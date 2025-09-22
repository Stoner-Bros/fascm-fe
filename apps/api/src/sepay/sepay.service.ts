import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as XLSX from 'xlsx';
import {
  SePayQrRequest,
  SePayQrResponse,
  SePayWebhookPayload,
  SePayWebhookResponse,
} from './interfaces/sepay.interface';
import { Payment } from './schema/payment.schema';
import { User } from '@api/users/schema/user.schema';
import { Subscription } from '@api/subscription/schema/subscription.schema';

@Injectable()
export class SePayService {
  private readonly logger = new Logger(SePayService.name);

  constructor(
    private configService: ConfigService,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
  ) {}

  /**
   * Tạo URL QR code cho thanh toán SePay
   * @param payload Thông tin thanh toán
   * @returns URL của QR code
   */
  generateQrUrl(payload: SePayQrRequest): SePayQrResponse {
    const accountNumber = this.configService.get<string>(
      'SEPAY_ACCOUNT_NUMBER',
    );
    const bankCode = this.configService.get<string>('SEPAY_BANK_CODE');
    const { amount, description } = payload;

    if (!accountNumber || !bankCode) {
      throw new Error(
        'SEPAY_ACCOUNT_NUMBER và SEPAY_BANK_CODE chưa được cấu hình',
      );
    }

    // Mã hóa nội dung chuyển khoản để đảm bảo URL không bị lỗi
    const encodedDescription = encodeURIComponent(description);

    // Tạo URL theo định dạng của SePay
    const qrUrl = `https://qr.sepay.vn/img?acc=${accountNumber}&bank=${bankCode}&amount=${amount}&des=${encodedDescription}`;

    return { qrUrl };
  }

  /**
   * Xử lý webhook từ SePay khi có giao dịch mới
   * @param payload Dữ liệu webhook từ SePay
   * @returns Kết quả xử lý
   */
  async processWebhook(
    payload: SePayWebhookPayload,
  ): Promise<SePayWebhookResponse> {
    try {
      this.logger.log(`Nhận webhook từ SePay: ${JSON.stringify(payload)}`);
      // Lọc referenceCode từ description: chỉ lấy PAY + 16 số
      const match = payload.description.match(/PAY\d{11,}/);
      const referenceCode = match ? match[0] : null;
      this.logger.log(`Reference code: ${referenceCode}`);
      // Tìm payment session đã tạo trước đó
      const payment = referenceCode
        ? await this.paymentModel.findOne({ referenceCode })
        : null;
      if (!payment) {
        this.logger.error(
          'Không tìm thấy payment session với referenceCode này!',
        );
        return { success: false, message: 'Không tìm thấy payment session' };
      }

      // Cập nhật trạng thái/thông tin giao dịch nếu cần
      payment.status = 'paid';
      payment.transactionDate = new Date().toISOString();
      await payment.save();

      const user = await this.userModel.findById(payment.userId.toString());
      if (!user) {
        this.logger.error('Không tìm thấy user với ID: ' + payment.userId);
        return { success: false, message: 'Không tìm thấy user' };
      }

      const subscription = await this.subscriptionModel.findOne({
        price: (payment.transferAmount / (1 - 85 / 100)).toFixed(0),
      });
      if (!subscription) {
        this.logger.error('Không tìm thấy subscription với amount này!');
        return { success: false, message: 'Không tìm thấy subscription' };
      }

      if (user.proExpiresAt && user.proExpiresAt > new Date()) {
        user.proExpiresAt = new Date(
          user.proExpiresAt.getTime() +
            subscription.duration * 24 * 60 * 60 * 1000,
        );
      } else {
        user.proExpiresAt = new Date(
          Date.now() + subscription.duration * 24 * 60 * 60 * 1000,
        );
      }
      await user.save();

      this.logger.log(`Đã cập nhật trạng thái giao dịch ID: ${payment._id}`);

      return {
        success: true,
        message: 'Webhook đã được xử lý thành công',
      };
    } catch (error) {
      this.logger.error(`Lỗi khi xử lý webhook: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Lỗi khi xử lý webhook: ${error.message}`,
      };
    }
  }

  /**
   * Kiểm tra trạng thái thanh toán dựa trên mã tham chiếu
   * @param referenceCode Mã tham chiếu của giao dịch
   * @returns Thông tin trạng thái thanh toán
   */
  async checkPaymentStatus(
    referenceCode: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Tìm giao dịch trong database dựa trên referenceCode
      const payment = await this.paymentModel.findOne({ referenceCode }).exec();

      if (!payment) {
        return {
          success: false,
          message: 'Payment not found',
        };
      }

      if (payment.status === 'paid') {
        return {
          success: true,
          message: 'The transaction has been paid successfully.',
        };
      }

      return {
        success: false,
        message: 'Payment not paid',
      };
    } catch (error) {
      this.logger.error(
        `Lỗi khi kiểm tra trạng thái thanh toán: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: `Lỗi khi kiểm tra trạng thái thanh toán: ${error.message}`,
      };
    }
  }

  async createPaymentSession(amount: number, userId: string) {
    const referenceCode = 'PAY' + Date.now() + Math.floor(Math.random() * 1000);
    await this.paymentModel.create({
      referenceCode,
      transferAmount: amount,
      userId,
      description: referenceCode,
    });
    return { referenceCode };
  }

  async getPaymentSession(referenceCode: string) {
    const payment = await this.paymentModel.findOne({ referenceCode });
    if (!payment) throw new NotFoundException('Không tìm thấy giao dịch');
    const accountNumber = this.configService.get<string>(
      'SEPAY_ACCOUNT_NUMBER',
    );
    const bankCode = this.configService.get<string>('SEPAY_BANK_CODE');
    const encodedDescription = encodeURIComponent(payment.description || '');
    const qrUrl = `https://qr.sepay.vn/img?acc=${accountNumber}&bank=${bankCode}&amount=${payment.transferAmount}&des=${encodedDescription}`;
    return {
      qrUrl,
      amount: payment.transferAmount,
      description: payment.description,
      referenceCode: payment.referenceCode,
      // status: payment.status, // nếu có
    };
  }

  async updateMissPayment(referenceCode: string) {
    const payment = await this.paymentModel.findOne({ referenceCode });
    if (!payment) throw new NotFoundException('Không tìm thấy giao dịch');
    // Cập nhật trạng thái/thông tin giao dịch nếu cần
    payment.status = 'paid';
    payment.transactionDate = new Date().toISOString();
    await payment.save();

    const user = await this.userModel.findById(payment.userId.toString());
    if (!user) {
      this.logger.error('Không tìm thấy user với ID: ' + payment.userId);
      return { success: false, message: 'Không tìm thấy user' };
    }

    const subscription = await this.subscriptionModel.findOne({
      price: (payment.transferAmount / (1 - 85 / 100)).toFixed(0),
    });
    if (!subscription) {
      this.logger.error('Không tìm thấy subscription với amount này!');
      return { success: false, message: 'Không tìm thấy subscription' };
    }

    if (user.proExpiresAt && user.proExpiresAt > new Date()) {
      user.proExpiresAt = new Date(
        user.proExpiresAt.getTime() +
          subscription.duration * 24 * 60 * 60 * 1000,
      );
    } else {
      user.proExpiresAt = new Date(
        Date.now() + subscription.duration * 24 * 60 * 60 * 1000,
      );
    }
    await user.save();
    return { success: true, message: 'Đã cập nhật trạng thái giao dịch' };
  }

  /**
   * Xuất danh sách thanh toán đã thanh toán thành file Excel
   * @returns Buffer của file Excel
   */
  async exportPaymentsToExcel(): Promise<Buffer> {
    try {
      // Lấy tất cả payments có status = 'paid' và populate user information
      const payments = await this.paymentModel
        .find({ status: 'paid' })
        .populate('userId', 'firstName lastName email proExpiresAt')
        .exec();

      // Tạo dữ liệu cho Excel
      const excelData = [];

      for (const payment of payments) {
        const user = payment.userId as any;

        // Tính toán subscription package dựa trên payment amount
        const originalAmount = payment.transferAmount / (1 - 85 / 100);
        const subscription = await this.subscriptionModel.findOne({
          price: originalAmount.toFixed(0),
        });

        excelData.push({
          'Reference Code': payment.referenceCode,
          'Transfer Amount': payment.transferAmount,
          'Original Amount': originalAmount.toFixed(0),
          'Transaction Date': payment.transactionDate
            ? new Date(payment.transactionDate).toLocaleString()
            : '',
          Status: payment.status,
          'User First Name': user?.firstName || '',
          'User Last Name': user?.lastName || '',
          'User Email': user?.email || '',
          'Pro Expires At': user?.proExpiresAt
            ? new Date(user.proExpiresAt).toLocaleString()
            : '',
          'Package Name': subscription?.name || 'Unknown',
          'Package Type': subscription?.type || 'Unknown',
        });
      }

      // Tạo workbook và worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Thiết lập độ rộng cột
      const columnWidths = [
        { wch: 20 }, // Reference Code
        { wch: 15 }, // Transfer Amount
        { wch: 15 }, // Original Amount
        { wch: 20 }, // Transaction Date
        { wch: 10 }, // Status
        { wch: 15 }, // User First Name
        { wch: 15 }, // User Last Name
        { wch: 25 }, // User Email
        { wch: 20 }, // Pro Expires At
        { wch: 20 }, // Package Name
        { wch: 15 }, // Package Type
      ];
      worksheet['!cols'] = columnWidths;

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Paid Payments');

      // Tạo buffer từ workbook
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      this.logger.log(
        `Đã xuất ${excelData.length} bản ghi thanh toán thành Excel`,
      );

      return buffer;
    } catch (error) {
      this.logger.error(`Lỗi khi xuất Excel: ${error.message}`, error.stack);
      throw new Error(`Lỗi khi xuất Excel: ${error.message}`);
    }
  }
}

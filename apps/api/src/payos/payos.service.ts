import { Subscription } from '@api/subscription/schema/subscription.schema';
import { User } from '@api/users/schema/user.schema';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import PayOS from '@payos/node';
import { Model } from 'mongoose';
import * as XLSX from 'xlsx';
import { Payment } from '../sepay/schema/payment.schema';

@Injectable()
export class PayosService {
  private readonly logger = new Logger(PayosService.name);
  private payOS: any;

  constructor(
    private configService: ConfigService,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
  ) {
    const clientId = this.configService.get<string>('PAYOS_CLIENT_ID');
    const apiKey = this.configService.get<string>('PAYOS_API_KEY');
    const checksumKey = this.configService.get<string>('PAYOS_CHECKSUM_KEY');

    if (!clientId || !apiKey || !checksumKey) {
      this.logger.error('PayOS configuration missing');
      throw new Error('PayOS configuration is required');
    }

    this.payOS = new PayOS(clientId, apiKey, checksumKey);
  }

  /**
   * Tạo payment session cho PayOS (mobile-first)
   * @param amount Số tiền thanh toán
   * @param userId ID của user
   * @param isMobile Có phải mobile app không
   * @returns Thông tin payment session
   */
  async createPaymentSession(amount: number, userId: string) {
    // Tạo referenceCode format bình thường
    const referenceCode = 'PAY' + Date.now() + Math.floor(Math.random() * 1000);

    await this.paymentModel.create({
      gateway: 'payos',
      referenceCode,
      transferAmount: amount,
      userId: userId, // Đảm bảo userId được truyền đúng
      description: referenceCode,
      status: 'pending',
    });

    return { referenceCode };
  }

  /**
   * Lấy thông tin payment session với QR code
   * @param referenceCode Mã tham chiếu
   * @param platform Platform type (mobile|web) - default mobile
   * @returns Thông tin session với QR code
   */
  async getPaymentSession(referenceCode: string, platform: string = 'mobile') {
    const payment = await this.paymentModel.findOne({ referenceCode });
    if (!payment) throw new NotFoundException('Không tìm thấy giao dịch');

    // Tạo payment link từ PayOS để lấy QR code
    const orderCode = Math.floor(Math.random() * 1000000000);
    const baseUrl = this.configService.get('APP_URL');

    // Xác định URL dựa trên platform (mobile-first)
    // Tất cả đều sử dụng format PAY bình thường
    // Browser test được xác định qua platform parameter

    const returnUrl =
      platform === 'web'
        ? `${baseUrl}/payos/result?ref=${payment.referenceCode}`
        : `myapp://payment/success?ref=${payment.referenceCode}`;

    const cancelUrl =
      platform === 'web'
        ? `${baseUrl}/payos?cancel=1`
        : `myapp://payment/cancel?ref=${payment.referenceCode}`;

    const paymentLinkData = {
      orderCode,
      amount: payment.transferAmount,
      description: payment.referenceCode,
      cancelUrl,
      returnUrl,
      buyerName: 'User',
      buyerEmail: 'user@example.com',
    };

    try {
      const payosResponse = await this.createPaymentLink(paymentLinkData);

      return {
        referenceCode: payment.referenceCode,
        amount: payment.transferAmount,
        description: payment.description,
        status: payment.status,
        gateway: payment.gateway,
        qrCode: payosResponse.qrCode,
        checkoutUrl: payosResponse.checkoutUrl,
        accountNumber: payosResponse.accountNumber,
        accountName: payosResponse.accountName,
        platform: platform || 'mobile',
      };
    } catch (error) {
      this.logger.error(`Lỗi tạo QR code cho session: ${error.message}`);
      // Trả về session info không có QR code nếu lỗi
      return {
        referenceCode: payment.referenceCode,
        amount: payment.transferAmount,
        description: payment.description,
        status: payment.status,
        gateway: payment.gateway,
      };
    }
  }

  /**
   * Tạo payment link với PayOS
   * @param body Thông tin thanh toán
   * @returns Payment link từ PayOS
   */
  async createPaymentLink(body: any) {
    try {
      // Gọi payOS để tạo link thanh toán
      const payosRes = await this.payOS.createPaymentLink(body);
      return payosRes;
    } catch (error) {
      this.logger.error(`Lỗi tạo payment link với PayOS: ${error.message}`);
      throw new Error(`PayOS error: ${error.message}`);
    }
  }

  async getPaymentLinkInformation(orderId: string | number) {
    return this.payOS.getPaymentLinkInformation(orderId);
  }

  async cancelPaymentLink(orderId: string | number, reason?: string) {
    return this.payOS.cancelPaymentLink(orderId, reason);
  }

  verifyPaymentWebhookData(data: any) {
    return this.payOS.verifyPaymentWebhookData(data);
  }

  async confirmWebhookUrl(webhookUrl: string) {
    try {
      const result = await this.payOS.confirmWebhook(webhookUrl);
      this.logger.log(`Webhook URL confirmed: ${result}`);
      return { success: true, message: result };
    } catch (error) {
      this.logger.error(`Webhook URL confirmation failed: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  async initializeWebhook() {
    const webhookUrl = `${this.configService.get('APP_URL')}/api/payos/webhook`;
    this.logger.log(`Initializing webhook URL: ${webhookUrl}`);
    return this.confirmWebhookUrl(webhookUrl);
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

  /**
   * Cập nhật giao dịch bị bỏ lỡ
   * @param referenceCode Mã tham chiếu
   * @returns Kết quả cập nhật
   */
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
        .find({ status: 'paid', gateway: 'payos' })
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
          Gateway: payment.gateway,
        });
      }

      // Tạo workbook và worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Thiết lập độ rộng cột
      const columnWidths = [
        { wch: 20 }, // Reference Code
        { wch: 15 }, // Order Code
        { wch: 35 }, // Payment Link ID
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
        { wch: 10 }, // Gateway
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

  async handleWebhook(webhookData: any) {
    try {
      this.logger.log(`Nhận webhook từ payOS: ${JSON.stringify(webhookData)}`);

      // 1. Xác thực dữ liệu webhook (nếu có signature)
      if (webhookData.signature) {
        try {
          const verifiedData = this.payOS.verifyPaymentWebhookData(webhookData);
          this.logger.log(
            `Dữ liệu webhook đã được xác thực: ${JSON.stringify(verifiedData)}`,
          );
        } catch (verifyError) {
          this.logger.warn(`Lỗi xác thực webhook: ${verifyError.message}`);
          // Vẫn tiếp tục xử lý nếu không xác thực được
        }
      }

      // 2. Kiểm tra trạng thái thanh toán
      if (webhookData.code !== '00' || !webhookData.success) {
        this.logger.warn(`Thanh toán không thành công: ${webhookData.desc}`);
        return { success: false, message: webhookData.desc };
      }

      // 3. Tìm payment theo referenceCode từ description
      let payment = null;

      if (webhookData.data?.description) {
        const match = webhookData.data.description.match(/PAY\d{11,}/);
        const referenceCode = match ? match[0] : null;
        if (referenceCode) {
          payment = await this.paymentModel.findOne({
            referenceCode,
            gateway: 'payos',
          });
        }
      }

      if (!payment) {
        this.logger.error(
          `Không tìm thấy payment với referenceCode từ description: ${webhookData.data?.description}`,
        );
        return { success: false, message: 'Payment not found' };
      }

      // 4. Cập nhật trạng thái payment
      payment.status = 'paid';
      payment.transactionDate = webhookData.data.transactionDateTime;
      payment.code = webhookData.data.code;
      payment.accountNumber = webhookData.data.accountNumber;
      await payment.save();

      // 5. Thực hiện nghiệp vụ hậu thanh toán (nâng cấp user)
      const user = await this.userModel.findById(payment.userId.toString());
      if (!user) {
        this.logger.error(`Không tìm thấy user với ID: ${payment.userId}`);
        return { success: false, message: 'User not found' };
      }

      // Tìm subscription dựa trên amount
      const subscription = await this.subscriptionModel.findOne({
        price: (payment.transferAmount / (1 - 85 / 100)).toFixed(0),
      });

      if (!subscription) {
        this.logger.error(
          `Không tìm thấy subscription với amount: ${payment.transferAmount}`,
        );
        return { success: false, message: 'Subscription not found' };
      }

      // Cập nhật thời gian hết hạn pro
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
      this.logger.log(`Đã nâng cấp user ID: ${user._id}`);

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
}

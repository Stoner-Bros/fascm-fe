import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
  Res,
  Param,
} from '@nestjs/common';
import { PayosService } from './payos.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateMissPaymentDto } from './dto/update-miss-payment.dto';
import { GenerateQRDto } from './dto/generate-qr.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@ApiTags('payos')
@Controller('payos')
export class PayosController {
  private readonly logger = new Logger(PayosController.name);
  constructor(
    private readonly payosService: PayosService,
    private readonly configService: ConfigService,
  ) {}

  @Post('create-link')
  @ApiOperation({ summary: 'Create a new payOS payment link' })
  @ApiResponse({
    status: 201,
    description: 'Payment link created successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async createPaymentLink(@Body() body: CreatePaymentLinkDto) {
    return this.payosService.createPaymentLink(body);
  }

  @Post('create-session')
  @ApiOperation({
    summary: 'Tạo payment session cho PayOS (mobile-first)',
    description:
      'Tạo session thanh toán mới. Default cho mobile app với deep links.',
  })
  @ApiBody({ type: CreateSessionDto })
  @ApiResponse({
    status: 201,
    description: 'Payment session created successfully.',
    schema: {
      type: 'object',
      properties: {
        referenceCode: {
          type: 'string',
          example: 'PAY1703123456789',
          description: 'Mã tham chiếu của session',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiQuery({
    name: 'mobile',
    required: false,
    type: Boolean,
    description: 'Is mobile app (default: true)',
  })
  async createSession(@Body() body: CreateSessionDto) {
    return this.payosService.createPaymentSession(body.amount, body.userId);
  }

  @Get('session/:referenceCode')
  @ApiOperation({
    summary: 'Lấy thông tin payment session với QR code',
    description: 'Lấy thông tin session và tạo checkout URL + QR code từ PayOS',
  })
  @ApiParam({
    name: 'referenceCode',
    type: String,
    description: 'Mã tham chiếu của payment session',
    example: 'PAY1703123456789',
  })
  @ApiQuery({
    name: 'platform',
    required: false,
    type: String,
    enum: ['mobile', 'web'],
    description: 'Platform type (mobile|web) - default mobile',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment session information with QR code.',
    schema: {
      type: 'object',
      properties: {
        referenceCode: { type: 'string', example: 'PAY1703123456789' },
        amount: { type: 'number', example: 50000 },
        description: { type: 'string', example: 'PAY1703123456789' },
        status: { type: 'string', example: 'pending' },
        gateway: { type: 'string', example: 'payos' },
        qrCode: {
          type: 'string',
          example: 'data:image/png;base64,iVBORw0KGgo...',
        },
        checkoutUrl: {
          type: 'string',
          example: 'https://pay.payos.vn/web/abc123',
        },
        accountNumber: { type: 'string', example: '1234567890' },
        accountName: { type: 'string', example: 'PAYOS' },
        platform: { type: 'string', example: 'mobile' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Payment session not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getSession(
    @Param('referenceCode') referenceCode: string,
    @Query('platform') platform?: string,
  ) {
    return this.payosService.getPaymentSession(referenceCode, platform);
  }

  @Post('generate-qr')
  @ApiOperation({
    summary: 'Tạo QR code cho thanh toán PayOS (DEPRECATED)',
    description: 'DEPRECATED: Sử dụng GET /session/{referenceCode} thay thế',
    deprecated: true,
  })
  @ApiBody({ type: GenerateQRDto })
  @ApiResponse({
    status: 201,
    description: 'QR code URL đã được tạo thành công',
    schema: {
      type: 'object',
      properties: {
        qrCode: {
          type: 'string',
          example: 'data:image/png;base64,iVBORw0KGgo...',
        },
        checkoutUrl: {
          type: 'string',
          example: 'https://pay.payos.vn/web/abc123',
        },
        referenceCode: { type: 'string', example: 'PAY1703123456789' },
        accountNumber: { type: 'string', example: '1234567890' },
        accountName: { type: 'string', example: 'PAYOS' },
        amount: { type: 'number', example: 50000 },
        description: { type: 'string', example: 'PAY1703123456789' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async generateQR(@Body() body: GenerateQRDto) {
    // Tạo payment session trước
    const session = await this.payosService.createPaymentSession(
      body.amount,
      body.userId,
    );

    // Tạo payment link từ PayOS với QR code thực
    const orderCode = Math.floor(Math.random() * 1000000000);
    const paymentLinkData = {
      orderCode,
      amount: body.amount,
      description: session.referenceCode, // Sử dụng referenceCode làm description
      cancelUrl: `${this.configService.get('APP_URL')}/payos?cancel=1`,
      returnUrl: `${this.configService.get('APP_URL')}/payos/result?ref=${session.referenceCode}`,
      buyerName: 'User', // Có thể lấy từ user context
      buyerEmail: 'user@example.com', // Có thể lấy từ user context
    };

    try {
      const payosResponse =
        await this.payosService.createPaymentLink(paymentLinkData);

      return {
        qrCode: payosResponse.qrCode, // QR code thực từ PayOS
        checkoutUrl: payosResponse.checkoutUrl, // URL thanh toán PayOS
        referenceCode: session.referenceCode,
        accountNumber: payosResponse.accountNumber,
        accountName: payosResponse.accountName,
        amount: payosResponse.amount,
        description: payosResponse.description,
      };
    } catch (error) {
      this.logger.error(`Lỗi tạo payment link: ${error.message}`);
      throw new Error(`Không thể tạo payment link: ${error.message}`);
    }
  }

  @Get('check-payment/:referenceCode')
  @ApiOperation({
    summary: 'Kiểm tra trạng thái thanh toán',
    description: 'Verify payment status sau khi user hoàn tất thanh toán',
  })
  @ApiParam({
    name: 'referenceCode',
    type: String,
    description: 'Mã tham chiếu của payment session',
    example: 'PAY1703123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment status information',
    schema: {
      type: 'object',
      properties: {
        referenceCode: { type: 'string', example: 'PAY1703123456789' },
        status: {
          type: 'string',
          enum: ['paid', 'pending', 'failed'],
          example: 'paid',
        },
        message: { type: 'string', example: 'Thanh toán thành công' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Payment session not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async checkPaymentStatus(
    @Param('referenceCode') referenceCode: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Kiểm tra trạng thái thanh toán: ${referenceCode}`);
    return this.payosService.checkPaymentStatus(referenceCode);
  }

  @Post('update-miss-payment')
  @ApiOperation({
    summary: 'Cập nhật giao dịch bị bỏ lỡ',
    description:
      'Manually update payment status cho các giao dịch bị webhook miss',
  })
  @ApiBody({ type: UpdateMissPaymentDto })
  @ApiResponse({
    status: 200,
    description: 'Giao dịch đã được cập nhật thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Giao dịch đã được cập nhật thành công',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Payment session not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async updateMissPayment(@Body() body: UpdateMissPaymentDto) {
    return this.payosService.updateMissPayment(body.referenceCode);
  }

  @Get('export-payments')
  @ApiOperation({ summary: 'Xuất danh sách thanh toán thành file Excel' })
  @ApiResponse({
    status: 200,
    description: 'File Excel đã được tạo thành công',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async exportPayments(@Res() res: Response): Promise<void> {
    this.logger.log('Xuất danh sách thanh toán thành Excel');
    const buffer = await this.payosService.exportPaymentsToExcel();

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="payos-payments-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
      'Content-Length': buffer.length.toString(),
    });

    res.end(buffer);
  }

  @Get('link-info')
  @ApiOperation({ summary: 'Get payOS payment link information' })
  @ApiResponse({ status: 200, description: 'Return payment link information.' })
  @ApiQuery({
    name: 'orderId',
    required: true,
    type: String,
    description: 'Order code or payment link ID',
  })
  async getPaymentLinkInformation(@Query('orderId') orderId: string) {
    return this.payosService.getPaymentLinkInformation(orderId);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'PayOS Webhook Handler',
    description: 'Nhận và xử lý webhook từ PayOS khi có giao dịch thành công',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook đã được xử lý thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Webhook received successfully' },
        data: { type: 'object' },
      },
    },
  })
  async handleWebhook(@Body() webhookData: any, @Res() res: Response) {
    try {
      this.logger.log('Nhận webhook từ payOS:', JSON.stringify(webhookData));

      const result = await this.payosService.handleWebhook(webhookData);

      // Luôn trả về 200 để payOS biết webhook đã được nhận thành công
      return res.status(200).json({
        success: true,
        message: 'Webhook received successfully',
        data: result,
      });
    } catch (error) {
      this.logger.error('Lỗi xử lý webhook:', error);

      // Vẫn trả về 200 để payOS không gửi lại webhook
      return res.status(200).json({
        success: false,
        message: 'Webhook received but processing failed',
        error: error.message,
      });
    }
  }
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class SePayWebhookDto {
  @ApiProperty({
    description: 'ID giao dịch trên SePay',
    example: 92704,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Brand name của ngân hàng',
    example: 'Vietcombank',
  })
  @IsString()
  gateway: string;

  @ApiProperty({
    description: 'Thời gian xảy ra giao dịch phía ngân hàng',
    example: '2023-03-25 14:02:37',
  })
  @IsString()
  transactionDate: string;

  @ApiProperty({
    description: 'Số tài khoản ngân hàng',
    example: '0123499999',
  })
  @IsString()
  accountNumber: string;

  @ApiProperty({
    description: 'Mã code thanh toán',
    example: null,
    required: false,
  })
  @IsOptional()
  @IsString()
  code: string | null;

  @ApiProperty({
    description: 'Nội dung chuyển khoản',
    example: 'chuyen tien mua iphone',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Loại giao dịch. in là tiền vào, out là tiền ra',
    example: 'in',
    enum: ['in', 'out'],
  })
  @IsEnum(['in', 'out'])
  transferType: 'in' | 'out';

  @ApiProperty({
    description: 'Số tiền giao dịch',
    example: 2277000,
  })
  @IsNumber()
  transferAmount: number;

  @ApiProperty({
    description: 'Số dư tài khoản (lũy kế)',
    example: 19077000,
  })
  @IsNumber()
  accumulated: number;

  @ApiProperty({
    description: 'Tài khoản ngân hàng phụ (tài khoản định danh)',
    example: null,
    required: false,
  })
  @IsOptional()
  @IsString()
  subAccount: string | null;

  @ApiProperty({
    description: 'Mã tham chiếu của tin nhắn sms',
    example: 'MBVCB.3278907687',
  })
  @IsString()
  referenceCode: string;

  @ApiProperty({
    description: 'Toàn bộ nội dung tin nhắn sms',
    example: '',
  })
  @IsString()
  description: string;
}

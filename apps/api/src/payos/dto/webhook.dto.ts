import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsObject } from 'class-validator';

class PayosWebhookDataDto {
  @ApiProperty({ example: 123 })
  orderCode: number;

  @ApiProperty({ example: 3000 })
  amount: number;

  @ApiProperty({ example: 'VQRIO123' })
  description: string;

  @ApiProperty({ example: '12345678' })
  accountNumber: string;

  @ApiProperty({ example: 'TF230204212323' })
  reference: string;

  @ApiProperty({ example: '2023-02-04 18:25:00' })
  transactionDateTime: string;

  @ApiProperty({ example: 'VND' })
  currency: string;

  @ApiProperty({ example: '124c33293c43417ab7879e14c8d9eb18' })
  paymentLinkId: string;

  @ApiProperty({ example: '00' })
  code: string;

  @ApiProperty({ example: 'Thành công' })
  desc: string;

  @ApiProperty({ example: '' })
  counterAccountBankId: string;

  @ApiProperty({ example: '' })
  counterAccountBankName: string;

  @ApiProperty({ example: '' })
  counterAccountName: string;

  @ApiProperty({ example: '' })
  counterAccountNumber: string;

  @ApiProperty({ example: '' })
  virtualAccountName: string;

  @ApiProperty({ example: '' })
  virtualAccountNumber: string;
}

export class PayosWebhookDto {
  @ApiProperty({ example: '00' })
  @IsString()
  code: any;

  @ApiProperty({ example: 'success' })
  @IsString()
  desc: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  success: boolean;

  @ApiProperty({ type: PayosWebhookDataDto })
  @IsObject()
  data: PayosWebhookDataDto;

  @ApiProperty({
    example: '8d8640d802576397a1ce45ebda7f835055768ac7ad2e0bfb77f9b8f12cca4c7f',
  })
  @IsString()
  signature: string;
}

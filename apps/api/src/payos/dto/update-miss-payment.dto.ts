import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateMissPaymentDto {
  @ApiProperty({
    example: 'PAY1703123456789',
    description: 'Mã tham chiếu của giao dịch',
  })
  @IsString()
  @IsNotEmpty()
  referenceCode: string;
}

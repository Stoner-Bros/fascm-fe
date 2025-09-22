import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty, Min } from 'class-validator';

export class GenerateQRDto {
  @ApiProperty({
    example: 10000,
    description: 'Số tiền thanh toán',
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1000)
  amount: number;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID của user',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}

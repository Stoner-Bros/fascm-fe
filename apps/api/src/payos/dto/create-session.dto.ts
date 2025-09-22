import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({
    example: 10000,
    description: 'Số tiền thanh toán',
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID của user',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}

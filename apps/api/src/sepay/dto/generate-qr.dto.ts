import { IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateQrDto {
  @ApiProperty({
    description: 'Số tiền',
    example: 100000,
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'ID người dùng',
    example: '1',
  })
  @IsString()
  userId: string;
}

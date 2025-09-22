import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PayosItemDto {
  @ApiProperty({ example: 'Product name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 2000 })
  @IsNumber()
  price: number;
}

export class CreatePaymentLinkDto {
  @ApiProperty({ example: 1234 })
  @IsNumber()
  orderCode: number;

  @ApiProperty({ example: 2000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'Thanh toan don hang' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'http://localhost:3000/cancel.html' })
  @IsString()
  cancelUrl: string;

  @ApiProperty({ example: 'http://localhost:3000/success.html' })
  @IsString()
  returnUrl: string;

  @ApiPropertyOptional({ type: [PayosItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PayosItemDto)
  items?: PayosItemDto[];

  @ApiPropertyOptional({ example: 'Nguyen Van A' })
  @IsOptional()
  @IsString()
  buyerName?: string;

  @ApiPropertyOptional({ example: 'user@email.com' })
  @IsOptional()
  @IsString()
  buyerEmail?: string;

  @ApiPropertyOptional({ example: '0123456789' })
  @IsOptional()
  @IsString()
  buyerPhone?: string;

  @ApiPropertyOptional({ example: '123 Main St' })
  @IsOptional()
  @IsString()
  buyerAddress?: string;

  @ApiPropertyOptional({ example: 1710000000 })
  @IsOptional()
  @IsNumber()
  expiredAt?: number;

  @ApiProperty({
    example: '664e1b2f8c1b2c0012a4e123',
    description: 'UserId của người thanh toán',
  })
  @IsString()
  userId: string;
}

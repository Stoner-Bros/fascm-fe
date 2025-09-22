import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsUrl,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'The name of the product',
    example:
      'Kem chống nắng nâng tone cho da dầu La Roche-Posay Anthelios XL SPF50',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The brand of the product',
    example: 'La Roche-Posay',
  })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({
    description: 'The URL to the product image',
    example: 'https://example.com/image.jpg',
  })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    description: 'The URL to the product on Shopee',
    example: 'https://shopee.vn/product-name-i.37251700.580590480',
  })
  @IsUrl()
  @IsOptional()
  shopeeUrl?: string;

  @ApiProperty({
    description: 'Whether the product is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'The description of the product',
    example: 'Kem chống nắng nâng tone cho da dầu...',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The price of the product',
    example: 399000,
  })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'The categories of the product',
    example: ['Chống nắng', 'Da dầu'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  categories?: string[];

  @ApiProperty({
    description: 'The main benefits of the product',
    example: ['Bảo vệ da khỏi tia UV', 'Giảm bóng nhờn', 'Làm sáng da'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  benefits?: string[];
}

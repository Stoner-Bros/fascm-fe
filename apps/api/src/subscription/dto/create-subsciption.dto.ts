import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'The name of the subscription',
    example: 'Pro',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The type of the subscription',
    example: 'weekly',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'The duration of the subscription in days',
    example: 7,
  })
  @IsNumber()
  @IsNotEmpty()
  duration: number;

  @ApiProperty({
    description: 'The price of the subscription',
    example: 100000,
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: 'The discount of the subscription in percentage',
    example: 10,
  })
  @IsNumber()
  @IsOptional()
  discount: number;

  @ApiProperty({
    description: 'The currency of the subscription',
    example: 'VND',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    description: 'The description of the subscription',
    example: 'This is a description of the subscription',
  })
  @IsString()
  @IsOptional()
  description: string;
}

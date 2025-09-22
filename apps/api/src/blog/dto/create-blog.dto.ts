import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BlogImageDto {
  @ApiProperty({
    description: 'The URL of the image',
    example: 'https://example.com/images/blog1.jpg',
  })
  url: string;

  @ApiProperty({
    description: 'The caption for the image',
    example: 'Figure 1: Applying sunscreen properly',
    required: false,
  })
  @IsString()
  @IsOptional()
  caption?: string;
}

export class CreateBlogDto {
  @ApiProperty({
    description: 'The title of the blog post',
    example: 'Top 10 Skincare Tips for Oily Skin',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The content of the blog post (can contain HTML)',
    example:
      '<p>Here are the top skincare tips that will help you manage oily skin...</p>',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'The images for the blog post',
    type: [BlogImageDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlogImageDto)
  @IsOptional()
  images?: BlogImageDto[];

  @ApiProperty({
    description: 'The tags for the blog post',
    example: ['Skincare', 'Oily Skin', 'Tips'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsOptional()
  tags?: string[];
}

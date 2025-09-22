import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { QuestionType } from '../schema/skin-question.schema';

export class QuestionOptionDto {
  @ApiProperty({ description: 'Option value' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({ description: 'Option label' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ description: 'Option description', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateSkinQuestionDto {
  @ApiProperty({ description: 'Question text' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ description: 'Question description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: QuestionType, description: 'Type of question' })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiProperty({ type: [QuestionOptionDto], description: 'Question options' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  @IsOptional()
  options?: QuestionOptionDto[];

  @ApiProperty({ description: 'Question order', default: 0 })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({ description: 'Whether the question is active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Whether the question is required',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;
}

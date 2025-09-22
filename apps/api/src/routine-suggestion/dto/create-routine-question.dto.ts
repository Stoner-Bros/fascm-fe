import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { QuestionType } from '../schema/routine-question.schema';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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

export class CreateRoutineQuestionDto {
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

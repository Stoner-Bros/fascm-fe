import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';

export class AnswerDto {
  @ApiProperty({ description: 'Question ID' })
  @IsMongoId()
  questionId: string;

  @ApiProperty({ description: 'Answer value (string or array of strings)' })
  @IsNotEmpty()
  answer: string | string[];
}

export class SubmitSkinProfileDto {
  @ApiProperty({ type: [AnswerDto], description: 'Skin profile answers' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}

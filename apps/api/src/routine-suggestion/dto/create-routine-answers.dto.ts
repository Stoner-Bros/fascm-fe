import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RoutineAnswer {
  @ApiProperty({ description: 'Question ID' })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({ description: 'Answer value(s)' })
  @IsArray()
  @IsNotEmpty()
  answers: string[];
}

export class CreateRoutineAnswersDto {
  @ApiProperty({
    type: [RoutineAnswer],
    description: 'Array of answers for routine questions',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutineAnswer)
  answers: RoutineAnswer[];
}

import { PartialType } from '@nestjs/mapped-types';
import { CreateRoutineQuestionDto } from './create-routine-question.dto';

export class UpdateRoutineQuestionDto extends PartialType(
  CreateRoutineQuestionDto,
) {}

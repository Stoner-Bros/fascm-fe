import { PartialType } from '@nestjs/mapped-types';
import { CreateSkinQuestionDto } from './create-skin-question.dto';

export class UpdateSkinQuestionDto extends PartialType(CreateSkinQuestionDto) {}

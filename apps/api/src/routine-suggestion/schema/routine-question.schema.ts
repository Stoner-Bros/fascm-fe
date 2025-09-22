import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RoutineQuestionDocument = HydratedDocument<RoutineQuestion>;

export enum QuestionType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TEXT = 'TEXT',
  SCALE = 'SCALE',
}

export class QuestionOption {
  @Prop({ required: true })
  value: string;

  @Prop({ required: true })
  label: string;

  @Prop()
  description?: string;
}

@Schema({ timestamps: true })
export class RoutineQuestion {
  @Prop({ required: true })
  question: string;

  @Prop()
  description?: string;

  @Prop({
    required: true,
    enum: QuestionType,
    default: QuestionType.SINGLE_CHOICE,
  })
  type: QuestionType;

  @Prop({
    type: [{ value: String, label: String, description: String }],
    default: [],
  })
  options: QuestionOption[];

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isRequired: boolean;
}

export const RoutineQuestionSchema =
  SchemaFactory.createForClass(RoutineQuestion);

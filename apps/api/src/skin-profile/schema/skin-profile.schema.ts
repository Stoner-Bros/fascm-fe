import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { User } from '@api/users/schema/user.schema';

export type SkinProfileDocument = HydratedDocument<SkinProfile>;

export class Answer {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'SkinQuestion',
    required: true,
  })
  questionId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  answer: string | string[];
}

@Schema({ timestamps: true })
export class SkinProfile {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: User;

  @Prop({
    type: [
      {
        questionId: {
          type: MongooseSchema.Types.ObjectId,
          ref: 'SkinQuestion',
        },
        answer: {},
      },
    ],
  })
  answers: Answer[];

  @Prop()
  skinType?: string;

  @Prop()
  concerns?: string[];

  @Prop()
  recommendations?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const SkinProfileSchema = SchemaFactory.createForClass(SkinProfile);

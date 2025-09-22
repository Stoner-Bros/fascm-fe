import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '@api/users/schema/user.schema';

@Schema({ collection: 'ai_usages', timestamps: true })
export class AIUsage extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: Number, default: 0 })
  promptCount: number;

  @Prop({ type: Date, required: false })
  createdAt: Date;

  @Prop({ type: Date, required: false })
  updatedAt: Date;
}

export const AIUsageSchema = SchemaFactory.createForClass(AIUsage);

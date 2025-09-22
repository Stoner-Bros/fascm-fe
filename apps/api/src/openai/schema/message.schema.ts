import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Thread } from './thread.schema';

@Schema({ collection: 'messages', timestamps: true })
export class Message extends Document {
  @Prop({ type: String, required: false })
  openaiMessageId: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'Thread', required: true })
  thread: Thread;

  @Prop({ type: String, enum: ['user', 'assistant'], required: true })
  sender: 'user' | 'assistant';

  @Prop({ type: Object, required: false })
  metadata: Record<string, any>;

  @Prop({ type: Date, required: false })
  createdAt: Date;

  @Prop({ type: Date, required: false })
  updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

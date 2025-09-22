import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '@api/users/schema/user.schema';

@Schema({ collection: 'threads', timestamps: true })
export class Thread extends Document {
  @Prop({ type: String, required: false })
  openaiThreadId: string;

  @Prop({ type: String, required: false })
  name: string;

  @Prop({ type: String, required: false })
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: User;

  @Prop({ type: Object, required: false })
  metadata: Record<string, any>;

  @Prop({ type: Date, required: false })
  createdAt: Date;

  @Prop({ type: Date, required: false })
  updatedAt: Date;
}

export const ThreadSchema = SchemaFactory.createForClass(Thread);

import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from '@api/users/schema/user.schema';
import { Message } from '@api/openai/schema/message.schema';

@Schema({ collection: 'files', timestamps: true })
export class File extends Document {
  @Prop({ required: false })
  openaiFileId: string;

  @Prop({ required: true })
  filename: string;

  @Prop({ required: false })
  url: string;

  @Prop({ required: false })
  path: string;

  @Prop({ required: false })
  mimetype: string;

  @Prop({ required: false })
  size: number;

  @Prop({ type: String, ref: 'Message', required: false })
  message: Message;

  @Prop({ type: String, ref: 'User', required: false })
  owner: User;

  @Prop({ type: Date, required: false })
  createdAt: Date;

  @Prop({ type: Date, required: false })
  updatedAt: Date;
}

export const FileSchema = SchemaFactory.createForClass(File);

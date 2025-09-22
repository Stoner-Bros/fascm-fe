import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'permissions', timestamps: true })
export class Permission extends Document {
  @Prop({ required: true })
  action: string; // Changed to string for MongoDB compatibility

  @Prop({ required: true })
  subject: string;

  @Prop({ type: Object, required: false })
  conditions: Record<string, any>;

  @Prop({ required: false })
  description: string;

  @Prop({ type: Object, required: false })
  metadata: Record<string, any>;

  @Prop({ type: Date, required: false })
  createdAt: Date;

  @Prop({ type: Date, required: false })
  updatedAt: Date;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);

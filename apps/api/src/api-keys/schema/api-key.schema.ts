import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from '@api/users/schema/user.schema';

@Schema({ timestamps: true })
export class ApiKey extends Document {
  @Prop({ unique: true, required: true })
  key: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, ref: User.name, required: true })
  owner: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Object, required: true })
  rateLimit: {
    requests: number;
    perSeconds: number;
  };

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: Date, default: null })
  lastUsedAt: Date;

  @Prop({ type: Object, default: null })
  metadata: Record<string, any>;
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);

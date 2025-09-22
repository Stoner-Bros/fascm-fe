import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum EmailTemplateType {
  WELCOME = 'welcome',
  VERIFY_EMAIL = 'verify_email',
  FORGOT_PASSWORD = 'forgot_password',
  CHANGE_PASSWORD = 'change_password',
  APP_LAUNCH = 'app_launch',
  WEBSITE_LAUNCH = 'website_launch',
}

@Schema({ collection: 'email_templates', timestamps: true })
export class EmailTemplate extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, enum: EmailTemplateType })
  type: EmailTemplateType;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  htmlContent: string;

  @Prop()
  textContent: string;

  @Prop()
  description: string;

  @Prop({ type: Date, required: false })
  createdAt: Date;

  @Prop({ type: Date, required: false })
  updatedAt: Date;
}

export const EmailTemplateSchema = SchemaFactory.createForClass(EmailTemplate);

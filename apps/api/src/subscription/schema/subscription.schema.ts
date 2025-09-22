import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SubscriptionDocument = HydratedDocument<Subscription>;

export enum SubscriptionType {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: SubscriptionType })
  type: SubscriptionType;

  @Prop({ required: true })
  duration: number;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: false })
  discount?: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true, default: true })
  isActive: boolean;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

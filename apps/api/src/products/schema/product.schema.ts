import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  brand: string;

  @Prop()
  imageUrl: string;

  @Prop()
  shopeeUrl: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  description: string;

  @Prop()
  price: number;

  @Prop({ type: [String], default: [] })
  categories: string[];

  @Prop({ type: [String], default: [] })
  benefits: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);

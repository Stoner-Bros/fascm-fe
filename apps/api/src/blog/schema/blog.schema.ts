import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schema/user.schema';

export type BlogDocument = HydratedDocument<Blog>;

// Schema for comments on blog posts
@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  author: User;

  @Prop({ required: true })
  content: string;

  @Prop({ default: 0 })
  likes: number;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  likedBy: User[];
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// Schema for blog images
@Schema()
export class BlogImage {
  @Prop({ required: true })
  url: string;

  @Prop()
  caption: string;
}

export const BlogImageSchema = SchemaFactory.createForClass(BlogImage);

// Main Blog schema
@Schema({ timestamps: true })
export class Blog {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, type: String })
  content: string; // Can contain HTML content

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  author: User;

  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }],
    default: [],
  })
  likedBy: User[];

  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  sharesCount: number;

  @Prop({ type: [{ type: CommentSchema }], default: [] })
  comments: Comment[];

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [BlogImageSchema], default: [] })
  images: BlogImage[];
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

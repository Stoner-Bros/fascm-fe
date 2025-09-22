import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '@api/roles/schema/role.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true, sparse: true })
  googleId?: string;

  @Prop({ required: false })
  firstName: string;

  @Prop({ required: false })
  lastName: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: false })
  avatar?: string;

  @Prop({ required: false })
  password: string;

  @Prop({ type: [{ type: Object }] })
  roles: Role[];

  @Prop()
  refreshToken?: string;

  @Prop()
  otp?: string;

  @Prop()
  otpExpiration?: Date;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  verificationToken?: string;

  @Prop({ default: 10 })
  dailyPromptLimit: number;

  @Prop()
  proExpiresAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

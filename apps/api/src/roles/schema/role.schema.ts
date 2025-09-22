import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Permission } from '@api/permissions/schema/permission.schema';

@Schema({ collection: 'roles', timestamps: true })
export class Role extends Document {
  @Prop({ unique: true, required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: [{ type: String, ref: 'Permission' }] })
  permissions: Permission[];

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop({ type: Date, required: false })
  createdAt: Date;

  @Prop({ type: Date, required: false })
  updatedAt: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

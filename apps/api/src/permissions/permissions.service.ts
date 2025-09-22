import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from './schema/permission.schema';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { CustomNotFoundException } from '@api/common/exceptions/custom-exceptions';
import { validateObjectId } from '@api/common/utils/mongoose.utils';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const permission = new this.permissionModel(createPermissionDto);
    return permission.save();
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionModel.find().exec();
  }

  async findOne(id: string): Promise<Permission> {
    validateObjectId(id, 'permission');
    const permission = await this.permissionModel.findById(id).exec();
    if (!permission) {
      throw new CustomNotFoundException(
        `Permission with ID "${id}" not found`,
        'permissionNotFound',
      );
    }
    return permission;
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    validateObjectId(id, 'permission');
    const permission = await this.permissionModel
      .findByIdAndUpdate(id, updatePermissionDto, { new: true })
      .exec();
    if (!permission) {
      throw new CustomNotFoundException(
        `Permission with ID "${id}" not found`,
        'permissionNotFound',
      );
    }
    return permission;
  }

  async remove(id: string): Promise<void> {
    validateObjectId(id, 'permission');
    const result = await this.permissionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new CustomNotFoundException(
        `Permission with ID "${id}" not found`,
        'permissionNotFound',
      );
    }
  }

  async findByIds(ids: string[]): Promise<Permission[]> {
    return this.permissionModel.find({ _id: { $in: ids } }).exec();
  }
}

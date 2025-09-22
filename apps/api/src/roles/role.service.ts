import { PermissionService } from './../permissions/permissions.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from './schema/role.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CustomNotFoundException } from '@api/common/exceptions/custom-exceptions';
import { validateObjectId } from '@api/common/utils/mongoose.utils';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name)
    private roleModel: Model<Role>,
    private permissionService: PermissionService,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = new this.roleModel(createRoleDto);

    if (createRoleDto.permissionIds) {
      const permissions = await this.permissionService.findByIds(
        createRoleDto.permissionIds,
      );
      role.permissions = permissions;
    }

    return role.save();
  }

  async findAll(): Promise<Role[]> {
    return this.roleModel.find().populate('permissions').exec();
  }

  async findOne(id: string): Promise<Role> {
    validateObjectId(id, 'role');
    const role = await this.roleModel
      .findById(id)
      .populate('permissions')
      .exec();

    if (!role) {
      throw new CustomNotFoundException(
        `Role with ID "${id}" not found`,
        'roleNotFound',
      );
    }

    return role;
  }

  async findOneByName(name: string): Promise<Role> {
    const role = await this.roleModel
      .findOne({ name })
      .populate('permissions')
      .exec();

    if (!role) {
      throw new CustomNotFoundException(
        `Role with name "${name}" not found`,
        'roleNotFound',
      );
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    validateObjectId(id, 'role');
    const role = await this.findOne(id);

    if (updateRoleDto.permissionIds) {
      const permissions = await this.permissionService.findByIds(
        updateRoleDto.permissionIds,
      );
      role.permissions = permissions;
    }

    Object.assign(role, updateRoleDto);
    return role.save();
  }

  async remove(id: string): Promise<void> {
    validateObjectId(id, 'role');
    const role = await this.findOne(id);
    await this.roleModel.deleteOne({ _id: role._id }).exec();
  }

  async assignPermissionToRole(
    roleId: string,
    permissionId: string,
  ): Promise<Role> {
    validateObjectId(roleId, 'role');
    validateObjectId(permissionId, 'permission');

    const role = await this.roleModel
      .findById(roleId)
      .populate('permissions')
      .exec();
    if (!role)
      throw new CustomNotFoundException('Role not found', 'roleNotFound');

    const permission = await this.permissionService.findOne(permissionId);
    if (!permission)
      throw new CustomNotFoundException(
        'Permission not found',
        'permissionNotFound',
      );

    role.permissions.push(permission);
    return role.save();
  }

  async removePermissionFromRole(
    roleId: string,
    permissionId: string,
  ): Promise<Role> {
    validateObjectId(roleId, 'role');
    validateObjectId(permissionId, 'permission');

    const role = await this.roleModel
      .findById(roleId)
      .populate('permissions')
      .exec();
    if (!role)
      throw new CustomNotFoundException('Role not found', 'roleNotFound');

    role.permissions = role.permissions.filter((p) => p.id !== permissionId);
    return role.save();
  }
}

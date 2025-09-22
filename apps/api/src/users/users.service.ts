import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { RoleService } from './../roles/role.service';
import { CustomNotFoundException } from '@api/common/exceptions/custom-exceptions';
import { validateObjectId } from '@api/common/utils/mongoose.utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly roleService: RoleService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const userRole = await this.roleService.findOneByName('user');
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      roles: userRole ? [userRole] : [],
      isEmailVerified: true,
    });
    return user.save();
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const data = await this.userModel
      .find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    const total = await this.userModel.countDocuments().exec();
    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<User> {
    validateObjectId(id, 'user');
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new CustomNotFoundException(
        `User with ID ${id} not found`,
        'userNotFound',
      );
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new CustomNotFoundException(
        `User with email ${email} not found`,
        'userNotFound',
      );
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    validateObjectId(id, 'user');
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!user) {
      throw new CustomNotFoundException(
        `User with ID ${id} not found`,
        'userNotFound',
      );
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    validateObjectId(id, 'user');
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) {
      throw new CustomNotFoundException(
        `User with ID ${id} not found`,
        'userNotFound',
      );
    }
  }

  async assignRoleToUser(assignRoleDto: AssignRoleDto) {
    const { userId, roleId } = assignRoleDto;
    validateObjectId(userId, 'user');
    validateObjectId(roleId, 'role');

    const user = await this.userModel.findById(userId).exec();
    const role = await this.roleService.findOne(roleId);

    if (!user) {
      throw new CustomNotFoundException(
        `User with id ${userId} not found`,
        'userNotFound',
      );
    }
    if (!role) {
      throw new CustomNotFoundException(
        `Role with id ${roleId} not found`,
        'roleNotFound',
      );
    }
    user.roles = user.roles ? [...user.roles, role] : [role];
    return user.save();
  }
}

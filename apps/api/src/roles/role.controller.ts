import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PoliciesGuard } from '@api/casl/guards/policies.guard';
import { CheckPolicies } from '@api/casl/decorators/check-policies.decorator';
import { Action, AppAbility } from '@api/casl/ability.factory';
import { Role } from './schema/role.schema';

@ApiTags('roles')
@Controller('roles')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('API-Key-auth')
@UseGuards(AuthGuard(['api-key', 'jwt']), PoliciesGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Role))
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Role))
  @Get()
  async findAll() {
    return this.roleService.findAll();
  }

  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Role))
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, Role))
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(id, updateRoleDto);
  }

  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Role))
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }

  @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, Role))
  @Post(':roleId/permissions/:permissionId')
  async assignPermissionToRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.roleService.assignPermissionToRole(roleId, permissionId);
  }

  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, Role))
  @Delete(':roleId/permissions/:permissionId')
  async removePermissionFromRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.roleService.removePermissionFromRole(roleId, permissionId);
  }
}

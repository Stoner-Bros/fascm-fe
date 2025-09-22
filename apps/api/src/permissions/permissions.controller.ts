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
import { PermissionService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ApiBearerAuth, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CheckPolicies } from '@api/casl/decorators/check-policies.decorator';
import { Action, AppAbility } from '@api/casl/ability.factory';
import { PoliciesGuard } from '@api/casl/guards/policies.guard';
import { Permission } from './schema/permission.schema';

@ApiTags('permissions')
@Controller('permissions')
@ApiBearerAuth('JWT-auth')
@ApiSecurity('API-Key-auth')
@UseGuards(AuthGuard(['api-key', 'jwt']), PoliciesGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Create, Permission),
  )
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Permission))
  async findAll() {
    return this.permissionService.findAll();
  }

  @Get(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Permission))
  async findOne(@Param('id') id: string) {
    return this.permissionService.findOne(id);
  }

  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Update, Permission),
  )
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.Delete, Permission),
  )
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.permissionService.remove(id);
  }
}

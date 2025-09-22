import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './schema/role.schema';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { ApiKeyModule } from '@api/api-keys/api-key.module';
import { CaslModule } from '@api/casl/casl.module';
import { PermissionModule } from '@api/permissions/permissions.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    PermissionModule,
    ApiKeyModule,
    CaslModule,
  ],
  providers: [RoleService],
  controllers: [RoleController],
  exports: [RoleService],
})
export class RoleModule {}

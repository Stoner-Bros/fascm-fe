import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionService } from './permissions.service';
import { PermissionController } from './permissions.controller';
import { Permission, PermissionSchema } from './schema/permission.schema';
import { CaslModule } from '@api/casl/casl.module';
import { ApiKeyModule } from '@api/api-keys/api-key.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema },
    ]),
    ApiKeyModule,
    CaslModule,
  ],
  providers: [PermissionService],
  controllers: [PermissionController],
  exports: [PermissionService],
})
export class PermissionModule {}

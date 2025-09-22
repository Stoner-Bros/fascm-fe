import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiKey, ApiKeySchema } from './schema/api-key.schema';
import { ApiKeyService } from './api-key.service';
import { ApiKeyController } from './api-key.controller';
import { CaslModule } from '@api/casl/casl.module';
import { PassportModule } from '@nestjs/passport';
import { ApiKeyStrategy } from './api-key.strategy';
import { User, UserSchema } from '@api/users/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ApiKey.name, schema: ApiKeySchema },
      { name: User.name, schema: UserSchema },
    ]),
    PassportModule,
    CaslModule,
  ],
  providers: [ApiKeyService, ApiKeyStrategy],
  controllers: [ApiKeyController],
  exports: [ApiKeyService, PassportModule, ApiKeyStrategy],
})
export class ApiKeyModule {}

import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { PoliciesGuard } from '../casl/guards/policies.guard';
import { CheckPolicies } from '../casl/decorators/check-policies.decorator';
import { Action, AppAbility } from '../casl/ability.factory';
import { ApiKey } from './schema/api-key.schema';
import { User } from '@api/auth/decorators/user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiKeyPolicies } from './policies/api-key.policies';

@Controller('api-keys')
@ApiTags('api-keys')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post()
  @CheckPolicies(ApiKeyPolicies.create)
  async createApiKey(@User('id') userId: string, @Body() dto: CreateApiKeyDto) {
    return this.apiKeyService.createApiKey(userId, dto);
  }

  @Get()
  @CheckPolicies(ApiKeyPolicies.read)
  async listApiKeys(@User('id') userId: string) {
    return this.apiKeyService.listApiKeys(userId);
  }

  @Delete(':id')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Delete, ApiKey))
  async revokeApiKey(@User('id') userId: string, @Param('id') keyId: string) {
    return this.apiKeyService.revokeApiKey(userId, keyId);
  }

  @Post(':id/rotate')
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Update, ApiKey))
  async rotateApiKey(@User('id') userId: string, @Param('id') keyId: string) {
    return this.apiKeyService.rotateApiKey(userId, keyId);
  }
}

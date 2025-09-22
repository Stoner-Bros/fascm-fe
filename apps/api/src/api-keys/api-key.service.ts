import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomBytes, createHash } from 'crypto';
import { ApiKey } from './schema/api-key.schema';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import {
  CustomUnauthorizedException,
  CustomNotFoundException,
} from '@api/common/exceptions/custom-exceptions';
import { validateObjectId } from '@api/common/utils/mongoose.utils';

@Injectable()
export class ApiKeyService {
  constructor(@InjectModel(ApiKey.name) private apiKeyModel: Model<ApiKey>) {}

  private generateApiKey(): string {
    const key = randomBytes(32).toString('hex');
    return `ak_${key}`;
  }

  private hashApiKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }

  async createApiKey(
    userId: string,
    dto: CreateApiKeyDto,
  ): Promise<{ key: string; apiKey: any }> {
    const plainKey = this.generateApiKey();
    const hashedKey = this.hashApiKey(plainKey);

    const apiKey = new this.apiKeyModel({
      key: hashedKey,
      name: dto.name,
      owner: userId,
      expiresAt: new Date(
        Date.now() + (dto.expiresInDays || 365) * 24 * 60 * 60 * 1000,
      ),
      rateLimit: dto.rateLimit || { requests: 1000, perSeconds: 3600 },
      metadata: dto.metadata,
    });

    await apiKey.save();

    // Return the plain key only once
    return {
      key: plainKey,
      apiKey: { ...apiKey.toObject(), key: '' },
    };
  }

  async validateApiKey(key: string): Promise<ApiKey> {
    const hashedKey = this.hashApiKey(key);

    const apiKey = await this.apiKeyModel.findOneAndUpdate(
      { key: hashedKey, isActive: true, expiresAt: { $gte: new Date() } },
      { lastUsedAt: new Date() },
      { new: true },
    );

    if (!apiKey) {
      throw new CustomUnauthorizedException(
        'Invalid or expired API key',
        'invalidApiKey',
      );
    }

    return apiKey;
  }

  async revokeApiKey(userId: string, keyId: string): Promise<void> {
    validateObjectId(keyId, 'api key');
    validateObjectId(userId, 'user');

    const apiKey = await this.apiKeyModel.findOneAndUpdate(
      { _id: keyId, owner: userId },
      { isActive: false },
    );

    if (!apiKey) {
      throw new CustomNotFoundException('API key not found', 'apiKeyNotFound');
    }
  }

  async rotateApiKey(
    userId: string,
    keyId: string,
  ): Promise<{ key: string; apiKey: ApiKey }> {
    validateObjectId(keyId, 'api key');
    validateObjectId(userId, 'user');

    const oldApiKey = await this.apiKeyModel.findOneAndUpdate(
      { _id: keyId, owner: userId, isActive: true },
      { isActive: false },
    );

    if (!oldApiKey) {
      throw new CustomNotFoundException(
        'API key not found or inactive',
        'apiKeyNotFound',
      );
    }

    // Create new key with same settings
    return this.createApiKey(userId, {
      name: `${oldApiKey.name} (rotated)`,
      expiresInDays: 365,
      rateLimit: oldApiKey.rateLimit,
      metadata: oldApiKey.metadata,
    });
  }

  async listApiKeys(userId: string): Promise<ApiKey[]> {
    return this.apiKeyModel.find(
      { owner: userId, isActive: true },
      'id name expiresAt lastUsedAt createdAt metadata',
    );
  }
}

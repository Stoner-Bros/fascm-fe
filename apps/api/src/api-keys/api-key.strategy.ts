import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ApiKeyService } from './api-key.service';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@api/users/schema/user.schema';
import { CustomUnauthorizedException } from '@api/common/exceptions/custom-exceptions';
import { isValidObjectId } from '@api/common/utils/mongoose.utils';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(
  HeaderAPIKeyStrategy,
  'api-key',
) {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {
    super(
      { header: 'x-api-key', prefix: '' },
      true,
      async (apiKey: string, done: any, req: any, next: () => void) => {
        const validKey = await this.apiKeyService.validateApiKey(apiKey);
        if (!validKey) {
          return done(
            new CustomUnauthorizedException('Invalid API key', 'invalidApiKey'),
            false,
          );
        }

        if (!isValidObjectId(validKey.owner)) {
          return done(
            new CustomUnauthorizedException(
              'Invalid user ID format',
              'invalidUserId',
            ),
            false,
          );
        }

        const user = await this.userModel
          .findById(validKey.owner)
          .select(
            'id firstName lastName email createdAt updatedAt roles permissions',
          );

        if (!user) {
          throw new CustomUnauthorizedException(
            'User not found',
            'userNotFound',
          );
        }

        return done(null, user, next);
      },
    );
  }
}

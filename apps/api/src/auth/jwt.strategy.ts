import { User } from '@api/users/schema/user.schema';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Model } from 'mongoose';
import { CustomUnauthorizedException } from '@api/common/exceptions/custom-exceptions';
import { validateObjectId } from '@api/common/utils/mongoose.utils';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string }) {
    try {
      validateObjectId(payload.sub, 'user');
    } catch {
      throw new CustomUnauthorizedException('Invalid user ID', 'invalidUserId');
    }

    const user = await this.userModel
      .findById(payload.sub)
      .select(
        'id firstName lastName email avatar createdAt updatedAt proExpiresAt',
      )
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions',
        },
      })
      .exec();

    if (!user) {
      throw new CustomUnauthorizedException('User not found', 'userNotFound');
    }

    return user;
  }
}

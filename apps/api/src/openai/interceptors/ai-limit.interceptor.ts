import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { OpenAiService } from '../openai.service';
import { UsersService } from '@api/users/users.service';
import { UserDocument } from '@api/users/schema/user.schema';
import { CustomForbiddenException } from '@api/common/exceptions/custom-exceptions';

@Injectable()
export class AILimitInterceptor implements NestInterceptor {
  constructor(
    private readonly openaiService: OpenAiService,
    private readonly userService: UsersService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = await this.userService.findOne(request.user.id);

    const isPro =
      user.proExpiresAt &&
      new Date(user.proExpiresAt.toString()).getTime() > new Date().getTime();

    if (!isPro) {
      const allowed = await this.openaiService.incrementUsage(
        user as UserDocument,
        user.dailyPromptLimit,
      );

      if (!allowed) {
        throw new CustomForbiddenException(
          'You have used all your free credits today. Please try again tomorrow or upgrade your plan.',
          'dailyLimitExceeded',
        );
      }
    }

    return next.handle();
  }
}

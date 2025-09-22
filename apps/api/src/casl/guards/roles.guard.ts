import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true; // No roles required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Check if user has any of the required roles
    const hasRole = () => {
      if (!user.roles || !Array.isArray(user.roles)) {
        return false;
      }

      return user.roles.some((role: any) => {
        // Check if the user has any of the required roles
        // Role can be an object with a name property or a string
        const roleName = typeof role === 'string' ? role : role.name;
        return requiredRoles.includes(roleName);
      });
    };

    if (!hasRole()) {
      throw new UnauthorizedException(
        'User does not have sufficient permissions',
      );
    }

    return true;
  }
}

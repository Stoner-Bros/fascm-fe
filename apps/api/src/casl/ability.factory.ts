import { Injectable } from '@nestjs/common';
import {
  AbilityBuilder,
  createMongoAbility,
  InferSubjects,
  MongoAbility,
} from '@casl/ability';
import { ApiKey } from '../api-keys/schema/api-key.schema';
import { User } from '@api/users/schema/user.schema';
import { Permission } from '@api/permissions/schema/permission.schema';
import { Role } from '@api/roles/schema/role.schema';
import { Role as Role_Enum } from '@api/roles/enums/role.enum';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subjects =
  | InferSubjects<typeof ApiKey | typeof User | typeof Role | typeof Permission>
  | 'all'
  | string;
export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    if (user.roles) {
      user.roles?.forEach((role) => {
        role.permissions?.forEach((permission) => {
          const action = permission.action as Action; // Cast to Action enum
          if (Object.values(Action).includes(action)) {
            // Validate the action
            if (permission.conditions) {
              can(action, permission.subject, permission.conditions);
            } else {
              can(action, permission.subject);
            }
          } else {
            console.warn(`Invalid action: ${permission.action}`);
          }
        });
      });
    }

    // Default role hierarchy rules
    if (this.hasRole(user, Role_Enum.ADMIN)) {
      can(Action.Manage, 'all');
    }

    if (this.hasRole(user, Role_Enum.DEVELOPER)) {
      can(Action.Manage, 'all');
    }

    return build();
  }

  private hasRole(user: User, roleName: string): boolean {
    return user.roles?.some((role) => role.name === roleName);
  }

  // createForApiKey(apiKey: ApiKey) {
  //   const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  //   apiKey.permissions.forEach(permission => {
  //     switch (permission) {
  //       case ApiKeyPermission.READ:
  //         can(Action.Read, 'all');
  //         break;
  //       case ApiKeyPermission.WRITE:
  //         can(Action.Create, 'all');
  //         can(Action.Update, 'all');
  //         break;
  //       case ApiKeyPermission.ADMIN:
  //         can(Action.Manage, 'all');
  //         break;
  //     }
  //   });

  //   return build();
  // }
}

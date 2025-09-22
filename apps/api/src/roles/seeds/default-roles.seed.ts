import { Role as RoleEnum } from '../enums/role.enum';

export const defaultRoles: Partial<any>[] = [
  {
    name: RoleEnum.ADMIN,
    description: 'Administrator with full system access',
    permissions: ['manage_all'],
  },
  {
    name: RoleEnum.DEVELOPER,
    description: 'Developer with full system access',
    permissions: ['manage_all'],
  },
  {
    name: RoleEnum.USER,
    description: 'Regular user with basic access',
    permissions: ['read_all'],
  },
];

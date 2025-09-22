import { Permission } from '../schema/permission.schema';
import { Action } from '../../casl/ability.factory';

export const defaultPermissions: Partial<Permission>[] = [
  {
    action: Action.Manage,
    subject: 'all',
    description: 'Can manage all resources',
  },
  {
    action: Action.Create,
    subject: 'all',
    description: 'Can create all resource',
  },
  {
    action: Action.Read,
    subject: 'all',
    description: 'Can read all resource',
  },
  {
    action: Action.Update,
    subject: 'all',
    description: 'Can update all resource',
  },
  {
    action: Action.Delete,
    subject: 'all',
    description: 'Can delete all resource',
  },
  {
    action: Action.Create,
    subject: 'ApiKey',
    description: 'Can create API keys',
  },
  {
    action: Action.Read,
    subject: 'ApiKey',
    conditions: { ownerId: '${userId}' },
    description: 'Can read own API keys',
  },
  {
    action: Action.Update,
    subject: 'ApiKey',
    conditions: { ownerId: '${userId}' },
    description: 'Can update own API keys',
  },
  {
    action: Action.Delete,
    subject: 'ApiKey',
    conditions: { ownerId: '${userId}' },
    description: 'Can delete own API keys',
  },
  // Add more default permissions as needed
];

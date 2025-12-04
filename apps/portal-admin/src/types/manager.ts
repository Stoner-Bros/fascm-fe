import { User } from './auth';
import type { AccountUserPayload } from './common';
import { Warehouse } from './warehouse';

export type Manager = {
  warehouse: Warehouse | null;
  user: User;
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateManagerDto = {
  warehouse?: {
    id: string;
  } | null;
  user: AccountUserPayload;
};

export type UpdateManagerDto = Partial<CreateManagerDto>;

export type FindAllManagersDto = {
  page?: number;
  limit?: number;
  warehouseId?: string;
  search?: string;
};

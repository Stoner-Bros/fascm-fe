import type { AccountUserPayload } from './common';

export type Manager = {
  id: string;
  warehouse?: {
    id: string;
    name?: string;
    address?: string;
  } | null;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  createdAt?: string;
  updatedAt?: string;
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

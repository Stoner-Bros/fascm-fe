import type { AccountUserPayload } from './common';

export type Staff = {
  id: string;
  position: string;
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
  };
  createdAt?: string;
  updatedAt?: string;
};

export type CreateStaffDto = {
  warehouse?: {
    id: string;
  } | null;
  position: string;
  user: AccountUserPayload;
};

export type UpdateStaffDto = Partial<CreateStaffDto>;

export type FindAllStaffsDto = {
  page?: number;
  limit?: number;
  warehouseId?: string;
  search?: string;
};

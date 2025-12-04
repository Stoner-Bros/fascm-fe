import { User } from './auth';
import type { AccountUserPayload } from './common';
import { Warehouse } from './warehouse';

export type Staff = {
  warehouse: Warehouse | null;
  position: string;
  user: User;
  id: string;
  createdAt: string;
  updatedAt: string;
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

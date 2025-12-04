import { User } from './auth';
import type { AccountUserPayload } from './common';
import { Truck } from './truck';
import { Warehouse } from './warehouse';

export type DeliveryStaff = {
  truck: Truck | null;
  warehouse: Warehouse | null;
  licenseExpiredAt: string;
  licensePhoto: string;
  licenseNumber: string;
  user: User;
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateDeliveryStaffDto = {
  truck?: {
    id: string;
  } | null;
  warehouse?: {
    id: string;
  } | null;
  licenseNumber: string;
  licensePhoto?: string;
  licenseExpiredAt: string;
  user: AccountUserPayload;
};

export type UpdateDeliveryStaffDto = Partial<CreateDeliveryStaffDto>;

export type FindAllDeliveryStaffsDto = {
  page?: number;
  limit?: number;
  warehouseId?: string;
  truckId?: string;
  search?: string;
};

import type { AccountUserPayload } from './common';

export type DeliveryStaff = {
  id: string;
  licenseNumber: string;
  licensePhoto?: string;
  licenseExpiredAt?: string;
  truck?: {
    id: string;
    licenseNumber?: string;
    model?: string;
  } | null;
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

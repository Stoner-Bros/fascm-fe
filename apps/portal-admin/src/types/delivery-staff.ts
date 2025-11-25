export type DeliveryStaff = {
  id: string;
  licenseNumber: string;
  licensePhoto?: string;
  licenseExpiredAt?: string;
  truck?: {
    id: string;
    licenseNumber?: string;
    model?: string;
  };
  warehouse?: {
    id: string;
    name?: string;
    address?: string;
  };
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
  truck: {
    id: string;
  };
  warehouse: {
    id: string;
  };
  licenseNumber: string;
  licensePhoto?: string;
  licenseExpiredAt: string;
  user: {
    id: string;
  };
};

export type UpdateDeliveryStaffDto = Partial<CreateDeliveryStaffDto>;

export type FindAllDeliveryStaffsDto = {
  page?: number;
  limit?: number;
  warehouseId?: string;
  truckId?: string;
  search?: string;
};

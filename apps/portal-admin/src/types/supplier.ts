import type { AccountUserPayload } from './common';

export type Supplier = {
  warehouse: {
    address: string;
    name: string;
    id: string;
    createdAt: string;
    updatedAt: string;
  };
  user: {
    id: number;
    email: string;
    provider: string;
    socialId: string;
    firstName: string;
    lastName: string;
    photo: {
      id: string;
      path: string;
    };
    role: {
      id: number;
      name: string;
    };
    status: {
      id: number;
      name: string;
    };
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
  };
  contact: string;
  taxCode: string;
  address: string;
  certificate: string;
  qrCode: string;
  gardenName: string;
  representativeName: string;
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateSupplierDto = {
  contact: string;
  taxCode: string;
  address: string;
  certificate?: string;
  qrCode?: string;
  gardenName: string;
  representativeName: string;
  warehouse?: {
    id: string;
  } | null;
  user: AccountUserPayload;
};

export type UpdateSupplierDto = Partial<CreateSupplierDto>;

export type FindAllSuppliersDto = {
  page?: number;
  limit?: number;
  search?: string;
};

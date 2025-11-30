export type Supplier = {
  id: string;
  user?: {
    clerkUserId?: string | null;
    id: number;
    firstName?: string;
    lastName?: string;
    role?: {
      id: number;
      name: string;
      __entity?: string;
    };
    status?: {
      id: number;
      name: string;
      __entity?: string;
    };
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
  };
  contact?: string;
  taxCode?: string;
  address?: string;
  certificate?: string;
  qrCode?: string;
  gardenName?: string;
  representativeName?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  // Legacy fields for backward compatibility
  name?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  rating?: number;
  isActive?: boolean;
  certifications?: string[];
};

export type CreateSupplierDto = {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  certifications?: string[];
};

export type UpdateSupplierDto = Partial<CreateSupplierDto>;

export type FindAllSuppliersDto = {
  page?: number;
  limit?: number;
};

export type InfinityPaginationResponse<T> = {
  data: T[];
  hasNextPage: boolean;
};

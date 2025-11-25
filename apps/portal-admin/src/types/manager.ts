export type Manager = {
  id: string;
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

export type CreateManagerDto = {
  warehouse: {
    id: string;
  };
  user: {
    id: string;
  };
};

export type UpdateManagerDto = Partial<CreateManagerDto>;

export type FindAllManagersDto = {
  page?: number;
  limit?: number;
  warehouseId?: string;
  search?: string;
};

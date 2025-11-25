export type Warehouse = {
  id: string;
  name: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateWarehouseDto = {
  name: string;
  address: string;
};

export type UpdateWarehouseDto = Partial<CreateWarehouseDto>;

export type FindAllWarehousesDto = {
  page?: number;
  limit?: number;
  search?: string;
};

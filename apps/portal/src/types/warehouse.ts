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

export type WarehouseTicketsResponse = {
  importTickets: Array<{
    unit: string;
    quantity: number;
    percent: number;
    importDate: string;
    expiredAt: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    batchCode: string;
    productName: string;
    numberOfBatch: number;
    areaName: string;
  }>;
  exportTickets: Array<{
    unit: string;
    quantity: number;
    exportDate: string;
    id: string;
    createdAt: string;
    updatedAt: string;
    productName: string;
    areaName: string;
  }>;
};

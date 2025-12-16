export type Area = {
  id: string;
  name: string;
  description?: string;
  capacity: number; // Sức chứa của area (kg)
  availableCapacity?: number; // Sức chứa khả dụng = capacity - (số batch * 20kg)
  location: string;
  warehouse?: {
    id: string;
    name?: string;
  } | null;
  iotDevice?: {
    id: string;
    name?: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateAreaDto = {
  name: string;
  description?: string;
  capacity: number; // Sức chứa của area (kg)
  availableCapacity?: number; // Sức chứa khả dụng, mặc định = capacity khi tạo mới
  location: string;
  warehouse: {
    id: string;
  };
  iotDevice?: {
    id: string;
  }[];
};

export type UpdateAreaDto = Partial<CreateAreaDto>;

export type FindAllAreasDto = {
  page?: number;
  limit?: number;
  search?: string;
  warehouseId?: string;
};

export type AreaTicketsResponse = {
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

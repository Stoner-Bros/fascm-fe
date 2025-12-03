export type InboundBatch = {
  id: string;
  quantity: number;
  unit: string;
  batchCode: string;
  product: {
    id: string;
    name?: string;
  };
  harvestDetail: {
    id: string;
    code?: string;
    harvestTicket?: {
      id: string;
      harvestScheduleId?: {
        id: string;
        supplierId?: {
          id: string;
          warehouse?: {
            id: string;
            name?: string;
          };
        };
      };
    };
  };
  warehouse?: {
    id: string;
    name?: string;
  };
  warehouseId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateInboundBatchDto = {
  quantity: number;
  unit: string;
  batchCode: string;
  product: {
    id: string;
  };
  harvestDetail: {
    id: string;
  };
};

export type UpdateInboundBatchDto = Partial<CreateInboundBatchDto>;

export type FindAllInboundBatchesDto = {
  page?: number;
  limit?: number;
  search?: string;
  productId?: string;
  harvestDetailId?: string;
};

export type InboundBatch = {
  id: string;
  quantity: number;
  unit: string;
  batchCode: string;
  importTicket?: any;
  harvestInvoiceDetail: any;
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

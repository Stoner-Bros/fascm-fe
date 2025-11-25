export type Batch = {
  id: string;
  batchCode: string;
  quantity: number;
  unit: string;
  volume: number;
  area?: {
    id: string;
    name?: string;
  };
  product?: {
    id: string;
    name?: string;
  };
  importTicket?: {
    id: string;
  };
  orderDetail?: {
    id: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type CreateBatchDto = {
  orderDetail?: {
    id: string;
  };
  volume?: number;
  quantity: number;
  unit: string;
  batchCode: string;
  area?: {
    id: string;
  };
  product: {
    id: string;
  };
  importTicket: {
    id: string;
  };
};

export type UpdateBatchDto = Partial<CreateBatchDto>;

export type FindAllBatchesDto = {
  page?: number;
  limit?: number;
  search?: string;
  importTicketId?: string;
  productId?: string;
};

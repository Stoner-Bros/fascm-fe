export type BatchPrice = {
  price: number;
  quantity: number;
  unit: string;
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type Batch = {
  id: string;
  batchCode: string;
  quantity: number;
  currentQuantity?: number;
  unit: string;
  volume?: number;
  costPrice?: number;
  expiredAt?: string | null;
  price?: BatchPrice[];
  area?: {
    id: string;
    name?: string;
  };
  product?: {
    id: string;
    name?: string;
    image?: string | null;
  };
  importTicket?: {
    id: string;
  };
  orderDetail?: {
    id: string;
  };
  createdAt?: string;
  updatedAt?: string;
  gardenName?: string;
  harvestDate?: string;
  initQuantity?: number;
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
  importTicketId?: string;
  productId?: string;
  areaId?: string;
};

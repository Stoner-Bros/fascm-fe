export type ImportTicket = {
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
};

export type CreateImportTicketDto = {
  realityQuantity: number;
  expiredAt?: string | null;
  inboundBatch: {
    id: string;
  };
  area: {
    id: string;
  };
};

export type UpdateImportTicketDto = Partial<CreateImportTicketDto>;

export type FindAllImportTicketsDto = {
  page?: number;
  limit?: number;
  search?: string;
  inboundBatchId?: string;
  areaId?: string;
};

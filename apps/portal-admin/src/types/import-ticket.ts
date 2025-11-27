export type ImportTicket = {
  id: string;
  numberOfBatch: number;
  percent: number;
  realityQuantity: number;
  importDate: string;
  inboundBatch?: {
    id: string;
    batchCode?: string;
    product?: {
      id: string;
      name?: string;
    };
  };
  area?: {
    id: string;
    name?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type CreateImportTicketDto = {
  realityQuantity: number;
  importDate: string;
  inboundBatch: {
    id: string;
  };
  area?: {
    id: string;
  };
};

export type UpdateImportTicketDto = Partial<CreateImportTicketDto>;

export type FindAllImportTicketsDto = {
  page?: number;
  limit?: number;
  search?: string;
  inboundBatchId?: string;
};

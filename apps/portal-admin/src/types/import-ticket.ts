export type ImportTicket = {
  id: string;
  numberOfBatch?: number;
  percent?: number;
  realityQuantity: number;
  importDate: string;
  expiredAt?: string | null;
  numberOfBigBatch?: number | null;
  numberOfSmallBatch?: number | null;
  unit?: string | null;
  quantity?: number | null;
  inboundBatch?: {
    id?: string;
    batchCode?: string;
    unit?: string;
    quantity: number;
    product?: {
      id: string;
      name?: string;
    };
    harvestDetail: {
      product: {
        id: string;
        name?: string;
        unit?: string;
      };
    };
    harvestTicket?: {
      id: string;
      date: string;
      quantity: number;
      unit?: string;
      harvestScheduleId?: {
        id: string;
        supplierId?: {
          warehouse?: {
            id: string;
            name?: string;
          };
          user?: {
            id: string;
            firstName?: string;
            lastName?: string;
          };
          gardenName?: string;
          representativeName?: string;
        };
      };
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
  expiredAt?: string | null;
  inboundBatch: {
    id: string;
  };
  area: {
    id: string;
  };
  numberOfBigBatch?: number | null;
  numberOfSmallBatch?: number | null;
};

export type UpdateImportTicketDto = Partial<CreateImportTicketDto>;

export type FindAllImportTicketsDto = {
  page?: number;
  limit?: number;
  search?: string;
  inboundBatchId?: string;
  areaId?: string;
};

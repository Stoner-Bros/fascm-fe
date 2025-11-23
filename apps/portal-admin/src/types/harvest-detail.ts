export type HarvestDetail = {
  id: string;
  taxRate?: number | null;
  amount?: number | null;
  unitPrice?: number | null;
  quantity?: number | null;
  unit?: string | null;
  product?: {
    id: string;
  } | null;
  harvestTicket?: {
    id: string;
  } | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type CreateHarvestDetailDto = {
  taxRate?: number | null;
  amount?: number | null;
  unitPrice?: number | null;
  quantity?: number | null;
  unit?: string | null;
  product?: {
    id: string;
  } | null;
  harvestTicket?: {
    id: string;
  } | null;
};

export type UpdateHarvestDetailDto = Partial<CreateHarvestDetailDto>;

export type FindAllHarvestDetailsDto = {
  page?: number;
  limit?: number;
  harvestTicketId?: string;
};

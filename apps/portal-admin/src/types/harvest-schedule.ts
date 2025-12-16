export type HarvestSchedule = {
  id: string;
  description?: string | null;
  harvestDate?: string | Date | null;
  address?: string | null;
  supplierId?: {
    id: string;
  } | null;
  supplier?: {
    id: string;
    gardenName?: string;
    address?: string;
    [key: string]: unknown;
  } | null;
  status?: HarvestScheduleStatus | null;
  reason?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  harvestTicket?: {
    id: string;
    [key: string]: unknown;
  };
  harvestDetails?: Array<{
    id: string;
    quantity?: number;
    expectedUnitPrice?: number;
    finalUnitPrice?: number;
    finalUnitPriceAccepted?: boolean;
    unit?: string;
    product?: {
      id: string;
      name?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }>;
};

export type HarvestScheduleStatus =
  // lowercase format
  'pending' | 'rejected' | 'completed' | 'processing' | 'approved' | 'canceled';

export type CreateHarvestScheduleDto = {
  address?: string | null;
  description?: string | null;
  harvestDate: string | Date;
  harvestTicket: {
    ticketNumber?: string | null;
    ticketUrl?: string | null;
  };
  harvestDetails: Array<{
    unitPrice?: number | null;
    quantity?: number | null;
    unit?: string | null;
    product?: {
      id: string;
    } | null;
  }>;
};

export type UpdateHarvestScheduleDto = Partial<CreateHarvestScheduleDto>;
export type UpdateHarvestScheduleStatusDto = {
  status: HarvestScheduleStatus;
  reason?: string;
};
export type FindAllHarvestSchedulesDto = {
  page?: number;
  limit?: number;
  status?: HarvestScheduleStatus;
  supplierId?: string;
  sort?: 'asc' | 'desc';
};

export type UpdateFinalPriceDto = {
  finalUnitPrice: number;
};

export type AcceptPriceDto = {
  finalUnitPriceAccepted: boolean;
};

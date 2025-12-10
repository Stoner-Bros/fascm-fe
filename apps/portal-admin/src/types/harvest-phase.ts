export type HarvestPhaseStatus =
  | 'preparing'
  | 'delivering'
  | 'delivered'
  | 'completed'
  | 'canceled';

export interface HarvestPhase {
  id: string;
  description?: string | null;
  status?: HarvestPhaseStatus | null;
  phaseNumber?: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  harvestSchedule?: {
    id: string;
    [key: string]: unknown;
  };
  harvestInvoice?: {
    id: string;
    invoiceNumber?: string;
    totalAmount?: number;
    totalPayment?: number;
    taxRate?: number;
    [key: string]: unknown;
  };
  harvestInvoiceDetails?: Array<{
    id: string;
    unitPrice?: number | null;
    quantity?: number | null;
    unit?: string | null;
    product?: {
      id: string;
      name?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }>;
  imageProof?: Array<{
    id: string;
    imageUrl?: string;
    [key: string]: unknown;
  }> | null;
}

export interface CreateHarvestInvoiceDetailDto {
  unitPrice?: number | null;
  quantity?: number | null;
  unit?: string | null;
  product: {
    id: string;
  };
}

export interface CreateHarvestInvoiceDto {
  invoiceNumber?: string | null;
  totalAmount?: number | null;
  taxRate?: number | null;
}

export interface CreateHarvestPhaseDto {
  description?: string | null;
  phaseNumber?: number | null;
  harvestSchedule: {
    id: string;
  };
  harvestInvoice?: CreateHarvestInvoiceDto | null;
  harvestInvoiceDetails: CreateHarvestInvoiceDetailDto[];
}

export interface CreateMultipleHarvestPhaseDto {
  harvestPhases: CreateHarvestPhaseDto[];
}

export type UpdateHarvestPhaseDto = Partial<CreateHarvestPhaseDto>;

export interface UpdateHarvestPhaseStatusDto {
  status: HarvestPhaseStatus;
}

export interface FindAllHarvestPhasesDto {
  page?: number;
  limit?: number;
  harvestScheduleId?: string;
}

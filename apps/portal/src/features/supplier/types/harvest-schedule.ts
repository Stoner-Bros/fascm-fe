export type HarvestSchedule = {
  id: string;
  description?: string | null;
  harvestDate?: string | Date | null;
  address?: string | null;
  supplierId?: {
    id: string;
  } | null;
  status?: HarvestScheduleStatus | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type HarvestScheduleStatus =
  | 'PENDING'
  | 'REJECTED'
  | 'COMPLETED'
  | 'PREPARING'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'APPROVED'
  | 'CANCELLED';

export type CreateHarvestScheduleDto = {
  address?: string | null;
  description?: string | null;
  harvestDate: string | Date;
  supplierId: {
    id: string;
  };
};

export type UpdateHarvestScheduleDto = Partial<CreateHarvestScheduleDto>;
export type UpdateHarvestScheduleStatusDto = {
  status: HarvestScheduleStatus;
};
export type FindAllHarvestSchedulesDto = {
  page?: number;
  limit?: number;
  status?: HarvestScheduleStatus;
  supplierId?: string;
};

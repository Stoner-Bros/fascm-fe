export type HarvestSchedule = {
  id: string;
  description?: string | null;
  harvestDate?: string | Date | null;
  supplierId?: {
    id: string;
    user?: {
      firstName?: string;
      lastName?: string;
    };
  } | null;
  status?: HarvestScheduleStatus | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type HarvestScheduleStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'IN_PROGRESS';

export type CreateHarvestScheduleDto = {
  description?: string | null;
  harvestDate: string | Date;
  supplierId: {
    id: string;
  };
};

export type UpdateHarvestScheduleDto = Partial<CreateHarvestScheduleDto>;

export type FindAllHarvestSchedulesDto = {
  page?: number;
  limit?: number;
  status?: HarvestScheduleStatus;
  supplierId?: string;
};

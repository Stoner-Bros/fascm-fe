export type HarvestSchedule = {
  id: string;
  description?: string | null;
  harvestDate?: string | Date | null;
  supplierId?: {
    id: string;
    representativeName?: string;
    gardenName?: string;
    user?: {
      firstName?: string;
      lastName?: string;
    };
    address?: string;
  } | null;
  status?: HarvestScheduleStatus | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type HarvestScheduleStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'canceled'
  | 'completed';

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
  status?: string;
  sort?: 'asc' | 'desc';
};

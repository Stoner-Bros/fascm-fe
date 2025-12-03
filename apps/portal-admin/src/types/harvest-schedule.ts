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
  reason?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  address?: string | null;
};

export type HarvestScheduleStatus =
  | 'pending'
  | 'rejected'
  | 'completed'
  | 'preparing'
  | 'delivering'
  | 'delivered'
  | 'approved'
  | 'cancelled';
export type CreateHarvestScheduleDto = {
  description?: string | null;
  harvestDate: string | Date;
  supplierId: {
    id: string;
  };
  address?: string | null;
};

export type UpdateHarvestScheduleDto = Partial<CreateHarvestScheduleDto>;
export type UpdateHarvestScheduleStatusDto = {
  status: HarvestScheduleStatus;
};
export type FindAllHarvestSchedulesDto = {
  page?: number;
  limit?: number;
  status?: string;
  sort?: 'asc' | 'desc';
};

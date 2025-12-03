export type AreaSetting = {
  id: string;
  minHumidity: number;
  maxHumidity: number;
  minTemperature: number;
  maxTemperature: number;
  minCapacity?: number; // Sức chứa tối thiểu (kg)
  area: {
    id: string;
    name?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type CreateAreaSettingDto = {
  minHumidity: number;
  maxHumidity: number;
  minTemperature: number;
  maxTemperature: number;
  minCapacity?: number; // Sức chứa tối thiểu (kg)
  area: {
    id: string;
  };
};

export type UpdateAreaSettingDto = Partial<CreateAreaSettingDto>;

export type FindAllAreaSettingsDto = {
  page?: number;
  limit?: number;
  areaId?: string;
};

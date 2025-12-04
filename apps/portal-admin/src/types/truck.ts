import { IoTDeviceBE } from './iot-device';

export enum TruckStatusEnum {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  MAINTENANCE = 'maintenance',
  IN_USE = 'in_use'
}

export type Truck = {
  id: string;
  status?: TruckStatusEnum | null;
  currentLocation?: string | null;
  model?: string | null;
  licensePhoto?: string | null;
  licensePlate?: string | null;
  capacity?: number | null;
  iotDevice?: IoTDeviceBE[] | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTruckDto = {
  status?: TruckStatusEnum | null;
  currentLocation?: string | null;
  model?: string | null;
  licensePhoto?: string | null;
  licensePlate?: string | null;
  capacity?: number | null;
  iotDevice?: { id: string }[] | null;
};

export type UpdateTruckDto = Partial<CreateTruckDto>;

export type FindAllTrucksDto = {
  page?: number;
  limit?: number;
};

export type TruckSetting = {
  id: string;
  minHumidity?: number | null;
  maxHumidity?: number | null;
  minTemperature?: number | null;
  maxTemperature?: number | null;
  truck?: { id: string } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTruckSettingDto = {
  minHumidity?: number | null;
  maxHumidity?: number | null;
  minTemperature?: number | null;
  maxTemperature?: number | null;
  truck: { id: string };
};

export type UpdateTruckSettingDto = Partial<CreateTruckSettingDto>;

export type FindAllTruckSettingsDto = {
  page?: number;
  limit?: number;
};

export type TruckAlert = {
  id: string;
  status?: string | null;
  message?: string | null;
  alertType?: string | null;
  truck?: { id: string } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type FindAllTruckAlertsDto = {
  page?: number;
  limit?: number;
};

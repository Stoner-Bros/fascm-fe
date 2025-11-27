import { IoTDeviceBE } from './iot-device';

export type Truck = {
  id: string;
  status?: string | null;
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
  status?: string | null;
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

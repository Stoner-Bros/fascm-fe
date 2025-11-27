export type IoTDeviceBE = {
  id: string;
  type?: string | null;
  status?: 'online' | 'offline' | 'warning' | 'error' | string;
  data?: unknown[] | null;
  lastDataTime?: string | null;
  area?: { id: string } | null;
  truck?: { id: string } | null;
  createdAt?: string;
  updatedAt?: string;
};

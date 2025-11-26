export type InfinityPaginationResponse<T> = {
  data: T[];
  hasNextPage: boolean;
};

export type Product = {
  id: string;
  name?: string | null;
  description?: string | null;
  image?: string | null;
  status?: string | null;
  minStorageHumidity?: string | null;
  minStorageTemperature?: string | null;
  maxStorageHumidity?: string | null;
  maxStorageTemperature?: string | null;
  pricePerKg?: number | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

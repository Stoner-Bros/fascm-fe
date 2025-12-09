export type ProductPrice = {
  id: string;
  price: number;
  quantity: number;
  unit: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
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
  price?: ProductPrice[];
  category?: any | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

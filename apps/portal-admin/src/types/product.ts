export type Category = {
  id: string;
  name?: string | null;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Product = {
  id: string;
  name?: string | null;
  description?: string | null;
  pricePerKg?: number | null;
  image?: string | null;
  categoryId?: Category | null;
  status?: string | null;
  minStorageHumidity?: string | null;
  maxStorageHumidity?: string | null;
  minStorageTemperature?: string | null;
  maxStorageTemperature?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateProductDto = {
  name?: string | null;
  description?: string | null;
  pricePerKg?: number | null;
  image?: string | null;
  categoryId?: { id: string } | null;
  minStorageHumidity?: string | null;
  maxStorageHumidity?: string | null;
  minStorageTemperature?: string | null;
  maxStorageTemperature?: string | null;
};

export type UpdateProductDto = Partial<CreateProductDto>;

export type FindAllProductsDto = {
  page?: number;
  limit?: number;
  categoryId?: string;
  categoryIds?: string[];
};

export type Category = {
  id: string;
  name?: string | null;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Price = {
  id: string;
  price?: number | null;
  quantity?: number | null;
  unit?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Product = {
  id: string;
  name?: string | null;
  description?: string | null;
  image?: string | null;
  category?: Category | null;
  status?: string | null;
  price?: Price[] | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateProductDto = {
  name?: string | null;
  description?: string | null;
  image?: string | null;
  category?: { id: string } | null;
};

export type UpdateProductDto = Partial<CreateProductDto>;

export type FindAllProductsDto = {
  page?: number;
  limit?: number;
  categoryId?: string;
  categoryIds?: string[];
};

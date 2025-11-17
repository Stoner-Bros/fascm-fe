import { fetchJSON } from './client';

export type Category = {
  id: string;
  englishName?: string | null;
  vietnameseName?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InfinityPaginationResponse<T> = {
  data: T[];
  hasNextPage: boolean;
};

export async function fetchCategories({
  page = 1,
  limit = 50
}: { page?: number; limit?: number } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  return fetchJSON<InfinityPaginationResponse<Category>>(
    `/categories?${params.toString()}`
  );
}

export async function fetchCategoryById(id: string) {
  return fetchJSON<Category>(`/categories/${id}`);
}

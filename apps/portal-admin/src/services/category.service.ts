import { fetchJSON } from '@/lib/client';
import type { Category } from '@/types/product';
import type { InfinityPaginationResponse } from '@/types/common';

export interface CreateCategoryDto {
  name?: string | null;
}

export interface UpdateCategoryDto {
  name?: string | null;
}

// Backend category response type
interface CategoryBackend {
  id: string;
  name?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Transform backend category to frontend format
function transformCategory(backendCategory: CategoryBackend): Category {
  return {
    id: backendCategory.id,
    name: backendCategory.name,
    description: null, // Backend không có description field
    createdAt: new Date(backendCategory.createdAt),
    updatedAt: new Date(backendCategory.updatedAt)
  };
}

export async function fetchCategories({
  page = 1,
  limit = 50
}: {
  page?: number;
  limit?: number;
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  const response = await fetchJSON<InfinityPaginationResponse<CategoryBackend>>(
    `/categories?${params.toString()}`
  );

  return {
    ...response,
    data: response.data.map(transformCategory)
  };
}

export async function fetchCategoryById(id: string) {
  const backendCategory = await fetchJSON<CategoryBackend>(`/categories/${id}`);
  return transformCategory(backendCategory);
}

export async function createCategory(data: CreateCategoryDto) {
  const backendCategory = await fetchJSON<CategoryBackend>('/categories', {
    method: 'POST',
    body: data
  });
  return transformCategory(backendCategory);
}

export async function updateCategory(id: string, data: UpdateCategoryDto) {
  const backendCategory = await fetchJSON<CategoryBackend>(
    `/categories/${id}`,
    {
      method: 'PATCH',
      body: data
    }
  );
  return transformCategory(backendCategory);
}

export async function deleteCategory(id: string) {
  return fetchJSON<void>(`/categories/${id}`, {
    method: 'DELETE'
  });
}

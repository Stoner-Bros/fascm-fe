import { Product } from '@/features/consignee/types/product';
import { fetchJSON } from '../lib/client';

export type InfinityPaginationResponse<T> = {
  data: T[];
  hasNextPage: boolean;
};

export async function fetchProducts({
  page = 1,
  limit = 12,
  categoryId,
  categoryIds
}: {
  page?: number;
  limit?: number;
  categoryId?: string;
  categoryIds?: string[];
}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  if (categoryId) params.set('categoryId', categoryId);
  if (Array.isArray(categoryIds)) {
    for (const id of categoryIds) {
      if (id) params.append('categoryIds', id);
    }
  }
  return fetchJSON<InfinityPaginationResponse<Product>>(
    `/products?${params.toString()}`
  );
}

export async function fetchProductById(id: string) {
  return fetchJSON<Product>(`/products/${id}`);
}

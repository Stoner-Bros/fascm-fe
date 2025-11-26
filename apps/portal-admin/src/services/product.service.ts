import { fetchJSON } from '@/lib/client';
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  FindAllProductsDto
} from '@/types/product';
import type { InfinityPaginationResponse } from '@/types/common';

export async function createProduct(body: CreateProductDto) {
  return fetchJSON<Product>('/products', { method: 'POST', body });
}

export async function fetchProducts({
  page = 1,
  limit = 10,
  categoryId,
  categoryIds
}: FindAllProductsDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  if (categoryId) {
    params.append('categoryId', categoryId);
  }

  if (categoryIds && categoryIds.length > 0) {
    params.append('categoryIds', categoryIds.join(','));
  }

  return fetchJSON<InfinityPaginationResponse<Product>>(
    `/products?${params.toString()}`
  );
}

export async function fetchProductById(id: string) {
  return fetchJSON<Product>(`/products/${id}`);
}

export async function updateProduct(id: string, body: UpdateProductDto) {
  return fetchJSON<Product>(`/products/${id}`, {
    method: 'PATCH',
    body
  });
}

export async function deleteProduct(id: string) {
  return fetchJSON<void>(`/products/${id}`, { method: 'DELETE' });
}

export async function updateProductStatus(id: string) {
  return fetchJSON<Product>(`/products/${id}/status`, {
    method: 'PATCH'
  });
}

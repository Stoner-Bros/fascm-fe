import { fetchJSON } from '@/lib/client';
import type { InfinityPaginationResponse } from '@/types/common';

export interface Price {
  id: string;
  batch?: {
    id: string;
  };
  product?: {
    id: string;
  };
  price?: number | null;
  quantity?: number | null;
  unit?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePriceDto {
  batch?: { id: string };
  product?: { id: string };
  price?: number | null;
  quantity?: number | null;
  unit?: string | null;
}

export interface UpdatePriceDto {
  batch?: { id: string };
  product?: { id: string };
  price?: number | null;
  quantity?: number | null;
  unit?: string | null;
}

export interface FindAllPricesDto {
  page?: number;
  limit?: number;
}

export async function fetchPrices({
  page = 1,
  limit = 10
}: FindAllPricesDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  return fetchJSON<InfinityPaginationResponse<Price>>(
    `/prices?${params.toString()}`
  );
}

export async function fetchPriceById(id: string) {
  return fetchJSON<Price>(`/prices/${id}`);
}

export async function createPrice(data: CreatePriceDto) {
  return fetchJSON<Price>('/prices', {
    method: 'POST',
    body: data
  });
}

export async function updatePrice(id: string, data: UpdatePriceDto) {
  return fetchJSON<Price>(`/prices/${id}`, {
    method: 'PATCH',
    body: data
  });
}

export async function deletePrice(id: string) {
  return fetchJSON<void>(`/prices/${id}`, {
    method: 'DELETE'
  });
}

export async function fetchPricesByBatchId(batchId: string) {
  return fetchJSON<Price[]>(`/prices/${batchId}/batch`);
}

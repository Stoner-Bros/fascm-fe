import { fetchJSON } from '@/lib/client';
import type {
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
  FindAllSuppliersDto
} from '@/types/supplier';
import type { InfinityPaginationResponse } from '@/types/common';

export async function createSupplier(body: CreateSupplierDto) {
  return fetchJSON<Supplier>('/suppliers', { method: 'POST', body });
}

export async function fetchSuppliers({
  page = 1,
  limit = 10
}: FindAllSuppliersDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  return fetchJSON<InfinityPaginationResponse<Supplier>>(
    `/suppliers?${params.toString()}`
  );
}

export async function fetchSupplierById(id: string) {
  return fetchJSON<Supplier>(`/suppliers/${id}`);
}

export async function updateSupplier(id: string, body: UpdateSupplierDto) {
  return fetchJSON<Supplier>(`/suppliers/${id}`, {
    method: 'PATCH',
    body
  });
}

export async function deleteSupplier(id: string) {
  return fetchJSON<void>(`/suppliers/${id}`, { method: 'DELETE' });
}

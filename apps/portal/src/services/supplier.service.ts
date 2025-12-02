import { fetchJSON } from '@/lib/client';
import type {
  Supplier,
  UpdateSupplierDto,
  FindAllSuppliersDto,
  InfinityPaginationResponse
} from '../types/supplier';

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

export async function fetchSupplier() {
  return fetchJSON<Supplier>(`/suppliers/mine`);
}

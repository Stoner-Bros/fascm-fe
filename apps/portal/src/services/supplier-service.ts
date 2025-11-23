import { fetchJSON } from '@/lib/client';
import type {
  Supplier,
  CreateSupplierDto,
  UpdateSupplierDto,
  FindAllSuppliersDto,
  InfinityPaginationResponse
} from '../features/supplier/types/supplier';

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

export async function fetchMySupplier(): Promise<Supplier> {
  try {
    // Try to fetch from /suppliers/me endpoint first
    return await fetchJSON<Supplier>('/suppliers/me');
  } catch (error) {
    // If /suppliers/me doesn't exist, get user ID from /auth/me
    // then fetch suppliers and find the one matching user ID
    const { me } = await import('@/services/auth.service');
    const user = await me();

    if (!user || !user.id) {
      throw new Error('User not found');
    }

    // Fetch all suppliers and find the one with matching user.id
    const suppliersResponse = await fetchSuppliers({ page: 1, limit: 100 });
    const supplier = suppliersResponse.data.find(
      (s) => s.user?.id === Number(user.id) || String(s.user?.id) === user.id
    );

    if (!supplier) {
      throw new Error('Supplier not found for current user');
    }

    return supplier;
  }
}

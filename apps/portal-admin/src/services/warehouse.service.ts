import { fetchJSON } from '@/lib/client';
import type {
  Warehouse,
  CreateWarehouseDto,
  UpdateWarehouseDto,
  FindAllWarehousesDto
} from '@/types/warehouse';
import type { InfinityPaginationResponse } from '@/types/common';

const BASE_PATH = '/warehouses';

export async function createWarehouse(body: CreateWarehouseDto) {
  return fetchJSON<Warehouse>(BASE_PATH, {
    method: 'POST',
    body
  });
}

export async function fetchWarehouses({
  page = 1,
  limit = 10,
  search
}: FindAllWarehousesDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  if (search) params.set('search', search);

  return fetchJSON<InfinityPaginationResponse<Warehouse>>(
    `${BASE_PATH}?${params.toString()}`
  );
}

export async function fetchWarehouseById(id: string) {
  return fetchJSON<Warehouse>(`${BASE_PATH}/${id}`);
}

export async function updateWarehouse(id: string, body: UpdateWarehouseDto) {
  return fetchJSON<Warehouse>(`${BASE_PATH}/${id}`, {
    method: 'PATCH',
    body
  });
}

export async function deleteWarehouse(id: string) {
  return fetchJSON<void>(`${BASE_PATH}/${id}`, {
    method: 'DELETE'
  });
}

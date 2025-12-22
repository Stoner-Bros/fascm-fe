import { fetchJSON } from '@/lib/client';
import type { InfinityPaginationResponse } from '@/types/common';
import type { FindAllWarehousesDto, Warehouse } from '@/types/warehouse';

const BASE_PATH = '/warehouses';

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

import { fetchJSON } from '@/lib/client';
import type {
  Manager,
  CreateManagerDto,
  UpdateManagerDto,
  FindAllManagersDto
} from '@/types/manager';
import type { InfinityPaginationResponse } from '@/types/common';

const BASE_PATH = '/managers';

export async function createManager(body: CreateManagerDto) {
  return fetchJSON<Manager>(BASE_PATH, {
    method: 'POST',
    body
  });
}

export async function fetchManagers({
  page = 1,
  limit = 10,
  warehouseId,
  search
}: FindAllManagersDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  if (warehouseId) params.set('warehouseId', warehouseId);
  if (search) params.set('search', search);

  return fetchJSON<InfinityPaginationResponse<Manager>>(
    `${BASE_PATH}?${params.toString()}`
  );
}

export async function fetchManagerById(id: string) {
  return fetchJSON<Manager>(`${BASE_PATH}/${id}`);
}

export async function updateManager(id: string, body: UpdateManagerDto) {
  return fetchJSON<Manager>(`${BASE_PATH}/${id}`, {
    method: 'PATCH',
    body
  });
}

export async function deleteManager(id: string) {
  return fetchJSON<void>(`${BASE_PATH}/${id}`, {
    method: 'DELETE'
  });
}

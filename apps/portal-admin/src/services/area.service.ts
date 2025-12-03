import { fetchJSON } from '@/lib/client';
import type {
  Area,
  CreateAreaDto,
  UpdateAreaDto,
  FindAllAreasDto
} from '@/types/area';
import type { InfinityPaginationResponse } from '@/types/common';

const BASE_PATH = '/areas';

export async function createArea(body: CreateAreaDto) {
  return fetchJSON<Area>(BASE_PATH, {
    method: 'POST',
    body
  });
}

export async function fetchAreas({
  page = 1,
  limit = 10,
  search,
  warehouseId
}: FindAllAreasDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  if (search) params.set('search', search);
  if (warehouseId) params.set('warehouseId', warehouseId);

  return fetchJSON<InfinityPaginationResponse<Area>>(
    `${BASE_PATH}?${params.toString()}`
  );
}

export async function fetchAreaById(id: string) {
  return fetchJSON<Area>(`${BASE_PATH}/${id}`);
}

export async function updateArea(id: string, body: UpdateAreaDto) {
  return fetchJSON<Area>(`${BASE_PATH}/${id}`, {
    method: 'PATCH',
    body
  });
}

export async function deleteArea(id: string) {
  return fetchJSON<void>(`${BASE_PATH}/${id}`, {
    method: 'DELETE'
  });
}

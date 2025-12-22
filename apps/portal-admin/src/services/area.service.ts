import { fetchJSON } from '@/lib/client';
import { useAuthStore } from '@/stores/auth.store';
import type {
  Area,
  CreateAreaDto,
  UpdateAreaDto,
  FindAllAreasDto,
  AreaTicketsResponse
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
  limit = 50,
  warehouseId
}: FindAllAreasDto = {}): Promise<InfinityPaginationResponse<Area>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  const warehouse = useAuthStore.getState()?.fullInfo?.warehouse;
  if (!warehouseId && warehouse) {
    warehouseId = warehouse.id;
  }

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

export type AreaAlert = {
  id: string;
  status?: string | null;
  message?: string | null;
  alertType?: string | null;
  area?: { id: string } | null;
  createdAt?: string;
  updatedAt?: string;
};

export async function fetchAreaAlerts({
  page = 1,
  limit = 50
}: { page?: number; limit?: number } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  return fetchJSON<InfinityPaginationResponse<AreaAlert>>(
    `/area-alerts?${params.toString()}`
  );
}

export async function fetchActiveAreaAlertByAreaId(areaId: string) {
  return fetchJSON<AreaAlert | null>(`/area-alerts/active/area/${areaId}`);
}

export async function fetchAreaTickets(areaId: string) {
  return fetchJSON<AreaTicketsResponse>(`/areas/${areaId}/activity-logs`);
}

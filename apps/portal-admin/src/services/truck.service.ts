import { fetchJSON } from '@/lib/client';
import type {
  Truck,
  CreateTruckDto,
  UpdateTruckDto,
  FindAllTrucksDto
} from '@/types/truck';
import type { InfinityPaginationResponse } from '@/types/common';

const BASE_PATH = '/trucks';

export async function createTruck(body: CreateTruckDto) {
  return fetchJSON<Truck>(BASE_PATH, {
    method: 'POST',
    body
  });
}

export async function fetchTrucks({
  page = 1,
  limit = 10
}: FindAllTrucksDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  return fetchJSON<InfinityPaginationResponse<Truck>>(
    `${BASE_PATH}?${params.toString()}`
  );
}

export async function fetchTruckById(id: string) {
  return fetchJSON<Truck>(`${BASE_PATH}/${id}`);
}

export async function updateTruck(id: string, body: UpdateTruckDto) {
  return fetchJSON<Truck>(`${BASE_PATH}/${id}`, {
    method: 'PATCH',
    body
  });
}

export async function deleteTruck(id: string) {
  return fetchJSON<void>(`${BASE_PATH}/${id}`, {
    method: 'DELETE'
  });
}

import { fetchJSON } from '@/lib/client';
import type {
  Truck,
  CreateTruckDto,
  UpdateTruckDto,
  FindAllTrucksDto
} from '@/types/truck';
import type { InfinityPaginationResponse } from '@/types/common';
import type {
  TruckSetting,
  CreateTruckSettingDto,
  UpdateTruckSettingDto,
  FindAllTruckSettingsDto,
  TruckAlert,
  FindAllTruckAlertsDto
} from '@/types/truck';
import { useAuthStore } from '@/stores/auth.store';

const BASE_PATH = '/trucks';
const SETTINGS_PATH = '/truck-settings';
const ALERTS_PATH = '/truck-alerts';

export async function createTruck(body: CreateTruckDto) {
  return fetchJSON<Truck>(BASE_PATH, {
    method: 'POST',
    body
  });
}

export async function fetchTrucks({
  page = 1,
  limit = 50
}: FindAllTrucksDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  const warehouseId = useAuthStore.getState().fullInfo?.warehouse?.id;
  if (warehouseId) params.set('warehouseId', warehouseId as string);

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

export async function updateTruckStatus(id: string, status: string) {
  return fetchJSON<Truck>(`${BASE_PATH}/${id}/status`, {
    method: 'PATCH',
    body: { status }
  });
}

export async function createTruckSetting(body: CreateTruckSettingDto) {
  return fetchJSON<TruckSetting>(SETTINGS_PATH, { method: 'POST', body });
}

export async function fetchTruckSettings({
  page = 1,
  limit = 50
}: FindAllTruckSettingsDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  return fetchJSON<InfinityPaginationResponse<TruckSetting>>(
    `${SETTINGS_PATH}?${params.toString()}`
  );
}

export async function fetchTruckSettingById(id: string) {
  return fetchJSON<TruckSetting>(`${SETTINGS_PATH}/${id}`);
}

export async function updateTruckSetting(
  id: string,
  body: UpdateTruckSettingDto
) {
  return fetchJSON<TruckSetting>(`${SETTINGS_PATH}/${id}`, {
    method: 'PATCH',
    body
  });
}

export async function fetchTruckAlerts({
  page = 1,
  limit = 50
}: FindAllTruckAlertsDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  return fetchJSON<InfinityPaginationResponse<TruckAlert>>(
    `${ALERTS_PATH}?${params.toString()}`
  );
}

export async function fetchTruckAlertById(id: string) {
  return fetchJSON<TruckAlert>(`${ALERTS_PATH}/${id}`);
}

export async function fetchTruckSettingByTruckId(truckId: string) {
  return fetchJSON<TruckSetting>(`${SETTINGS_PATH}/truck/${truckId}`);
}

export async function fetchActiveTruckAlertByTruckId(truckId: string) {
  return fetchJSON<TruckAlert | null>(`${ALERTS_PATH}/active/truck/${truckId}`);
}

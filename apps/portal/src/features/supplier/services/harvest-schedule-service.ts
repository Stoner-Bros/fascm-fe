import { fetchJSON } from '@/lib/client';
import type {
  HarvestSchedule,
  CreateHarvestScheduleDto,
  UpdateHarvestScheduleDto,
  FindAllHarvestSchedulesDto
} from '../types/harvest-schedule';
import type { InfinityPaginationResponse } from '../types/common';

export async function createHarvestSchedule(body: CreateHarvestScheduleDto) {
  return fetchJSON<HarvestSchedule>('/harvest-schedules', {
    method: 'POST',
    body
  });
}

export async function fetchHarvestSchedules({
  page = 1,
  limit = 10,
  status,
  supplierId
}: FindAllHarvestSchedulesDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  if (status) params.set('status', status);
  if (supplierId) params.set('supplierId', supplierId);

  return fetchJSON<InfinityPaginationResponse<HarvestSchedule>>(
    `/harvest-schedules?${params.toString()}`
  );
}

export async function fetchHarvestScheduleById(id: string) {
  return fetchJSON<HarvestSchedule>(`/harvest-schedules/${id}`);
}

export async function updateHarvestSchedule(
  id: string,
  body: UpdateHarvestScheduleDto
) {
  return fetchJSON<HarvestSchedule>(`/harvest-schedules/${id}`, {
    method: 'PATCH',
    body
  });
}

export async function deleteHarvestSchedule(id: string) {
  return fetchJSON<void>(`/harvest-schedules/${id}`, { method: 'DELETE' });
}

export async function confirmHarvestSchedule(id: string) {
  return fetchJSON<HarvestSchedule>(`/harvest-schedules/${id}/confirm`, {
    method: 'PATCH'
  });
}

export async function cancelHarvestSchedule(id: string) {
  return fetchJSON<HarvestSchedule>(`/harvest-schedules/${id}/cancel`, {
    method: 'PATCH'
  });
}

export async function completeHarvestSchedule(id: string) {
  return fetchJSON<HarvestSchedule>(`/harvest-schedules/${id}/complete`, {
    method: 'PATCH'
  });
}

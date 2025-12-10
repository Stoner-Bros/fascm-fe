import { fetchJSON } from '@/lib/client';
import type { InfinityPaginationResponse } from '../types/common';
import type {
  CreateHarvestScheduleDto,
  FindAllHarvestSchedulesDto,
  HarvestSchedule,
  UpdateHarvestScheduleDto
} from '../types/harvest-schedule';

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
  sort
}: FindAllHarvestSchedulesDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  if (status) params.set('status', status);
  if (sort) params.set('sort', sort);

  return fetchJSON<InfinityPaginationResponse<HarvestSchedule>>(
    `/harvest-schedules?${params.toString()}`
  );
}

export async function fetchHarvestSchedulesBySupplier({
  supplierId,
  page = 1,
  limit = 10,
  status,
  sort
}: FindAllHarvestSchedulesDto & { supplierId: string }) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  if (status) params.set('status', status);
  if (sort) params.set('sort', sort);

  return fetchJSON<InfinityPaginationResponse<HarvestSchedule>>(
    `/harvest-schedules/supplier/${supplierId}?${params.toString()}`
  );
}

export async function fetchMyHarvestSchedules({
  page = 1,
  limit = 10,
  status,
  sort
}: FindAllHarvestSchedulesDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  if (status) params.set('status', status);
  if (sort) params.set('sort', sort);

  return fetchJSON<InfinityPaginationResponse<HarvestSchedule>>(
    `/harvest-schedules/mine?${params.toString()}`
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

export async function updateHarvestScheduleStatus(
  id: string,
  status: string,
  reason?: string
) {
  return fetchJSON<HarvestSchedule>(`/harvest-schedules/${id}/status`, {
    method: 'PATCH',
    body: { status, reason }
  });
}

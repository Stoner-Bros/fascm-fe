import { fetchJSON } from '@/lib/client';
import type {
  HarvestSchedule,
  CreateHarvestScheduleDto,
  UpdateHarvestScheduleDto,
  FindAllHarvestSchedulesDto
} from '@/types/harvest-schedule';
import type { InfinityPaginationResponse } from '@/types/common';

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
  sort = 'desc'
}: FindAllHarvestSchedulesDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    status: status || '',
    sort
  });

  return fetchJSON<InfinityPaginationResponse<HarvestSchedule>>(
    `/harvest-schedules?${params.toString()}`
  );
}

export async function fetchHarvestScheduleById(id: string) {
  return fetchJSON<HarvestSchedule>(`/harvest-schedules/${id}`);
}

export async function approveHarvestSchedule(id: string) {
  return fetchJSON<HarvestSchedule>(`/harvest-schedules/${id}/status`, {
    method: 'PATCH',
    body: { status: 'approved' }
  });
}

export async function deleteHarvestSchedule(id: string) {
  return fetchJSON<void>(`/harvest-schedules/${id}`, { method: 'DELETE' });
}

export async function rejectHarvestSchedule(id: string, reason: string) {
  return fetchJSON<HarvestSchedule>(`/harvest-schedules/${id}/status`, {
    method: 'PATCH',
    body: { status: 'rejected', reason: reason }
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

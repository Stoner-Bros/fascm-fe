import { fetchJSON } from '@/lib/client';
import type { InfinityPaginationResponse } from '../types/common';
import type {
  HarvestPhase,
  CreateHarvestPhaseDto,
  CreateMultipleHarvestPhaseDto,
  UpdateHarvestPhaseDto,
  UpdateHarvestPhaseStatusDto,
  FindAllHarvestPhasesDto
} from '../types/harvest-phase';

export async function createHarvestPhase(body: CreateHarvestPhaseDto) {
  return fetchJSON<HarvestPhase>('/harvest-phases', {
    method: 'POST',
    body
  });
}

export async function createMultipleHarvestPhases(
  body: CreateMultipleHarvestPhaseDto
) {
  return fetchJSON<HarvestPhase[]>('/harvest-phases/multiple', {
    method: 'POST',
    body
  });
}

export async function fetchHarvestPhases({
  page = 1,
  limit = 10
}: FindAllHarvestPhasesDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  return fetchJSON<InfinityPaginationResponse<HarvestPhase>>(
    `/harvest-phases?${params.toString()}`
  );
}

export async function fetchHarvestPhasesBySchedule({
  harvestScheduleId,
  page = 1,
  limit = 10
}: FindAllHarvestPhasesDto & { harvestScheduleId: string }) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });

  return fetchJSON<InfinityPaginationResponse<HarvestPhase>>(
    `/harvest-phases/harvest-schedule/${harvestScheduleId}?${params.toString()}`
  );
}

export async function fetchHarvestPhaseById(id: string) {
  return fetchJSON<HarvestPhase>(`/harvest-phases/${id}`);
}

export async function updateHarvestPhase(
  id: string,
  body: UpdateHarvestPhaseDto
) {
  return fetchJSON<HarvestPhase>(`/harvest-phases/${id}`, {
    method: 'PATCH',
    body
  });
}

export async function updateHarvestPhaseStatus(
  id: string,
  body: UpdateHarvestPhaseStatusDto
) {
  return fetchJSON<HarvestPhase>(`/harvest-phases/${id}/status`, {
    method: 'PATCH',
    body
  });
}

export async function deleteHarvestPhase(id: string) {
  return fetchJSON<void>(`/harvest-phases/${id}`, {
    method: 'DELETE'
  });
}

export async function uploadPhaseImageProof(id: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return fetchJSON<{ path: string }>(`/harvest-phases/${id}/upload-img-proof`, {
    method: 'POST',
    body: formData,
    headers: {}, // Let browser set Content-Type with boundary
    file: true
  });
}

import { fetchJSON } from '@/lib/client';
import type {
  HarvestDetail,
  CreateHarvestDetailDto,
  UpdateHarvestDetailDto,
  FindAllHarvestDetailsDto
} from '@/types/harvest-detail';
import type { InfinityPaginationResponse } from '@/types/common';

export async function createHarvestDetail(body: CreateHarvestDetailDto) {
  return fetchJSON<HarvestDetail>('/harvest-details', {
    method: 'POST',
    body
  });
}

export async function fetchHarvestDetails({
  page = 1,
  limit = 10,
  harvestTicketId
}: FindAllHarvestDetailsDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  if (harvestTicketId) params.set('harvestTicketId', harvestTicketId);

  return fetchJSON<InfinityPaginationResponse<HarvestDetail>>(
    `/harvest-details?${params.toString()}`
  );
}

export async function fetchHarvestDetailsByHarvestTicketId(
  harvestTicketId: string
) {
  return fetchJSON<HarvestDetail[]>(
    `/harvest-details/harvest-ticket/${harvestTicketId}`
  );
}

export async function fetchHarvestDetailById(id: string) {
  return fetchJSON<HarvestDetail>(`/harvest-details/${id}`);
}

export async function updateHarvestDetail(
  id: string,
  body: UpdateHarvestDetailDto
) {
  return fetchJSON<HarvestDetail>(`/harvest-details/${id}`, {
    method: 'PATCH',
    body
  });
}

export async function deleteHarvestDetail(id: string) {
  return fetchJSON<void>(`/harvest-details/${id}`, { method: 'DELETE' });
}

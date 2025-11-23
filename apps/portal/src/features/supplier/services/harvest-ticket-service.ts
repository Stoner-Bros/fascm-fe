import { fetchJSON } from '@/lib/client';
import type {
  HarvestTicket,
  CreateHarvestTicketDto,
  UpdateHarvestTicketDto,
  FindAllHarvestTicketsDto
} from '../types/harvest-ticket';
import type { InfinityPaginationResponse } from '../types/common';

export async function createHarvestTicket(body: CreateHarvestTicketDto) {
  return fetchJSON<HarvestTicket>('/harvest-tickets', {
    method: 'POST',
    body
  });
}

export async function fetchHarvestTickets({
  page = 1,
  limit = 10,
  harvestScheduleId
}: FindAllHarvestTicketsDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  if (harvestScheduleId) params.set('harvestScheduleId', harvestScheduleId);

  return fetchJSON<InfinityPaginationResponse<HarvestTicket>>(
    `/harvest-tickets?${params.toString()}`
  );
}

export async function fetchHarvestTicketById(id: string) {
  return fetchJSON<HarvestTicket>(`/harvest-tickets/${id}`);
}

export async function updateHarvestTicket(
  id: string,
  body: UpdateHarvestTicketDto
) {
  return fetchJSON<HarvestTicket>(`/harvest-tickets/${id}`, {
    method: 'PATCH',
    body
  });
}

export async function deleteHarvestTicket(id: string) {
  return fetchJSON<void>(`/harvest-tickets/${id}`, { method: 'DELETE' });
}

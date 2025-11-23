import { fetchJSON, getApiBase } from '@/lib/client';
import type {
  HarvestTicket,
  CreateHarvestTicketDto,
  UpdateHarvestTicketDto,
  FindAllHarvestTicketsDto
} from '@/types/harvest-ticket';
import type { InfinityPaginationResponse } from '@/types/common';

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

export async function fetchHarvestTicketInvoice(id: string): Promise<Blob> {
  const url = `${getApiBase()}/harvest-tickets/${id}/invoice`;

  let accessToken: string | null = null;
  if (typeof window !== 'undefined') {
    try {
      accessToken = window.localStorage.getItem('ADAT');
    } catch (e) {
      console.warn('[API] Unable to read accessToken from localStorage', e);
    }
  }

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    }
  });

  if (!res.ok) {
    let errorMessage = `Failed to fetch invoice: ${res.status} ${res.statusText}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData?.message || errorMessage;
    } catch {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return res.blob();
}

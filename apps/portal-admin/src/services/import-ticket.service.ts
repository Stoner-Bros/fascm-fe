import { fetchJSON } from '@/lib/client';
import type {
  CreateImportTicketDto,
  FindAllImportTicketsDto,
  ImportTicket,
  UpdateImportTicketDto
} from '@/types/import-ticket';
import type { InfinityPaginationResponse } from '@/types/common';
import { useAuthStore } from '@/stores/auth.store';

const BASE_PATH = '/import-tickets';

export async function fetchImportTickets({
  page = 1,
  limit = 10
}: FindAllImportTicketsDto = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  const warehouseId = useAuthStore.getState().fullInfo?.warehouse?.id;

  if (warehouseId) params.set('warehouseId', warehouseId as string);

  return fetchJSON<InfinityPaginationResponse<ImportTicket>>(
    `${BASE_PATH}?${params.toString()}`
  );
}

export async function fetchImportTicketById(id: string) {
  return fetchJSON<ImportTicket>(`${BASE_PATH}/${id}`);
}

export async function createImportTicket(body: CreateImportTicketDto) {
  return fetchJSON<ImportTicket>(BASE_PATH, {
    method: 'POST',
    body
  });
}

export async function updateImportTicket(
  id: string,
  body: UpdateImportTicketDto
) {
  return fetchJSON<ImportTicket>(`${BASE_PATH}/${id}`, {
    method: 'PATCH',
    body
  });
}

export async function deleteImportTicket(id: string) {
  return fetchJSON<void>(`${BASE_PATH}/${id}`, {
    method: 'DELETE'
  });
}

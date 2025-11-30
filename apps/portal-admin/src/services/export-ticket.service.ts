import { fetchJSON } from '@/lib/client';
import type { InfinityPaginationResponse } from '@/types/common';
import { OrderDetailBE } from '@/types/order';

export type ExportTicket = {
  id: string;
  numberOfBatch?: number | null;
  ExportDate?: string | null;
  orderDetail?: OrderDetailBE | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateExportTicketDto = {
  numberOfBatch?: number | null;
  ExportDate?: Date | string | null;
  orderDetail?: { id: string } | null;
};

const BASE_PATH = '/export-tickets';

export async function createExportTicket(body: CreateExportTicketDto) {
  return fetchJSON<ExportTicket>(BASE_PATH, { method: 'POST', body });
}

export async function createExportTicketsBulk(bodies: CreateExportTicketDto[]) {
  return fetchJSON<ExportTicket[]>(`${BASE_PATH}/many`, {
    method: 'POST',
    body: bodies
  });
}

export async function fetchExportTickets({
  page = 1,
  limit = 10
}: {
  page?: number;
  limit?: number;
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  return fetchJSON<InfinityPaginationResponse<ExportTicket>>(
    `${BASE_PATH}?${params.toString()}`
  );
}

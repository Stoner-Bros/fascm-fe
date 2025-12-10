import { fetchJSON } from '@/lib/client';
import type { InfinityPaginationResponse } from '@/types/common';

export type ExportTicket = {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type OrderInvoiceDetailWithBatch = {
  orderInvoiceDetailId: string;
  batchIds: string[];
};

export type CreateExportTicketDto = {
  invoiceDetails: OrderInvoiceDetailWithBatch[];
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

export async function fetchExportTicketById(id: string) {
  return fetchJSON<ExportTicket>(`${BASE_PATH}/${id}`);
}

export async function deleteExportTicket(id: string) {
  return fetchJSON<void>(`${BASE_PATH}/${id}`, {
    method: 'DELETE'
  });
}

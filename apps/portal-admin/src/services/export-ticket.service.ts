import { fetchJSON } from '@/lib/client';
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

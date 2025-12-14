import type { ImportTicket } from '@/types/import-ticket';

// Import Ticket List Types
export type ImportTicketRow = {
  id: string;
  batchCode: string;
  productName: string;
  quantity: number;
  unit: string;
  numberOfBatch: number;
  areaName: string;
  importDate: string;
  expiredAt: string | null;
  percent: number;
};

export type StatusFilter = 'ALL';

export type State = {
  importTickets: ImportTicketRow[];
  loading: boolean;
  searchQuery: string;
  statusFilter: StatusFilter;
  deleteDialogOpen: boolean;
  selectedTicketId: string | null;
  isCreateDialogOpen: boolean;
  isQualityCheckOpen: boolean;
  page: number;
  hasMore: boolean;
};

export type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_IMPORT_TICKETS'; payload: ImportTicketRow[] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_STATUS_FILTER'; payload: StatusFilter }
  | { type: 'OPEN_DELETE_DIALOG'; payload: string }
  | { type: 'CLOSE_DELETE_DIALOG' }
  | { type: 'DELETE_TICKET'; payload: string }
  | { type: 'OPEN_CREATE_DIALOG' }
  | { type: 'CLOSE_CREATE_DIALOG' }
  | { type: 'OPEN_QUALITY_CHECK' }
  | { type: 'CLOSE_QUALITY_CHECK' }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_HAS_MORE'; payload: boolean }
  | { type: 'LOAD_ERROR' };

export const mapImportTicketToRow = (
  ticket: ImportTicket
): ImportTicketRow => ({
  id: ticket.id,
  batchCode: ticket.batchCode || '-',
  productName: ticket.productName || '-',
  quantity: ticket.quantity,
  unit: ticket.unit,
  numberOfBatch: ticket.numberOfBatch,
  areaName: ticket.areaName || '-',
  importDate: ticket.importDate,
  expiredAt: ticket.expiredAt || null,
  percent: ticket.percent
});

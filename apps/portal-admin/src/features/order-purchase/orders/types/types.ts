import { HarvestScheduleStatus } from '@/types/harvest-schedule';

// Harvest Schedule List Types
export type HarvestScheduleRow = {
  id: string;
  scheduleNumber: string;
  products: string;
  harvestDate: string;
  address: string;
  status: HarvestScheduleStatus;
  description?: string;
  reason?: string;
  createdAt: string;
  supplierName?: string;
};

export type StatusFilter =
  | 'ALL'
  | 'pending'
  | 'rejected'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'canceled';

export type State = {
  harvestSchedules: HarvestScheduleRow[];
  loading: boolean;
  searchQuery: string;
  statusFilter: StatusFilter;
  cancelDialogOpen: boolean;
  selectedScheduleId: string | null;
};

export type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_HARVEST_SCHEDULES'; payload: HarvestScheduleRow[] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_STATUS_FILTER'; payload: StatusFilter }
  | { type: 'OPEN_CANCEL_DIALOG'; payload: string }
  | { type: 'CLOSE_CANCEL_DIALOG' }
  | { type: 'CANCEL_SCHEDULE'; payload: string }
  | { type: 'LOAD_ERROR' };

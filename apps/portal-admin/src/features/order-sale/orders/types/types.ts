import { OrderScheduleStatus } from '@/types/order';

// Order List Types
export type OrderScheduleRow = {
  id: string;
  orderNumber: string;
  products: string;
  deliveryDate: string;
  address: string;
  status: OrderScheduleStatus;
  description?: string;
  reason?: string;
  createdAt: string;
  consigneeName?: string;
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
  orderSchedules: OrderScheduleRow[];
  loading: boolean;
  searchQuery: string;
  statusFilter: StatusFilter;
  cancelDialogOpen: boolean;
  rejectDialogOpen: boolean;
  selectedScheduleId: string | null;
  updatingStatusIds: Set<string>;
};

export type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ORDER_SCHEDULES'; payload: OrderScheduleRow[] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_STATUS_FILTER'; payload: StatusFilter }
  | { type: 'OPEN_CANCEL_DIALOG'; payload: string }
  | { type: 'CLOSE_CANCEL_DIALOG' }
  | { type: 'OPEN_REJECT_DIALOG'; payload: string }
  | { type: 'CLOSE_REJECT_DIALOG' }
  | { type: 'CANCEL_ORDER'; payload: string }
  | { type: 'REJECT_ORDER'; payload: string }
  | { type: 'APPROVE_ORDER'; payload: string }
  | { type: 'SET_UPDATING_STATUS'; payload: { id: string; updating: boolean } }
  | { type: 'LOAD_ERROR' };

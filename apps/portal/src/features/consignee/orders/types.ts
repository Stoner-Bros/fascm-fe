import { OrderScheduleStatus } from '@/types/order';
import type { Product } from '@/types/product';
import type { Batch } from '@/types/batch';

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
  selectedScheduleId: string | null;
};

export type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ORDER_SCHEDULES'; payload: OrderScheduleRow[] }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_STATUS_FILTER'; payload: StatusFilter }
  | { type: 'OPEN_CANCEL_DIALOG'; payload: string }
  | { type: 'CLOSE_CANCEL_DIALOG' }
  | { type: 'CANCEL_ORDER'; payload: string }
  | { type: 'LOAD_ERROR' };

// New Order Types
export type OrderLine = {
  productId?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  batchId?: string;
  batchCode?: string;
};

export type Step = 'products' | 'delivery' | 'review';

export type NewOrderState = {
  currentStep: Step;
  products: Product[];
  productBatches: Record<string, Batch[]>;
  orderLines: OrderLine[];
  selectedProducts: Set<string>;
  deliveryDate: string;
  deliveryAddress: string;
  orderDescription: string;
  deliveryPos?: { lat: number; lng: number };
  showMap: boolean;
  loading: boolean;
  submitting: boolean;
};

export type NewOrderAction =
  | { type: 'SET_STEP'; payload: Step }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | {
      type: 'SET_PRODUCT_BATCHES';
      payload: { productId: string; batches: Batch[] };
    }
  | { type: 'SET_ORDER_LINES'; payload: OrderLine[] }
  | { type: 'ADD_ORDER_LINE'; payload: OrderLine }
  | {
      type: 'UPDATE_ORDER_LINE';
      payload: { productId: string; field: keyof OrderLine; value: any };
    }
  | { type: 'REMOVE_ORDER_LINE'; payload: string }
  | {
      type: 'TOGGLE_PRODUCT';
      payload: { product: Product; orderLine: OrderLine };
    }
  | { type: 'SET_SELECTED_PRODUCTS'; payload: Set<string> }
  | { type: 'SET_DELIVERY_DATE'; payload: string }
  | { type: 'SET_DELIVERY_ADDRESS'; payload: string }
  | { type: 'SET_ORDER_DESCRIPTION'; payload: string }
  | {
      type: 'SET_DELIVERY_POS';
      payload: { lat: number; lng: number } | undefined;
    }
  | { type: 'TOGGLE_MAP' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | {
      type: 'PREFILL_FROM_URL';
      payload: { products: Product[]; preSelectedIds: string[] };
    };

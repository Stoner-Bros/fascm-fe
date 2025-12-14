import { Area } from '@/types/area';
import { Batch } from '@/types/batch';
import { OrderPhase, OrderSchedule } from '@/types/order';

// Export ticket wizard steps
export type ExportTicketStep =
  | 'schedule'
  | 'phase'
  | 'invoiceDetail'
  | 'area'
  | 'batches'
  | 'summary';

export const EXPORT_TICKET_STEPS: ExportTicketStep[] = [
  'schedule',
  'phase',
  'invoiceDetail',
  'area',
  'batches',
  'summary'
];

export const STEP_LABELS: Record<ExportTicketStep, string> = {
  schedule: 'Lịch giao hàng',
  phase: 'Đợt giao hàng',
  invoiceDetail: 'Chi tiết hóa đơn',
  area: 'Khu vực kho',
  batches: 'Lô hàng',
  summary: 'Xác nhận'
};

// Order invoice detail with product info
export interface OrderInvoiceDetail {
  id: string;
  unitPrice?: number | null;
  quantity?: number | null;
  unit?: string | null;
  product?: {
    id: string;
    name?: string;
    image?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Wizard state
export interface ExportTicketWizardState {
  currentStep: ExportTicketStep;
  // Selected data
  selectedSchedule: OrderSchedule | null;
  selectedPhase: OrderPhase | null;
  selectedInvoiceDetail: OrderInvoiceDetail | null;
  selectedArea: Area | null;
  selectedBatchIds: string[];
  // Available data
  schedules: OrderSchedule[];
  phases: OrderPhase[];
  areas: Area[];
  batches: Batch[];
  // Loading states
  loadingSchedules: boolean;
  loadingPhases: boolean;
  loadingAreas: boolean;
  loadingBatches: boolean;
  // Error states
  errorSchedules: string | null;
  errorPhases: string | null;
  errorAreas: string | null;
  errorBatches: string | null;
  // Submission
  isSubmitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;
}

// Actions for the wizard
export type ExportTicketWizardAction =
  | { type: 'SET_STEP'; step: ExportTicketStep }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_SCHEDULES_LOADING'; loading: boolean }
  | { type: 'SET_SCHEDULES'; schedules: OrderSchedule[] }
  | { type: 'SET_SCHEDULES_ERROR'; error: string | null }
  | { type: 'SELECT_SCHEDULE'; schedule: OrderSchedule | null }
  | { type: 'SET_PHASES_LOADING'; loading: boolean }
  | { type: 'SET_PHASES'; phases: OrderPhase[] }
  | { type: 'SET_PHASES_ERROR'; error: string | null }
  | { type: 'SELECT_PHASE'; phase: OrderPhase | null }
  | { type: 'SELECT_INVOICE_DETAIL'; invoiceDetail: OrderInvoiceDetail | null }
  | { type: 'SET_AREAS_LOADING'; loading: boolean }
  | { type: 'SET_AREAS'; areas: Area[] }
  | { type: 'SET_AREAS_ERROR'; error: string | null }
  | { type: 'SELECT_AREA'; area: Area | null }
  | { type: 'SET_BATCHES_LOADING'; loading: boolean }
  | { type: 'SET_BATCHES'; batches: Batch[] }
  | { type: 'SET_BATCHES_ERROR'; error: string | null }
  | { type: 'TOGGLE_BATCH'; batchId: string }
  | { type: 'SET_SELECTED_BATCHES'; batchIds: string[] }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'SET_SUBMIT_ERROR'; error: string | null }
  | { type: 'SET_SUBMIT_SUCCESS'; success: boolean }
  | { type: 'RESET' };

// Initial state
export const initialWizardState: ExportTicketWizardState = {
  currentStep: 'schedule',
  selectedSchedule: null,
  selectedPhase: null,
  selectedInvoiceDetail: null,
  selectedArea: null,
  selectedBatchIds: [],
  schedules: [],
  phases: [],
  areas: [],
  batches: [],
  loadingSchedules: false,
  loadingPhases: false,
  loadingAreas: false,
  loadingBatches: false,
  errorSchedules: null,
  errorPhases: null,
  errorAreas: null,
  errorBatches: null,
  isSubmitting: false,
  submitError: null,
  submitSuccess: false
};

import { Consignee } from './consignee';
import { Product } from './product';

// ============================================================================
// ORDER SCHEDULE
// ============================================================================

export type OrderScheduleStatus =
  | 'pending'
  | 'rejected'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'canceled';

export type OrderSchedule = {
  id: string;
  address?: string | null;
  description?: string | null;
  status?: OrderScheduleStatus | null;
  deliveryDate?: Date | string | null;
  consignee?: Consignee | null;
  reason?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  order: Order;
  orderDetails: OrderDetail[];
};

export type CreateOrderScheduleDto = {
  address?: string | null;
  description?: string | null;
  deliveryDate?: Date | string | null;
  order: CreateOrderDto;
  orderDetails: CreateOrderDetailDto[];
};

export type UpdateOrderScheduleDto = Partial<CreateOrderScheduleDto>;

export type UpdateOrderScheduleStatusDto = {
  status: OrderScheduleStatus;
  reason?: string;
};

export type FindAllOrderSchedulesDto = {
  page?: number;
  limit?: number;
  status?: OrderScheduleStatus;
  sort?: 'asc' | 'desc';
};

// ============================================================================
// ORDER
// ============================================================================

export type Order = {
  id: string;
  unit?: string | null;
  quantity?: number | null;
  orderNumber?: string | null;
  orderUrl?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type CreateOrderDto = {
  orderNumber?: string | null;
  orderUrl?: string | null;
};

// ============================================================================
// ORDER DETAIL
// ============================================================================

export type OrderDetail = {
  id: string;
  amount?: number | null;
  unitPrice?: number | null;
  quantity?: number | null;
  unit?: string | null;
  product?: Product | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type CreateOrderDetailDto = {
  unitPrice?: number | null;
  quantity?: number | null;
  unit?: string | null;
  product?: { id: string } | null;
};

// ============================================================================
// ORDER PHASE
// ============================================================================

export type OrderPhaseStatus =
  | 'preparing'
  | 'delivering'
  | 'delivered'
  | 'completed'
  | 'canceled';

export type ImageProof = {
  id: string;
  path?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type OrderPhase = {
  id: string;
  imageProof?: ImageProof[] | null;
  description?: string | null;
  status?: OrderPhaseStatus | null;
  phaseNumber?: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  orderInvoice: OrderInvoice;
  orderInvoiceDetails: OrderInvoiceDetail[];
};

export type CreateOrderPhaseDto = {
  description?: string | null;
  phaseNumber?: number | null;
  orderSchedule: { id: string };
  orderInvoice?: CreateOrderInvoiceDto | null;
  orderInvoiceDetails: CreateOrderInvoiceDetailDto[];
};

export type CreateMultipleOrderPhaseDto = {
  orderPhases: CreateOrderPhaseDto[];
};

export type UpdateOrderPhaseDto = Partial<CreateOrderPhaseDto>;

export type UpdateOrderPhaseStatusDto = {
  status: OrderPhaseStatus;
};

export type FindAllOrderPhasesDto = {
  page?: number;
  limit?: number;
};

// ============================================================================
// ORDER INVOICE
// ============================================================================

export type OrderInvoice = {
  id: string;
  totalPayment?: number | null;
  totalAmount?: number | null;
  quantity?: number | null;
  unit?: string | null;
  vatAmount?: number | null;
  taxRate?: number | null;
  invoiceNumber?: number | null;
  invoiceUrl?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type CreateOrderInvoiceDto = {
  taxRate?: number | null;
  invoiceNumber?: number | null;
  invoiceUrl?: string | null;
};

// ============================================================================
// ORDER INVOICE DETAIL
// ============================================================================

export type OrderInvoiceDetail = {
  id: string;
  amount?: number | null;
  taxRate?: number | null;
  unitPrice?: number | null;
  quantity?: number | null;
  unit?: string | null;
  product?: Product | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type CreateOrderInvoiceDetailDto = {
  unitPrice?: number | null;
  quantity?: number | null;
  unit?: string | null;
  product: { id: string };
};

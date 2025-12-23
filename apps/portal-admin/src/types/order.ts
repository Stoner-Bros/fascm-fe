import { OrderDetail } from './order-detail';
import { Product } from './product';

export type Consignee = {
  id: string;
  contact?: string | null;
  taxCode?: string | null;
  address?: string | null;
  certificate?: string | null;
  qrCode?: string | null;
  organizationName?: string | null;
  representativeName?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export type OrderWithDetailsResponseDto = {
  order: OrderBE;
  orderDetails: OrderDetailBE[];
};

export type OrderScheduleStatus =
  | 'pending'
  | 'rejected'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'canceled';

export type OrderSchedule = {
  id: string;
  status?: OrderScheduleStatus | null;
  description?: string | null;
  deliveryDate?: string | Date | null;
  address?: string | null;
  reason?: string | null;
  createdAt: string;
  updatedAt: string;
  consignee?: Consignee | null;
  order?: {
    id: string;
    unit?: string | null;
    quantity?: number | null;
    orderNumber?: string | null;
    orderUrl?: string | null;
    createdAt?: string | Date | null;
    updatedAt?: string | Date | null;
  } | null;
  orderDetails?: Array<OrderDetail> | null;
};

export type OrderBE = {
  id: string;
  totalVolume?: number | null;
  totalMass?: number | null;
  totalPayment?: number | null;
  vatAmount?: number | null;
  totalAmount?: number | null;
  orderDate?: string | null;
  orderUrl?: string | null;
  orderSchedule?: OrderSchedule | null;
  createdAt: string;
  updatedAt: string;
};

export type FindAllOrdersDto = {
  page?: number;
  limit?: number;
};

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

export type OrderDetailBE = {
  id: string;
  image?: string | null;
  taxRate?: number | null;
  amount?: number | null;
  unitPrice?: number | null;
  quantity?: number | null;
  unit?: string | null;
  product?: Product | null;
  order?: { id: string } | null;
  numberOfBatch?: number | null;
  createdAt: string;
  updatedAt: string;
};

// Order Phase Types
export type OrderPhaseStatus =
  | 'preparing'
  | 'delivering'
  | 'delivered'
  | 'completed'
  | 'canceled';

export interface OrderPhase {
  id: string;
  description?: string | null;
  status?: OrderPhaseStatus | null;
  phaseNumber?: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  orderSchedule?: {
    id: string;
    [key: string]: unknown;
  };
  orderInvoice?: {
    id: string;
    invoiceNumber?: string;
    totalAmount?: number;
    totalPayment?: number;
    taxRate?: number | null;
    [key: string]: unknown;
  };
  orderInvoiceDetails?: Array<{
    id: string;
    unitPrice?: number | null;
    quantity?: number | null;
    unit?: string | null;
    product?: {
      id: string;
      name?: string;
      [key: string]: unknown;
    };
    amount?: number | null;
    [key: string]: unknown;
    orderDetailSelections?: Array<any>;
  }>;
  imageProof?: Array<{
    id: string;
    photo?: {
      id: string;
      path?: string | null;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }> | null;
}

export interface CreateOrderInvoiceDetailDto {
  quantity: number | null;
  unit?: string | null;
  product: {
    id: string | null;
  };
  selectionIds?: string[] | null;
}

export interface CreateOrderInvoiceDto {
  taxRate?: number | null;
  invoiceNumber?: string | null;
  totalAmount?: number | null;
}

export interface CreateOrderPhaseDto {
  description?: string | null;
  phaseNumber?: number | null;
  orderSchedule: {
    id: string;
  };
  orderInvoice?: CreateOrderInvoiceDto | null;
  orderInvoiceDetails: CreateOrderInvoiceDetailDto[] | null;
}

export interface CreateMultipleOrderPhaseDto {
  orderPhases: CreateOrderPhaseDto[];
}

export type UpdateOrderPhaseDto = Partial<CreateOrderPhaseDto>;

export interface UpdateOrderPhaseStatusDto {
  status: OrderPhaseStatus;
}

export interface FindAllOrderPhasesDto {
  page?: number;
  limit?: number;
  orderScheduleId?: string;
}

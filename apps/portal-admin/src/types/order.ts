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
  consignee?: Consignee | null;
  createdAt: string;
  updatedAt: string;
  address?: string | null;
  reason?: string | null;
  orders?: Array<{
    id: string;
    totalAmount?: number;
    orderDate?: string;
    orderUrl?: string;
    [key: string]: unknown;
  }>;
  orderDetails?: Array<{
    id: string;
    quantity?: number;
    unitPrice?: number;
    unit?: string;
    product?: {
      id: string;
      name?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }>;
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
    [key: string]: unknown;
  }>;
  imageProof?: Array<{
    id: string;
    imageUrl?: string;
    [key: string]: unknown;
  }> | null;
}

export interface CreateOrderInvoiceDetailDto {
  unitPrice?: number | null;
  quantity?: number | null;
  unit?: string | null;
  product: {
    id: string;
  };
}

export interface CreateOrderInvoiceDto {
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
  orderInvoiceDetails: CreateOrderInvoiceDetailDto[];
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

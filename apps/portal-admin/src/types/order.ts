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
export type OrderSchedule = {
  id: string;
  status?: OrderScheduleStatus | null;
  description?: string | null;
  orderDate?: string | null;
  consignee?: Consignee | null;
  createdAt: string;
  updatedAt: string;
  address?: string | null;
};

export type OrderScheduleStatus =
  | 'pending'
  | 'rejected'
  | 'preparing'
  | 'delivering'
  | 'delivered'
  | 'completed'
  | 'canceled'
  | 'approved';

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

export type UpdateOrderScheduleDto = {
  status?: OrderScheduleStatus;
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

export type OrderPhase = {
  id: string;
  phaseNumber?: number | null;
  status?: string | null;
  description?: string | null;
  orderSchedule?: OrderSchedule | null;
  createdAt: string;
  updatedAt: string;
};

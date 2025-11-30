import { Product } from './product';
import { Consignee } from './consignee';

export type Order = {
  totalVolume?: number | null;
  totalMass?: number | null;
  totalPayment?: number | null;
  vatAmount?: number | null;
  totalAmount?: number | null;
  taxRate?: number | null;
  orderDate?: string | null;
  orderUrl?: string | null;
  payment?: { id: string } | null;
  orderSchedule?: {
    id: string;
    status?: OrderScheduleStatus;
    address: string;
    description?: string | null;
    orderDate?: string | null;
    consignee?: Consignee | null;
  } | null;
  id: string;
  createdAt: Date;
  updatedAt: Date;
};
export type OrderScheduleStatus = 'IN_PROGRESS' | 'CONFIRMED' | 'CANCELLED';
export type CreateOrderRequest = {
  id?: string | null;
  totalVolume?: number | null;
  totalMass?: number | null;
  totalPayment?: number | null;
  vatAmount?: number | null;
  totalAmount?: number | null;
  taxRate?: number | null;
  orderDate?: string | null;
  orderUrl?: string | null;
  payment?: { id: string } | null;
  orderSchedule?: { id: string } | null;
};
export type OrderDetail = {
  taxRate?: number | null;
  amount?: number | null;
  unitPrice?: number | null;
  quantity?: number | null;
  unit?: string | null;
  product?: Product | null;
  order?: Order | null;
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderRef = { id: string };
export type ProductRef = { id: string };

export type CreateOrderDetailRequest = {
  taxRate?: number | null;
  amount?: number | null;
  unitPrice?: number | null;
  quantity?: number | null;
  unit?: string | null;
  product?: ProductRef | null;
  order?: OrderRef | null;
};

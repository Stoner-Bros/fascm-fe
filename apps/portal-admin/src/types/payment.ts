// Payment Types
import type { Debt } from './debt';

export type PaymentStatus = 'pending' | 'paid';
export type PaymentMethod = 'bank_transfer' | 'cash';
export type PaymentType = 'in' | 'out';

export type Payment = {
  id: string;
  paymentCode?: string | null;
  status?: PaymentStatus | null;
  amount?: number | null;
  paymentMethod?: PaymentMethod | null;
  checkoutUrl?: string | null;
  qrCode?: string | null; // QR code string data (from PayOS)
  paymentType?: PaymentType | null;
  createdAt: Date;
  updatedAt: Date;
  debt?: Debt | null;
};

export type CreatePaymentDto = {
  amount: number;
  paymentMethod: PaymentMethod;
  supplierId?: string | null;
  consigneeId?: string | null;
};

export type UpdatePaymentDto = {
  amount?: number;
  paymentMethod?: PaymentMethod;
};

export type PaymentUpdateEvent = {
  paymentCode: string;
  status: PaymentStatus;
  amount: number;
  paymentMethod: PaymentMethod;
  timestamp: Date;
};

// PayOS Payment Info Response (from PayOS API)
export type PayOSPaymentInfo = {
  id: string;
  orderCode: number;
  amount: number;
  amountPaid: number;
  amountRemaining: number;
  status: string;
  createdAt: string;
  transactions: any[];
  cancellationReason?: string | null;
  canceledAt?: string | null;
};

// PayOS Cancel Response
export type PayOSCancelResponse = {
  id: string;
  orderCode: number;
  amount: number;
  amountPaid: number;
  amountRemaining: number;
  status: string;
  createdAt: string;
  cancellationReason?: string | null;
  canceledAt?: string | null;
};

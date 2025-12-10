// Payment Types
export type PaymentStatus = 'pending' | 'paid';

export type Payment = {
  id: string;
  paymentCode?: string | null;
  status?: PaymentStatus | null;
  amount?: number | null;
  paymentMethod?: string | null;
  checkoutUrl?: string | null;
  qrCode?: string | null; // QR code string data (from PayOS)
  createdAt: Date;
  updatedAt: Date;
};

export type CreatePaymentDto = {
  orderInvoiceId: string;
  paymentMethod: string; // 'transfer', 'cash', etc.
};

export type UpdatePaymentDto = {
  amount?: number;
  paymentMethod?: string;
};

export type PaymentUpdateEvent = {
  paymentCode: string;
  status: PaymentStatus;
  amount: number;
  paymentMethod: string;
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

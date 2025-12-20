import { io, Socket } from 'socket.io-client';
import { fetchJSON } from '@/lib/client';
import type { InfinityPaginationResponse } from '@/types/common';
import type {
  Payment,
  CreatePaymentDto,
  PayOSPaymentInfo,
  PayOSCancelResponse
} from '@/types/payment';

// ============================================================================
// Socket.IO Configuration
// ============================================================================

/**
 * Connect to the payments WebSocket namespace
 */
function connectPaymentSocket(): Socket {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  return io(base + '/payments', {
    path: '/socket.io',
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });
}

/**
 * Payment status update payload from Socket.IO
 */
export type PaymentStatusUpdatePayload = {
  paymentId: string;
  paymentCode: string;
  status: string; // 'pending' | 'paid' | 'canceled'
  amount?: number;
  paymentMethod?: string;
  timestamp: string;
};

/**
 * Subscribe to real-time payment status updates via Socket.IO
 *
 * @param paymentCode - The payment code to monitor
 * @param onStatusUpdate - Callback when payment status changes
 * @returns Cleanup function to unsubscribe and disconnect
 *
 * @example
 * ```tsx
 * const unsubscribe = subscribeToPaymentStatus(
 *   paymentCode,
 *   (update) => {
 *     console.log('Payment status:', update.status);
 *     if (update.status === 'paid') {
 *       router.push('/success');
 *     }
 *   }
 * );
 *
 * // Cleanup on unmount
 * return () => unsubscribe();
 * ```
 */
export function subscribeToPaymentStatus(
  paymentCode: string,
  onStatusUpdate: (payload: PaymentStatusUpdatePayload) => void
): () => void {
  const socket = connectPaymentSocket();

  // Handler for status updates
  const statusHandler = (payload: any) => {
    if (
      payload &&
      typeof payload === 'object' &&
      typeof payload.status === 'string'
    ) {
      onStatusUpdate(payload as PaymentStatusUpdatePayload);
    }
  };

  // Handler for subscription confirmation
  const subscribedHandler = (data: any) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('[Payment Socket] Subscribed to payment:', data.paymentCode);
    }
  };

  // Subscribe to payment updates
  socket.emit('payment:subscribe', { paymentCode });
  socket.on('payment:subscribed', subscribedHandler);
  socket.on('payment:statusUpdate', statusHandler);

  // Connection error handling
  socket.on('connect_error', (error) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('[Payment Socket] Connection error:', error);
    }
  });

  socket.on('disconnect', (reason) => {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('[Payment Socket] Disconnected:', reason);
    }
  });

  // Return cleanup function
  return () => {
    socket.emit('payment:unsubscribe', { paymentCode });
    socket.off('payment:statusUpdate', statusHandler);
    socket.off('payment:subscribed', subscribedHandler);
    socket.disconnect();
  };
}

// ============================================================================
// HTTP API Functions
// ============================================================================

/**
 * Create a new payment
 *
 * @param body - Payment creation data (amount, paymentMethod, partner linkage)
 * @returns Created payment with optional checkout/QR info for bank transfers
 *
 * Note: The backend now expects the caller to provide amount and partner
 * identifiers (supplierId or consigneeId). It returns PayOS checkout/QR data
 * when paymentMethod is bank_transfer.
 */
export async function createPayment(body: CreatePaymentDto): Promise<Payment> {
  return fetchJSON<Payment>('/payments', {
    method: 'POST',
    body
  });
}

/**
 * Fetch all payments with pagination
 *
 * @param options - Pagination options
 * @returns Paginated list of payments
 */
export async function fetchPayments({
  page = 1,
  limit = 10
}: {
  page?: number;
  limit?: number;
} = {}): Promise<InfinityPaginationResponse<Payment>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  return fetchJSON<InfinityPaginationResponse<Payment>>(
    `/payments?${params.toString()}`
  );
}

/**
 * Fetch a single payment by ID
 *
 * @param id - Payment ID
 * @returns Payment details
 */
export async function fetchPaymentById(id: string): Promise<Payment> {
  return fetchJSON<Payment>(`/payments/${id}`);
}

/**
 * Get payment information from PayOS
 *
 * @param paymentCode - The payment code (order code)
 * @returns PayOS payment information
 */
export async function fetchPayOSPaymentInfo(
  paymentCode: string
): Promise<PayOSPaymentInfo> {
  return fetchJSON<PayOSPaymentInfo>(`/payments/payos/${paymentCode}`);
}

/**
 * Cancel a payment
 *
 * @param paymentCode - The payment code to cancel
 * @param cancellationReason - Optional reason for cancellation
 * @returns Cancellation result
 */
export async function cancelPayment(
  paymentCode: string,
  cancellationReason?: string
): Promise<PayOSCancelResponse | Payment> {
  return fetchJSON<PayOSCancelResponse | Payment>(
    `/payments/payos/${paymentCode}/cancel`,
    {
      method: 'POST',
      body: cancellationReason ? { cancellationReason } : undefined
    }
  );
}

/**
 * Confirm a cash payment as paid
 * (Admin/Staff only - marks payment as paid manually)
 *
 * @param paymentCode - The payment code to confirm
 * @returns Updated payment
 */
export async function confirmCashPayment(
  paymentCode: string
): Promise<Payment> {
  return fetchJSON<Payment>(
    `/payments/confirm-payment-paid-by-cash/${paymentCode}`,
    {
      method: 'PATCH'
    }
  );
}

/**
 * Delete a payment
 *
 * @param id - Payment ID
 */
export async function deletePayment(id: string): Promise<void> {
  await fetchJSON(`/payments/${id}`, {
    method: 'DELETE'
  });
}

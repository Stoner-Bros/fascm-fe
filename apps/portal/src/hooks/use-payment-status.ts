import { useEffect, useState, useCallback } from 'react';
import {
  subscribeToPaymentStatus,
  type PaymentStatusUpdatePayload
} from '@/services/payment.service';

interface UsePaymentStatusOptions {
  /**
   * Payment code to monitor
   */
  paymentCode: string | null | undefined;

  /**
   * Callback when payment status changes
   */
  onStatusChange?: (payload: PaymentStatusUpdatePayload) => void;

  /**
   * Callback specifically for successful payment
   */
  onPaymentSuccess?: (payload: PaymentStatusUpdatePayload) => void;

  /**
   * Callback specifically for canceled payment
   */
  onPaymentCanceled?: (payload: PaymentStatusUpdatePayload) => void;

  /**
   * Whether to automatically subscribe when payment code is available
   * @default true
   */
  enabled?: boolean;
}

interface UsePaymentStatusReturn {
  /**
   * Latest payment status update
   */
  status: PaymentStatusUpdatePayload | null;

  /**
   * Whether the socket is connected
   */
  isConnected: boolean;

  /**
   * Latest payment status string
   */
  currentStatus: string | null;

  /**
   * Whether payment is completed (paid)
   */
  isPaid: boolean;

  /**
   * Whether payment is canceled
   */
  isCanceled: boolean;

  /**
   * Whether payment is still pending
   */
  isPending: boolean;
}

/**
 * React hook for subscribing to real-time payment status updates
 *
 * @example
 * ```tsx
 * function PaymentPage() {
 *   const { status, isPaid, isConnected } = usePaymentStatus({
 *     paymentCode: '176536700000083',
 *     onPaymentSuccess: (update) => {
 *       toast.success('Payment successful!');
 *       router.push('/success');
 *     },
 *     onPaymentCanceled: (update) => {
 *       toast.error('Payment was canceled');
 *     }
 *   });
 *
 *   return (
 *     <div>
 *       <p>Status: {status?.status}</p>
 *       <p>Connected: {isConnected ? 'Yes' : 'No'}</p>
 *       {isPaid && <p>Payment Complete! ✓</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePaymentStatus({
  paymentCode,
  onStatusChange,
  onPaymentSuccess,
  onPaymentCanceled,
  enabled = true
}: UsePaymentStatusOptions): UsePaymentStatusReturn {
  const [status, setStatus] = useState<PaymentStatusUpdatePayload | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleStatusUpdate = useCallback(
    (payload: PaymentStatusUpdatePayload) => {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('[usePaymentStatus] Status update received:', payload);
      }
      setStatus(payload);

      // Call general status change callback
      onStatusChange?.(payload);

      // Call specific callbacks based on status
      if (payload.status === 'paid') {
        onPaymentSuccess?.(payload);
      } else if (payload.status === 'canceled') {
        onPaymentCanceled?.(payload);
      }
    },
    [onStatusChange, onPaymentSuccess, onPaymentCanceled]
  );

  useEffect(() => {
    // Don't subscribe if payment code is not available or disabled
    if (!paymentCode || !enabled) {
      setIsConnected(false);
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('[usePaymentStatus] Subscribing to payment:', paymentCode);
    }
    setIsConnected(true);

    // Subscribe to payment updates
    const unsubscribe = subscribeToPaymentStatus(
      paymentCode,
      handleStatusUpdate
    );

    // Cleanup on unmount or when payment code changes
    return () => {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log(
          '[usePaymentStatus] Unsubscribing from payment:',
          paymentCode
        );
      }
      setIsConnected(false);
      unsubscribe();
    };
  }, [paymentCode, enabled, handleStatusUpdate]);

  // Derived state
  const currentStatus = status?.status || null;
  const isPaid = currentStatus === 'paid';
  const isCanceled = currentStatus === 'canceled';
  const isPending = currentStatus === 'pending' || currentStatus === null;

  return {
    status,
    isConnected,
    currentStatus,
    isPaid,
    isCanceled,
    isPending
  };
}

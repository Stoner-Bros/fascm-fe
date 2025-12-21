'use client';

import { useToast } from '@/components/ui/use-toast';
import {
  createPayment,
  subscribeToPaymentStatus,
  confirmCashPayment
} from '@/services/payment.service';
import type { Payment } from '@/types/payment';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UsePaymentOptions {
  onPaymentSuccess?: (payment: Payment) => void;
  onPaymentError?: (error: Error) => void;
}

export function usePayment(options?: UsePaymentOptions) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const { toast } = useToast();

  // Cleanup socket subscription on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  const createPaymentWithQR = useCallback(
    async (amount: number, supplierId?: string, consigneeId?: string) => {
      try {
        setIsCreating(true);

        // Cleanup previous subscription if exists
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }

        const newPayment = await createPayment({
          amount,
          paymentMethod: 'bank_transfer',
          supplierId: supplierId || null,
          consigneeId: consigneeId || null
        });

        setPayment(newPayment);

        // Subscribe to payment status updates if payment code exists
        if (newPayment.paymentCode) {
          const unsubscribe = subscribeToPaymentStatus(
            newPayment.paymentCode,
            (update) => {
              if (update.status === 'paid') {
                setIsSubscribed(false);
                if (unsubscribeRef.current) {
                  unsubscribeRef.current();
                  unsubscribeRef.current = null;
                }
                options?.onPaymentSuccess?.(newPayment);
                toast({
                  title: 'Thanh toán thành công',
                  description: 'Giao dịch đã được xử lý thành công',
                  variant: 'default'
                });
              }
            }
          );

          unsubscribeRef.current = unsubscribe;
          setIsSubscribed(true);
        }
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error('Failed to create payment');
        options?.onPaymentError?.(err);
        toast({
          title: 'Lỗi',
          description: err.message,
          variant: 'destructive'
        });
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [options, toast]
  );

  const createCashPayment = useCallback(
    async (amount: number, supplierId?: string, consigneeId?: string) => {
      try {
        setIsCreating(true);

        // Cleanup previous subscription if exists
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }

        // 1. Create payment with method CASH
        const newPayment = await createPayment({
          amount,
          paymentMethod: 'cash',
          supplierId: supplierId || null,
          consigneeId: consigneeId || null
        });

        setPayment(newPayment);
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error('Failed to create cash payment');
        options?.onPaymentError?.(err);
        toast({
          title: 'Lỗi',
          description: err.message,
          variant: 'destructive'
        });
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [options, toast]
  );

  const reset = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    setPayment(null);
    setIsCreating(false);
    setIsSubscribed(false);
  }, []);

  return {
    payment,
    isCreating,
    isSubscribed,
    createPaymentWithQR,
    createCashPayment,
    reset
  };
}

'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { usePayment } from '../hooks/use-payment';
import { validatePaymentForm } from '../utils/payment-validation';
import { formatDebtAmount } from '../utils/utils';
import { generateQRCodeDataURL } from '../utils/qr-code';
import { Loader2, Check } from 'lucide-react';
import type { Debt } from '@/types/debt';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface PaymentModalProps {
  debt: Debt;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PaymentModal({
  debt,
  isOpen,
  onClose,
  onSuccess
}: PaymentModalProps) {
  const t = useTranslations('Payment.modal');
  const [amount, setAmount] = useState<string>('');
  const [errors, setErrors] = useState<{ amount?: string }>({});
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const { payment, isCreating, createPaymentWithQR, createCashPayment, reset } =
    usePayment({
      onPaymentSuccess: () => {
        onSuccess?.();
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    });

  const maxAmount = debt.remainingAmount ?? 0;

  useEffect(() => {
    if (isOpen) {
      setAmount(maxAmount.toString());
      setErrors({});
      setQrCodeDataURL(null);
      reset();
    }
  }, [isOpen, maxAmount, reset]);

  // Generate QR code when payment.qrCode is available (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (payment?.qrCode && typeof payment.qrCode === 'string') {
      setIsGeneratingQR(true);
      generateQRCodeDataURL(payment.qrCode)
        .then((dataURL) => {
          setQrCodeDataURL(dataURL);
        })
        .catch((error) => {
          console.error('Failed to generate QR code:', error);
        })
        .finally(() => {
          setIsGeneratingQR(false);
        });
    } else {
      setQrCodeDataURL(null);
    }
  }, [payment?.qrCode]);

  const handleClose = () => {
    if (!isCreating) {
      setAmount('');
      setErrors({});
      reset();
      onClose();
    }
  };

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');
    setAmount(numericValue);

    if (errors.amount) {
      const numValue = parseFloat(numericValue) || 0;
      const error = validatePaymentForm(
        { amount: numValue, paymentMethod: 'bank_transfer' },
        maxAmount
      ).amount;
      setErrors({ amount: error });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount) || 0;
    const validationErrors = validatePaymentForm(
      { amount: numAmount, paymentMethod: 'bank_transfer' },
      maxAmount
    );

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Only allow payment for supplier debts
      if (debt.partnerType !== 'supplier' || !debt.supplier) {
        setErrors({
          amount: t('form.amount.error.supplierOnly')
        });
        return;
      }

      const supplierId = debt.supplier.id;

      await createPaymentWithQR(numAmount, supplierId, undefined);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCashPayment = async () => {
    const numAmount = parseFloat(amount) || 0;
    const validationErrors = validatePaymentForm(
      { amount: numAmount, paymentMethod: 'cash' },
      maxAmount
    );

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Only allow payment for supplier debts
      if (debt.partnerType !== 'supplier' || !debt.supplier) {
        setErrors({
          amount: t('form.amount.error.supplierOnly')
        });
        return;
      }

      const supplierId = debt.supplier.id;
      await createCashPayment(numAmount, supplierId, undefined);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleMaxAmount = () => {
    setAmount(maxAmount.toString());
    setErrors({});
  };

  return (
    <Modal
      title={t('title')}
      description={t('description')}
      isOpen={isOpen}
      onClose={handleClose}
      className='lg:max-w-2xl'
    >
      {!payment ? (
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='amount'>{t('form.amount.label')}</Label>
              <span className='text-muted-foreground text-sm'>
                {t('form.amount.max', { amount: formatDebtAmount(maxAmount) })}
              </span>
            </div>
            <div className='relative'>
              <Input
                id='amount'
                type='text'
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder={t('form.amount.placeholder')}
                className={cn('pr-20', errors.amount && 'border-destructive')}
                disabled={isCreating}
                aria-invalid={!!errors.amount}
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={handleMaxAmount}
                className='absolute top-1/2 right-1 h-7 -translate-y-1/2 px-2 text-xs'
                disabled={isCreating}
              >
                {t('form.maxButton')}
              </Button>
            </div>
            {errors.amount && (
              <p className='text-destructive text-sm'>{errors.amount}</p>
            )}
          </div>

          <div className='bg-muted/50 space-y-2 rounded-lg p-4'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>
                {t('form.summary.remainingDebt')}
              </span>
              <span className='font-semibold'>
                {formatDebtAmount(maxAmount)}
              </span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>
                {t('form.summary.enteredAmount')}
              </span>
              <span className='font-semibold'>
                {formatDebtAmount(parseFloat(amount) || 0)}
              </span>
            </div>
            <div className='flex justify-between border-t pt-2'>
              <span className='font-medium'>
                {t('form.summary.remainingAfterPayment')}
              </span>
              <span className='font-bold text-orange-600 dark:text-orange-400'>
                {formatDebtAmount(
                  Math.max(0, maxAmount - (parseFloat(amount) || 0))
                )}
              </span>
            </div>
          </div>

          <div className='flex justify-end gap-3'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={isCreating}
            >
              {t('form.buttons.cancel')}
            </Button>
            <Button
              type='button'
              variant='secondary'
              onClick={handleCashPayment}
              disabled={isCreating}
            >
              {t('form.buttons.cash')}
            </Button>
            <Button type='submit' disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  {t('form.buttons.creating')}
                </>
              ) : (
                t('form.buttons.createQR')
              )}
            </Button>
          </div>
        </form>
      ) : (
        <div className='space-y-6'>
          <div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/20'>
            <div className='flex items-center gap-2 text-green-700 dark:text-green-300'>
              <Check className='h-5 w-5' />
              <span className='font-semibold'>
                {payment.status === 'paid'
                  ? t('success.paidTitle')
                  : t('success.createdTitle')}
              </span>
            </div>
            <p className='mt-2 text-sm text-green-600 dark:text-green-400'>
              {payment.paymentMethod === 'cash'
                ? t('success.cashMessage')
                : payment.status === 'paid'
                  ? t('success.paidMessage')
                  : t('success.qrMessage')}
            </p>
          </div>

          {payment.qrCode && (
            <div className='flex flex-col items-center space-y-4'>
              <div className='rounded-lg border-2 border-dashed bg-white p-4'>
                {isGeneratingQR ? (
                  <div className='flex h-64 w-64 items-center justify-center'>
                    <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
                  </div>
                ) : qrCodeDataURL ? (
                  <img
                    src={qrCodeDataURL}
                    alt='QR Code'
                    className='h-64 w-64 object-contain'
                  />
                ) : (
                  <div className='text-muted-foreground flex h-64 w-64 items-center justify-center text-sm'>
                    {t('success.qrError')}
                  </div>
                )}
              </div>
              <p className='text-muted-foreground text-center text-sm'>
                {t('success.scanInstruction')}
              </p>
            </div>
          )}

          {payment.checkoutUrl && (
            <div className='space-y-2'>
              <Button
                asChild
                className='w-full'
                onClick={() => window.open(payment.checkoutUrl || '', '_blank')}
              >
                <a
                  href={payment.checkoutUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {t('success.openPayOS')}
                </a>
              </Button>
            </div>
          )}

          <div className='bg-muted/50 space-y-2 rounded-lg p-4'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>
                {t('success.transactionCode')}
              </span>
              <span className='font-mono font-semibold'>
                {payment.paymentCode || payment.id.slice(0, 8)}
              </span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>
                {t('success.amount')}
              </span>
              <span className='font-semibold'>
                {formatDebtAmount(payment.amount ?? 0)}
              </span>
            </div>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>
                {t('success.status')}
              </span>
              <span
                className={cn(
                  'font-semibold',
                  payment.status === 'paid'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-orange-600 dark:text-orange-400'
                )}
              >
                {payment.status === 'paid'
                  ? t('success.statusPaid')
                  : t('success.statusPending')}
              </span>
            </div>
          </div>

          <div className='flex justify-end gap-3'>
            <Button variant='outline' onClick={handleClose}>
              {t('success.close')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';

type CancelDialogProps = {
  open: boolean;
  selectedScheduleId: string | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

export function CancelDialog({
  open,
  selectedScheduleId,
  onClose,
  onConfirm
}: CancelDialogProps) {
  const t = useTranslations('HarvestOrders.list');
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason);
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('dialog.cancelTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('dialog.cancelDescription', {
              id: selectedScheduleId || ''
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className='py-4'>
          <Label htmlFor='cancel-reason' className='mb-2 block'>
            {t('dialog.reasonLabel')}{' '}
            <span className='text-destructive'>*</span>
          </Label>
          <Textarea
            id='cancel-reason'
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('dialog.reasonPlaceholder')}
            rows={3}
            className='resize-none'
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>
            {t('dialog.cancelKeep')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={!reason.trim()}>
            {t('dialog.cancelConfirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

'use client';

import { useState, useEffect } from 'react';
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

type ReasonDialogProps = {
  open: boolean;
  selectedScheduleId: string | null;
  type: 'cancel' | 'reject';
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

export function ReasonDialog({
  open,
  selectedScheduleId,
  type,
  onClose,
  onConfirm
}: ReasonDialogProps) {
  const t = useTranslations('Orders.list');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      setReason('');
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm(reason);
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  const titleKey =
    type === 'cancel' ? 'dialog.cancelTitle' : 'dialog.rejectTitle';
  const descriptionKey =
    type === 'cancel' ? 'dialog.cancelDescription' : 'dialog.rejectDescription';
  const confirmKey =
    type === 'cancel' ? 'dialog.cancelConfirm' : 'dialog.rejectConfirm';
  const reasonPlaceholderKey =
    type === 'cancel'
      ? 'dialog.reasonPlaceholder'
      : 'dialog.rejectReasonPlaceholder';

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t(titleKey)}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(descriptionKey, {
              id: selectedScheduleId || ''
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className='py-4'>
          <Label htmlFor='reason' className='mb-2 block'>
            {t('dialog.reasonLabel')}{' '}
            <span className='text-destructive'>*</span>
          </Label>
          <Textarea
            id='reason'
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t(reasonPlaceholderKey)}
            rows={3}
            className='resize-none'
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>
            {t('dialog.cancelKeep')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={!reason.trim()}>
            {t(confirmKey)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

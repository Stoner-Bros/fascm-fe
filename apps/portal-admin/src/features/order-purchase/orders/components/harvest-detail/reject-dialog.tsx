import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslations } from 'next-intl';

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  loading: boolean;
}

export function RejectDialog({
  open,
  onOpenChange,
  reason,
  onReasonChange,
  onConfirm,
  loading
}: RejectDialogProps) {
  const t = useTranslations('HarvestOrders.detail.rejectDialog');
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div>
            <Label htmlFor='reason'>{t('reasonLabel')}</Label>
            <Textarea
              id='reason'
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder={t('reasonPlaceholder')}
              rows={4}
              className='mt-2'
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t('cancel')}
          </Button>
          <Button
            variant='destructive'
            onClick={onConfirm}
            disabled={loading || !reason.trim()}
          >
            {loading ? t('processing') : t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

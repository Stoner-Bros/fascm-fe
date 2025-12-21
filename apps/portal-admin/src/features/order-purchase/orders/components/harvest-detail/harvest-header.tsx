import { Button } from '@/components/ui/button';
import type {
  HarvestSchedule,
  HarvestScheduleStatus
} from '@/types/harvest-schedule';
import { ArrowLeft, Check, Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { PermissionGuard } from '@/components/permissions';
import { Permission } from '@/constants/permissions';

interface HarvestHeaderProps {
  schedule: HarvestSchedule;
  status: HarvestScheduleStatus | null | undefined;
  hasRemainingQuantity: boolean;
  onApprove: () => void;
  onReject: () => void;
  onComplete: () => void;
  onCreatePhase: () => void;
  updating: boolean;
}

export function HarvestHeader({
  schedule,
  status,
  hasRemainingQuantity,
  onApprove,
  onReject,
  onCreatePhase,
  onComplete,
  updating
}: HarvestHeaderProps) {
  const router = useRouter();
  const t = useTranslations('HarvestOrders.detail');

  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='flex items-center gap-4'>
        <Button
          variant='outline'
          size='icon'
          onClick={() => router.back()}
          className='shrink-0'
        >
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <div>
          <h1 className='text-2xl font-bold sm:text-3xl'>{t('title')}</h1>
          <p className='text-muted-foreground mt-1 text-sm sm:text-base'>
            {t('code')}: {schedule.id.slice(0, 11)}
          </p>
        </div>
      </div>
      <div className='flex flex-wrap items-center gap-2'>
        {status === 'pending' && (
          <>
            <PermissionGuard permission={Permission.UPDATE_PURCHASE_ORDER}>
              <Button
                variant='destructive'
                onClick={onReject}
                disabled={updating}
              >
                <X className='mr-2 h-4 w-4' />
                {t('header.reject')}
              </Button>
            </PermissionGuard>
            <PermissionGuard permission={Permission.UPDATE_PURCHASE_ORDER}>
              <Button onClick={onApprove} disabled={updating} variant='default'>
                <Check className='mr-2 h-4 w-4' />
                {t('header.approve')}
              </Button>
            </PermissionGuard>
          </>
        )}
        {(status === 'approved' || status === 'processing') &&
          hasRemainingQuantity && (
            <PermissionGuard permission={Permission.UPDATE_PURCHASE_ORDER}>
              <Button onClick={onCreatePhase} variant='default'>
                <Plus className='mr-2 h-4 w-4' />
                {t('header.createPhase')}
              </Button>
            </PermissionGuard>
          )}
        {status === 'processing' && !hasRemainingQuantity && (
          <PermissionGuard permission={Permission.UPDATE_PURCHASE_ORDER}>
            <Button onClick={onComplete} variant='default'>
              <Check className='mr-2 h-4 w-4' />
              {t('header.markComplete')}
            </Button>
          </PermissionGuard>
        )}
      </div>
    </div>
  );
}

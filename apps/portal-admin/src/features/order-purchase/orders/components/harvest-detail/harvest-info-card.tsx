import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { HarvestSchedule } from '@/types/harvest-schedule';
import { useTranslations } from 'next-intl';
import { formatDateTime } from '../../utils/formatting';
import { getHarvestStatusBadge } from '../../utils/status-badges';

interface HarvestInfoCardProps {
  schedule: HarvestSchedule;
}

export function HarvestInfoCard({ schedule }: HarvestInfoCardProps) {
  const t = useTranslations('HarvestOrders.detail.infoCard');
  const tStatus = useTranslations('HarvestOrders.list.statuses');
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div>
            <Label className='text-muted-foreground text-sm'>
              {t('status')}
            </Label>
            <div className='mt-2'>
              {getHarvestStatusBadge(schedule.status, (key) => tStatus(key))}
            </div>
          </div>
          <div>
            <Label className='text-muted-foreground text-sm'>
              {t('harvestDate')}
            </Label>
            <p className='mt-2 font-medium'>
              {formatDateTime(schedule.harvestDate)}
            </p>
          </div>
        </div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div>
            <Label className='text-muted-foreground text-sm'>
              {t('supplier')}
            </Label>
            <p className='mt-2 font-medium'>
              {schedule.supplier?.gardenName || '-'}
            </p>
          </div>
          <div>
            <Label className='text-muted-foreground text-sm'>
              {t('harvestAddress')}
            </Label>
            <p className='mt-2 font-medium'>{schedule.address || '-'}</p>
          </div>
        </div>
        {schedule.description && (
          <div>
            <Label className='text-muted-foreground text-sm'>
              {t('description')}
            </Label>
            <p className='mt-2'>{schedule.description}</p>
          </div>
        )}
        {schedule.reason && (
          <div>
            <Label className='text-muted-foreground text-sm'>
              {t('rejectionReason')}
            </Label>
            <p className='text-destructive mt-2'>{schedule.reason}</p>
          </div>
        )}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div>
            <Label className='text-muted-foreground text-sm'>
              {t('createdAt')}
            </Label>
            <p className='mt-2 font-medium'>
              {formatDateTime(schedule.createdAt)}
            </p>
          </div>
          <div>
            <Label className='text-muted-foreground text-sm'>
              {t('updatedAt')}
            </Label>
            <p className='mt-2 font-medium'>
              {formatDateTime(schedule.updatedAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

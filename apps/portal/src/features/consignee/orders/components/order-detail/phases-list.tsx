import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { IconPackage } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import type { OrderPhase, OrderSchedule } from '@/types/order';
import { PhaseCard } from './phase-card';

interface PhasesListProps {
  phases: OrderPhase[];
  orderSchedule: OrderSchedule;
  loading: boolean;
  onConfirmDelivery?: (phaseId: string) => void;
  isConfirming?: boolean;
}

export function PhasesList({
  phases,
  orderSchedule,
  loading,
  onConfirmDelivery,
  isConfirming
}: PhasesListProps) {
  const t = useTranslations('Orders');

  if (loading) {
    return (
      <Card>
        <CardContent className='py-12'>
          <div className='flex flex-col items-center justify-center'>
            <div className='border-primary mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
            <p className='text-muted-foreground'>
              {t('detail.phases.loading')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (phases.length === 0) {
    return (
      <Card>
        <CardContent className='py-12'>
          <div className='flex flex-col items-center justify-center'>
            <IconPackage className='text-muted-foreground mb-4 h-16 w-16' />
            <p className='text-muted-foreground text-lg font-medium'>
              {t('detail.phases.empty')}
            </p>
            <p className='text-muted-foreground text-sm'>
              {t('detail.phases.emptyDescription')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {phases.map((phase) => (
        <PhaseCard
          key={phase.id}
          phase={phase}
          orderSchedule={orderSchedule}
          onConfirmDelivery={onConfirmDelivery}
          isConfirming={isConfirming}
        />
      ))}
    </div>
  );
}

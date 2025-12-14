import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { HarvestPhase } from '@/types/harvest-phase';
import { useTranslations } from 'next-intl';
import { PhaseCard } from './phase-card';

interface PhasesListProps {
  phases: HarvestPhase[];
}

export function PhasesList({ phases }: PhasesListProps) {
  const t = useTranslations('HarvestOrders.detail.phases');
  if (phases.length === 0) {
    return null;
  }

  // Sort phases by phaseNumber in descending order
  const sortedPhases = [...phases].sort((a, b) => {
    const aPhaseNumber = a.phaseNumber || 0;
    const bPhaseNumber = b.phaseNumber || 0;
    return bPhaseNumber - aPhaseNumber;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <p className='text-muted-foreground text-sm'>
          {t('subtitle', { count: phases.length })}
        </p>
      </CardHeader>
      <CardContent className='space-y-4'>
        {sortedPhases.map((phase) => (
          <PhaseCard key={phase.id} phase={phase} />
        ))}
      </CardContent>
    </Card>
  );
}

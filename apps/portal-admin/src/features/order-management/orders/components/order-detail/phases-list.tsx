import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OrderPhase } from '@/types/order';
import { PhaseCard } from './phase-card';

interface PhasesListProps {
  phases: OrderPhase[];
  onConfirmDelivery?: (phaseId: string) => void;
  updatingPhaseId?: string | null;
}

export function PhasesList({
  phases,
  onConfirmDelivery,
  updatingPhaseId
}: PhasesListProps) {
  if (phases.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Các đợt giao hàng</CardTitle>
        <p className='text-muted-foreground text-sm'>
          Danh sách các đợt giao hàng đã tạo ({phases.length})
        </p>
      </CardHeader>
      <CardContent className='space-y-4'>
        {phases.map((phase) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            onConfirmDelivery={onConfirmDelivery}
            updatingPhaseId={updatingPhaseId}
          />
        ))}
      </CardContent>
    </Card>
  );
}

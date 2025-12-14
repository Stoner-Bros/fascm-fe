import { useToast } from '@/components/ui/use-toast';
import {
  fetchHarvestPhasesBySchedule,
  updateHarvestPhaseStatus
} from '@/services/harvest-phase.service';
import {
  fetchHarvestScheduleById,
  updateHarvestScheduleStatus
} from '@/services/harvest-schedule.service';
import type { HarvestPhase } from '@/types/harvest-phase';
import type { HarvestSchedule } from '@/types/harvest-schedule';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export function useHarvestDetail(scheduleId: string) {
  const { toast } = useToast();
  const t = useTranslations('HarvestOrders.detail.toast');
  const [schedule, setSchedule] = useState<HarvestSchedule | null>(null);
  const [phases, setPhases] = useState<HarvestPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPhases, setLoadingPhases] = useState(false);

  const fetchPhases = async () => {
    setLoadingPhases(true);
    try {
      const phasesData = await fetchHarvestPhasesBySchedule({
        harvestScheduleId: scheduleId,
        limit: 50
      });
      setPhases(phasesData.data);
    } catch (error) {
      console.error('Failed to fetch phases:', error);
      toast({
        title: t('error'),
        description: t('errorFetchPhases'),
        variant: 'destructive'
      });
    } finally {
      setLoadingPhases(false);
    }
  };

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const scheduleData = await fetchHarvestScheduleById(scheduleId);
      setSchedule(scheduleData);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
      toast({
        title: t('error'),
        description: t('errorFetchSchedule'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
    fetchPhases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleId]);

  return {
    schedule,
    phases,
    loading,
    fetchPhases,
    fetchSchedule,
    loadingPhases
  };
}

export function useHarvestStatusActions(
  schedule: HarvestSchedule | null,
  onSuccess: () => void
) {
  const { toast } = useToast();
  const t = useTranslations('HarvestOrders.detail.toast');
  const [updating, setUpdating] = useState(false);

  const approve = async () => {
    if (!schedule) return;
    setUpdating(true);
    try {
      await updateHarvestScheduleStatus(schedule.id, 'approved');
      toast({
        title: t('success'),
        description: t('successApprove')
      });
      onSuccess();
    } catch (error) {
      toast({
        title: t('error'),
        description: t('errorApprove'),
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  };

  const reject = async (reason: string) => {
    if (!schedule || !reason.trim()) {
      toast({
        title: t('error'),
        description: t('rejectReasonRequired'),
        variant: 'destructive'
      });
      return;
    }
    setUpdating(true);
    try {
      await updateHarvestScheduleStatus(schedule.id, 'rejected', reason);
      toast({
        title: t('success'),
        description: t('successReject')
      });
      onSuccess();
    } catch (error) {
      toast({
        title: t('error'),
        description: t('errorReject'),
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  };

  const complete = async () => {
    if (!schedule) return;
    setUpdating(true);
    try {
      await updateHarvestScheduleStatus(schedule.id, 'completed');
      toast({
        title: t('success'),
        description: t('successComplete')
      });
      onSuccess();
    } catch (error) {
      toast({
        title: t('error'),
        description: t('errorComplete'),
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  };

  return {
    approve,
    reject,
    complete,
    updating
  };
}

export function usePhaseActions(onSuccess: () => void) {
  const { toast } = useToast();
  const t = useTranslations('HarvestOrders.detail.toast');
  const [updatingPhaseId, setUpdatingPhaseId] = useState<string | null>(null);

  const confirmDelivery = async (phaseId: string) => {
    setUpdatingPhaseId(phaseId);
    try {
      await updateHarvestPhaseStatus(phaseId, { status: 'completed' });
      toast({
        title: t('success'),
        description: t('successConfirmDelivery')
      });
      onSuccess();
    } catch (error) {
      toast({
        title: t('error'),
        description: t('errorConfirmDelivery'),
        variant: 'destructive'
      });
    } finally {
      setUpdatingPhaseId(null);
    }
  };

  return {
    confirmDelivery,
    updatingPhaseId
  };
}

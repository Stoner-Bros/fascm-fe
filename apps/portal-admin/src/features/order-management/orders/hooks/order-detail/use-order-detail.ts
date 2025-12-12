import { useToast } from '@/components/ui/use-toast';
import {
  fetchOrderPhasesBySchedule,
  updateOrderPhaseStatus
} from '@/services/order-phase.service';
import {
  fetchOrderScheduleById,
  updateOrderScheduleStatus
} from '@/services/order-schedule.service';
import type { OrderPhase, OrderSchedule } from '@/types/order';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export function useOrderDetail(scheduleId: string) {
  const { toast } = useToast();
  const t = useTranslations('Orders.detail.toast');
  const [schedule, setSchedule] = useState<OrderSchedule | null>(null);
  const [phases, setPhases] = useState<OrderPhase[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [scheduleData, phasesData] = await Promise.all([
        fetchOrderScheduleById(scheduleId),
        fetchOrderPhasesBySchedule({
          orderScheduleId: scheduleId,
          limit: 50
        })
      ]);
      setSchedule(scheduleData);
      setPhases(phasesData.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: t('error'),
        description: t('errorLoad'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleId]);

  return {
    schedule,
    phases,
    loading,
    refetch: loadData
  };
}

export function useOrderStatusActions(
  schedule: OrderSchedule | null,
  onSuccess: () => void
) {
  const { toast } = useToast();
  const t = useTranslations('Orders.detail.toast');
  const [updating, setUpdating] = useState(false);

  const approve = async () => {
    if (!schedule) return;
    setUpdating(true);
    try {
      await updateOrderScheduleStatus(schedule.id, 'approved');
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
      await updateOrderScheduleStatus(schedule.id, 'rejected', reason);
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
      await updateOrderScheduleStatus(schedule.id, 'completed');
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
  const t = useTranslations('Orders.detail.toast');
  const [updatingPhaseId, setUpdatingPhaseId] = useState<string | null>(null);

  const confirmDelivery = async (phaseId: string) => {
    setUpdatingPhaseId(phaseId);
    try {
      await updateOrderPhaseStatus(phaseId, { status: 'completed' });
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

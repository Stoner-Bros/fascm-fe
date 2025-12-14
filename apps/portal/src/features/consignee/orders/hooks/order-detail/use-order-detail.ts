import { useToast } from '@/hooks/use-toast';
import {
  fetchOrderPhasesBySchedule,
  updateOrderPhaseStatus
} from '@/services/order-phases.service';
import { fetchOrderScheduleById } from '@/services/order-schedule.service';
import type { OrderPhase, OrderSchedule } from '@/types/order';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export function useOrderDetail(orderId: string) {
  const { toast } = useToast();
  const t = useTranslations('Orders');
  const [orderSchedule, setOrderSchedule] = useState<OrderSchedule | null>(
    null
  );
  const [orderPhases, setOrderPhases] = useState<OrderPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [phasesLoading, setPhasesLoading] = useState(true);

  const loadOrderDetail = async () => {
    if (!orderId) return;

    setLoading(true);
    try {
      const data = await fetchOrderScheduleById(orderId);
      setOrderSchedule(data);
    } catch (error) {
      toast({
        title: t('detail.toast.errorTitle'),
        description: t('detail.toast.errorLoadDetails'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadOrderPhases = async () => {
    if (!orderId) return;

    setPhasesLoading(true);
    try {
      const response = await fetchOrderPhasesBySchedule(orderId, {
        page: 1,
        limit: 50
      });
      setOrderPhases(response.data || []);
    } catch (error) {
      toast({
        title: t('detail.toast.errorTitle'),
        description: t('detail.phases.errorLoadPhases'),
        variant: 'destructive'
      });
    } finally {
      setPhasesLoading(false);
    }
  };

  useEffect(() => {
    loadOrderDetail();
    loadOrderPhases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return {
    orderSchedule,
    orderPhases,
    loading,
    phasesLoading,
    loadOrderDetail,
    loadOrderPhases
  };
}

export function usePhaseActions(onSuccess: () => void) {
  const { toast } = useToast();
  const t = useTranslations('Orders');
  const [updatingPhaseId, setUpdatingPhaseId] = useState<string | null>(null);

  const confirmDelivery = async (phaseId: string) => {
    setUpdatingPhaseId(phaseId);
    try {
      await updateOrderPhaseStatus(phaseId, {
        status: 'completed'
      });
      toast({
        title: t('detail.phases.confirmSuccessTitle'),
        description: t('detail.phases.confirmSuccessDescription'),
        variant: 'default'
      });
      onSuccess();
    } catch (error) {
      toast({
        title: t('detail.toast.errorTitle'),
        description: t('detail.phases.confirmErrorDescription'),
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

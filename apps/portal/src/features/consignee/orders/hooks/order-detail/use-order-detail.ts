import { useToast } from '@/hooks/use-toast';
import {
  fetchOrderPhasesBySchedule,
  updateOrderPhaseStatus
} from '@/services/order-phases.service';
import { fetchOrderScheduleById } from '@/services/order-schedule.service';
import type { OrderPhase, OrderSchedule } from '@/types/order';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import {
  fetchDeliveriesByOrderSchedule,
  type Delivery
} from '@/services/delivery.service';
import { normalize } from 'path';

export function useOrderDetail(orderId: string) {
  const { toast } = useToast();
  const t = useTranslations('Orders');
  const [orderSchedule, setOrderSchedule] = useState<OrderSchedule | null>(
    null
  );
  const [orderPhases, setOrderPhases] = useState<OrderPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [phasesLoading, setPhasesLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

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
  const socket = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    return io(base + '/deliveries', { transports: ['websocket'] });
  }, []);
  useEffect(() => {
    const sid = String(orderSchedule?.id ?? '').trim();
    if (!sid) return;
    let localDeliveries: Delivery[] = [];
    fetchDeliveriesByOrderSchedule({ orderScheduleId: sid, page: 1, limit: 50 })
      .then((res) => {
        localDeliveries = Array.isArray(res?.data) ? res.data : [];
        setDeliveries(localDeliveries);
        localDeliveries.forEach((d) => {
          socket.emit('delivery:subscribe', { deliveryId: d.id });
        });
      })
      .catch(() => {});
    const normalize = (s: string) => {
      const raw = String(s).trim().toLowerCase();
      const map: Record<string, string> = {
        deliverd: 'delivered',
        delivered: 'delivered',
        scheduled: 'delivering',
        complete: 'completed',
        cancelled: 'canceled'
      };
      return map[raw] ?? raw;
    };
    const updatePhase = (deliveryId: string, status: string) => {
      const d =
        localDeliveries.find((x) => x.id === deliveryId) ||
        localDeliveries.find((x) => x.id === String(deliveryId));
      const phaseId = String(d?.orderPhase?.id ?? '');
      if (!phaseId) return;
      const next = normalize(status);
      const allowed = new Set([
        'preparing',
        'delivering',
        'delivered',
        'completed',
        'canceled'
      ]);
      setOrderPhases((prev) =>
        prev.map((p) => {
          if (p.id !== phaseId) return p;
          if (!allowed.has(next)) return p;
          const cur = String(p.status ?? '').toLowerCase();
          if (['delivered', 'completed'].includes(cur) && cur !== next) {
            return p;
          }
          return { ...p, status: next as any };
        })
      );
    };
    const onStart = (data: any) => {
      const id = String(data?.id ?? data?.deliveryId ?? '').trim();
      if (!id) return;
      updatePhase(id, 'delivering');
    };
    const onUpdate = (data: any) => {
      const id = String(data?.id ?? data?.deliveryId ?? '').trim();
      if (!id) return;
      if (data?.status) updatePhase(id, String(data.status));
    };
    const onEnd = (data: any) => {
      const id = String(data?.id ?? data?.deliveryId ?? '').trim();
      if (!id) return;
      updatePhase(id, 'delivered');
    };
    socket.on('delivery:start', onStart);
    socket.on('delivery:update', onUpdate);
    socket.on('delivery:end', onEnd);
    return () => {
      localDeliveries.forEach((d) => {
        socket.emit('delivery:unsubscribe', { deliveryId: d.id });
      });
      socket.off('delivery:start', onStart);
      socket.off('delivery:update', onUpdate);
      socket.off('delivery:end', onEnd);
    };
  }, [orderSchedule?.id, socket]);
  useEffect(() => {
    if (!deliveries || deliveries.length === 0) return;
    const statusByPhase = new Map<string, string>();
    deliveries.forEach((d) => {
      const phaseId = String(d?.orderPhase?.id ?? '');
      const st = String(d?.status ?? '').toLowerCase();
      if (phaseId && st) statusByPhase.set(phaseId, st);
    });
    if (statusByPhase.size === 0) return;
    setOrderPhases((prev) =>
      prev.map((p) => {
        const cur = String(p.status ?? '').toLowerCase();
        const incoming = statusByPhase.get(p.id);
        if (!incoming) return p;
        const next = normalize(incoming);
        const allowed = new Set([
          'preparing',
          'delivering',
          'delivered',
          'completed',
          'canceled'
        ]);
        if (!allowed.has(next)) return p;
        if (['delivered', 'completed'].includes(cur) && cur !== next) return p;
        if (cur && cur !== 'preparing' && cur !== 'scheduled') return p;
        return { ...p, status: next as any };
      })
    );
  }, [deliveries]);

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

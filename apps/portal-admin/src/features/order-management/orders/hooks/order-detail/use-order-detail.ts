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
import { useEffect, useState } from 'react';

export function useOrderDetail(scheduleId: string) {
  const { toast } = useToast();
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
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu lịch giao hàng',
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
  const [updating, setUpdating] = useState(false);

  const approve = async () => {
    if (!schedule) return;
    setUpdating(true);
    try {
      await updateOrderScheduleStatus(schedule.id, 'approved');
      toast({
        title: 'Thành công',
        description: 'Đã duyệt lịch giao hàng'
      });
      onSuccess();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể duyệt lịch giao hàng',
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  };

  const reject = async (reason: string) => {
    if (!schedule || !reason.trim()) {
      toast({
        title: 'Vui lòng nhập lý do từ chối',
        variant: 'destructive'
      });
      return;
    }
    setUpdating(true);
    try {
      await updateOrderScheduleStatus(schedule.id, 'rejected', reason);
      toast({
        title: 'Thành công',
        description: 'Đã từ chối lịch giao hàng'
      });
      onSuccess();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể từ chối lịch giao hàng',
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
        title: 'Thành công',
        description: 'Đã đánh dấu hoàn thành'
      });
      onSuccess();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái',
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
  const [updatingPhaseId, setUpdatingPhaseId] = useState<string | null>(null);

  const confirmDelivery = async (phaseId: string) => {
    setUpdatingPhaseId(phaseId);
    try {
      await updateOrderPhaseStatus(phaseId, { status: 'completed' });
      toast({
        title: 'Thành công',
        description: 'Đã xác nhận giao hàng'
      });
      onSuccess();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái đợt giao hàng',
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

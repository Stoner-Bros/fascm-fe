import { useToast } from '@/components/ui/use-toast';
import { fetchAreas } from '@/services/area.service';
import { fetchBatchesGroupedByWeight } from '@/services/batch.service';
import {
  createExportTicket,
  CreateExportTicketDto,
  deleteExportTicket,
  ExportTicket,
  fetchExportTickets
} from '@/services/export-ticket.service';
import { fetchOrderPhasesBySchedule } from '@/services/order-phase.service';
import { fetchOrderSchedules } from '@/services/order-schedule.service';
import { Area } from '@/types';
import { Batch } from '@/types/batch';
import { OrderPhase, OrderSchedule } from '@/types/order';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export function useOrderSchedules() {
  const { toast } = useToast();
  const t = useTranslations('Orders.detail.toast');

  const [schedules, setSchedules] = useState<OrderSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const response = await fetchOrderSchedules({
        status: 'processing'
      });
      setSchedules(response.data);
      setHasNextPage(response.hasNextPage);
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
    loadSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    schedules,
    loading,
    hasNextPage,
    loadSchedules
  };
}

export function useOrderPhasesBySchedule(orderScheduleId: string) {
  const { toast } = useToast();

  const [phases, setPhases] = useState<OrderPhase[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loadPhases = async () => {
    setLoading(true);
    try {
      const response = await fetchOrderPhasesBySchedule({
        orderScheduleId
      });
      setPhases(response.data);
      setHasNextPage(response.hasNextPage);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách đợt giao hàng',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderScheduleId]);

  return {
    phases,
    loading,
    hasNextPage,
    loadPhases
  };
}

export function useExportTickets() {
  const { toast } = useToast();

  const [tickets, setTickets] = useState<ExportTicket[]>([]);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loadETickets = async () => {
    setLoadingFetch(true);
    try {
      const response = await fetchExportTickets();
      setTickets(response.data);
      setHasNextPage(response.hasNextPage);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách phiếu xuất kho',
        variant: 'destructive'
      });
    } finally {
      setLoadingFetch(false);
    }
  };

  const createETicket = async (payload: CreateExportTicketDto) => {
    setLoadingCreate(true);
    try {
      const response = await createExportTicket(payload);
      setTickets([...tickets, response as unknown as ExportTicket]);
    } catch (error) {
      console.error('Failed to create export ticket:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo phiếu xuất kho',
        variant: 'destructive'
      });
    } finally {
      setLoadingCreate(false);
    }
  };

  const deleteETicket = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa phiếu xuất kho này?')) return;

    setLoadingDelete(true);
    try {
      await deleteExportTicket(id);
      toast({
        title: 'Thành công',
        description: 'Xóa phiếu xuất kho thành công'
      });
      setTickets(tickets.filter((ticket) => ticket.id !== id));
    } catch (error) {
      console.error('Failed to delete export ticket:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa phiếu xuất kho',
        variant: 'destructive'
      });
    } finally {
      setLoadingDelete(false);
    }
  };

  useEffect(() => {
    loadETickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    tickets,
    loadingFetch,
    loadingCreate,
    loadingDelete,
    hasNextPage,
    loadETickets,
    createETicket,
    deleteETicket
  };
}

export function useAreas() {
  const { toast } = useToast();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loadAreas = async () => {
    setLoading(true);
    try {
      const response = await fetchAreas();
      setAreas(response.data);
      setHasNextPage(response.hasNextPage);
    } catch (error) {
      console.error('Failed to fetch areas:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách kho',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAreas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    areas,
    loading,
    hasNextPage,
    loadAreas
  };
}

export function useBatchesGroupedByWeight(areaId: string, productId: string) {
  const { toast } = useToast();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBatches = async () => {
    setLoading(true);
    try {
      const response = await fetchBatchesGroupedByWeight({
        areaId,
        productId
      });
      setBatches(response);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách lô hàng',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaId, productId]);

  return {
    batches,
    loading,
    loadBatches
  };
}

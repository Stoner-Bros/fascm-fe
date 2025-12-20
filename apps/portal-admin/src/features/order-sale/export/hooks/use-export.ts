import { useToast } from '@/components/ui/use-toast';
import {
  createExportTicket,
  CreateExportTicketDto,
  deleteExportTicket,
  ExportTicket,
  fetchExportTickets
} from '@/services/export-ticket.service';
import { fetchOrderPhasesBySchedule } from '@/services/order-phase.service';
import { fetchOrderSchedules } from '@/services/order-schedule.service';
import { OrderPhase, OrderSchedule } from '@/types/order';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { parseAsInteger, useQueryState } from 'nuqs';

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
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit] = useQueryState('limit', parseAsInteger.withDefault(10));

  const loadETickets = useCallback(async () => {
    setLoadingFetch(true);
    try {
      const response = await fetchExportTickets({
        page: page ?? 1,
        limit: limit ?? 10
      });
      setTickets(response.data);
      setHasNextPage(response.hasNextPage);
      setPageCount((prev) => {
        const minimalTotal = response.hasNextPage
          ? (page ?? 1) + 1
          : (page ?? 1);
        return Math.max(prev, minimalTotal);
      });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const createETicket = useCallback(
    async (payload: CreateExportTicketDto) => {
      setLoadingCreate(true);
      try {
        const response = await createExportTicket(payload);
        setTickets([...tickets, response as unknown as ExportTicket]);
        toast({
          title: 'Thành công',
          description: 'Đã tạo phiếu xuất kho mới'
        });
        loadETickets();
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
    },
    [tickets, loadETickets]
  );

  const deleteETicket = useCallback(
    async (id: string) => {
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
    },
    [tickets]
  );

  useEffect(() => {
    loadETickets();
  }, [loadETickets]);

  return {
    tickets,
    loadingFetch,
    loadingCreate,
    loadingDelete,
    hasNextPage,
    page,
    setPage,
    limit,
    pageCount,
    loadETickets,
    createETicket,
    deleteETicket
  };
}

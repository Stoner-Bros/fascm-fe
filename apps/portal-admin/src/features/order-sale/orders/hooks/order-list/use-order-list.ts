'use client';

import { useToast } from '@/components/ui/use-toast';
import {
  fetchOrderSchedules,
  updateOrderScheduleStatus
} from '@/services/order-schedule.service';
import type { OrderSchedule, OrderScheduleStatus } from '@/types/order';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { parseAsInteger, useQueryState } from 'nuqs';
import type {
  Action,
  OrderScheduleRow,
  State,
  StatusFilter
} from '../../types/types';

const initialState: State = {
  orderSchedules: [],
  loading: false,
  searchQuery: '',
  statusFilter: 'ALL',
  cancelDialogOpen: false,
  rejectDialogOpen: false,
  selectedScheduleId: null,
  updatingStatusIds: new Set<string>()
};

function orderSchedulesReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ORDER_SCHEDULES':
      return { ...state, orderSchedules: action.payload, loading: false };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_STATUS_FILTER':
      return { ...state, statusFilter: action.payload };
    case 'OPEN_CANCEL_DIALOG':
      return {
        ...state,
        cancelDialogOpen: true,
        selectedScheduleId: action.payload
      };
    case 'CLOSE_CANCEL_DIALOG':
      return {
        ...state,
        cancelDialogOpen: false,
        selectedScheduleId: null
      };
    case 'OPEN_REJECT_DIALOG':
      return {
        ...state,
        rejectDialogOpen: true,
        selectedScheduleId: action.payload
      };
    case 'CLOSE_REJECT_DIALOG':
      return {
        ...state,
        rejectDialogOpen: false,
        selectedScheduleId: null
      };
    case 'CANCEL_ORDER':
      return {
        ...state,
        orderSchedules: state.orderSchedules.map((schedule) =>
          schedule.id === action.payload
            ? { ...schedule, status: 'canceled' as OrderScheduleStatus }
            : schedule
        ),
        cancelDialogOpen: false,
        selectedScheduleId: null
      };
    case 'REJECT_ORDER':
      return {
        ...state,
        orderSchedules: state.orderSchedules.map((schedule) =>
          schedule.id === action.payload
            ? { ...schedule, status: 'rejected' as OrderScheduleStatus }
            : schedule
        ),
        rejectDialogOpen: false,
        selectedScheduleId: null
      };
    case 'APPROVE_ORDER':
      return {
        ...state,
        orderSchedules: state.orderSchedules.map((schedule) =>
          schedule.id === action.payload
            ? { ...schedule, status: 'approved' as OrderScheduleStatus }
            : schedule
        ),
        selectedScheduleId: null
      };
    case 'SET_UPDATING_STATUS': {
      const newSet = new Set(state.updatingStatusIds);
      if (action.payload.updating) {
        newSet.add(action.payload.id);
      } else {
        newSet.delete(action.payload.id);
      }
      return { ...state, updatingStatusIds: newSet };
    }
    case 'LOAD_ERROR':
      return { ...state, loading: false };
    default:
      return state;
  }
}

export const normalizeStatus = (
  status?: OrderScheduleStatus | null
): OrderScheduleStatus => {
  if (!status || status.trim() === '') return 'pending';
  return status.toLowerCase().trim() as OrderScheduleStatus;
};

const formatDateTime = (date: string | Date | null | undefined) => {
  if (!date) return '-';
  const d = new Date(date as unknown as string);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export function useOrderList() {
  const { toast } = useToast();
  const t = useTranslations('Orders.list');
  const [state, dispatch] = useReducer(orderSchedulesReducer, initialState);
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const schedulesRes = await fetchOrderSchedules({
          page: page ?? 1,
          limit: limit ?? 10,
          sort: 'desc'
        });

        if (cancelled) return;

        const schedules: OrderSchedule[] = schedulesRes.data ?? [];

        // Process schedules into rows
        const rows: OrderScheduleRow[] = schedules.map((schedule) => {
          // Extract product names from order details
          const productNames = new Set<string>();
          const orderDetails = schedule.orderDetails ?? [];
          for (const detail of orderDetails) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const productName =
              (detail as any)?.product?.name ||
              (detail as any)?.productName ||
              (detail as any)?.product?.id;
            if (productName) productNames.add(String(productName));
          }

          const products =
            Array.from(productNames).join(', ') || t('table.noProducts');

          const deliveryDate = formatDateTime(schedule.deliveryDate);
          const orderNumber =
            (schedule.order && schedule.order?.id) || schedule.id;
          const address = schedule.address || '-';
          const createdAt = formatDateTime(schedule.createdAt);
          const consigneeName = schedule.consignee?.organizationName || '-';

          return {
            id: schedule.id,
            orderNumber,
            products,
            deliveryDate,
            address,
            status: (schedule.status ?? 'pending') as OrderScheduleStatus,
            description: schedule.description ?? undefined,
            reason: schedule.reason ?? undefined,
            createdAt,
            consigneeName
          };
        });

        dispatch({ type: 'SET_ORDER_SCHEDULES', payload: rows });
        setPageCount((prev) => {
          const minimalTotal = schedulesRes.hasNextPage
            ? (page ?? 1) + 1
            : (page ?? 1);
          return Math.max(prev, minimalTotal);
        });
      } catch {
        if (cancelled) return;
        dispatch({ type: 'LOAD_ERROR' });
        toast({
          title: t('toast.errorTitle'),
          description: t('toast.errorDescription'),
          variant: 'destructive'
        });
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const setSearchQuery = useCallback(
    (query: string) => {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
      if (page !== 1) {
        void setPage(1);
      }
    },
    [page, setPage]
  );

  const setStatusFilter = useCallback(
    (filter: StatusFilter) => {
      dispatch({ type: 'SET_STATUS_FILTER', payload: filter });
      if (page !== 1) {
        void setPage(1);
      }
    },
    [page, setPage]
  );

  const handleOpenCancelDialog = useCallback((scheduleId: string) => {
    dispatch({ type: 'OPEN_CANCEL_DIALOG', payload: scheduleId });
  }, []);

  const handleCloseCancelDialog = useCallback(() => {
    dispatch({ type: 'CLOSE_CANCEL_DIALOG' });
  }, []);

  const handleOpenRejectDialog = useCallback((scheduleId: string) => {
    dispatch({ type: 'OPEN_REJECT_DIALOG', payload: scheduleId });
  }, []);

  const handleCloseRejectDialog = useCallback(() => {
    dispatch({ type: 'CLOSE_REJECT_DIALOG' });
  }, []);

  const handleApproveOrder = useCallback(
    async (scheduleId: string) => {
      dispatch({
        type: 'SET_UPDATING_STATUS',
        payload: { id: scheduleId, updating: true }
      });
      try {
        await updateOrderScheduleStatus(scheduleId, 'approved');
        dispatch({ type: 'APPROVE_ORDER', payload: scheduleId });
        toast({
          title: t('toast.approveTitle'),
          description: t('toast.approveDescription')
        });
      } catch {
        toast({
          title: t('toast.errorTitle'),
          description: t('toast.errorApproveDescription'),
          variant: 'destructive'
        });
      } finally {
        dispatch({
          type: 'SET_UPDATING_STATUS',
          payload: { id: scheduleId, updating: false }
        });
      }
    },
    [t, toast]
  );

  const handleCancelOrder = useCallback(
    async (reason: string) => {
      if (!state.selectedScheduleId) return;
      const scheduleId = state.selectedScheduleId;
      dispatch({ type: 'CLOSE_CANCEL_DIALOG' });
      dispatch({
        type: 'SET_UPDATING_STATUS',
        payload: { id: scheduleId, updating: true }
      });
      try {
        await updateOrderScheduleStatus(scheduleId, 'canceled', reason);
        dispatch({ type: 'CANCEL_ORDER', payload: scheduleId });
        toast({
          title: t('toast.cancelTitle'),
          description: t('toast.cancelDescription', {
            id: scheduleId
          })
        });
      } catch {
        toast({
          title: t('toast.errorTitle'),
          description: t('toast.errorCancelDescription'),
          variant: 'destructive'
        });
      } finally {
        dispatch({
          type: 'SET_UPDATING_STATUS',
          payload: { id: scheduleId, updating: false }
        });
      }
    },
    [state.selectedScheduleId, t, toast]
  );

  const handleRejectOrder = useCallback(
    async (reason: string) => {
      if (!state.selectedScheduleId) return;
      const scheduleId = state.selectedScheduleId;
      dispatch({ type: 'CLOSE_REJECT_DIALOG' });
      dispatch({
        type: 'SET_UPDATING_STATUS',
        payload: { id: scheduleId, updating: true }
      });
      try {
        await updateOrderScheduleStatus(scheduleId, 'rejected', reason);
        dispatch({ type: 'REJECT_ORDER', payload: scheduleId });
        toast({
          title: t('toast.rejectTitle'),
          description: t('toast.rejectDescription', {
            id: scheduleId
          })
        });
      } catch {
        toast({
          title: t('toast.errorTitle'),
          description: t('toast.errorRejectDescription'),
          variant: 'destructive'
        });
      } finally {
        dispatch({
          type: 'SET_UPDATING_STATUS',
          payload: { id: scheduleId, updating: false }
        });
      }
    },
    [state.selectedScheduleId, t, toast]
  );

  const showRejectionReason = useCallback(
    (reason?: string) => {
      toast({
        title: t('dialog.rejectionReasonTitle'),
        description: reason || t('dialog.rejectionReasonDefault'),
        variant: 'default'
      });
    },
    [t, toast]
  );

  const filteredSchedules = useMemo(() => {
    const q = state.searchQuery.toLowerCase();
    return state.orderSchedules.filter((schedule) => {
      const matchesSearch =
        schedule.id.toLowerCase().includes(q) ||
        schedule.orderNumber.toLowerCase().includes(q) ||
        schedule.products.toLowerCase().includes(q) ||
        schedule.consigneeName?.toLowerCase().includes(q) ||
        false;
      const matchesStatus =
        state.statusFilter === 'ALL' ||
        normalizeStatus(schedule.status) === state.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [state.orderSchedules, state.searchQuery, state.statusFilter]);

  const statusCounts = useMemo(
    () => ({
      all: state.orderSchedules.length,
      pending: state.orderSchedules.filter(
        (s) => normalizeStatus(s.status) === 'pending'
      ).length,
      rejected: state.orderSchedules.filter(
        (s) => normalizeStatus(s.status) === 'rejected'
      ).length,
      approved: state.orderSchedules.filter(
        (s) => normalizeStatus(s.status) === 'approved'
      ).length,
      processing: state.orderSchedules.filter(
        (s) => normalizeStatus(s.status) === 'processing'
      ).length,
      completed: state.orderSchedules.filter(
        (s) => normalizeStatus(s.status) === 'completed'
      ).length,
      canceled: state.orderSchedules.filter(
        (s) => normalizeStatus(s.status) === 'canceled'
      ).length
    }),
    [state.orderSchedules]
  );

  return {
    state,
    filteredSchedules,
    statusCounts,
    setSearchQuery,
    setStatusFilter,
    handleOpenCancelDialog,
    handleCloseCancelDialog,
    handleOpenRejectDialog,
    handleCloseRejectDialog,
    handleApproveOrder,
    handleCancelOrder,
    handleRejectOrder,
    showRejectionReason,
    page,
    setPage,
    limit,
    pageCount,
    t
  };
}

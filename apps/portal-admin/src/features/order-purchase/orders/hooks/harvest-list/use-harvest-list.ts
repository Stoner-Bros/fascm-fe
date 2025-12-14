'use client';

import { useToast } from '@/components/ui/use-toast';
import {
  fetchHarvestSchedules,
  updateHarvestScheduleStatus
} from '@/services/harvest-schedule.service';
import type {
  HarvestSchedule,
  HarvestScheduleStatus
} from '@/types/harvest-schedule';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import type {
  Action,
  HarvestScheduleRow,
  State,
  StatusFilter
} from '../../types/types';

const initialState: State = {
  harvestSchedules: [],
  loading: false,
  searchQuery: '',
  statusFilter: 'ALL',
  cancelDialogOpen: false,
  rejectDialogOpen: false,
  selectedScheduleId: null,
  updatingStatusIds: new Set<string>()
};

function harvestSchedulesReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_HARVEST_SCHEDULES':
      return { ...state, harvestSchedules: action.payload, loading: false };
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
    case 'CONFIRM_SCHEDULE':
      return {
        ...state,
        harvestSchedules: state.harvestSchedules.map((schedule) =>
          schedule.id === action.payload
            ? { ...schedule, status: 'approved' as HarvestScheduleStatus }
            : schedule
        ),
        selectedScheduleId: null
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
    case 'CANCEL_SCHEDULE':
      return {
        ...state,
        harvestSchedules: state.harvestSchedules.map((schedule) =>
          schedule.id === action.payload
            ? { ...schedule, status: 'canceled' as HarvestScheduleStatus }
            : schedule
        ),
        cancelDialogOpen: false,
        selectedScheduleId: null
      };
    case 'REJECT_SCHEDULE':
      return {
        ...state,
        harvestSchedules: state.harvestSchedules.map((schedule) =>
          schedule.id === action.payload
            ? { ...schedule, status: 'rejected' as HarvestScheduleStatus }
            : schedule
        ),
        rejectDialogOpen: false,
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
  status?: HarvestScheduleStatus | null
): HarvestScheduleStatus => {
  if (!status || status.trim() === '') return 'pending';
  return status.toLowerCase().trim() as HarvestScheduleStatus;
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

export function useHarvestList() {
  const { toast } = useToast();
  const t = useTranslations('HarvestOrders.list');
  const [state, dispatch] = useReducer(harvestSchedulesReducer, initialState);
  const didFetchRef = useRef(false);

  const loadData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const schedulesRes = await fetchHarvestSchedules({
        page: 1,
        limit: 50,
        sort: 'desc'
      });
      const schedules: HarvestSchedule[] = schedulesRes.data ?? [];

      const rows: HarvestScheduleRow[] = schedules.map((schedule) => {
        const productNames = new Set<string>();
        const harvestDetails = schedule.harvestDetails ?? [];
        for (const detail of harvestDetails) {
          const productName =
            (detail as any)?.product?.name ||
            (detail as any)?.productName ||
            (detail as any)?.product?.id;
          if (productName) productNames.add(String(productName));
        }

        const products =
          Array.from(productNames).join(', ') || t('table.noProducts');

        return {
          id: schedule.id,
          scheduleNumber: schedule.id,
          products,
          harvestDate: formatDateTime(schedule.harvestDate),
          address: schedule.address || '-',
          status: (schedule.status ?? 'pending') as HarvestScheduleStatus,
          description: schedule.description ?? undefined,
          reason: schedule.reason ?? undefined,
          createdAt: formatDateTime(schedule.createdAt),
          supplierName: schedule.supplier?.gardenName || '-'
        };
      });

      dispatch({ type: 'SET_HARVEST_SCHEDULES', payload: rows });
    } catch {
      dispatch({ type: 'LOAD_ERROR' });
      toast({
        title: t('toast.errorTitle'),
        description: t('toast.errorDescription'),
        variant: 'destructive'
      });
    }
  }, [t, toast]);

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    loadData();
  }, [loadData]);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const setStatusFilter = useCallback((filter: StatusFilter) => {
    dispatch({ type: 'SET_STATUS_FILTER', payload: filter });
  }, []);

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

  const handleConfirmSchedule = useCallback(
    async (scheduleId: string) => {
      dispatch({
        type: 'SET_UPDATING_STATUS',
        payload: { id: scheduleId, updating: true }
      });
      try {
        await updateHarvestScheduleStatus(scheduleId, 'approved');
        dispatch({ type: 'CONFIRM_SCHEDULE', payload: scheduleId });
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

  const handleCancelSchedule = useCallback(
    async (reason: string) => {
      if (!state.selectedScheduleId) return;
      const scheduleId = state.selectedScheduleId;
      dispatch({ type: 'CLOSE_CANCEL_DIALOG' });
      dispatch({
        type: 'SET_UPDATING_STATUS',
        payload: { id: scheduleId, updating: true }
      });
      try {
        await updateHarvestScheduleStatus(scheduleId, 'canceled', reason);
        dispatch({ type: 'CANCEL_SCHEDULE', payload: scheduleId });
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

  const handleRejectSchedule = useCallback(
    async (reason: string) => {
      if (!state.selectedScheduleId) return;
      const scheduleId = state.selectedScheduleId;
      dispatch({ type: 'CLOSE_REJECT_DIALOG' });
      dispatch({
        type: 'SET_UPDATING_STATUS',
        payload: { id: scheduleId, updating: true }
      });
      try {
        await updateHarvestScheduleStatus(scheduleId, 'rejected', reason);
        dispatch({ type: 'REJECT_SCHEDULE', payload: scheduleId });
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
    return state.harvestSchedules.filter((schedule) => {
      const matchesSearch =
        schedule.id.toLowerCase().includes(q) ||
        schedule.scheduleNumber.toLowerCase().includes(q) ||
        schedule.products.toLowerCase().includes(q) ||
        schedule.supplierName?.toLowerCase().includes(q) ||
        false;
      const matchesStatus =
        state.statusFilter === 'ALL' ||
        normalizeStatus(schedule.status) === state.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [state.harvestSchedules, state.searchQuery, state.statusFilter]);

  const statusCounts = useMemo(
    () => ({
      all: state.harvestSchedules.length,
      pending: state.harvestSchedules.filter(
        (s) => normalizeStatus(s.status) === 'pending'
      ).length,
      rejected: state.harvestSchedules.filter(
        (s) => normalizeStatus(s.status) === 'rejected'
      ).length,
      approved: state.harvestSchedules.filter(
        (s) => normalizeStatus(s.status) === 'approved'
      ).length,
      processing: state.harvestSchedules.filter(
        (s) => normalizeStatus(s.status) === 'processing'
      ).length,
      completed: state.harvestSchedules.filter(
        (s) => normalizeStatus(s.status) === 'completed'
      ).length,
      canceled: state.harvestSchedules.filter(
        (s) => normalizeStatus(s.status) === 'canceled'
      ).length
    }),
    [state.harvestSchedules]
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
    handleConfirmSchedule,
    handleCancelSchedule,
    handleRejectSchedule,
    showRejectionReason,
    loadData,
    t
  };
}

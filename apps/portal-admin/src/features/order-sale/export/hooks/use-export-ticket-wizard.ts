'use client';

import { useToast } from '@/components/ui/use-toast';
import { fetchAreas } from '@/services/area.service';
import {
  createExportTicket,
  CreateExportTicketDto
} from '@/services/export-ticket.service';
import { fetchOrderPhasesBySchedule } from '@/services/order-phase.service';
import { fetchOrderSchedules } from '@/services/order-schedule.service';
import { Area } from '@/types/area';
import { OrderPhase, OrderSchedule } from '@/types/order';
import { useCallback, useEffect, useReducer, useRef } from 'react';
import {
  BatchGroupedByWeight,
  EXPORT_TICKET_STEPS,
  ExportTicketStep,
  ExportTicketWizardAction,
  ExportTicketWizardState,
  initialWizardState,
  OrderInvoiceDetail
} from '../types';
import { fetchBatches } from '@/services/batch.service';
import { Batch } from '@/types';

// Reducer function
function wizardReducer(
  state: ExportTicketWizardState,
  action: ExportTicketWizardAction
): ExportTicketWizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step };

    case 'NEXT_STEP': {
      const currentIndex = EXPORT_TICKET_STEPS.indexOf(state.currentStep);
      if (currentIndex < EXPORT_TICKET_STEPS.length - 1) {
        return {
          ...state,
          currentStep: EXPORT_TICKET_STEPS[currentIndex + 1]
        };
      }
      return state;
    }

    case 'PREV_STEP': {
      const currentIndex = EXPORT_TICKET_STEPS.indexOf(state.currentStep);
      if (currentIndex > 0) {
        return {
          ...state,
          currentStep: EXPORT_TICKET_STEPS[currentIndex - 1]
        };
      }
      return state;
    }

    case 'SET_SCHEDULES_LOADING':
      return { ...state, loadingSchedules: action.loading };

    case 'SET_SCHEDULES':
      return { ...state, schedules: action.schedules, errorSchedules: null };

    case 'SET_SCHEDULES_ERROR':
      return { ...state, errorSchedules: action.error };

    case 'SELECT_SCHEDULE':
      return {
        ...state,
        selectedSchedule: action.schedule,
        // Reset dependent data when schedule changes
        selectedPhase: null,
        selectedInvoiceDetail: null,
        selectedArea: null,
        selectedBatchIds: [],
        phases: [],
        batches: []
      };

    case 'SET_PHASES_LOADING':
      return { ...state, loadingPhases: action.loading };

    case 'SET_PHASES':
      return { ...state, phases: action.phases, errorPhases: null };

    case 'SET_PHASES_ERROR':
      return { ...state, errorPhases: action.error };

    case 'SELECT_PHASE':
      return {
        ...state,
        selectedPhase: action.phase,
        // Reset dependent data when phase changes
        selectedInvoiceDetail: null,
        selectedArea: null,
        selectedBatchIds: [],
        batches: []
      };

    case 'SELECT_INVOICE_DETAIL':
      return {
        ...state,
        selectedInvoiceDetail: action.invoiceDetail,
        // Reset dependent data when invoice detail changes
        selectedArea: null,
        selectedBatchIds: [],
        batches: []
      };

    case 'SET_AREAS_LOADING':
      return { ...state, loadingAreas: action.loading };

    case 'SET_AREAS':
      return { ...state, areas: action.areas, errorAreas: null };

    case 'SET_AREAS_ERROR':
      return { ...state, errorAreas: action.error };

    case 'SELECT_AREA':
      return {
        ...state,
        selectedArea: action.area,
        // Reset batches when area changes
        selectedBatchIds: [],
        batches: []
      };

    case 'SET_BATCHES_LOADING':
      return { ...state, loadingBatches: action.loading };

    case 'SET_BATCHES':
      return { ...state, batches: action.batches, errorBatches: null };

    case 'SET_BATCHES_ERROR':
      return { ...state, errorBatches: action.error };

    case 'TOGGLE_BATCH': {
      const batchIds = state.selectedBatchIds.includes(action.batchId)
        ? state.selectedBatchIds.filter((id) => id !== action.batchId)
        : [...state.selectedBatchIds, action.batchId];
      return { ...state, selectedBatchIds: batchIds };
    }

    case 'SET_SELECTED_BATCHES':
      return { ...state, selectedBatchIds: action.batchIds };

    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.isSubmitting };

    case 'SET_SUBMIT_ERROR':
      return { ...state, submitError: action.error };

    case 'SET_SUBMIT_SUCCESS':
      return { ...state, submitSuccess: action.success };

    case 'RESET':
      return initialWizardState;

    default:
      return state;
  }
}

// Cache types
type PhasesCache = Map<string, OrderPhase[]>;
type BatchesCache = Map<string, Batch[]>;

export function useExportTicketWizard() {
  const { toast } = useToast();
  const [state, dispatch] = useReducer(wizardReducer, initialWizardState);

  // Use ref to store toast to avoid re-renders
  const toastRef = useRef(toast);
  toastRef.current = toast;

  // Cache for phases by scheduleId
  const phasesCacheRef = useRef<PhasesCache>(new Map());

  // Cache for batches by areaId_productId
  const batchesCacheRef = useRef<BatchesCache>(new Map());

  // Load schedules on mount
  const loadSchedules = useCallback(async () => {
    dispatch({ type: 'SET_SCHEDULES_LOADING', loading: true });
    try {
      const response = await fetchOrderSchedules({ status: 'processing' });
      dispatch({ type: 'SET_SCHEDULES', schedules: response.data });
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      dispatch({
        type: 'SET_SCHEDULES_ERROR',
        error: 'Không thể tải danh sách lịch giao hàng'
      });
      toastRef.current({
        title: 'Lỗi',
        description: 'Không thể tải danh sách lịch giao hàng',
        variant: 'destructive'
      });
    } finally {
      dispatch({ type: 'SET_SCHEDULES_LOADING', loading: false });
    }
  }, []);

  // Load phases when schedule is selected (with caching)
  const loadPhases = useCallback(
    async (scheduleId: string, forceRefresh = false) => {
      // Check cache first
      const cachedPhases = phasesCacheRef.current.get(scheduleId);
      if (cachedPhases && !forceRefresh) {
        dispatch({ type: 'SET_PHASES', phases: cachedPhases });
        return;
      }

      dispatch({ type: 'SET_PHASES_LOADING', loading: true });
      try {
        const response = await fetchOrderPhasesBySchedule({
          orderScheduleId: scheduleId
        });
        // Save to cache
        phasesCacheRef.current.set(scheduleId, response.data);
        dispatch({ type: 'SET_PHASES', phases: response.data });
      } catch (error) {
        console.error('Failed to fetch phases:', error);
        dispatch({
          type: 'SET_PHASES_ERROR',
          error: 'Không thể tải danh sách đợt giao hàng'
        });
        toastRef.current({
          title: 'Lỗi',
          description: 'Không thể tải danh sách đợt giao hàng',
          variant: 'destructive'
        });
      } finally {
        dispatch({ type: 'SET_PHASES_LOADING', loading: false });
      }
    },
    []
  );

  // Load areas
  const loadAreas = useCallback(async () => {
    dispatch({ type: 'SET_AREAS_LOADING', loading: true });
    try {
      const response = await fetchAreas();
      dispatch({ type: 'SET_AREAS', areas: response.data });
    } catch (error) {
      console.error('Failed to fetch areas:', error);
      dispatch({
        type: 'SET_AREAS_ERROR',
        error: 'Không thể tải danh sách khu vực'
      });
      toastRef.current({
        title: 'Lỗi',
        description: 'Không thể tải danh sách khu vực',
        variant: 'destructive'
      });
    } finally {
      dispatch({ type: 'SET_AREAS_LOADING', loading: false });
    }
  }, []);

  // Load batches when area and product are selected (with caching)
  const loadBatches = useCallback(
    async (areaId: string, productId: string, forceRefresh = false) => {
      const cacheKey = `${areaId}_${productId}`;

      // Check cache first
      const cachedBatches = batchesCacheRef.current.get(cacheKey);
      if (cachedBatches && !forceRefresh) {
        dispatch({ type: 'SET_BATCHES', batches: cachedBatches });
        return;
      }

      dispatch({ type: 'SET_BATCHES_LOADING', loading: true });
      try {
        const response = await fetchBatches({
          areaId,
          productId
        });
        // Save to cache
        batchesCacheRef.current.set(cacheKey, response.data);
        dispatch({ type: 'SET_BATCHES', batches: response.data });
      } catch (error) {
        console.error('Failed to fetch batches:', error);
        dispatch({
          type: 'SET_BATCHES_ERROR',
          error: 'Không thể tải danh sách lô hàng'
        });
        toastRef.current({
          title: 'Lỗi',
          description: 'Không thể tải danh sách lô hàng',
          variant: 'destructive'
        });
      } finally {
        dispatch({ type: 'SET_BATCHES_LOADING', loading: false });
      }
    },
    []
  );

  // Clear caches (useful when data might have changed)
  const clearPhasesCache = useCallback((scheduleId?: string) => {
    if (scheduleId) {
      phasesCacheRef.current.delete(scheduleId);
    } else {
      phasesCacheRef.current.clear();
    }
  }, []);

  const clearBatchesCache = useCallback(
    (areaId?: string, productId?: string) => {
      if (areaId && productId) {
        batchesCacheRef.current.delete(`${areaId}_${productId}`);
      } else {
        batchesCacheRef.current.clear();
      }
    },
    []
  );

  // Initial load - run once on mount
  useEffect(() => {
    loadSchedules();
    loadAreas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load phases when schedule is selected
  const selectedScheduleId = state.selectedSchedule?.id;
  useEffect(() => {
    if (selectedScheduleId) {
      loadPhases(selectedScheduleId);
    }
  }, [selectedScheduleId, loadPhases]);

  // Load batches when area and invoice detail (product) are selected
  const selectedAreaId = state.selectedArea?.id;
  const selectedProductId = state.selectedInvoiceDetail?.product?.id;
  useEffect(() => {
    if (selectedAreaId && selectedProductId) {
      loadBatches(selectedAreaId, selectedProductId);
    }
  }, [selectedAreaId, selectedProductId, loadBatches]);

  // Actions
  const goToStep = useCallback((step: ExportTicketStep) => {
    dispatch({ type: 'SET_STEP', step });
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const selectSchedule = useCallback((schedule: OrderSchedule | null) => {
    dispatch({ type: 'SELECT_SCHEDULE', schedule });
  }, []);

  const selectPhase = useCallback((phase: OrderPhase | null) => {
    dispatch({ type: 'SELECT_PHASE', phase });
  }, []);

  const selectInvoiceDetail = useCallback(
    (invoiceDetail: OrderInvoiceDetail | null) => {
      dispatch({ type: 'SELECT_INVOICE_DETAIL', invoiceDetail });
    },
    []
  );

  const selectArea = useCallback((area: Area | null) => {
    dispatch({ type: 'SELECT_AREA', area });
  }, []);

  const toggleBatch = useCallback((batchId: string) => {
    dispatch({ type: 'TOGGLE_BATCH', batchId });
  }, []);

  const setSelectedBatches = useCallback((batchIds: string[]) => {
    dispatch({ type: 'SET_SELECTED_BATCHES', batchIds });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
    // Clear caches on reset
    phasesCacheRef.current.clear();
    batchesCacheRef.current.clear();
  }, []);

  // Validation - use specific state values instead of entire state
  const {
    selectedSchedule,
    selectedPhase,
    selectedInvoiceDetail,
    selectedArea,
    selectedBatchIds,
    currentStep
  } = state;

  const canProceed = useCallback(
    (step: ExportTicketStep): boolean => {
      switch (step) {
        case 'schedule':
          return !!selectedSchedule;
        case 'phase':
          return !!selectedPhase;
        case 'invoiceDetail':
          return !!selectedInvoiceDetail;
        case 'area':
          return !!selectedArea;
        case 'batches':
          return selectedBatchIds.length > 0;
        case 'summary':
          return true;
        default:
          return false;
      }
    },
    [
      selectedSchedule,
      selectedPhase,
      selectedInvoiceDetail,
      selectedArea,
      selectedBatchIds
    ]
  );

  const isStepAccessible = useCallback(
    (step: ExportTicketStep): boolean => {
      const stepIndex = EXPORT_TICKET_STEPS.indexOf(step);
      const currentIndex = EXPORT_TICKET_STEPS.indexOf(currentStep);

      // Can always go back
      if (stepIndex <= currentIndex) return true;

      // Check all previous steps
      for (let i = 0; i < stepIndex; i++) {
        if (!canProceed(EXPORT_TICKET_STEPS[i])) return false;
      }
      return true;
    },
    [currentStep, canProceed]
  );

  // Submit
  const submitExportTicket = useCallback(async (): Promise<boolean> => {
    if (!selectedInvoiceDetail || selectedBatchIds.length === 0) {
      toastRef.current({
        title: 'Lỗi',
        description: 'Vui lòng chọn đầy đủ thông tin',
        variant: 'destructive'
      });
      return false;
    }

    dispatch({ type: 'SET_SUBMITTING', isSubmitting: true });
    dispatch({ type: 'SET_SUBMIT_ERROR', error: null });

    try {
      const payload: CreateExportTicketDto = {
        invoiceDetails: [
          {
            orderInvoiceDetailId: selectedInvoiceDetail.id,
            batchIds: selectedBatchIds
          }
        ]
      };

      await createExportTicket(payload);

      dispatch({ type: 'SET_SUBMIT_SUCCESS', success: true });
      toastRef.current({
        title: 'Thành công',
        description: 'Tạo phiếu xuất kho thành công'
      });

      // Clear batches cache after successful submission since inventory changed
      batchesCacheRef.current.clear();

      return true;
    } catch (error: any) {
      console.error('Failed to create export ticket:', error);
      const errorMessage = error?.message || 'Không thể tạo phiếu xuất kho';
      dispatch({ type: 'SET_SUBMIT_ERROR', error: errorMessage });
      toastRef.current({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    } finally {
      dispatch({ type: 'SET_SUBMITTING', isSubmitting: false });
    }
  }, [selectedInvoiceDetail, selectedBatchIds]);

  // Force refresh functions (bypass cache)
  const refreshPhases = useCallback(
    (scheduleId: string) => {
      loadPhases(scheduleId, true);
    },
    [loadPhases]
  );

  const refreshBatches = useCallback(
    (areaId: string, productId: string) => {
      loadBatches(areaId, productId, true);
    },
    [loadBatches]
  );

  return {
    // State
    ...state,
    // Navigation
    goToStep,
    nextStep,
    prevStep,
    // Selections
    selectSchedule,
    selectPhase,
    selectInvoiceDetail,
    selectArea,
    toggleBatch,
    setSelectedBatches,
    // Validation
    canProceed,
    isStepAccessible,
    // Actions
    submitExportTicket,
    reset,
    // Reload functions (uses cache)
    loadSchedules,
    loadPhases,
    loadAreas,
    loadBatches,
    // Force refresh functions (bypass cache)
    refreshPhases,
    refreshBatches,
    // Cache management
    clearPhasesCache,
    clearBatchesCache
  };
}

export type UseExportTicketWizardReturn = ReturnType<
  typeof useExportTicketWizard
>;

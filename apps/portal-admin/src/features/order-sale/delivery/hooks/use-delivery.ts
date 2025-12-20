'use client';

import { useToast } from '@/components/ui/use-toast';
import { fetchDeliveryStaffs } from '@/services/delivery-staff.service';
import {
  createDelivery as createDeliveryService,
  fetchDeliveries,
  updateDeliveryStatus as updateDeliveryStatusService
} from '@/services/delivery.service';
import {
  fetchOrderPhaseById,
  fetchOrderPhasesBySchedule,
  uploadPhaseImageProof
} from '@/services/order-phase.service';
import { fetchOrderSchedules } from '@/services/order-schedule.service';
import { fetchTrucks } from '@/services/truck.service';
import {
  CreateDeliveryDto,
  Delivery,
  DeliveryStatusEnum
} from '@/types/delivery';
import { DeliveryStaff } from '@/types/delivery-staff';
import { OrderPhase, OrderSchedule, OrderScheduleStatus } from '@/types/order';
import { Truck } from '@/types/truck';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { parseAsInteger, useQueryState } from 'nuqs';

// ============================================================================
// Trucks Hook
// ============================================================================
export function useTrucks() {
  const { toast } = useToast();
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loadTrucks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchTrucks({ page: 1, limit: 50 });
      setTrucks(response.data as Truck[]);
      setHasNextPage(response.hasNextPage);
    } catch (error) {
      console.error('Failed to fetch trucks:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải danh sách xe'
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadTrucks();
  }, [loadTrucks]);

  // Filter only available trucks
  const availableTrucks = useMemo(
    () =>
      trucks.filter((t) => t.status === 'available' || t.status === 'in_use'),
    [trucks]
  );

  return {
    trucks,
    availableTrucks,
    loading,
    hasNextPage,
    loadTrucks
  };
}

// ============================================================================
// Delivery Staff Hook
// ============================================================================
export function useDeliveryStaffs() {
  const { toast } = useToast();
  const [deliveryStaffs, setDeliveryStaffs] = useState<DeliveryStaff[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loadDeliveryStaffs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchDeliveryStaffs({ page: 1, limit: 50 });
      setDeliveryStaffs(response.data as DeliveryStaff[]);
      setHasNextPage(response.hasNextPage);
    } catch (error) {
      console.error('Failed to fetch delivery staffs:', error);
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải danh sách nhân viên giao hàng'
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadDeliveryStaffs();
  }, [loadDeliveryStaffs]);

  return {
    deliveryStaffs,
    loading,
    hasNextPage,
    loadDeliveryStaffs
  };
}

// ============================================================================
// Order Schedules Hook with Search & Filter
// ============================================================================
export function useOrderSchedules() {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<OrderSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderScheduleStatus | 'all'>(
    'processing'
  );
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit] = useQueryState('limit', parseAsInteger.withDefault(10));

  // Sort function: processing and pending first, completed last
  const sortSchedules = useCallback((schedulesList: OrderSchedule[]) => {
    return [...schedulesList].sort((a, b) => {
      const statusA = (a.status || 'pending').toLowerCase();
      const statusB = (b.status || 'pending').toLowerCase();

      // Processing and pending should be first
      const priorityA =
        statusA === 'processing' || statusA === 'pending' ? 0 : 1;
      const priorityB =
        statusB === 'processing' || statusB === 'pending' ? 0 : 1;

      // Completed should be last
      const completedA = statusA === 'completed' ? 1 : 0;
      const completedB = statusB === 'completed' ? 1 : 0;

      // First sort by priority (processing/pending first)
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Then sort completed to the end
      if (completedA !== completedB) {
        return completedA - completedB;
      }

      // For same priority, sort by date (newest first)
      const dateA = new Date(a.createdAt || a.deliveryDate || 0).getTime();
      const dateB = new Date(b.createdAt || b.deliveryDate || 0).getTime();
      return dateB - dateA;
    });
  }, []);

  const loadSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchOrderSchedules({
        page,
        limit,
        status: statusFilter === 'all' ? undefined : statusFilter,
        sort: 'desc'
      });
      const sortedSchedules = sortSchedules(response.data);
      setSchedules(sortedSchedules);
      setHasNextPage(response.hasNextPage);

      // Calculate pageCount for pagination display
      // If hasNextPage is true, there's at least one more page
      // If we're on page > 1 and no next page, this is the last page
      if (response.hasNextPage) {
        // There's at least one more page, so pageCount is at least current page + 1
        setPageCount((prev) => Math.max(prev, page + 1));
      } else {
        // No next page, so current page is the last page
        setPageCount(page);
      }
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách lịch giao hàng',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, sortSchedules]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  // Filtered schedules based on search
  const filteredSchedules = useMemo(() => {
    if (!searchQuery.trim()) return schedules;
    const query = searchQuery.toLowerCase();
    return schedules.filter(
      (s) =>
        s.id.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query) ||
        s.consignee?.organizationName?.toLowerCase().includes(query) ||
        s.address?.toLowerCase().includes(query)
    );
  }, [schedules, searchQuery]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
    },
    [setPage]
  );

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (page !== 1) {
        setPage(1);
      }
    },
    [page, setPage]
  );

  const handleStatusFilterChange = useCallback(
    (filter: OrderScheduleStatus | 'all') => {
      setStatusFilter(filter);
      if (page !== 1) {
        setPage(1);
      }
    },
    [page, setPage]
  );

  return {
    schedules: filteredSchedules,
    allSchedules: schedules,
    loading,
    hasNextPage,
    page,
    pageCount,
    limit,
    searchQuery,
    setSearchQuery: handleSearchChange,
    statusFilter,
    setStatusFilter: handleStatusFilterChange,
    setPage: handlePageChange,
    loadSchedules
  };
}

// ============================================================================
// Order Phases by Schedule Hook with Caching
// ============================================================================
type PhasesCache = Record<
  string,
  { phases: OrderPhase[]; hasNextPage: boolean }
>;

export function useOrderPhasesBySchedule() {
  const { toast } = useToast();
  const cacheRef = useRef<PhasesCache>({});
  const [phasesMap, setPhasesMap] = useState<PhasesCache>({});
  const [loadingScheduleId, setLoadingScheduleId] = useState<string | null>(
    null
  );

  const loadPhases = useCallback(
    async (orderScheduleId: string, forceRefresh = false) => {
      // Check cache first
      if (!forceRefresh && cacheRef.current[orderScheduleId]) {
        return cacheRef.current[orderScheduleId];
      }

      setLoadingScheduleId(orderScheduleId);
      try {
        const response = await fetchOrderPhasesBySchedule({
          orderScheduleId,
          limit: 50
        });
        const result = {
          phases: response.data,
          hasNextPage: response.hasNextPage
        };
        // Update cache
        cacheRef.current[orderScheduleId] = result;
        setPhasesMap((prev) => ({
          ...prev,
          [orderScheduleId]: result
        }));
        return result;
      } catch (error) {
        console.error('Failed to fetch phases:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể tải danh sách đợt giao hàng',
          variant: 'destructive'
        });
        return null;
      } finally {
        setLoadingScheduleId(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const getPhases = useCallback(
    (scheduleId: string): OrderPhase[] => {
      return phasesMap[scheduleId]?.phases || [];
    },
    [phasesMap]
  );

  const clearCache = useCallback((scheduleId?: string) => {
    if (scheduleId) {
      delete cacheRef.current[scheduleId];
      setPhasesMap((prev) => {
        const newMap = { ...prev };
        delete newMap[scheduleId];
        return newMap;
      });
    } else {
      cacheRef.current = {};
      setPhasesMap({});
    }
  }, []);

  const refetchPhase = useCallback(
    async (phaseId: string, scheduleId: string) => {
      try {
        const response = await fetchOrderPhaseById(phaseId);
        // Update the phase in the phasesMap for the schedule
        setPhasesMap((prev) => {
          const schedulePhases = prev[scheduleId];
          if (!schedulePhases) {
            return prev;
          }
          const updatedPhases = schedulePhases.phases.map((phase) =>
            phase.id === phaseId ? response : phase
          );
          // Update cache
          const updatedResult = {
            phases: updatedPhases,
            hasNextPage: schedulePhases.hasNextPage
          };
          cacheRef.current[scheduleId] = updatedResult;
          return {
            ...prev,
            [scheduleId]: updatedResult
          };
        });
        return response;
      } catch (error) {
        console.error('Failed to refetch phase:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể tải lại thông tin đợt giao hàng',
          variant: 'destructive'
        });
        return null;
      } finally {
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {
    phasesMap,
    loadingScheduleId,
    loadPhases,
    getPhases,
    clearCache,
    refetchPhase
  };
}

// ============================================================================
// Deliveries Hook with Full CRUD
// ============================================================================
export function useDeliveries() {
  const { toast } = useToast();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingUpdateStatus, setLoadingUpdateStatus] = useState<string | null>(
    null
  );
  const [loadingUploadProofPhaseId, setLoadingUploadProofPhaseId] = useState<
    string | null
  >(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loadDeliveriesWithOrderPhase = useCallback(async () => {
    setLoadingFetch(true);
    try {
      // Fetch deliveries with orderPhaseId filter (all deliveries that have orderPhase)
      const response = await fetchDeliveries({
        page: 1,
        limit: 100
      });
      // Filter only deliveries that have orderPhase (not harvestPhase)
      const orderDeliveries = response.data.filter(
        (d) => d.orderPhase && !d.harvestPhase
      );
      setDeliveries(orderDeliveries);
      setHasNextPage(response.hasNextPage);
    } catch (error) {
      console.error('Failed to fetch deliveries with order phase:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách giao hàng',
        variant: 'destructive'
      });
    } finally {
      setLoadingFetch(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createDelivery = useCallback(
    async (data: CreateDeliveryDto): Promise<Delivery | null> => {
      setLoadingCreate(true);
      try {
        const response = await createDeliveryService(data);
        setDeliveries((prev) => [...prev, response]);
        toast({
          title: 'Thành công',
          description: 'Đã tạo chuyến giao hàng mới'
        });
        return response;
      } catch (error) {
        console.error('Failed to create delivery:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể tạo giao hàng',
          variant: 'destructive'
        });
        return null;
      } finally {
        setLoadingCreate(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const updateDeliveryStatus = useCallback(
    async (
      id: string,
      status: DeliveryStatusEnum
    ): Promise<Delivery | null> => {
      setLoadingUpdateStatus(id);
      try {
        const response = await updateDeliveryStatusService(id, status);
        setDeliveries((prev) =>
          prev.map((delivery) => (delivery.id === id ? response : delivery))
        );
        toast({
          title: 'Thành công',
          description: 'Đã cập nhật trạng thái giao hàng'
        });
        return response;
      } catch (error) {
        console.error('Failed to update delivery status:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể cập nhật trạng thái giao hàng',
          variant: 'destructive'
        });
        return null;
      } finally {
        setLoadingUpdateStatus(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Get delivery by order phase ID
  const getDeliveryByPhaseId = useCallback(
    (phaseId: string): Delivery | undefined => {
      return deliveries.find((d) => d.orderPhase?.id === phaseId);
    },
    [deliveries]
  );

  // Check if a phase already has a delivery
  const hasDeliveryForPhase = useCallback(
    (phaseId: string): boolean => {
      return deliveries.some((d) => d.orderPhase?.id === phaseId);
    },
    [deliveries]
  );

  const uploadPhaseProof = useCallback(
    async (
      phaseId: string,
      files: File[]
    ): Promise<{ paths: string[] } | null> => {
      setLoadingUploadProofPhaseId(phaseId);
      try {
        const uploads = await Promise.all(
          files.map(async (file) => uploadPhaseImageProof(phaseId, file))
        );
        const paths = uploads
          .map((res) => res?.path)
          .filter((p): p is string => Boolean(p));
        if (!paths.length) {
          throw new Error('No files uploaded');
        }
        toast({
          title: 'Thành công',
          description: `Đã tải ${paths.length} hình ảnh xác nhận đợt giao hàng`
        });
        return { paths };
      } catch (error) {
        console.error('Failed to upload phase proof:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể tải hình ảnh xác nhận',
          variant: 'destructive'
        });
        return null;
      } finally {
        setLoadingUploadProofPhaseId(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Get all phase IDs that have deliveries
  const assignedPhaseIds = useMemo(() => {
    return new Set(
      deliveries
        .map((d) => d.orderPhase?.id)
        .filter((id): id is string => Boolean(id))
    );
  }, [deliveries]);

  useEffect(() => {
    loadDeliveriesWithOrderPhase();
  }, [loadDeliveriesWithOrderPhase]);

  return {
    deliveries,
    loadingFetch,
    loadingCreate,
    loadingUpdateStatus,
    loadingUploadProofPhaseId,
    hasNextPage,
    loadDeliveriesWithOrderPhase,
    createDelivery,
    updateDeliveryStatus,
    getDeliveryByPhaseId,
    hasDeliveryForPhase,
    assignedPhaseIds,
    uploadPhaseProof
  };
}

// ============================================================================
// Combined Delivery Page Hook
// ============================================================================
export function useDeliveryPage() {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null
  );
  const [expandedScheduleIds, setExpandedScheduleIds] = useState<Set<string>>(
    new Set()
  );

  const trucks = useTrucks();
  const deliveryStaffs = useDeliveryStaffs();
  const schedules = useOrderSchedules();
  const phases = useOrderPhasesBySchedule();
  const deliveries = useDeliveries();

  // Toggle schedule expansion
  const toggleScheduleExpand = useCallback(
    async (scheduleId: string) => {
      setExpandedScheduleIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(scheduleId)) {
          newSet.delete(scheduleId);
        } else {
          newSet.add(scheduleId);
          // Lazy load phases when expanding
          phases.loadPhases(scheduleId);
        }
        return newSet;
      });
    },
    [phases]
  );

  // Select a schedule
  const selectSchedule = useCallback(
    async (scheduleId: string) => {
      setSelectedScheduleId(scheduleId);
      // Load phases if not already loaded
      if (!phases.phasesMap[scheduleId]) {
        await phases.loadPhases(scheduleId);
      }
    },
    [phases]
  );

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.all([
      schedules.loadSchedules(),
      deliveries.loadDeliveriesWithOrderPhase(),
      trucks.loadTrucks(),
      deliveryStaffs.loadDeliveryStaffs()
    ]);
    phases.clearCache();
  }, [schedules, deliveries, trucks, deliveryStaffs, phases]);

  // Get selected schedule object
  const selectedSchedule = useMemo(() => {
    if (!selectedScheduleId) return null;
    return (
      schedules.allSchedules.find((s) => s.id === selectedScheduleId) || null
    );
  }, [selectedScheduleId, schedules.allSchedules]);

  // Get phases for selected schedule
  const selectedSchedulePhases = useMemo(() => {
    if (!selectedScheduleId) return [];
    return phases.getPhases(selectedScheduleId);
  }, [selectedScheduleId, phases]);

  return {
    // State
    selectedScheduleId,
    selectedSchedule,
    selectedSchedulePhases,
    expandedScheduleIds,

    // Actions
    selectSchedule,
    toggleScheduleExpand,
    refreshAll,

    // Sub-hooks
    trucks,
    deliveryStaffs,
    schedules,
    phases,
    deliveries
  };
}

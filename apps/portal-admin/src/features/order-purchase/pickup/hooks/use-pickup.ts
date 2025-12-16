'use client';

import { useToast } from '@/components/ui/use-toast';
import { fetchDeliveryStaffs } from '@/services/delivery-staff.service';
import {
  createDelivery,
  fetchDeliveriesWithHarvestPhase,
  updateDeliveryStatus
} from '@/services/delivery.service';
import { fetchHarvestPhasesBySchedule } from '@/services/harvest-phase.service';
import { fetchHarvestSchedules } from '@/services/harvest-schedule.service';
import { fetchTrucks } from '@/services/truck.service';
import {
  CreateDeliveryDto,
  Delivery,
  DeliveryStatusEnum
} from '@/types/delivery';
import { uploadPhaseImageProof } from '@/services/harvest-phase.service';
import { DeliveryStaff } from '@/types/delivery-staff';
import { HarvestPhase } from '@/types/harvest-phase';
import {
  HarvestSchedule,
  HarvestScheduleStatus
} from '@/types/harvest-schedule';
import { Truck } from '@/types/truck';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
// Harvest Schedules Hook with Search & Filter
// ============================================================================
export function useHarvestSchedules() {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<HarvestSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    HarvestScheduleStatus | 'all'
  >('processing');

  const loadSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchHarvestSchedules({
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: 50
      });
      setSchedules(response.data);
      setHasNextPage(response.hasNextPage);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách lịch thu hoạch',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

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
        s.supplier?.gardenName?.toLowerCase().includes(query) ||
        s.address?.toLowerCase().includes(query)
    );
  }, [schedules, searchQuery]);

  return {
    schedules: filteredSchedules,
    allSchedules: schedules,
    loading,
    hasNextPage,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    loadSchedules
  };
}

// ============================================================================
// Harvest Phases by Schedule Hook with Caching
// ============================================================================
type PhasesCache = Record<
  string,
  { phases: HarvestPhase[]; hasNextPage: boolean }
>;

export function useHarvestPhasesBySchedule() {
  const { toast } = useToast();
  const cacheRef = useRef<PhasesCache>({});
  const [phasesMap, setPhasesMap] = useState<PhasesCache>({});
  const [loadingScheduleId, setLoadingScheduleId] = useState<string | null>(
    null
  );

  const loadPhases = useCallback(
    async (harvestScheduleId: string, forceRefresh = false) => {
      // Check cache first
      if (!forceRefresh && cacheRef.current[harvestScheduleId]) {
        return cacheRef.current[harvestScheduleId];
      }

      setLoadingScheduleId(harvestScheduleId);
      try {
        const response = await fetchHarvestPhasesBySchedule({
          harvestScheduleId,
          limit: 50
        });
        const result = {
          phases: response.data,
          hasNextPage: response.hasNextPage
        };
        // Update cache
        cacheRef.current[harvestScheduleId] = result;
        setPhasesMap((prev) => ({
          ...prev,
          [harvestScheduleId]: result
        }));
        return result;
      } catch (error) {
        console.error('Failed to fetch phases:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể tải danh sách đợt thu hoạch',
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
    (scheduleId: string): HarvestPhase[] => {
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

  return {
    phasesMap,
    loadingScheduleId,
    loadPhases,
    getPhases,
    clearCache
  };
}

// ============================================================================
// Pickups (Deliveries) Hook with Full CRUD
// ============================================================================
export function usePickups() {
  const { toast } = useToast();
  const [pickups, setPickups] = useState<Delivery[]>([]);
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingUpdateStatus, setLoadingUpdateStatus] = useState<string | null>(
    null
  );
  const [loadingUploadProofPhaseId, setLoadingUploadProofPhaseId] = useState<
    string | null
  >(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loadPickupsWithHarvestPhase = useCallback(async () => {
    setLoadingFetch(true);
    try {
      const response = await fetchDeliveriesWithHarvestPhase({
        page: 1,
        limit: 100
      });
      setPickups(response.data);
      setHasNextPage(response.hasNextPage);
    } catch (error) {
      console.error('Failed to fetch deliveries with harvest phase:', error);
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

  const createPickup = useCallback(
    async (data: CreateDeliveryDto): Promise<Delivery | null> => {
      setLoadingCreate(true);
      try {
        const response = await createDelivery(data);
        setPickups((prev) => [...prev, response]);
        toast({
          title: 'Thành công',
          description: 'Đã tạo chuyến giao hàng mới'
        });
        return response;
      } catch (error) {
        console.error('Failed to create pickup:', error);
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

  const updatePickupStatus = useCallback(
    async (
      id: string,
      status: DeliveryStatusEnum
    ): Promise<Delivery | null> => {
      setLoadingUpdateStatus(id);
      try {
        const response = await updateDeliveryStatus(id, status);
        setPickups((prev) =>
          prev.map((pickup) => (pickup.id === id ? response : pickup))
        );
        toast({
          title: 'Thành công',
          description: 'Đã cập nhật trạng thái giao hàng'
        });
        return response;
      } catch (error) {
        console.error('Failed to update pickup status:', error);
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
          description: `Đã tải ${paths.length} hình ảnh xác nhận đợt thu hoạch`
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

  // Get pickup by harvest phase ID
  const getPickupByPhaseId = useCallback(
    (phaseId: string): Delivery | undefined => {
      return pickups.find((p) => p.harvestPhase?.id === phaseId);
    },
    [pickups]
  );

  // Check if a phase already has a pickup
  const hasPickupForPhase = useCallback(
    (phaseId: string): boolean => {
      return pickups.some((p) => p.harvestPhase?.id === phaseId);
    },
    [pickups]
  );

  // Get all phase IDs that have pickups
  const assignedPhaseIds = useMemo(() => {
    return new Set(
      pickups
        .map((p) => p.harvestPhase?.id)
        .filter((id): id is string => Boolean(id))
    );
  }, [pickups]);

  useEffect(() => {
    loadPickupsWithHarvestPhase();
  }, [loadPickupsWithHarvestPhase]);

  return {
    pickups,
    loadingFetch,
    loadingCreate,
    loadingUpdateStatus,
    loadingUploadProofPhaseId,
    hasNextPage,
    loadPickupsWithHarvestPhase,
    createPickup,
    updatePickupStatus,
    getPickupByPhaseId,
    hasPickupForPhase,
    assignedPhaseIds,
    uploadPhaseProof
  };
}

// ============================================================================
// Combined Pickup Page Hook
// ============================================================================
export function usePickupPage() {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null
  );
  const [expandedScheduleIds, setExpandedScheduleIds] = useState<Set<string>>(
    new Set()
  );

  const trucks = useTrucks();
  const deliveryStaffs = useDeliveryStaffs();
  const schedules = useHarvestSchedules();
  const phases = useHarvestPhasesBySchedule();
  const pickups = usePickups();

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
      pickups.loadPickupsWithHarvestPhase(),
      trucks.loadTrucks(),
      deliveryStaffs.loadDeliveryStaffs()
    ]);
    phases.clearCache();
  }, [schedules, pickups, trucks, deliveryStaffs, phases]);

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
    pickups
  };
}

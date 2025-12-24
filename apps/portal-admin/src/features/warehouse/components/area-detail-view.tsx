'use client';

import IotDeviceCard from '@/components/iot/iot-device-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { getApiBase } from '@/lib/client';
import {
  createAreaSetting,
  fetchAreaSettings,
  updateAreaSetting
} from '@/services/area-setting.service';
import { fetchAreaById, fetchAreaTickets } from '@/services/area.service';
import { fetchBatchesByArea } from '@/services/batch.service';
import { fetchExportTickets } from '@/services/export-ticket.service';
import { fetchImportTickets } from '@/services/import-ticket.service';
import { subscribeIoTDataUpdates } from '@/services/iotdevice.service';
import {
  createPrice,
  type CreatePriceDto,
  deletePrice,
  fetchPricesByBatchId,
  type Price,
  updatePrice,
  type UpdatePriceDto
} from '@/services/price.service';
import { fetchWarehouseById } from '@/services/warehouse.service';
import type { Area as AreaEntity } from '@/types/area';
import type { AreaSetting } from '@/types/area-setting';
import type { Batch } from '@/types/batch';
import type { ImportTicket } from '@/types/import-ticket';
import type { Warehouse } from '@/types/warehouse';
import {
  IconAlertTriangle,
  IconArrowDown,
  IconArrowLeft,
  IconArrowUp,
  IconBell,
  IconBox,
  IconCalendar,
  IconClock,
  IconDroplet,
  IconEdit,
  IconEye,
  IconHistory,
  IconMapPin,
  IconPackage,
  IconPlus,
  IconRefresh,
  IconSettings,
  IconShield,
  IconThermometer,
  IconTrash
} from '@tabler/icons-react';
import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  type PaginationState,
  useReactTable
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';

interface AreaDetailViewProps {
  warehouseId: string;
  areaId: string;
}

export default function AreaDetailView({
  warehouseId,
  areaId
}: AreaDetailViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('AreaDetail');
  const locale = useLocale();
  const [realTimeData, setRealTimeData] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [area, setArea] = useState<AreaEntity | null>(null);
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [isLoadingArea, setIsLoadingArea] = useState(false);
  const [isLoadingWarehouse, setIsLoadingWarehouse] = useState(false);
  const [temperature, setTemperature] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number | null>(null);
  const [isLoadingEnv, setIsLoadingEnv] = useState(false);
  const [areaDeviceIds, setAreaDeviceIds] = useState<string[]>([]);
  const [areaSetting, setAreaSetting] = useState<AreaSetting | null>(null);
  const [isLoadingSetting, setIsLoadingSetting] = useState(false);
  const [isSavingSetting, setIsSavingSetting] = useState(false);
  const [settingForm, setSettingForm] = useState({
    minTemperature: '',
    maxTemperature: '',
    minHumidity: '',
    maxHumidity: '',
    minCapacity: ''
  });
  const [areaBatches, setAreaBatches] = useState<Batch[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [batchPrices, setBatchPrices] = useState<Price[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<Price | null | 'new'>(null);
  const [areaImportTickets, setAreaImportTickets] = useState<ImportTicket[]>(
    []
  );
  const [activeAlert, setActiveAlert] = useState<{
    id: string;
    status?: string | null;
    message?: string | null;
    alertType?: string | null;
    area?: { id: string } | null;
    createdAt?: string;
    updatedAt?: string;
  } | null>(null);
  const [areaExportTickets, setAreaExportTickets] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [iotDevices, setIotDevices] = useState<any[]>([]);
  const [isLoadingIoT, setIsLoadingIoT] = useState(false);
  const [allImportTickets, setAllImportTickets] = useState<ImportTicket[]>([]);
  const [allExportTickets, setAllExportTickets] = useState<any[]>([]);
  const offlineTimersRef = useRef<Record<string, any>>({});

  // Pagination for batches table
  const [batchesPage, setBatchesPage] = useQueryState(
    'batchesPage',
    parseAsInteger.withDefault(1)
  );
  const [batchesLimit] = useQueryState(
    'batchesLimit',
    parseAsInteger.withDefault(10)
  );
  const [batchesPageCount, setBatchesPageCount] = useState(1);

  // Pagination for history table
  const [historyPage, setHistoryPage] = useQueryState(
    'historyPage',
    parseAsInteger.withDefault(1)
  );
  const [historyLimit] = useQueryState(
    'historyLimit',
    parseAsInteger.withDefault(10)
  );
  const [historyPageCount, setHistoryPageCount] = useState(1);

  type EnvironmentReadings = {
    temperature?: number | null;
    humidity?: number | null;
  };

  const parseDeviceData = (device: any): EnvironmentReadings => {
    try {
      // Support direct payload with top-level fields
      if (
        device &&
        typeof device === 'object' &&
        (device.temperature !== undefined || device.humidity !== undefined)
      ) {
        return {
          temperature:
            device.temperature ??
            device.temp ??
            device.t ??
            device.Temperature ??
            null,
          humidity:
            device.humidity ??
            device.humid ??
            device.h ??
            device.Humidity ??
            null
        };
      }

      const raw = device?.data;

      if (typeof raw === 'string' && raw.trim().length > 0) {
        const obj = JSON.parse(raw);
        return {
          temperature:
            obj.temperature ?? obj.temp ?? obj.t ?? obj.Temperature ?? null,
          humidity: obj.humidity ?? obj.humid ?? obj.h ?? obj.Humidity ?? null
        };
      }

      if (Array.isArray(raw) && raw.length > 0) {
        const last = raw[raw.length - 1];
        return {
          temperature:
            last?.temperature ?? last?.temp ?? last?.t ?? last?.Temperature,
          humidity: last?.humidity ?? last?.humid ?? last?.h ?? last?.Humidity
        };
      }

      if (raw && typeof raw === 'object') {
        return {
          temperature:
            raw.temperature ?? raw.temp ?? raw.t ?? (raw as any).Temperature,
          humidity: raw.humidity ?? raw.humid ?? raw.h ?? (raw as any).Humidity
        };
      }
    } catch {
      // ignore parse errors, fall through to empty result
    }

    return {};
  };

  const loadEnvironmentFromArea = async (id: string) => {
    setIsLoadingEnv(true);
    try {
      const area: any = await fetchAreaById(id);
      const iot = area?.iotDevice;
      const devices: any[] = Array.isArray(iot) ? iot : iot ? [iot] : [];

      // Lưu lại danh sách device id thuộc area này để filter IoT real-time
      const deviceIds = devices
        .map((d) => (d && typeof d === 'object' ? (d as any).id : null))
        .filter(
          (v): v is string => typeof v === 'string' && v.trim().length > 0
        );
      setAreaDeviceIds(deviceIds);

      for (const d of devices) {
        const r = parseDeviceData(d);
        if (r.temperature != null || r.humidity != null) {
          setTemperature(
            typeof r.temperature === 'number' ? r.temperature : null
          );
          setHumidity(typeof r.humidity === 'number' ? r.humidity : null);
          return;
        }
      }

      // Không có dữ liệu hợp lệ
      setTemperature(null);
      setHumidity(null);
    } catch {
      setTemperature(null);
      setHumidity(null);
    } finally {
      setIsLoadingEnv(false);
    }
  };

  // Load area & warehouse info từ API
  useEffect(() => {
    const loadArea = async () => {
      if (!areaId) return;
      setIsLoadingArea(true);
      try {
        const data = await fetchAreaById(areaId);
        setArea(data);
      } catch (error) {
        console.error('Unable to load area detail', error);
        setArea(null);
      } finally {
        setIsLoadingArea(false);
      }
    };

    const loadWarehouse = async () => {
      if (!warehouseId) return;
      setIsLoadingWarehouse(true);
      try {
        const data = await fetchWarehouseById(warehouseId);
        setWarehouse(data);
      } catch (error) {
        console.error('Unable to load warehouse', error);
        setWarehouse(null);
      } finally {
        setIsLoadingWarehouse(false);
      }
    };

    void loadArea();
    void loadWarehouse();
  }, [areaId, warehouseId]);

  useEffect(() => {
    setActiveAlert(null);
  }, [areaId]);

  // tạm thời vẫn dùng mock area/warehouse, nhưng ngưỡng cảnh báo lấy theo API area-settings
  useEffect(() => {
    if (areaId) {
      void loadEnvironmentFromArea(areaId);
    }

    let isMounted = true;

    const loadAreaSetting = async () => {
      // Reset state trước khi fetch
      if (isMounted) {
        setIsLoadingSetting(true);
        setAreaSetting(null);
        setSettingForm({
          minTemperature: '',
          maxTemperature: '',
          minHumidity: '',
          maxHumidity: '',
          minCapacity: ''
        });
      }

      try {
        // Tăng limit để đảm bảo lấy được tất cả settings của area
        const res = await fetchAreaSettings({ page: 1, limit: 100, areaId });

        // Kiểm tra component vẫn còn mount trước khi set state
        if (!isMounted) return;

        // Đảm bảo chỉ lấy cấu hình đúng theo areaId
        const current =
          (res.data || []).find((s) => s.area?.id === areaId) ?? null;

        if (isMounted) {
          setAreaSetting(current);
          setSettingForm({
            minTemperature:
              current?.minTemperature !== undefined
                ? String(current.minTemperature)
                : '',
            maxTemperature:
              current?.maxTemperature !== undefined
                ? String(current.maxTemperature)
                : '',
            minHumidity:
              current?.minHumidity !== undefined
                ? String(current.minHumidity)
                : '',
            maxHumidity:
              current?.maxHumidity !== undefined
                ? String(current.maxHumidity)
                : '',
            minCapacity:
              current?.minCapacity !== undefined
                ? String(current.minCapacity)
                : ''
          });
        }
      } catch (error) {
        console.error('Unable to load area settings', error);
        if (isMounted) {
          setAreaSetting(null);
          setSettingForm({
            minTemperature: '',
            maxTemperature: '',
            minHumidity: '',
            maxHumidity: '',
            minCapacity: ''
          });
        }
      } finally {
        if (isMounted) {
          setIsLoadingSetting(false);
        }
      }
    };

    void loadAreaSetting();

    // Cleanup function để đánh dấu component đã unmount
    return () => {
      isMounted = false;
    };
  }, [areaId]);

  // Real-time cập nhật nhiệt độ / độ ẩm từ IoT data theo area
  useEffect(() => {
    if (!areaId) return;

    const unsubscribe = subscribeIoTDataUpdates((payload) => {
      const payloadAreaId = (payload as any)?.areaId as string | undefined;
      if (payloadAreaId && String(payloadAreaId) !== String(areaId)) return;

      const payloadDeviceId = String((payload as any)?.deviceId ?? '').trim();
      if (!payloadAreaId) {
        if (!payloadDeviceId || !areaDeviceIds.includes(payloadDeviceId)) {
          return;
        }
      }

      const r = parseDeviceData(payload as any);
      if (r.temperature != null || r.humidity != null) {
        setTemperature(
          typeof r.temperature === 'number' ? r.temperature : null
        );
        setHumidity(typeof r.humidity === 'number' ? r.humidity : null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [areaId, areaDeviceIds]);

  // Refetch khi chuyển sang tab settings
  useEffect(() => {
    if (activeTab === 'settings' && areaId) {
      const loadAreaSetting = async () => {
        try {
          setIsLoadingSetting(true);
          const res = await fetchAreaSettings({ page: 1, limit: 100, areaId });
          const current =
            (res.data || []).find((s) => s.area?.id === areaId) ?? null;

          setAreaSetting(current);
          setSettingForm({
            minTemperature:
              current?.minTemperature !== undefined
                ? String(current.minTemperature)
                : '',
            maxTemperature:
              current?.maxTemperature !== undefined
                ? String(current.maxTemperature)
                : '',
            minHumidity:
              current?.minHumidity !== undefined
                ? String(current.minHumidity)
                : '',
            maxHumidity:
              current?.maxHumidity !== undefined
                ? String(current.maxHumidity)
                : '',
            minCapacity:
              current?.minCapacity !== undefined
                ? String(current.minCapacity)
                : ''
          });
        } catch (error) {
          console.error('Unable to reload area settings', error);
        } finally {
          setIsLoadingSetting(false);
        }
      };
      void loadAreaSetting();
    }
  }, [activeTab, areaId]);

  // Refetch khi quay lại trang (khi tab browser được focus lại)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        areaId &&
        activeTab === 'settings'
      ) {
        const loadAreaSetting = async () => {
          try {
            setIsLoadingSetting(true);
            const res = await fetchAreaSettings({
              page: 1,
              limit: 100,
              areaId
            });
            const current =
              (res.data || []).find((s) => s.area?.id === areaId) ?? null;

            setAreaSetting(current);
            setSettingForm({
              minTemperature:
                current?.minTemperature !== undefined
                  ? String(current.minTemperature)
                  : '',
              maxTemperature:
                current?.maxTemperature !== undefined
                  ? String(current.maxTemperature)
                  : '',
              minHumidity:
                current?.minHumidity !== undefined
                  ? String(current.minHumidity)
                  : '',
              maxHumidity:
                current?.maxHumidity !== undefined
                  ? String(current.maxHumidity)
                  : '',
              minCapacity:
                current?.minCapacity !== undefined
                  ? String(current.minCapacity)
                  : ''
            });
          } catch (error) {
            console.error('Unable to reload area settings', error);
          } finally {
            setIsLoadingSetting(false);
          }
        };
        void loadAreaSetting();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [areaId, activeTab]);

  useEffect(() => {
    if (!areaId) return;
    const base = getApiBase().replace(/\/api\/v1$/, '');
    const socket = io(`${base}/iot`, {
      path: '/socket.io',
      transports: ['websocket']
    });
    const onAlert = (payload: any) => {
      const aid = String(payload?.areaId ?? payload?.area?.id ?? '');
      if (!aid || aid !== String(areaId)) return;
      const alert = {
        id: String(payload?.id ?? Date.now()),
        status: payload?.status ?? 'active',
        message: payload?.message ?? '',
        alertType: payload?.alertType ?? payload?.type ?? 'Alert',
        area: { id: aid },
        createdAt: String(payload?.createdAt ?? new Date().toISOString()),
        updatedAt: String(payload?.updatedAt ?? new Date().toISOString())
      };
      if (String(payload?.status ?? '').toLowerCase() === 'resolved') {
        setActiveAlert(null);

        // Show notification with temperature and humidity
        const data = payload?.data || payload;
        const temp = data?.currentTemperature;
        const humid = data?.currentHumidity;

        if (temp !== undefined || humid !== undefined) {
          // Toast handled by NotificationListener
          // Update current state if available
          if (typeof temp === 'number') setTemperature(temp);
          if (typeof humid === 'number') setHumidity(humid);
        }
      } else {
        setActiveAlert(alert);
        // Toast handled by NotificationListener
      }
    };
    socket.emit('alert:subscribeArea', { areaId });
    socket.on('area-alert', onAlert);
    return () => {
      socket.off('area-alert', onAlert);
      socket.disconnect();
    };
  }, [areaId]);

  // Fetch batches từ API khi areaId thay đổi
  const loadBatches = useCallback(async () => {
    if (!areaId) return;
    setIsLoadingBatches(true);
    try {
      const batchesRes = await fetchBatchesByArea({
        areaId,
        page: batchesPage ?? 1,
        limit: batchesLimit ?? 10
      });
      setAreaBatches(batchesRes.data || []);
      setBatchesPageCount((prev) => {
        const minimalTotal = batchesRes.hasNextPage
          ? (batchesPage ?? 1) + 1
          : (batchesPage ?? 1);
        return Math.max(prev, minimalTotal);
      });
    } catch (error) {
      console.error('Unable to load batches', error);
      setAreaBatches([]);
    } finally {
      setIsLoadingBatches(false);
    }
  }, [areaId, batchesPage, batchesLimit]);

  useEffect(() => {
    void loadBatches();
  }, [loadBatches]);

  // Fetch import và export tickets khi areaId thay đổi
  useEffect(() => {
    if (!areaId) return;

    const loadTicketsData = async () => {
      setIsLoadingHistory(true);
      try {
        const [ticketsRes, exportsRes] = await Promise.all([
          fetchImportTickets({
            page: 1,
            limit: 200
          }),
          fetchExportTickets({
            page: 1,
            limit: 200
          })
        ]);

        // Filter import tickets theo areaId
        const tickets: ImportTicket[] = (ticketsRes.data || []).filter(
          (it) => it.areaName && it.areaName === areaId
        );
        setAllImportTickets(tickets);

        // Filter export tickets - giữ nguyên logic hiện tại
        const exportTickets = exportsRes.data || [];
        setAllExportTickets(exportTickets);
      } catch (error) {
        console.error('Unable to load tickets data', error);
        setAllImportTickets([]);
        setAllExportTickets([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    void loadTicketsData();
  }, [areaId]);

  // Load prices khi mở dialog
  useEffect(() => {
    if (!selectedBatchId || !isPriceDialogOpen) return;

    const loadPrices = async () => {
      setIsLoadingPrices(true);
      try {
        const prices = await fetchPricesByBatchId(selectedBatchId);
        setBatchPrices(Array.isArray(prices) ? prices : []);
      } catch (error) {
        console.error('Unable to load prices', error);
        setBatchPrices([]);
      } finally {
        setIsLoadingPrices(false);
      }
    };

    void loadPrices();
  }, [selectedBatchId, isPriceDialogOpen]);

  // Load history data từ API activity-logs theo area ID
  const loadHistoryData = useCallback(async () => {
    if (!areaId) return;
    setIsLoadingHistory(true);
    try {
      const ticketsRes = await fetchAreaTickets(areaId);

      // Map import tickets từ API response
      const importTickets: ImportTicket[] = (
        ticketsRes.importTickets || []
      ).map((it) => ({
        id: it.id,
        unit: it.unit,
        quantity: it.quantity,
        percent: it.percent,
        importDate: it.importDate,
        expiredAt: it.expiredAt,
        createdAt: it.createdAt,
        updatedAt: it.updatedAt,
        batchCode: it.batchCode,
        productName: it.productName,
        numberOfBatch: it.numberOfBatch,
        areaName: it.areaName
      }));

      // Map export tickets từ API response
      const exportTickets = (ticketsRes.exportTickets || []).map((et) => ({
        id: et.id,
        createdAt: et.createdAt,
        updatedAt: et.updatedAt,
        ExportDate: et.exportDate,
        productName: et.productName,
        quantity: et.quantity,
        unit: et.unit,
        areaName: et.areaName
      }));

      setAreaImportTickets(importTickets);
      setAreaExportTickets(exportTickets);
    } catch (error) {
      console.error('Unable to load area history data', error);
      setAreaImportTickets([]);
      setAreaExportTickets([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [areaId, historyLimit]);

  useEffect(() => {
    void loadHistoryData();
  }, [loadHistoryData]);

  // Update areaImportTickets và areaExportTickets từ all data (fallback)
  useEffect(() => {
    // Chỉ update nếu chưa có data từ history API
    if (areaImportTickets.length === 0 && areaExportTickets.length === 0) {
      setAreaImportTickets(allImportTickets);
      setAreaExportTickets(allExportTickets);
    }
  }, [
    allImportTickets,
    allExportTickets,
    areaImportTickets.length,
    areaExportTickets.length
  ]);

  // Tạo activities từ import và export tickets
  const historyActivities = useMemo(() => {
    const importActivities = (areaImportTickets || []).map((it) => {
      const productName = it?.productName ?? '-';

      return {
        id: it.id,
        date: it.importDate ?? it.createdAt ?? new Date().toISOString(),
        type: 'import' as const,
        productName,
        quantity: it.quantity ?? 0,
        unit: it.unit ?? it.unit ?? 'kg',
        status: 'completed' as
          | 'completed'
          | 'pending_assignment'
          | 'assigned'
          | 'delivering'
          | 'cancelled'
      };
    });

    const exportActivities = (areaExportTickets || []).map((et: any) => ({
      id: et.id ?? '',
      date:
        et.ExportDate ??
        et.exportDate ??
        et.createdAt ??
        new Date().toISOString(),
      type: 'export' as const,
      productName: et.productName ?? et.orderDetail?.product?.name ?? '-',
      productId: et.orderDetail?.product?.id ?? '',
      quantity: Number(et.quantity ?? et.orderDetail?.quantity ?? 0),
      unit: et.unit ?? et.orderDetail?.unit ?? 'kg',
      status: 'completed' as
        | 'completed'
        | 'pending_assignment'
        | 'assigned'
        | 'delivering'
        | 'cancelled'
    }));

    return [...importActivities, ...exportActivities];
  }, [areaImportTickets, areaExportTickets]);

  // Paginate history activities
  const paginatedHistoryActivities = useMemo(() => {
    const startIndex = ((historyPage ?? 1) - 1) * (historyLimit ?? 10);
    const endIndex = startIndex + (historyLimit ?? 10);
    return historyActivities.slice(startIndex, endIndex);
  }, [historyActivities, historyPage, historyLimit]);

  // Update history pageCount when activities change
  useEffect(() => {
    const totalPages = Math.ceil(
      historyActivities.length / (historyLimit ?? 10)
    );
    setHistoryPageCount(Math.max(1, totalPages));
  }, [historyActivities.length, historyLimit]);

  const getActivityTypeIcon = (type: 'import' | 'export') => {
    return type === 'import' ? (
      <IconArrowDown className='h-4 w-4 text-green-600' />
    ) : (
      <IconArrowUp className='h-4 w-4 text-blue-600' />
    );
  };

  const getActivityTypeBadge = (type: 'import' | 'export') => {
    return type === 'import' ? (
      <Badge variant='secondary' className='bg-green-100 text-green-800'>
        {t('history.import')}
      </Badge>
    ) : (
      <Badge variant='secondary' className='bg-blue-100 text-blue-800'>
        {t('history.export')}
      </Badge>
    );
  };

  const getHistoryStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending_assignment: {
        label: t('history.status.pendingAssignment'),
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      assigned: {
        label: t('history.status.assigned'),
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      delivering: {
        label: t('history.status.delivering'),
        className: 'bg-purple-100 text-purple-800 border-purple-200'
      },
      completed: {
        label: t('history.status.completed'),
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      cancelled: {
        label: t('history.status.cancelled'),
        className: 'bg-red-100 text-red-800 border-red-200'
      }
    };

    const config = statusConfig[status] ?? {
      label: t('history.status.unknown'),
      className: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span
        className={`rounded-full border px-2 py-1 text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  // Batches table columns
  const batchesColumns: ColumnDef<Batch>[] = useMemo(
    () => [
      {
        accessorKey: 'batchCode',
        header: t('products.batches.columns.batchCode'),
        cell: ({ row }) => (
          <div className='font-mono text-xs'>{row.original.batchCode}</div>
        )
      },
      {
        accessorKey: 'product',
        header: t('products.batches.columns.product'),
        cell: ({ row }) => (
          <div className='font-medium'>{row.original.product?.name || '-'}</div>
        )
      },
      {
        accessorKey: 'quantity',
        header: t('products.batches.columns.quantity'),
        cell: ({ row }) => (
          <span className='font-medium'>
            {(
              row.original.currentQuantity ??
              row.original.quantity ??
              0
            ).toLocaleString()}
          </span>
        )
      },
      {
        accessorKey: 'unit',
        header: t('products.batches.columns.unit'),
        cell: ({ row }) => <span>{row.original.unit}</span>
      },
      {
        accessorKey: 'costPrice',
        header: `${t('products.batches.columns.costPrice')} /kg`,
        cell: ({ row }) => {
          const batch = row.original;
          return batch.costPrice && batch.quantity
            ? `${Math.round(batch.costPrice / batch.quantity).toLocaleString('vi-VN')} VNĐ`
            : '-';
        }
      },
      {
        accessorKey: 'expiredAt',
        header: t('products.batches.columns.expiredAt'),
        cell: ({ row }) => {
          const expiredAt = row.original.expiredAt;
          if (!expiredAt) return '—';

          const date = new Date(expiredAt);
          const now = new Date();
          now.setHours(0, 0, 0, 0);

          const checkDate = new Date(date);
          checkDate.setHours(0, 0, 0, 0);

          const diffTime = checkDate.getTime() - now.getTime();
          const diffDays = diffTime / (1000 * 60 * 60 * 24);

          let className = '';
          if (diffDays < 0) {
            className = 'text-gray-300 font-bold';
          } else if (diffDays <= 7) {
            className = 'text-orange-400 font-bold';
          }

          return (
            <span className={className}>
              {format(date, 'dd/MM/yyyy', { locale: vi })}
            </span>
          );
        }
      },
      {
        accessorKey: 'createdAt',
        header: t('products.batches.columns.createdAt'),
        cell: ({ row }) => {
          const createdAt = row.original.createdAt;
          return createdAt
            ? format(new Date(createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })
            : '—';
        }
      },
      {
        id: 'actions',
        header: t('products.batches.columns.actions'),
        cell: ({ row }) => (
          <div className='text-right'>
            <Button
              size='sm'
              variant='outline'
              onClick={() => {
                setSelectedBatchId(row.original.id);
                setIsPriceDialogOpen(true);
              }}
            >
              <IconEye className='mr-2 h-4 w-4' />
              {t('products.batches.actions.viewDetails')}
            </Button>
          </div>
        )
      }
    ],
    [t]
  );

  // History table columns
  const historyColumns: ColumnDef<(typeof historyActivities)[number]>[] =
    useMemo(
      () => [
        {
          accessorKey: 'date',
          header: t('history.columns.datetime'),
          cell: ({ row }) => (
            <div className='flex items-center gap-2'>
              <IconCalendar className='h-4 w-4 text-gray-400' />
              <span className='text-sm'>
                {format(new Date(row.original.date), 'dd/MM/yyyy HH:mm', {
                  locale: vi
                })}
              </span>
            </div>
          )
        },
        {
          accessorKey: 'type',
          header: t('history.columns.activityType'),
          cell: ({ row }) => (
            <div className='flex items-center gap-2'>
              {getActivityTypeIcon(row.original.type)}
              {getActivityTypeBadge(row.original.type)}
            </div>
          )
        },
        {
          accessorKey: 'productName',
          header: t('history.columns.product'),
          cell: ({ row }) => (
            <div className='text-sm font-medium'>
              {row.original.productName}
            </div>
          )
        },
        {
          accessorKey: 'quantity',
          header: t('history.columns.quantity'),
          cell: ({ row }) => (
            <span className='font-medium'>
              {row.original.quantity.toLocaleString()} {row.original.unit}
            </span>
          )
        },
        {
          accessorKey: 'status',
          header: t('history.columns.status'),
          cell: ({ row }) => getHistoryStatusBadge(row.original.status)
        }
      ],
      [t]
    );

  // Sort batches: expired at the bottom
  const sortedBatches = useMemo(() => {
    if (!areaBatches) return [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const nowTime = now.getTime();

    return [...areaBatches].sort((a, b) => {
      const dateA = a.expiredAt
        ? new Date(a.expiredAt).getTime()
        : Number.MAX_SAFE_INTEGER;
      const dateB = b.expiredAt
        ? new Date(b.expiredAt).getTime()
        : Number.MAX_SAFE_INTEGER;

      const isExpiredA = dateA < nowTime;
      const isExpiredB = dateB < nowTime;

      if (isExpiredA !== isExpiredB) {
        return isExpiredA ? 1 : -1; // Non-expired first
      }
      return dateA - dateB; // Ascending date
    });
  }, [areaBatches]);

  // Batches table
  const batchesPagination: PaginationState = useMemo(
    () => ({
      pageIndex: (batchesPage ?? 1) - 1,
      pageSize: batchesLimit ?? 10
    }),
    [batchesPage, batchesLimit]
  );

  const batchesTable = useReactTable({
    data: sortedBatches,
    columns: batchesColumns,
    pageCount: batchesPageCount,
    state: { pagination: batchesPagination },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const next = updater(batchesPagination);
        setBatchesPage(next.pageIndex + 1);
      } else {
        setBatchesPage(updater.pageIndex + 1);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true
  });

  // History table
  const historyPagination: PaginationState = useMemo(
    () => ({
      pageIndex: (historyPage ?? 1) - 1,
      pageSize: historyLimit ?? 10
    }),
    [historyPage, historyLimit]
  );

  const historyTable = useReactTable({
    data: paginatedHistoryActivities,
    columns: historyColumns,
    pageCount: historyPageCount,
    state: { pagination: historyPagination },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const next = updater(historyPagination);
        setHistoryPage(next.pageIndex + 1);
      } else {
        setHistoryPage(updater.pageIndex + 1);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true
  });

  useEffect(() => {
    if (activeTab !== 'iot' || !areaId) return;
    const loadIoTDevices = async () => {
      setIsLoadingIoT(true);
      try {
        const area: any = await fetchAreaById(areaId);
        const iot = area?.iotDevice;
        const devices: any[] = Array.isArray(iot) ? iot : iot ? [iot] : [];
        const deviceIds = devices
          .map((d) => (d && typeof d === 'object' ? (d as any).id : null))
          .filter(
            (v): v is string => typeof v === 'string' && v.trim().length > 0
          );
        setAreaDeviceIds(deviceIds);
        const normalized = devices.map((d) => {
          const parsed = parseDeviceData(d);
          return {
            id: String((d as any)?.id ?? ''),
            type: (d as any)?.type ?? (d as any)?.deviceType ?? 'sensor',
            status: (d as any)?.status ?? 'unknown',
            lastDataTime: String(
              (d as any)?.lastDataTime ??
                (d as any)?.updatedAt ??
                (d as any)?.createdAt ??
                ''
            ),
            data: parsed
          };
        });
        setIotDevices(normalized);
      } catch (error) {
        setIotDevices([]);
      } finally {
        setIsLoadingIoT(false);
      }
    };
    void loadIoTDevices();
  }, [activeTab, areaId]);

  useEffect(() => {
    if (!areaId) return;
    const unsubscribe = subscribeIoTDataUpdates((payload) => {
      const payloadAreaId = (payload as any)?.areaId as string | undefined;
      if (payloadAreaId && String(payloadAreaId) !== String(areaId)) return;
      const payloadDeviceId = String((payload as any)?.deviceId ?? '').trim();
      if (!payloadAreaId) {
        if (!payloadDeviceId || !areaDeviceIds.includes(payloadDeviceId))
          return;
      }
      const parsed = parseDeviceData(payload as any);
      setIotDevices((prev) => {
        const idx = prev.findIndex((d) => String(d.id) === payloadDeviceId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            data: parsed,
            status: String((payload as any)?.status ?? 'online'),
            lastDataTime: String(
              (payload as any)?.timestamp ?? new Date().toISOString()
            )
          };
          return next;
        }
        return prev;
      });
      if (payloadDeviceId) {
        const prevTimer = offlineTimersRef.current[payloadDeviceId];
        if (prevTimer) clearTimeout(prevTimer);
        offlineTimersRef.current[payloadDeviceId] = setTimeout(() => {
          setIotDevices((prev) => {
            const idx = prev.findIndex((d) => String(d.id) === payloadDeviceId);
            if (idx >= 0) {
              const next = [...prev];
              next[idx] = { ...next[idx], status: 'offline' };
              return next;
            }
            return prev;
          });
        }, 60000);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [areaId, areaDeviceIds]);

  useEffect(() => {
    return () => {
      Object.values(offlineTimersRef.current).forEach((t) => {
        try {
          clearTimeout(t);
        } catch {}
      });
    };
  }, []);

  const handleSaveSettings = async () => {
    if (
      !settingForm.minTemperature ||
      !settingForm.maxTemperature ||
      !settingForm.minHumidity ||
      !settingForm.maxHumidity
    ) {
      return;
    }

    const payload = {
      minTemperature: Number(settingForm.minTemperature),
      maxTemperature: Number(settingForm.maxTemperature),
      minHumidity: Number(settingForm.minHumidity),
      maxHumidity: Number(settingForm.maxHumidity),
      minCapacity: settingForm.minCapacity
        ? Number(settingForm.minCapacity)
        : undefined,
      area: { id: areaId }
    };

    try {
      setIsSavingSetting(true);
      let saved: AreaSetting;
      // Chỉ update nếu record hiện tại thuộc đúng area, nếu không thì tạo mới
      if (areaSetting && areaSetting.area?.id === areaId) {
        saved = await updateAreaSetting(areaSetting.id, payload);
      } else {
        saved = await createAreaSetting(payload);
      }
      setAreaSetting(saved);
    } finally {
      setIsSavingSetting(false);
    }
  };

  // Cập nhật dữ liệu thời gian thực
  useEffect(() => {
    setRealTimeData(new Date());
    const interval = setInterval(() => {
      setRealTimeData(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal':
        return (
          <Badge className='bg-green-100 text-green-800 dark:bg-green-600 dark:text-white'>
            {t('status.normal')}
          </Badge>
        );
      case 'warning':
        return (
          <Badge className='bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'>
            {t('status.warning')}
          </Badge>
        );
      case 'critical':
        return (
          <Badge className='bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'>
            {t('status.critical')}
          </Badge>
        );
      default:
        return <Badge variant='secondary'>{t('status.unknown')}</Badge>;
    }
  };

  const tempStatus = useMemo(() => {
    if (temperature == null || !areaSetting) return 'normal';
    if (
      areaSetting.minTemperature !== undefined &&
      temperature < areaSetting.minTemperature
    )
      return 'warning';
    if (
      areaSetting.maxTemperature !== undefined &&
      temperature > areaSetting.maxTemperature
    )
      return 'warning';
    return 'normal';
  }, [temperature, areaSetting]);

  const humidStatus = useMemo(() => {
    if (humidity == null || !areaSetting) return 'normal';
    if (
      areaSetting.minHumidity !== undefined &&
      humidity < areaSetting.minHumidity
    )
      return 'warning';
    if (
      areaSetting.maxHumidity !== undefined &&
      humidity > areaSetting.maxHumidity
    )
      return 'warning';
    return 'normal';
  }, [humidity, areaSetting]);

  const areaName = area?.name;

  const warehouseName =
    warehouse?.name || `${t('common.warehouse')} ${warehouseId}`;

  return areaName ? (
    <div className='mx-auto w-full space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => router.back()}
            className='flex items-center gap-2'
          >
            <IconArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h1 className='text-3xl font-bold'>
              {areaName}
              {isLoadingArea && ` (${t('header.loading')})`}
            </h1>
            <p className='text-muted-foreground'>
              {warehouseName}
              {isLoadingWarehouse && ` (${t('header.loading')})`} •{' '}
              {t('header.lastUpdated')}:{' '}
              {realTimeData ? realTimeData.toLocaleTimeString(locale) : '—'}
            </p>
          </div>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              if (areaId) {
                void loadEnvironmentFromArea(areaId);
              }
            }}
            disabled={isLoadingEnv}
          >
            <IconRefresh className='mr-2 h-4 w-4' />
            {isLoadingEnv ? t('loading') : t('actions.refresh')}
          </Button>
          <Button variant='outline' size='sm'>
            <IconSettings className='mr-2 h-4 w-4' />
            {t('actions.settings')}
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('status.temperature')}
            </CardTitle>
            <IconThermometer className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {temperature != null
                ? `${temperature}°C`
                : isLoadingEnv
                  ? t('loading')
                  : '—'}
            </div>
            <p className='text-muted-foreground text-xs'>
              {t('threshold')}:{' '}
              {areaSetting
                ? `${areaSetting.minTemperature}–${areaSetting.maxTemperature}°C`
                : '—'}
            </p>
            <div className='mt-2'>{getStatusBadge(tempStatus)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('status.humidity')}
            </CardTitle>
            <IconDroplet className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {humidity != null
                ? `${humidity}%`
                : isLoadingEnv
                  ? t('loading')
                  : '—'}
            </div>
            <p className='text-muted-foreground text-xs'>
              {t('threshold')}:{' '}
              {areaSetting
                ? `${areaSetting.minHumidity}–${areaSetting.maxHumidity}%`
                : '—'}
            </p>
            <div className='mt-2'>{getStatusBadge(humidStatus)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('alerts.title')}
            </CardTitle>
            <IconAlertTriangle className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            {activeAlert ? (
              <div className='space-y-1'>
                <div className='text-2xl font-bold text-yellow-600'>1</div>
                <p className='text-muted-foreground text-xs'>
                  {t('alerts.active')}
                </p>
                <div className='mt-2'>
                  <Badge variant='outline' className='text-yellow-600'>
                    {activeAlert.alertType || t('alerts.typeDefault')}
                  </Badge>
                </div>
                <p className='mt-1 text-sm'>{activeAlert.message || ''}</p>
              </div>
            ) : (
              <div className='space-y-1'>
                <div className='text-2xl font-bold'>0</div>
                <p className='text-muted-foreground text-xs'>
                  {t('alerts.none')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-4'
      >
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='products'>{t('tabs.products')}</TabsTrigger>
          <TabsTrigger value='alerts'>{t('tabs.alerts')}</TabsTrigger>
          <TabsTrigger value='history'>{t('tabs.history')}</TabsTrigger>
          <TabsTrigger value='settings'>{t('tabs.settings')}</TabsTrigger>
          <TabsTrigger value='iot'>{t('tabs.iot')}</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value='products' className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>{t('products.title')}</h3>
            {/* <Button
              size='sm'
              variant='outline'
              onClick={() => router.push('/dashboard/warehouse/batches')}
            >
              <IconPackage className='mr-2 h-4 w-4' />
              {t('products.manageImports')}
            </Button> */}
          </div>

          {isLoadingBatches ? (
            <DataTableSkeleton columnCount={8} rowCount={10} />
          ) : areaBatches.length === 0 ? (
            <div className='text-muted-foreground rounded-md border p-6 text-center text-sm'>
              {t('products.empty')}
            </div>
          ) : (
            <Card className='overflow-hidden'>
              <CardHeader>
                <CardTitle>{t('products.batches.title')}</CardTitle>
                <CardDescription>
                  {t('products.batches.description', {
                    count: areaBatches.length
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable table={batchesTable} pageSizeOptions={[]} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value='alerts' className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>{t('alerts.header')}</h3>
            <Button variant='outline'>
              <IconBell className='mr-2 h-4 w-4' />
              {t('alerts.settings')}
            </Button>
          </div>
          {activeAlert &&
          String(activeAlert.status ?? '').toLowerCase() === 'active' ? (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconAlertTriangle className='h-5 w-5 text-amber-600' />
                  {activeAlert.alertType || t('alerts.typeDefault')}
                </CardTitle>
                <CardDescription>{t('alerts.description')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-sm'>{activeAlert.message || ''}</p>
              </CardContent>
            </Card>
          ) : (
            <div className='text-muted-foreground text-sm'>
              {t('alerts.empty')}
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value='history' className='space-y-4'>
          <Card>
            <CardHeader>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <IconHistory className='h-5 w-5' />
                  {t('history.title')}
                </CardTitle>
                <CardDescription>{t('history.description')}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <DataTableSkeleton columnCount={5} rowCount={10} />
              ) : historyActivities.length === 0 ? (
                <div className='text-muted-foreground rounded-md border p-6 text-center text-sm'>
                  {t('history.noResults')}
                </div>
              ) : (
                <DataTable table={historyTable} pageSizeOptions={[]} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value='settings' className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>{t('settings.title')}</h3>
            <Button onClick={handleSaveSettings} disabled={isSavingSetting}>
              <IconShield className='mr-2 h-4 w-4' />
              {isSavingSetting ? t('settings.saving') : t('settings.save')}
            </Button>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.threshold.title')}</CardTitle>
                <CardDescription>
                  {t('settings.threshold.tempDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <label className='text-sm font-medium'>
                    {t('settings.fields.minTemperature')}
                  </label>
                  <input
                    type='number'
                    value={settingForm.minTemperature}
                    disabled={isLoadingSetting || isSavingSetting}
                    onChange={(e) =>
                      setSettingForm((prev) => ({
                        ...prev,
                        minTemperature: e.target.value
                      }))
                    }
                    className='mt-1 w-full rounded-md border px-3 py-2'
                  />
                </div>
                <div>
                  <label className='text-sm font-medium'>
                    {t('settings.fields.maxTemperature')}
                  </label>
                  <input
                    type='number'
                    value={settingForm.maxTemperature}
                    disabled={isLoadingSetting || isSavingSetting}
                    onChange={(e) =>
                      setSettingForm((prev) => ({
                        ...prev,
                        maxTemperature: e.target.value
                      }))
                    }
                    className='mt-1 w-full rounded-md border px-3 py-2'
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('settings.threshold.title')}</CardTitle>
                <CardDescription>
                  {t('settings.threshold.humidityDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <label className='text-sm font-medium'>
                    {t('settings.fields.minHumidity')}
                  </label>
                  <input
                    type='number'
                    value={settingForm.minHumidity}
                    disabled={isLoadingSetting || isSavingSetting}
                    onChange={(e) =>
                      setSettingForm((prev) => ({
                        ...prev,
                        minHumidity: e.target.value
                      }))
                    }
                    className='mt-1 w-full rounded-md border px-3 py-2'
                  />
                </div>
                <div>
                  <label className='text-sm font-medium'>
                    {t('settings.fields.maxHumidity')}
                  </label>
                  <input
                    type='number'
                    value={settingForm.maxHumidity}
                    disabled={isLoadingSetting || isSavingSetting}
                    onChange={(e) =>
                      setSettingForm((prev) => ({
                        ...prev,
                        maxHumidity: e.target.value
                      }))
                    }
                    className='mt-1 w-full rounded-md border px-3 py-2'
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* IoT Tab */}
        <TabsContent value='iot' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>{t('iot.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingIoT ? (
                <div className='py-8 text-center text-sm text-gray-500'>
                  {t('iot.loading')}
                </div>
              ) : iotDevices && iotDevices.length > 0 ? (
                <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                  {iotDevices.map((device: any) => (
                    <IotDeviceCard
                      key={String(device.id)}
                      id={String(device.id)}
                      type={device.type}
                      status={device.status}
                      lastDataTime={String(device?.lastDataTime ?? '')}
                      data={device.data}
                      locationLabel={`${t('iot.areaLabel')} ${areaId}`}
                    />
                  ))}
                </div>
              ) : (
                <div className='py-8 text-center text-sm text-gray-500'>
                  {t('iot.empty')}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Batch Detail & Price Management Dialog */}
      {selectedBatchId && (
        <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
          <DialogContent className='max-h-[90vh] !max-w-6xl overflow-y-auto p-0'>
            {/* Header with gradient background */}
            <div className='from-primary/10 via-primary/5 to-background border-b bg-gradient-to-r px-6 py-5'>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-3 text-xl'>
                  <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
                    <IconPackage className='text-primary h-5 w-5' />
                  </div>
                  <div>
                    <span>{t('products.batchDetail.title')}</span>
                    <p className='text-muted-foreground mt-0.5 text-sm font-normal'>
                      {t('products.batchDetail.description')}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>
            </div>

            <div className='space-y-6 p-6'>
              {/* Batch Information */}
              {(() => {
                const batch = areaBatches.find((b) => b.id === selectedBatchId);
                if (!batch) return null;

                const costPerKg =
                  batch.costPrice && batch.quantity
                    ? Math.round(batch.costPrice / batch.quantity)
                    : null;

                return (
                  <div className='space-y-4'>
                    {/* Batch Code Header */}
                    <div className='flex items-center gap-3 rounded-lg border bg-gradient-to-r from-slate-50 to-white p-4 dark:from-slate-900 dark:to-slate-800'>
                      <div className='flex-1'>
                        <p className='text-muted-foreground text-xs font-medium tracking-wider'>
                          {t('products.batches.columns.batchCode')}
                        </p>
                        <p className='mt-1 text-lg font-bold tracking-wide'>
                          {batch.batchCode || '-'}
                        </p>
                      </div>
                      <div className='flex-1 border-l pl-4'>
                        <p className='text-muted-foreground text-xs font-medium tracking-wider'>
                          {t('products.batches.columns.product')}
                        </p>
                        <p className='text-primary mt-1 text-lg font-semibold'>
                          {batch.product?.name || '-'}
                        </p>
                      </div>
                      {/* Current Quantity - Số lượng hiện tại */}
                      <div className='flex-1 border-l pl-4'>
                        <p className='text-muted-foreground text-xs font-medium'>
                          {t('products.batches.columns.currentQuantity')}
                        </p>
                        <p className='mt-1 text-lg font-bold'>
                          {(batch.currentQuantity ?? 0).toLocaleString()}{' '}
                          <span className='text-muted-foreground text-sm font-normal'>
                            {batch.unit || 'kg'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                      {/* Garden Name */}
                      <div className='rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-900'>
                        <div className='text-muted-foreground mb-1 flex items-center gap-2 text-xs font-medium'>
                          <IconMapPin className='h-3.5 w-3.5' />
                          {t('products.batches.columns.gardenName')}
                        </div>
                        <p className='truncate text-sm font-semibold'>
                          {batch.gardenName || '-'}
                        </p>
                      </div>

                      {/* Harvest Date */}
                      <div className='rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-900'>
                        <div className='text-muted-foreground mb-1 flex items-center gap-2 text-xs font-medium'>
                          <IconCalendar className='h-3.5 w-3.5' />
                          {t('products.batches.columns.harvestDate')}
                        </div>
                        <p className='text-sm font-semibold'>
                          {batch.harvestDate
                            ? format(
                                new Date(batch.harvestDate),
                                'dd/MM/yyyy',
                                { locale: vi }
                              )
                            : '-'}
                        </p>
                      </div>

                      {/* Expired Date */}
                      <div className='rounded-lg border bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-900'>
                        <div className='text-muted-foreground mb-1 flex items-center gap-2 text-xs font-medium'>
                          <IconClock className='h-3.5 w-3.5' />
                          {t('products.batches.columns.expiredAt')}
                        </div>
                        <p className='text-sm font-semibold'>
                          {batch.expiredAt
                            ? format(new Date(batch.expiredAt), 'dd/MM/yyyy', {
                                locale: vi
                              })
                            : '-'}
                        </p>
                      </div>
                    </div>

                    {/* Quantity & Cost Stats */}
                    <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
                      {/* Init Quantity - Số lượng ban đầu */}
                      <div className='rounded-lg border bg-white p-3 shadow-sm dark:bg-slate-900'>
                        <p className='text-muted-foreground text-xs font-medium'>
                          {t('products.batches.columns.initQuantity')}
                        </p>
                        <p className='mt-1 text-lg font-bold'>
                          {batch.initQuantity != null
                            ? batch.initQuantity.toLocaleString()
                            : '-'}{' '}
                          <span className='text-muted-foreground text-sm font-normal'>
                            {batch.unit || 'kg'}
                          </span>
                        </p>
                      </div>

                      {/* Quantity - Số lượng nhập */}
                      <div className='rounded-lg border bg-white p-3 shadow-sm dark:bg-slate-900'>
                        <p className='text-muted-foreground text-xs font-medium'>
                          {t('products.batches.columns.realQuantity')}
                        </p>
                        <p className='mt-1 text-lg font-bold'>
                          {(batch.quantity ?? 0).toLocaleString()}{' '}
                          <span className='text-muted-foreground text-sm font-normal'>
                            {batch.unit || 'kg'}
                          </span>
                        </p>
                      </div>

                      {/* Cost Price - Giá nhập */}
                      <div className='rounded-lg border bg-white p-3 shadow-sm dark:bg-slate-900'>
                        <p className='text-muted-foreground text-xs font-medium'>
                          {t('products.batches.columns.costPrice')}
                        </p>
                        <p className='mt-1 text-lg font-bold text-green-600 dark:text-green-400'>
                          {batch.costPrice
                            ? `${batch.costPrice.toLocaleString('vi-VN')}₫`
                            : '-'}
                        </p>
                      </div>

                      {/* Cost per unit - Giá nhập / Số lượng nhập */}
                      <div className='rounded-lg border bg-white p-3 shadow-sm dark:bg-slate-900'>
                        <p className='text-muted-foreground text-xs font-medium'>
                          {t('products.batches.columns.costPerUnit')}
                        </p>
                        <p className='mt-1 text-lg font-bold'>
                          {costPerKg
                            ? `${costPerKg.toLocaleString('vi-VN')}₫/${batch.unit || 'kg'}`
                            : '-'}
                        </p>
                      </div>
                    </div>

                    {/* Volume & Created Date */}
                    {(batch.volume != null || batch.createdAt) && (
                      <div className='text-muted-foreground flex flex-wrap items-center gap-4 text-xs'>
                        {batch.volume != null && (
                          <span className='flex items-center gap-1'>
                            <IconBox className='h-3.5 w-3.5' />
                            {t('products.batches.columns.volume')}:{' '}
                            {batch.volume.toLocaleString()} m³
                          </span>
                        )}
                        {batch.createdAt && (
                          <span className='flex items-center gap-1'>
                            <IconClock className='h-3.5 w-3.5' />
                            {t('products.batches.columns.createdAt')}:{' '}
                            {format(
                              new Date(batch.createdAt),
                              'dd/MM/yyyy HH:mm',
                              { locale: vi }
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Price List Section */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between border-b pb-3'>
                  <div className='flex items-center gap-2'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30'>
                      <IconPackage className='h-4 w-4 text-green-600 dark:text-green-400' />
                    </div>
                    <h4 className='text-base font-semibold'>
                      {t('products.prices.listTitle')}
                    </h4>
                  </div>
                  <Button
                    size='sm'
                    onClick={() => setEditingPrice('new')}
                    className='gap-2 shadow-sm'
                  >
                    <IconPlus className='h-4 w-4' />
                    {t('products.prices.addNew')}
                  </Button>
                </div>

                {/* Prices Table */}
                {isLoadingPrices ? (
                  <div className='flex items-center justify-center py-12'>
                    <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
                  </div>
                ) : batchPrices.length === 0 ? (
                  <div className='flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-12 dark:border-gray-700 dark:bg-gray-800/30'>
                    <div className='flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700'>
                      <IconPackage className='h-8 w-8 text-gray-400' />
                    </div>
                    <p className='text-muted-foreground mt-4 text-sm'>
                      {t('products.prices.empty')}
                    </p>
                    <Button
                      size='sm'
                      variant='outline'
                      className='mt-4 gap-2'
                      onClick={() => setEditingPrice('new')}
                    >
                      <IconPlus className='h-4 w-4' />
                      {t('products.prices.addFirst')}
                    </Button>
                  </div>
                ) : (
                  <div className='overflow-hidden rounded-xl border shadow-sm'>
                    <Table>
                      <TableHeader>
                        <TableRow className='bg-slate-50 dark:bg-slate-800'>
                          <TableHead className='font-semibold'>
                            {t('products.prices.columns.price')}
                          </TableHead>
                          <TableHead className='font-semibold'>
                            {t('products.prices.columns.quantity')}
                          </TableHead>
                          <TableHead className='font-semibold'>
                            {t('products.prices.columns.unit')}
                          </TableHead>
                          <TableHead className='font-semibold'>
                            {t('products.prices.columns.createdAt')}
                          </TableHead>
                          <TableHead className='text-right font-semibold'>
                            {t('products.prices.columns.actions')}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {batchPrices.map((price, index) => (
                          <TableRow
                            key={price.id}
                            className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-25 dark:bg-slate-900/50'}`}
                          >
                            <TableCell>
                              <span className='inline-flex items-center rounded-md bg-green-50 px-2.5 py-1 text-sm font-semibold text-green-700 ring-1 ring-green-600/20 ring-inset dark:bg-green-900/30 dark:text-green-400 dark:ring-green-500/30'>
                                {price.price
                                  ? `${price.price.toLocaleString('vi-VN')}₫`
                                  : '-'}
                              </span>
                            </TableCell>
                            <TableCell className='font-medium'>
                              {price.quantity?.toLocaleString() || '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant='outline' className='font-normal'>
                                {price.unit || 'kg'}
                              </Badge>
                            </TableCell>
                            <TableCell className='text-muted-foreground text-xs'>
                              {price.createdAt
                                ? format(
                                    new Date(price.createdAt),
                                    'dd/MM/yyyy HH:mm',
                                    { locale: vi }
                                  )
                                : '—'}
                            </TableCell>
                            <TableCell className='text-right'>
                              <div className='flex justify-end gap-1'>
                                <Button
                                  size='icon'
                                  variant='ghost'
                                  className='h-8 w-8 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30'
                                  onClick={() => setEditingPrice(price)}
                                >
                                  <IconEdit className='h-4 w-4' />
                                </Button>
                                <Button
                                  size='icon'
                                  variant='ghost'
                                  className='h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30'
                                  onClick={async () => {
                                    if (
                                      confirm(
                                        t('products.prices.confirmDelete')
                                      )
                                    ) {
                                      try {
                                        await deletePrice(price.id);
                                        const prices =
                                          await fetchPricesByBatchId(
                                            selectedBatchId!
                                          );
                                        setBatchPrices(
                                          Array.isArray(prices) ? prices : []
                                        );
                                      } catch (error) {
                                        console.error(
                                          'Failed to delete price',
                                          error
                                        );
                                      }
                                    }
                                  }}
                                >
                                  <IconTrash className='h-4 w-4' />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Edit/Create Price Form */}
              {editingPrice !== null && editingPrice !== undefined && (
                <div className='border-primary/30 from-primary/5 to-primary/10 rounded-xl border-2 border-dashed bg-gradient-to-br p-5'>
                  <div className='mb-4 flex items-center gap-2'>
                    <div className='bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg'>
                      {editingPrice === 'new' || !editingPrice ? (
                        <IconPlus className='text-primary h-4 w-4' />
                      ) : (
                        <IconEdit className='text-primary h-4 w-4' />
                      )}
                    </div>
                    <h4 className='text-base font-semibold'>
                      {editingPrice === 'new' || !editingPrice
                        ? t('products.prices.createTitle')
                        : t('products.prices.editTitle')}
                    </h4>
                  </div>
                  <PriceForm
                    price={editingPrice === 'new' ? null : editingPrice}
                    batchId={selectedBatchId!}
                    onSuccess={async () => {
                      setEditingPrice(null);
                      const prices = await fetchPricesByBatchId(
                        selectedBatchId!
                      );
                      setBatchPrices(Array.isArray(prices) ? prices : []);
                    }}
                    onCancel={() => setEditingPrice(null)}
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  ) : (
    <div className='w-full py-10 text-center'>{t('loading')}</div>
  );
}

// Price Form Component
function PriceForm({
  price,
  batchId,
  onSuccess,
  onCancel
}: {
  price: Price | null;
  batchId: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations('AreaDetail');
  const [formData, setFormData] = useState({
    price: price?.price?.toString() || '',
    quantity: price?.quantity?.toString() || '',
    unit: 'kg'
  });

  useEffect(() => {
    if (price) {
      setFormData({
        price: price.price?.toString() || '',
        quantity: price.quantity?.toString() || '',
        unit: 'kg'
      });
    } else {
      setFormData({
        price: '',
        quantity: '',
        unit: 'kg'
      });
    }
  }, [price]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: CreatePriceDto | UpdatePriceDto = {
        batch: { id: batchId },
        price: formData.price ? Number(formData.price) : null,
        quantity: formData.quantity ? Number(formData.quantity) : null,
        unit: 'kg'
      };

      if (price) {
        await updatePrice(price.id, payload);
      } else {
        await createPrice(payload as CreatePriceDto);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save price', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label>{t('products.prices.form.price')}</Label>
        <Input
          type='number'
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          placeholder={t('products.prices.form.pricePlaceholder')}
          className='[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
        />
      </div>
      <div className='space-y-2'>
        <Label>{t('products.prices.form.quantity')}</Label>
        <Input
          type='number'
          value={formData.quantity}
          onChange={(e) =>
            setFormData({ ...formData, quantity: e.target.value })
          }
          placeholder={t('products.prices.form.quantityPlaceholder')}
          className='[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
        />
      </div>
      <div className='space-y-2'>
        <Label>{t('products.prices.form.unit')}</Label>
        <div className='border-input bg-muted text-muted-foreground flex h-10 w-full rounded-md border px-3 py-2 text-sm'>
          kg
        </div>
      </div>
      <DialogFooter>
        <Button type='button' variant='outline' onClick={onCancel}>
          {t('products.prices.form.cancel')}
        </Button>
        <Button type='submit' disabled={isSaving}>
          {isSaving
            ? t('products.prices.form.saving')
            : price
              ? t('products.prices.form.update')
              : t('products.prices.form.create')}
        </Button>
      </DialogFooter>
    </form>
  );
}

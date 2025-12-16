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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getApiBase } from '@/lib/client';
import {
  createAreaSetting,
  fetchAreaSettings,
  updateAreaSetting
} from '@/services/area-setting.service';
import {
  fetchActiveAreaAlertByAreaId,
  fetchAreaById,
  fetchAreaTickets
} from '@/services/area.service';
import { fetchBatchesByArea } from '@/services/batch.service';
import {
  createPrice,
  deletePrice,
  fetchPricesByBatchId,
  updatePrice,
  type CreatePriceDto,
  type Price,
  type UpdatePriceDto
} from '@/services/price.service';
import { fetchExportTickets } from '@/services/export-ticket.service';
import { fetchImportTickets } from '@/services/import-ticket.service';
import { subscribeIoTDataUpdates } from '@/services/iotdevice.service';
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
  IconCalendar,
  IconDroplet,
  IconHistory,
  IconEdit,
  IconEye,
  IconPlus,
  IconRefresh,
  IconSettings,
  IconShield,
  IconThermometer,
  IconTrash
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
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
    if (!areaId) return;
    (async () => {
      try {
        const alert = await fetchActiveAreaAlertByAreaId(areaId);
        const isActive =
          alert && String(alert.status ?? '').toLowerCase() === 'active';
        setActiveAlert(isActive ? alert : null);
      } catch {}
    })();
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
      } else {
        setActiveAlert(alert);
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
  useEffect(() => {
    if (!areaId) return;

    const loadBatches = async () => {
      setIsLoadingBatches(true);
      try {
        const batchesRes = await fetchBatchesByArea({
          areaId,
          page: 1,
          limit: 200
        });
        setAreaBatches(batchesRes.data || []);
      } catch (error) {
        console.error('Unable to load batches', error);
        setAreaBatches([]);
      } finally {
        setIsLoadingBatches(false);
      }
    };

    void loadBatches();
  }, [areaId]);

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
  useEffect(() => {
    const loadHistoryData = async () => {
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
    };

    void loadHistoryData();
  }, [areaId]);

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
            lastDataTime: String(
              (payload as any)?.timestamp ?? new Date().toISOString()
            )
          };
          return next;
        }
        return prev;
      });
    });
    return () => {
      unsubscribe();
    };
  }, [areaId, areaDeviceIds]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

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

  const capacity = area?.capacity ?? 0;
  const usedCapacity =
    typeof area?.availableCapacity === 'number'
      ? Math.max(capacity - area.availableCapacity, 0)
      : 0;
  const capacityPercentage =
    capacity > 0 ? (usedCapacity / Math.max(capacity, 1)) * 100 : 0;
  const activeAlertCount = activeAlert ? 1 : 0;
  const areaName = area?.name;
  const areaCode = area?.id || areaId;
  const areaDescription = area?.description || '';
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
            <div className='mt-2'>{getStatusBadge('normal')}</div>
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
            <div className='mt-2'>{getStatusBadge('normal')}</div>
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
            <div className='text-muted-foreground text-sm'>
              {t('products.loading')}
            </div>
          ) : areaBatches.length === 0 ? (
            <div className='text-muted-foreground text-sm'>
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
              <CardContent className='p-0'>
                <div className='w-full overflow-x-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow className='bg-gray-50'>
                        <TableHead className='font-semibold'>
                          {t('products.batches.columns.batchCode')}
                        </TableHead>
                        <TableHead className='font-semibold'>
                          {t('products.batches.columns.product')}
                        </TableHead>
                        <TableHead className='font-semibold'>
                          {t('products.batches.columns.quantity')}
                        </TableHead>
                        {/* <TableHead className='font-semibold'>
                          {t('products.batches.columns.currentQuantity')}
                        </TableHead> */}
                        <TableHead className='font-semibold'>
                          {t('products.batches.columns.unit')}
                        </TableHead>
                        <TableHead className='font-semibold'>
                          {t('products.batches.columns.costPrice')}
                        </TableHead>
                        <TableHead className='font-semibold'>
                          {t('products.batches.columns.expiredAt')}
                        </TableHead>
                        <TableHead className='font-semibold'>
                          {t('products.batches.columns.createdAt')}
                        </TableHead>
                        <TableHead className='text-right font-semibold'>
                          {t('products.batches.columns.actions')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {areaBatches.map((batch) => (
                        <TableRow key={batch.id} className='hover:bg-gray-50'>
                          <TableCell>
                            <div className='font-mono text-xs'>
                              {batch.batchCode}
                            </div>
                            {/* <div className='text-muted-foreground text-xs'>
                              ID: {batch.id}
                            </div> */}
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <div>
                                <div className='font-medium'>
                                  {batch.product?.name || '-'}
                                </div>
                                {/* <div className='text-muted-foreground text-xs'>
                                  {batch.product?.id || '-'}
                                </div> */}
                              </div>
                            </div>
                          </TableCell>
                          {/* <TableCell className='font-medium'>
                            {batch.quantity.toLocaleString()}
                          </TableCell> */}
                          <TableCell className='font-medium'>
                            {(
                              batch.currentQuantity ??
                              batch.quantity ??
                              0
                            ).toLocaleString()}
                          </TableCell>
                          <TableCell>{batch.unit}</TableCell>
                          <TableCell>
                            {batch.costPrice
                              ? `${batch.costPrice.toLocaleString('vi-VN')} VNĐ`
                              : '-'}
                          </TableCell>
                          <TableCell className='text-xs'>
                            {batch.expiredAt
                              ? format(
                                  new Date(batch.expiredAt),
                                  'dd/MM/yyyy',
                                  {
                                    locale: vi
                                  }
                                )
                              : '—'}
                          </TableCell>
                          <TableCell className='text-xs'>
                            {batch.createdAt
                              ? format(
                                  new Date(batch.createdAt),
                                  'dd/MM/yyyy HH:mm',
                                  {
                                    locale: vi
                                  }
                                )
                              : '—'}
                          </TableCell>
                          <TableCell className='text-right'>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => {
                                setSelectedBatchId(batch.id);
                                setIsPriceDialogOpen(true);
                              }}
                            >
                              <IconEye className='mr-2 h-4 w-4' />
                              {t('products.batches.actions.viewDetails')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
                <div className='py-8 text-center text-sm text-gray-500'>
                  {t('history.loading')}
                </div>
              ) : (
                <>
                  {/* Activities Table */}
                  {historyActivities.length === 0 ? (
                    <div className='py-8 text-center text-sm text-gray-500'>
                      {t('history.noResults')}
                    </div>
                  ) : (
                    <div className='overflow-hidden rounded-lg border'>
                      <Table>
                        <TableHeader>
                          <TableRow className='bg-gray-50'>
                            <TableHead className='font-semibold'>
                              {t('history.columns.datetime')}
                            </TableHead>
                            <TableHead className='font-semibold'>
                              {t('history.columns.activityType')}
                            </TableHead>
                            <TableHead className='font-semibold'>
                              {t('history.columns.product')}
                            </TableHead>
                            <TableHead className='font-semibold'>
                              {t('history.columns.quantity')}
                            </TableHead>
                            <TableHead className='font-semibold'>
                              {t('history.columns.status')}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {historyActivities.map((activity) => (
                            <TableRow
                              key={activity.id}
                              className='hover:bg-gray-50'
                            >
                              <TableCell>
                                <div className='flex items-center gap-2'>
                                  <IconCalendar className='h-4 w-4 text-gray-400' />
                                  <span className='text-sm'>
                                    {format(
                                      new Date(activity.date),
                                      'dd/MM/yyyy HH:mm',
                                      {
                                        locale: vi
                                      }
                                    )}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className='flex items-center gap-2'>
                                  {getActivityTypeIcon(activity.type)}
                                  {getActivityTypeBadge(activity.type)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className='text-sm font-medium'>
                                    {activity.productName}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className='font-medium'>
                                {activity.quantity.toLocaleString()}{' '}
                                {activity.unit}
                              </TableCell>
                              <TableCell>
                                {getHistoryStatusBadge(activity.status)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </>
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

      {/* Price Management Dialog */}
      {selectedBatchId && (
        <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
          <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>
                {t('products.prices.title', {
                  batchCode:
                    areaBatches.find((b) => b.id === selectedBatchId)
                      ?.batchCode || selectedBatchId
                })}
              </DialogTitle>
              <DialogDescription>
                {t('products.prices.description')}
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4'>
              {/* Add New Price Button */}
              <div className='flex justify-end'>
                <Button
                  size='sm'
                  onClick={() => {
                    setEditingPrice('new');
                  }}
                >
                  <IconPlus className='mr-2 h-4 w-4' />
                  {t('products.prices.addNew')}
                </Button>
              </div>

              {/* Prices Table */}
              {isLoadingPrices ? (
                <div className='py-8 text-center text-sm text-gray-500'>
                  {t('products.prices.loading')}
                </div>
              ) : batchPrices.length === 0 ? (
                <div className='py-8 text-center text-sm text-gray-500'>
                  {t('products.prices.empty')}
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          {t('products.prices.columns.price')}
                        </TableHead>
                        <TableHead>
                          {t('products.prices.columns.quantity')}
                        </TableHead>
                        <TableHead>
                          {t('products.prices.columns.unit')}
                        </TableHead>
                        <TableHead>
                          {t('products.prices.columns.createdAt')}
                        </TableHead>
                        <TableHead className='text-right'>
                          {t('products.prices.columns.actions')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batchPrices.map((price) => (
                        <TableRow key={price.id}>
                          <TableCell>
                            {price.price
                              ? `${price.price.toLocaleString('vi-VN')} VNĐ`
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {price.quantity?.toLocaleString() || '-'}
                          </TableCell>
                          <TableCell>{price.unit || '-'}</TableCell>
                          <TableCell className='text-xs'>
                            {price.createdAt
                              ? format(
                                  new Date(price.createdAt),
                                  'dd/MM/yyyy HH:mm',
                                  {
                                    locale: vi
                                  }
                                )
                              : '—'}
                          </TableCell>
                          <TableCell className='text-right'>
                            <div className='flex justify-end gap-2'>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => setEditingPrice(price)}
                              >
                                <IconEdit className='h-4 w-4' />
                              </Button>
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={async () => {
                                  if (
                                    confirm(t('products.prices.confirmDelete'))
                                  ) {
                                    try {
                                      await deletePrice(price.id);
                                      const prices = await fetchPricesByBatchId(
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
                                <IconTrash className='h-4 w-4 text-red-600' />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Edit/Create Price Form */}
              {editingPrice !== null && editingPrice !== undefined && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {editingPrice === 'new' || !editingPrice
                        ? t('products.prices.createTitle')
                        : t('products.prices.editTitle')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
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

'use client';

import AreaCharts from '@/components/charts/area-charts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  createAreaSetting,
  fetchAreaSettings,
  updateAreaSetting
} from '@/services/area-setting.service';
import { fetchAreaById } from '@/services/area.service';
import { subscribeIoTDataUpdates } from '@/services/iotdevice.service';
import { fetchWarehouseById } from '@/services/warehouse.service';
import { fetchImportTickets } from '@/services/import-ticket.service';
import { fetchBatches } from '@/services/batch.service';
import { fetchExportTickets } from '@/services/export-ticket.service';
import type { Area as AreaEntity } from '@/types/area';
import type { AreaSetting } from '@/types/area-setting';
import type { Warehouse } from '@/types/warehouse';
import type { Batch } from '@/types/batch';
import type { ImportTicket } from '@/types/import-ticket';
import {
  IconActivity,
  IconAlertTriangle,
  IconArrowDown,
  IconArrowLeft,
  IconArrowUp,
  IconBell,
  IconBox,
  IconCalendar,
  IconClock,
  IconDroplet,
  IconFilter,
  IconHistory,
  IconMapPin,
  IconPackage,
  IconRefresh,
  IconSearch,
  IconSettings,
  IconShield,
  IconThermometer
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AreaDetailViewProps {
  warehouseId: string;
  areaId: string;
}

export default function AreaDetailView({
  warehouseId,
  areaId
}: AreaDetailViewProps) {
  const router = useRouter();
  const [realTimeData, setRealTimeData] = useState(new Date());
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
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [areaImportTickets, setAreaImportTickets] = useState<ImportTicket[]>(
    []
  );
  const [areaExportTickets, setAreaExportTickets] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [selectedActivityType, setSelectedActivityType] = useState('Tất cả');
  const [selectedProduct, setSelectedProduct] = useState('Tất cả');
  const [selectedStatus, setSelectedStatus] = useState('Tất cả');
  const [overviewBatches, setOverviewBatches] = useState<Batch[]>([]);
  const [isLoadingOverviewBatches, setIsLoadingOverviewBatches] =
    useState(false);

  type EnvironmentReadings = {
    temperature?: number | null;
    humidity?: number | null;
  };

  const parseDeviceData = (device: any): EnvironmentReadings => {
    try {
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
      // 1) Nếu payload có area, phải trùng area hiện tại
      const payloadAreaId = (payload as any)?.area?.id as string | undefined;
      if (payloadAreaId && payloadAreaId !== areaId) return;

      // 2) Nếu không có area trong payload, fallback theo device id của area
      const payloadId = String((payload as any)?.id ?? '').trim();
      if (!payloadAreaId) {
        if (!payloadId || !areaDeviceIds.includes(payloadId)) {
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

  // Load batches cho overview tab (để hiển thị phân bố sản phẩm)
  useEffect(() => {
    if (activeTab !== 'overview' || !areaId) return;

    const loadOverviewBatches = async () => {
      setIsLoadingOverviewBatches(true);
      try {
        const res = await fetchBatches({
          page: 1,
          limit: 200,
          areaId
        });
        const list = (res.data || []).filter(
          (b) => b.area?.id && b.area.id === areaId
        );
        setOverviewBatches(list);
      } catch (error) {
        console.error('Unable to load overview batches', error);
        setOverviewBatches([]);
      } finally {
        setIsLoadingOverviewBatches(false);
      }
    };

    void loadOverviewBatches();
  }, [activeTab, areaId]);

  // Load batches theo area khi mở tab Products
  useEffect(() => {
    if (activeTab !== 'products' || !areaId) return;

    const loadAreaBatches = async () => {
      setIsLoadingProducts(true);
      try {
        const res = await fetchBatches({
          page: 1,
          limit: 200,
          areaId
        });
        const list = (res.data || []).filter(
          (b) => b.area?.id && b.area.id === areaId
        );
        setAreaBatches(list);
        if (list.length > 0) {
          // Chọn sẵn product đầu tiên
          setSelectedProductId(list[0].product?.id ?? null);
        } else {
          setSelectedProductId(null);
        }
      } catch (error) {
        console.error('Unable to load area batches', error);
        setAreaBatches([]);
        setSelectedProductId(null);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    void loadAreaBatches();
  }, [activeTab, areaId]);

  // Load lịch sử import và export tickets theo area khi mở tab History
  useEffect(() => {
    if (activeTab !== 'history' || !areaId) return;

    const loadAreaHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const [ticketsRes, batchesRes, exportsRes] = await Promise.all([
          fetchImportTickets({
            page: 1,
            limit: 200
          }),
          fetchBatches({
            page: 1,
            limit: 200,
            areaId
          }),
          fetchExportTickets({
            page: 1,
            limit: 200
          })
        ]);

        const batchesInArea: Batch[] = (batchesRes.data || []).filter(
          (b) => b.area?.id && b.area.id === areaId
        );
        const importIdsFromBatches = new Set(
          batchesInArea
            .map((b) => b.importTicket?.id)
            .filter((id): id is string => !!id)
        );
        const orderDetailIdsFromBatches = new Set(
          batchesInArea
            .map((b) => b.orderDetail?.id)
            .filter((id): id is string => !!id)
        );

        const tickets: ImportTicket[] = (ticketsRes.data || []).filter(
          (it) =>
            (it.area?.id && it.area.id === areaId) ||
            importIdsFromBatches.has(it.id)
        );

        const exportTickets = (exportsRes.data || []).filter((et: any) =>
          orderDetailIdsFromBatches.has(et.orderDetail?.id)
        );

        setAreaImportTickets(tickets);
        setAreaExportTickets(exportTickets);
      } catch (error) {
        console.error('Unable to load area history', error);
        setAreaImportTickets([]);
        setAreaExportTickets([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    void loadAreaHistory();
  }, [activeTab, areaId]);

  // Tạo activities từ import và export tickets
  const historyActivities = useMemo(() => {
    const importActivities = (areaImportTickets || []).map((it) => {
      const productName =
        it.inboundBatch?.product?.name ??
        it.inboundBatch?.harvestDetail?.product?.name ??
        '-';
      const productId =
        it.inboundBatch?.product?.id ??
        it.inboundBatch?.harvestDetail?.product?.id ??
        '';

      return {
        id: it.id,
        date: it.importDate ?? it.createdAt ?? new Date().toISOString(),
        type: 'import' as const,
        productName,
        productId,
        quantity: Number(
          it.realityQuantity ??
            it.inboundBatch?.quantity ??
            it.inboundBatch?.harvestTicket?.quantity ??
            0
        ),
        unit:
          it.inboundBatch?.unit ?? it.inboundBatch?.harvestTicket?.unit ?? 'kg',
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
      date: et.ExportDate ?? et.createdAt ?? new Date().toISOString(),
      type: 'export' as const,
      productName: et.orderDetail?.product?.name ?? '-',
      productId: et.orderDetail?.product?.id ?? '',
      quantity: Number(et.orderDetail?.quantity ?? 0),
      unit: et.orderDetail?.unit ?? 'kg',
      status: 'completed' as
        | 'completed'
        | 'pending_assignment'
        | 'assigned'
        | 'delivering'
        | 'cancelled'
    }));

    return [...importActivities, ...exportActivities];
  }, [areaImportTickets, areaExportTickets]);

  // Lấy danh sách sản phẩm unique cho filter
  const historyProducts = useMemo(() => {
    const productSet = new Set<string>();
    historyActivities.forEach((activity) => {
      if (activity.productId) {
        productSet.add(activity.productId);
      }
    });
    return Array.from(productSet).map((id) => {
      const activity = historyActivities.find((a) => a.productId === id);
      return { id, name: activity?.productName ?? id };
    });
  }, [historyActivities]);

  // Filter activities
  const filteredHistoryActivities = useMemo(() => {
    return historyActivities.filter((activity) => {
      const matchesSearch =
        activity.productName
          .toLowerCase()
          .includes(historySearchTerm.toLowerCase()) ||
        activity.productId
          .toLowerCase()
          .includes(historySearchTerm.toLowerCase());

      const matchesActivityType =
        selectedActivityType === 'Tất cả' ||
        (selectedActivityType === 'Nhập kho' && activity.type === 'import') ||
        (selectedActivityType === 'Xuất kho' && activity.type === 'export');

      const matchesProduct =
        selectedProduct === 'Tất cả' || activity.productId === selectedProduct;

      const matchesStatus =
        selectedStatus === 'Tất cả' ||
        (selectedStatus === 'completed' && activity.status === 'completed') ||
        (selectedStatus === 'Đang xử lý' &&
          activity.status !== 'completed' &&
          activity.status !== 'cancelled') ||
        (selectedStatus === 'cancelled' && activity.status === 'cancelled');

      return (
        matchesSearch && matchesActivityType && matchesProduct && matchesStatus
      );
    });
  }, [
    historyActivities,
    historySearchTerm,
    selectedActivityType,
    selectedProduct,
    selectedStatus
  ]);

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
        Nhập kho
      </Badge>
    ) : (
      <Badge variant='secondary' className='bg-blue-100 text-blue-800'>
        Xuất kho
      </Badge>
    );
  };

  const getHistoryStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending_assignment: {
        label: 'Chờ phân công',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      assigned: {
        label: 'Đã phân công',
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      delivering: {
        label: 'Đang giao hàng',
        className: 'bg-purple-100 text-purple-800 border-purple-200'
      },
      completed: {
        label: 'Hoàn tất',
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      cancelled: {
        label: 'Đã hủy',
        className: 'bg-red-100 text-red-800 border-red-200'
      }
    };

    const config = statusConfig[status] ?? {
      label: 'Không xác định',
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

  const productsInArea = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name?: string; totalQuantity: number; batchCount: number }
    >();

    for (const b of areaBatches) {
      const id = b.product?.id;
      if (!id) continue;
      const name = b.product?.name;
      const prev = map.get(id) ?? {
        id,
        name,
        totalQuantity: 0,
        batchCount: 0
      };
      prev.totalQuantity += b.quantity;
      prev.batchCount += 1;
      map.set(id, prev);
    }

    return Array.from(map.values());
  }, [areaBatches]);

  const palette = [
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7300',
    '#00ff88',
    '#0088FE',
    '#FFBB28',
    '#FF8042'
  ];

  const toNumber = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const productDistributionData = useMemo(() => {
    const productMap = new Map<string, { name: string; value: number }>();
    overviewBatches.forEach((batch) => {
      const key = batch.product?.id || 'unknown';
      const name = batch.product?.name || 'Sản phẩm khác';
      const quantity = toNumber(batch.quantity);
      const prev = productMap.get(key);
      productMap.set(key, { name, value: (prev?.value ?? 0) + quantity });
    });

    const distribution = Array.from(productMap.values()).map((item, idx) => ({
      ...item,
      color: palette[idx % palette.length]
    }));

    return distribution.length
      ? distribution
      : [{ name: 'Chưa có dữ liệu', value: 1, color: palette[0] }];
  }, [overviewBatches]);

  const batchesOfSelectedProduct = useMemo(
    () =>
      selectedProductId
        ? areaBatches.filter((b) => b.product?.id === selectedProductId)
        : [],
    [areaBatches, selectedProductId]
  );

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
    const interval = setInterval(() => {
      setRealTimeData(new Date());
    }, 30000); // Cập nhật mỗi 30 giây

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
            Bình thường
          </Badge>
        );
      case 'warning':
        return (
          <Badge className='bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'>
            Cảnh báo
          </Badge>
        );
      case 'critical':
        return (
          <Badge className='bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'>
            Nghiêm trọng
          </Badge>
        );
      default:
        return <Badge variant='secondary'>Không xác định</Badge>;
    }
  };

  const capacity = area?.capacity ?? 0;
  const usedCapacity =
    typeof area?.availableCapacity === 'number'
      ? Math.max(capacity - area.availableCapacity, 0)
      : 0;
  const capacityPercentage =
    capacity > 0 ? (usedCapacity / Math.max(capacity, 1)) * 100 : 0;
  const activeAlertCount = 0; // sẽ nối API cảnh báo sau
  const areaName = area?.name || `Khu vực ${areaId}`;
  const areaCode = area?.id || areaId;
  const areaDescription = area?.description || '';
  const warehouseName = warehouse?.name || `Kho ${warehouseId}`;

  return (
    <div className='container mx-auto space-y-6 p-6'>
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
            Quay lại
          </Button>
          <div>
            <h1 className='text-3xl font-bold'>
              {areaName}
              {isLoadingArea && ' (đang tải...)'}
            </h1>
            <p className='text-muted-foreground'>
              {warehouseName}
              {isLoadingWarehouse && ' (đang tải...)'} • Cập nhật lần cuối:{' '}
              {realTimeData.toLocaleTimeString()}
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
            {isLoadingEnv ? 'Đang tải...' : 'Làm mới'}
          </Button>
          <Button variant='outline' size='sm'>
            <IconSettings className='mr-2 h-4 w-4' />
            Cài đặt
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Nhiệt độ</CardTitle>
            <IconThermometer className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {temperature != null
                ? `${temperature}°C`
                : isLoadingEnv
                  ? 'Đang tải...'
                  : '—'}
            </div>
            <p className='text-muted-foreground text-xs'>
              Ngưỡng:{' '}
              {areaSetting
                ? `${areaSetting.minTemperature}–${areaSetting.maxTemperature}°C`
                : '—'}
            </p>
            <div className='mt-2'>{getStatusBadge('normal')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Độ ẩm</CardTitle>
            <IconDroplet className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {humidity != null
                ? `${humidity}%`
                : isLoadingEnv
                  ? 'Đang tải...'
                  : '—'}
            </div>
            <p className='text-muted-foreground text-xs'>
              Ngưỡng:{' '}
              {areaSetting
                ? `${areaSetting.minHumidity}–${areaSetting.maxHumidity}%`
                : '—'}
            </p>
            <div className='mt-2'>{getStatusBadge('normal')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Dung tích</CardTitle>
            <IconBox className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {usedCapacity.toFixed(0)}/{capacity.toFixed(0)}
            </div>
            <p className='text-muted-foreground text-xs'>
              {capacityPercentage.toFixed(1)}% đã sử dụng
            </p>
            <Progress value={capacityPercentage} className='mt-2' />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Cảnh báo</CardTitle>
            <IconAlertTriangle className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-yellow-600'>
              {activeAlertCount}
            </div>
            <p className='text-muted-foreground text-xs'>
              Cảnh báo đang hoạt động
            </p>
            <div className='mt-2'>
              <Badge variant='outline' className='text-yellow-600'>
                Cần xử lý
              </Badge>
            </div>
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
          <TabsTrigger value='overview'>Tổng quan</TabsTrigger>
          <TabsTrigger value='products'>Sản phẩm</TabsTrigger>
          <TabsTrigger value='alerts'>Cảnh báo</TabsTrigger>
          <TabsTrigger value='history'>Lịch sử</TabsTrigger>
          <TabsTrigger value='settings'>Cài đặt</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            {/* Area Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconMapPin className='h-5 w-5' />
                  Thông tin khu vực
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Mã khu vực
                    </p>
                    <p className='font-semibold'>{areaCode}</p>
                  </div>
                  <div>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Loại khu vực
                    </p>
                    <p className='font-semibold'>{areaDescription}</p>
                  </div>
                  <div>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Trạng thái
                    </p>
                    {getStatusBadge('normal')}
                  </div>
                  <div>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Số sản phẩm
                    </p>
                    <p className='font-semibold'>
                      {productDistributionData.length > 0 &&
                      productDistributionData[0].name !== 'Chưa có dữ liệu'
                        ? productDistributionData.length
                        : '—'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className='text-muted-foreground mb-2 text-sm font-medium'>
                    Tỷ lệ sử dụng
                  </p>
                  <Progress value={capacityPercentage} className='h-2' />
                  <p className='text-muted-foreground mt-1 text-xs'>
                    {usedCapacity.toFixed(0)} / {capacity.toFixed(0)} đơn vị (
                    {capacityPercentage.toFixed(1)}%)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Product Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Phân bố sản phẩm</CardTitle>
                <CardDescription>
                  Tỷ lệ các loại sản phẩm trong khu vực
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingOverviewBatches ? (
                  <div className='flex h-[250px] items-center justify-center'>
                    <p className='text-muted-foreground text-sm'>
                      Đang tải dữ liệu...
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width='100%' height={250}>
                    <PieChart>
                      <Pie
                        data={productDistributionData}
                        cx='50%'
                        cy='50%'
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill='#8884d8'
                        dataKey='value'
                      >
                        {productDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <AreaCharts areaId={areaId} />
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value='products' className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>Sản phẩm trong khu vực</h3>
            <Button
              size='sm'
              variant='outline'
              onClick={() => router.push('/dashboard/warehouse/batches')}
            >
              <IconPackage className='mr-2 h-4 w-4' />
              Quản lý nhập hàng
            </Button>
          </div>

          {isLoadingProducts ? (
            <div className='text-muted-foreground text-sm'>
              Đang tải danh sách sản phẩm...
            </div>
          ) : productsInArea.length === 0 ? (
            <div className='text-muted-foreground text-sm'>
              Chưa có sản phẩm nào trong khu vực này. Vui lòng tạo Import Ticket
              và gán batch vào khu vực để hiển thị tại đây.
            </div>
          ) : (
            <div className='grid gap-4 lg:grid-cols-[2fr,3fr]'>
              <Card className='overflow-hidden'>
                <CardHeader>
                  <CardTitle>Danh sách sản phẩm</CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                  <div className='w-full overflow-x-auto'>
                    <table className='w-full text-sm'>
                      <thead className='bg-muted'>
                        <tr>
                          <th className='px-4 py-2 text-left'>Sản phẩm</th>
                          <th className='px-4 py-2 text-left'>Số lô</th>
                          <th className='px-4 py-2 text-left'>Tổng số lượng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productsInArea.map((p) => (
                          <tr
                            key={p.id}
                            className={`hover:bg-muted/50 cursor-pointer border-t ${
                              selectedProductId === p.id
                                ? 'bg-muted/80 font-semibold'
                                : ''
                            }`}
                            onClick={() => setSelectedProductId(p.id)}
                          >
                            <td className='px-4 py-2'>
                              <div className='font-medium'>
                                {p.name || p.id}
                              </div>
                            </td>
                            <td className='px-4 py-2'>{p.batchCount}</td>
                            <td className='px-4 py-2'>
                              {p.totalQuantity.toLocaleString()} kg
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <Card className='overflow-hidden'>
                <CardHeader>
                  <CardTitle>
                    {selectedProductId
                      ? 'Các lô hàng trong khu vực'
                      : 'Chọn một sản phẩm để xem các lô hàng'}
                  </CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                  {selectedProductId &&
                    batchesOfSelectedProduct.length === 0 && (
                      <div className='text-muted-foreground px-4 py-6 text-sm'>
                        Không tìm thấy lô hàng nào cho sản phẩm này trong khu
                        vực.
                      </div>
                    )}
                  {selectedProductId && batchesOfSelectedProduct.length > 0 && (
                    <div className='w-full overflow-x-auto'>
                      <table className='w-full text-sm'>
                        <thead className='bg-muted'>
                          <tr>
                            <th className='px-4 py-2 text-left'>Batch code</th>
                            <th className='px-4 py-2 text-left'>Số lượng</th>
                            <th className='px-4 py-2 text-left'>Đơn vị</th>
                            <th className='px-4 py-2 text-left'>
                              Ngày tạo batch
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {batchesOfSelectedProduct.map((b) => (
                            <tr key={b.id} className='border-t'>
                              <td className='px-4 py-2'>
                                <div className='font-mono text-xs'>
                                  {b.batchCode}
                                </div>
                                <div className='text-muted-foreground text-xs'>
                                  ID: {b.id}
                                </div>
                              </td>
                              <td className='px-4 py-2'>
                                {b.quantity.toLocaleString()}
                              </td>
                              <td className='px-4 py-2'>{b.unit}</td>
                              <td className='px-4 py-2 text-xs'>
                                {b.createdAt
                                  ? new Date(b.createdAt).toLocaleString(
                                      'vi-VN'
                                    )
                                  : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {!selectedProductId && (
                    <div className='text-muted-foreground px-4 py-6 text-sm'>
                      Hãy chọn một sản phẩm ở bảng bên trái để xem chi tiết các
                      lô hàng đang có trong khu vực.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value='alerts' className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>Cảnh báo và thông báo</h3>
            <Button variant='outline'>
              <IconBell className='mr-2 h-4 w-4' />
              Cài đặt thông báo
            </Button>
          </div>

          <div className='text-muted-foreground text-sm'>
            Chưa có dữ liệu cảnh báo cho khu vực này.
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value='history' className='space-y-4'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='flex items-center gap-2'>
                    <IconHistory className='h-5 w-5' />
                    Lịch sử hoạt động
                  </CardTitle>
                  <CardDescription>
                    Theo dõi tất cả các hoạt động xuất nhập kho trong khu vực
                  </CardDescription>
                </div>
                <Button variant='outline' size='sm'>
                  <IconClock className='mr-2 h-4 w-4' />
                  Xuất báo cáo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className='py-8 text-center text-sm text-gray-500'>
                  Đang tải lịch sử hoạt động...
                </div>
              ) : (
                <>
                  {/* Filters and Search */}
                  <div className='mb-6 space-y-4'>
                    <div className='flex flex-wrap items-center gap-4'>
                      <div className='min-w-[200px] flex-1'>
                        <div className='relative'>
                          <IconSearch className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                          <Input
                            placeholder='Tìm kiếm sản phẩm...'
                            value={historySearchTerm}
                            onChange={(e) =>
                              setHistorySearchTerm(e.target.value)
                            }
                            className='pl-10'
                          />
                        </div>
                      </div>
                    </div>

                    <div className='flex flex-wrap items-center gap-4'>
                      <div className='flex items-center gap-2'>
                        <IconFilter className='h-4 w-4 text-gray-500' />
                        <span className='text-sm font-medium text-gray-700'>
                          Bộ lọc:
                        </span>
                      </div>

                      <Select
                        value={selectedActivityType}
                        onValueChange={setSelectedActivityType}
                      >
                        <SelectTrigger className='w-[140px]'>
                          <SelectValue placeholder='Loại hoạt động' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='Tất cả'>Tất cả</SelectItem>
                          <SelectItem value='Nhập kho'>Nhập kho</SelectItem>
                          <SelectItem value='Xuất kho'>Xuất kho</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedProduct}
                        onValueChange={setSelectedProduct}
                      >
                        <SelectTrigger className='w-[180px]'>
                          <SelectValue placeholder='Sản phẩm' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='Tất cả'>
                            Tất cả sản phẩm
                          </SelectItem>
                          {historyProducts.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={selectedStatus}
                        onValueChange={setSelectedStatus}
                      >
                        <SelectTrigger className='w-[180px]'>
                          <SelectValue placeholder='Tất cả trạng thái' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='Tất cả'>
                            Tất cả trạng thái
                          </SelectItem>
                          <SelectItem value='completed'>Hoàn tất</SelectItem>
                          <SelectItem value='Đang xử lý'>Đang xử lý</SelectItem>
                          <SelectItem value='cancelled'>Đã hủy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Results Summary */}
                  <div className='mb-4 text-sm text-gray-600'>
                    Hiển thị {filteredHistoryActivities.length} kết quả từ tổng
                    số {historyActivities.length} hoạt động
                  </div>

                  {/* Activities Table */}
                  {filteredHistoryActivities.length === 0 ? (
                    <div className='py-8 text-center text-sm text-gray-500'>
                      Không tìm thấy hoạt động nào phù hợp với bộ lọc
                    </div>
                  ) : (
                    <div className='overflow-hidden rounded-lg border'>
                      <Table>
                        <TableHeader>
                          <TableRow className='bg-gray-50'>
                            <TableHead className='font-semibold'>
                              Ngày và giờ
                            </TableHead>
                            <TableHead className='font-semibold'>
                              Loại hoạt động
                            </TableHead>
                            <TableHead className='font-semibold'>
                              Sản phẩm
                            </TableHead>
                            <TableHead className='font-semibold'>
                              Số lượng
                            </TableHead>
                            <TableHead className='font-semibold'>
                              Trạng thái
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredHistoryActivities.map((activity) => (
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
                                  <div className='text-xs text-gray-500'>
                                    {activity.productId}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className='text-right font-medium'>
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
            <h3 className='text-lg font-semibold'>Cài đặt khu vực</h3>
            <Button onClick={handleSaveSettings} disabled={isSavingSetting}>
              <IconShield className='mr-2 h-4 w-4' />
              {isSavingSetting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Ngưỡng cảnh báo</CardTitle>
                <CardDescription>
                  Nhiệt độ tối thiểu / tối đa theo cấu hình area-settings
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <label className='text-sm font-medium'>
                    Nhiệt độ tối thiểu (°C)
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
                    Nhiệt độ tối đa (°C)
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
                <div>
                  <label className='text-sm font-medium'>
                    Sức chứa tối thiểu (kg)
                  </label>
                  <input
                    type='number'
                    min={0}
                    value={settingForm.minCapacity}
                    disabled={isLoadingSetting || isSavingSetting}
                    onChange={(e) =>
                      setSettingForm((prev) => ({
                        ...prev,
                        minCapacity: e.target.value
                      }))
                    }
                    placeholder='Ví dụ: 100'
                    className='mt-1 w-full rounded-md border px-3 py-2'
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ngưỡng cảnh báo</CardTitle>
                <CardDescription>
                  Độ ẩm tối thiểu / tối đa theo cấu hình area-settings
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <label className='text-sm font-medium'>
                    Độ ẩm tối thiểu (%)
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
                    Độ ẩm tối đa (%)
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
      </Tabs>
    </div>
  );
}

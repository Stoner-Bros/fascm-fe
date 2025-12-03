'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  IconArrowLeft,
  IconThermometer,
  IconDroplet,
  IconBox,
  IconAlertTriangle,
  IconSettings,
  IconHistory,
  IconBell,
  IconEye,
  IconEdit,
  IconRefresh,
  IconActivity,
  IconBarcode,
  IconPackage,
  IconClock,
  IconMapPin,
  IconShield
} from '@tabler/icons-react';
import AreaCharts from '@/components/charts/area-charts';
import {
  createAreaSetting,
  fetchAreaSettings,
  updateAreaSetting
} from '@/services/area-setting.service';
import type { AreaSetting } from '@/types/area-setting';
import { fetchAreaById } from '@/services/area.service';
import { fetchWarehouseById } from '@/services/warehouse.service';
import type { Area as AreaEntity } from '@/types/area';
import type { Warehouse } from '@/types/warehouse';
import { subscribeIoTDataUpdates } from '@/services/iotdevice.service';

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
                    <Badge variant='outline'>—</Badge>
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
                    <p className='font-semibold'>—</p>
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

            {/* Sensor Status */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconActivity className='h-5 w-5' />
                  Trạng thái cảm biến
                </CardTitle>
              </CardHeader>
              <CardContent className='text-muted-foreground space-y-2 text-sm'>
                <p>Chưa có dữ liệu cảm biến chi tiết cho khu vực này.</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <AreaCharts areaId={areaId} />

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconHistory className='h-5 w-5' />
                Hoạt động gần đây
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground text-sm'>
                Chưa có dữ liệu lịch sử hoạt động cho khu vực này.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value='products' className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>Sản phẩm trong khu vực</h3>
            <Button>
              <IconPackage className='mr-2 h-4 w-4' />
              Thêm sản phẩm
            </Button>
          </div>

          <div className='text-muted-foreground text-sm'>
            Chưa có dữ liệu sản phẩm cho khu vực này.
          </div>
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
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>Lịch sử hoạt động</h3>
            <Button variant='outline'>
              <IconClock className='mr-2 h-4 w-4' />
              Xuất báo cáo
            </Button>
          </div>

          <Card>
            <CardContent className='pt-4'>
              <p className='text-muted-foreground text-sm'>
                Chưa có dữ liệu lịch sử chi tiết cho khu vực này.
              </p>
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

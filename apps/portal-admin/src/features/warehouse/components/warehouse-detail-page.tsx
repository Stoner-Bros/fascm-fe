'use client';

import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import {
  fetchActiveAreaAlertByAreaId,
  fetchAreas
} from '@/services/area.service';
import { fetchBatches } from '@/services/batch.service';
import {
  connectIoTSocket,
  subscribeIoTDataUpdates
} from '@/services/iotdevice.service';
import { fetchWarehouseById } from '@/services/warehouse.service';
import type { Area } from '@/types/area';
import type { Batch } from '@/types/batch';
import type { Warehouse } from '@/types/warehouse';
import {
  IconArrowLeft,
  IconDroplet,
  IconEye,
  IconTemperature
} from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { WarehouseActivitiesTable } from './warehouse-activities-table';
import { useTranslations } from 'next-intl';

type EnvironmentReadings = {
  temperature?: number | null;
  humidity?: number | null;
};

const toNumeric = (value: unknown) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const parseDeviceData = (device: any): EnvironmentReadings => {
  try {
    const directTemp =
      device?.temperature ?? device?.temp ?? device?.t ?? device?.Temperature;
    const directHum =
      device?.humidity ?? device?.humid ?? device?.h ?? device?.Humidity;
    if (directTemp != null || directHum != null) {
      return { temperature: directTemp ?? null, humidity: directHum ?? null };
    }
    const raw = device?.data;
    if (typeof raw === 'string' && raw.trim().length > 0) {
      const obj = JSON.parse(raw);
      return {
        temperature: obj.temperature ?? obj.temp ?? obj.t ?? null,
        humidity: obj.humidity ?? obj.humid ?? obj.h ?? null
      };
    }
    if (Array.isArray(raw) && raw.length > 0) {
      const last = raw[raw.length - 1];
      return {
        temperature: last?.temperature ?? last?.temp ?? last?.t ?? null,
        humidity: last?.humidity ?? last?.humid ?? last?.h ?? null
      };
    }
    if (raw && typeof raw === 'object') {
      return {
        temperature:
          raw.temperature ?? raw.temp ?? raw.t ?? (raw as any).Temperature,
        humidity: raw.humidity ?? raw.humid ?? raw.h ?? (raw as any).Humidity
      };
    }
  } catch {}
  return {};
};

interface WarehouseDetailPageProps {
  warehouseId: string;
}

export default function WarehouseDetailPage({
  warehouseId
}: WarehouseDetailPageProps) {
  const { toast } = useToast();
  const t = useTranslations('WarehouseDetail');

  const [apiWarehouse, setApiWarehouse] = useState<Warehouse | null>(null);
  const [apiAreas, setApiAreas] = useState<Area[]>([]);
  const [areaBatches, setAreaBatches] = useState<Batch[]>([]);
  const [areaEnv, setAreaEnv] = useState<Record<string, EnvironmentReadings>>(
    {}
  );
  const [areaAlerts, setAreaAlerts] = useState<Record<string, boolean>>({});
  const [areaDeviceMap, setAreaDeviceMap] = useState<Record<string, string[]>>(
    {}
  );
  const alertSocketRef = useRef<any>(null);
  const subscribedAreasRef = useRef<Set<string>>(new Set());
  const deviceToAreaMap = useMemo(() => {
    const map: Record<string, string> = {};
    Object.entries(areaDeviceMap).forEach(([areaId, deviceIds]) => {
      deviceIds.forEach((deviceId) => {
        map[deviceId] = areaId;
      });
    });
    return map;
  }, [areaDeviceMap]);

  const warehouse = useMemo(() => {
    return {
      id: apiWarehouse?.id,
      name: apiWarehouse?.name,
      address: apiWarehouse?.address
    };
  }, [apiWarehouse]);

  const loadWarehouse = async () => {
    try {
      const data = await fetchWarehouseById(warehouseId);
      setApiWarehouse(data);
    } catch (error) {
      console.error('Unable to load warehouse', error);
      toast({
        variant: 'destructive',
        title: t('toast.loadWarehouseError'),
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
    }
  };

  const loadAreas = async () => {
    try {
      const res = await fetchAreas({ page: 1, limit: 50, warehouseId });
      const areas = res.data || [];
      setApiAreas(areas);

      const nextEnv: Record<string, EnvironmentReadings> = {};
      const nextDeviceMap: Record<string, string[]> = {};

      areas.forEach((area) => {
        const iot = (area as any)?.iotDevice;
        const devices: any[] = Array.isArray(iot) ? iot : iot ? [iot] : [];
        nextDeviceMap[area.id] = devices
          .map((d) => (d && typeof d === 'object' ? (d as any).id : null))
          .filter(
            (v): v is string => typeof v === 'string' && v.trim().length > 0
          );

        let readings: EnvironmentReadings = {
          temperature: null,
          humidity: null
        };

        for (const d of devices) {
          const r = parseDeviceData(d);
          const temperature = toNumeric(r.temperature);
          const humidity = toNumeric(r.humidity);
          if (temperature != null || humidity != null) {
            readings = { temperature, humidity };
            break;
          }
        }

        nextEnv[area.id] = readings;
      });

      setAreaEnv((prev) => {
        const merged: Record<string, EnvironmentReadings> = {};
        areas.forEach((area) => {
          const readings = nextEnv[area.id];
          const hasFresh =
            typeof readings.temperature === 'number' ||
            typeof readings.humidity === 'number';
          if (hasFresh) {
            merged[area.id] = readings;
          } else {
            merged[area.id] = prev[area.id] ?? readings;
          }
        });
        return merged;
      });

      setAreaDeviceMap(nextDeviceMap);

      const alertResults = await Promise.all(
        areas.map(async (area) => {
          try {
            const alert = await fetchActiveAreaAlertByAreaId(area.id);
            const isActive =
              !!alert && String(alert.status ?? '').toLowerCase() === 'active';
            return { areaId: area.id, isActive };
          } catch {
            return { areaId: area.id, isActive: false };
          }
        })
      );
      const alertMap: Record<string, boolean> = {};
      alertResults.forEach(({ areaId, isActive }) => {
        alertMap[areaId] = isActive;
      });
      setAreaAlerts(alertMap);

      // Fetch tất cả batches một lần (không filter theo areaId)
      try {
        const allBatchesRes = await fetchBatches({
          page: 1,
          limit: 500 // Fetch nhiều batches để cover tất cả areas
        });
        const allBatches = allBatchesRes.data || [];

        // Filter batches chỉ lấy những batches thuộc các areas của warehouse này
        const areaIds = new Set(areas.map((a) => a.id));
        setAreaBatches(
          allBatches.filter((b) => b.area?.id && areaIds.has(b.area.id))
        );
      } catch (error) {
        console.error('Unable to load batches for areas', error);
        setAreaBatches([]);
      }
    } catch (error) {
      console.error('Unable to load areas', error);
      toast({
        variant: 'destructive',
        title: t('toast.loadAreasError'),
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
    }
  };

  useEffect(() => {
    void loadWarehouse();
    void loadAreas();
  }, [warehouseId]);

  useEffect(() => {
    const unsubscribe = subscribeIoTDataUpdates((payload) => {
      const readings = parseDeviceData(payload as any);
      const temperature = toNumeric(readings.temperature);
      const humidity = toNumeric(readings.humidity);
      if (temperature == null && humidity == null) return;
      const payloadAreaId = String(
        (payload as any)?.areaId ?? (payload as any)?.area?.id ?? ''
      ).trim();
      let targetAreaId = payloadAreaId;
      if (!targetAreaId) {
        const payloadId = String(
          (payload as any)?.deviceId ?? (payload as any)?.id ?? ''
        ).trim();
        if (!payloadId) return;
        targetAreaId = deviceToAreaMap[payloadId];
      }
      if (!targetAreaId) return;

      setAreaEnv((prev) => ({
        ...prev,
        [targetAreaId]: {
          temperature:
            temperature != null
              ? temperature
              : (prev[targetAreaId]?.temperature ?? null),
          humidity:
            humidity != null ? humidity : (prev[targetAreaId]?.humidity ?? null)
        }
      }));
    });

    return () => {
      unsubscribe();
    };
  }, [deviceToAreaMap]);

  useEffect(() => {
    const socket = connectIoTSocket();
    alertSocketRef.current = socket;
    const onAlert = (payload: any) => {
      const aid = String(payload?.areaId ?? payload?.area?.id ?? '').trim();
      if (!aid) return;
      const status = String(payload?.status ?? '').toLowerCase();
      setAreaAlerts((prev) => ({ ...prev, [aid]: status === 'active' }));
    };
    const events = ['area-alert', 'area:alert', 'alert:update', 'alert'];
    events.forEach((evt) => socket.on(evt, onAlert));
    return () => {
      events.forEach((evt) => socket.off(evt, onAlert));
      socket.disconnect();
      alertSocketRef.current = null;
      subscribedAreasRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const socket = alertSocketRef.current;
    if (!socket) return;
    const areaIds = apiAreas
      .filter((a) => a.warehouse?.id === warehouseId)
      .map((a) => String(a.id || ''))
      .filter((id) => !!id);
    areaIds.forEach((id) => {
      if (subscribedAreasRef.current.has(id)) return;
      socket.emit('alert:subscribeArea', { areaId: id });
      subscribedAreasRef.current.add(id);
    });
  }, [apiAreas, warehouseId]);

  // Map areas từ API sang layout card
  // Chỉ lấy các khu vực thuộc đúng warehouse hiện tại
  const apiAreaCards = useMemo(() => {
    return apiAreas
      .filter((a) => a.warehouse?.id === warehouseId)
      .map((a) => {
        const env = areaEnv[a.id] ?? { temperature: null, humidity: null };

        // Tính số sản phẩm unique trong area
        const areaBatchesList = areaBatches.filter((b) => b.area?.id === a.id);
        const productSet = new Set<string>();
        areaBatchesList.forEach((b) => {
          if (b.product?.id) {
            productSet.add(b.product.id);
          }
        });

        // Tính capacity percentage = ((capacity - availableCapacity) / capacity) * 100
        const capacity = a.capacity ?? 0;
        const availableCapacity = a.availableCapacity ?? capacity;
        const usedCapacity = Math.max(0, capacity - availableCapacity);
        const capacityPercentage =
          capacity > 0 ? (usedCapacity / capacity) * 100 : 0;

        return {
          id: a.id,
          name: a.name,
          description: a.description,
          temperature: env.temperature ?? null,
          humidity: env.humidity ?? null,
          products: productSet.size,
          capacity: capacityPercentage,
          status: 'normal' as const,
          lastUpdated: '—',
          hasAlert: !!areaAlerts[a.id]
        };
      });
  }, [apiAreas, warehouseId, areaEnv, areaBatches, areaAlerts]);

  const allAreas = useMemo(() => apiAreaCards, [apiAreaCards]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'border-green-200 dark:border-green-500';
      case 'warning':
        return 'border-yellow-200 dark:border-yellow-500';
      case 'critical':
        return 'border-red-200 dark:border-red-500';
      default:
        return 'border-gray-200 dark:border-gray-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return warehouse.name ? (
    <PageContainer scrollable>
      <div className='w-full max-w-none space-y-3 md:space-y-4'>
        {/* Header */}
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3'>
          <div className='flex items-center space-x-2 md:space-x-3'>
            <Link
              href='/dashboard/warehouse'
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
            >
              <IconArrowLeft className='mr-1 h-4 w-4 md:mr-2' />
            </Link>
            <div className='min-w-0 flex-1'>
              <h1 className='truncate text-lg font-bold sm:text-xl md:text-2xl'>
                {warehouse.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Areas */}
        <div className='space-y-3'>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
            {allAreas.map((area) => (
              <Card
                key={area.id}
                className={cn('border-2', getStatusColor(area.status))}
              >
                <CardHeader>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='min-w-0 flex-1 pr-1'>
                      <CardTitle className='truncate text-sm'>
                        {area.name}
                      </CardTitle>
                      <CardDescription className='mt-0.5 truncate text-xs'>
                        {area.description || t('area.noDescription')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-2 px-3 pt-0 pb-3'>
                  <Badge
                    variant='outline'
                    className={cn(
                      'max-w-fit shrink-0 px-1 py-0.5 text-xs',
                      area.hasAlert
                        ? 'border-orange-300 bg-orange-100 text-orange-700'
                        : getStatusBadgeColor(area.status)
                    )}
                  >
                    <span className='truncate'>
                      {area.hasAlert ? t('area.alert') : t('area.normal')}
                    </span>
                  </Badge>
                  {/* Environmental Stats */}
                  <div className='grid grid-cols-2 gap-2 text-center md:gap-3'>
                    <div className='min-w-0 space-y-0.5'>
                      <div className='flex items-center justify-center gap-1'>
                        <IconTemperature className='h-5 w-5 shrink-0 text-blue-500' />

                        <span className='text-muted-foreground max-w-[120px] truncate text-center text-sm font-medium md:text-base'>
                          {t('area.temperature')}
                        </span>
                      </div>

                      <p className='truncate text-lg font-extrabold text-blue-600 md:text-2xl'>
                        {area.temperature != null
                          ? `${area.temperature}°C`
                          : '—'}
                      </p>
                    </div>
                    <div className='min-w-0 space-y-0.5'>
                      <div className='flex flex-wrap items-center justify-center'>
                        <IconDroplet className='mr-1 h-5 w-5 shrink-0 text-cyan-500' />
                        <span className='text-muted-foreground flex-shrink-0 truncate text-sm font-medium md:text-base'>
                          {t('area.humidity')}
                        </span>
                      </div>
                      <p className='truncate text-lg font-extrabold text-cyan-600 md:text-2xl'>
                        {area.humidity != null ? `${area.humidity}%` : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex gap-1'>
                    <Link
                      href={`/dashboard/warehouse/${warehouse.id}/area/${area.id}`}
                      className={cn(
                        buttonVariants({ variant: 'default', size: 'sm' }),
                        'h-7 min-w-0 flex-1 text-xs'
                      )}
                    >
                      <IconEye className='mr-1 h-3 w-3 shrink-0' />
                      <span className='truncate'>{t('actions.details')}</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <WarehouseActivitiesTable warehouseId={warehouseId} />
      </div>
    </PageContainer>
  ) : (
    <PageContainer>
      <div className='w-full py-10 text-center'>{t('loading')}</div>
    </PageContainer>
  );
}

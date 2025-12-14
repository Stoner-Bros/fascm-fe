'use client';
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
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  createIoTDevice,
  fetchIoTDeviceById,
  fetchIoTDevices,
  connectIoTSocket,
  updateIoTDevice
} from '@/services/iotdevice.service';
import {
  IconEye,
  IconRefresh,
  IconTemperature,
  IconDroplet,
  IconPlus,
  IconSearch
} from '@tabler/icons-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

type UIIoTDevice = {
  truckId: string;
  areaId: string;
  id: string;
  type: string;
  status: 'online' | 'offline' | 'warning';
  lastDataTime: string;
  data: any;
};

function parseDeviceData(d: any): { temperature?: number; humidity?: number } {
  try {
    if (typeof d?.data === 'string' && d.data.trim().length > 0) {
      const obj = JSON.parse(d.data);
      return {
        temperature: obj.temperature ?? obj.temp ?? obj.t,
        humidity: obj.humidity ?? obj.humid ?? obj.h
      };
    }
    if (Array.isArray(d?.data)) {
      const last = d.data[d.data.length - 1];
      return {
        temperature: last?.temperature ?? last?.temp ?? last?.t,
        humidity: last?.humidity ?? last?.humid ?? last?.h
      };
    }
    if (typeof d?.data === 'object' && d.data) {
      return {
        temperature: d.data.temperature ?? d.data.temp ?? d.data.t,
        humidity: d.data.humidity ?? d.data.humid ?? d.data.h
      };
    }
  } catch {}
  return {};
}

function toUiStatus(s?: string | null): UIIoTDevice['status'] {
  const v = String(s ?? '').toLowerCase();
  if (v === 'active' || v === 'online') return 'online';
  if (v === 'inactive' || v === 'offline') return 'offline';
  if (v === 'warning') return 'warning';
  return 'offline';
}

function formatLastUpdate(t: string): string {
  const iso = (t ?? '').trim();
  if (!iso) return 'N/A';
  try {
    return `${formatDistanceToNow(parseISO(iso), { addSuffix: true })}`;
  } catch {
    return iso;
  }
}

const getDeviceIcon = (type: string) => {
  const t = (type ?? '').toLowerCase();
  switch (t) {
    case 'temperature - humidity':
      return IconTemperature;
    case 'temperature':
      return IconTemperature;
    case 'humidity':
    default:
      return IconTemperature;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'text-green-500';
    case 'warning':
      return 'text-yellow-500';
    case 'offline':
      return 'text-gray-500';
    default:
      return 'text-gray-500';
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'online':
      return <Badge className='bg-green-100 text-green-800'>Hoạt động</Badge>;
    case 'warning':
      return <Badge className='bg-yellow-100 text-yellow-800'>Cảnh báo</Badge>;
    case 'offline':
      return <Badge className='bg-gray-100 text-gray-800'>Offline</Badge>;
    default:
      return (
        <Badge className='bg-gray-100 text-gray-800'>Không xác định</Badge>
      );
  }
};

export function IoTDeviceManagement() {
  const t = useTranslations('IoTDevices');
  const [devices, setDevices] = useState<UIIoTDevice[]>([]);
  const socketRef = useRef<any>(null);
  const subscribedRef = useRef<Set<string>>(new Set());
  const [selectedDevice, setSelectedDevice] = useState<UIIoTDevice | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [areaIdInput, setAreaIdInput] = useState('');
  const [truckIdInput, setTruckIdInput] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editAreaIdInput, setEditAreaIdInput] = useState('');
  const [editTruckIdInput, setEditTruckIdInput] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  // Tính toán statistics
  const stats = useMemo(() => {
    return {
      total: devices.length,
      online: devices.filter((d) => d.status === 'online').length,
      offline: devices.filter((d) => d.status === 'offline').length,
      warning: devices.filter((d) => d.status === 'warning').length
    };
  }, [devices]);

  // Filter devices
  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const matchesSearch =
        device.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.areaId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        device.truckId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || device.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [devices, searchTerm, statusFilter]);
  const loadDevices = async () => {
    setIsLoading(true);
    try {
      const raw = await fetchIoTDevices();
      const mapped: UIIoTDevice[] = (raw?.data ?? []).map((d: any) => {
        return {
          truckId: d?.truck?.id || '',
          areaId: d?.area?.id || '',
          id: d.id || '',
          type: String(d.type ?? 'sensor'),
          status: toUiStatus(d.status),
          lastDataTime: String(d?.lastDataTime ?? '').trim(),
          data: d?.data ?? null
        };
      });
      setDevices(mapped);
    } catch (error) {
      console.error('Failed to load devices', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    const socket = connectIoTSocket();
    socketRef.current = socket;
    const onUpdate = (payload: any) => {
      setDevices((prev) => {
        const pId = String(
          (payload as any)?.id ?? (payload as any)?.deviceId ?? ''
        ).trim();
        if (!pId) return prev;
        const readings = {
          temperature:
            (payload as any)?.temperature ?? (payload as any)?.temp ?? null,
          humidity:
            (payload as any)?.humidity ?? (payload as any)?.humid ?? null
        };
        const idx = prev.findIndex((d) => d.id === pId);
        const next: UIIoTDevice = {
          truckId:
            (payload as any)?.truck?.id || (idx >= 0 ? prev[idx].truckId : ''),
          areaId:
            (payload as any)?.area?.id || (idx >= 0 ? prev[idx].areaId : ''),
          id: pId || (idx >= 0 ? prev[idx].id : ''),
          type: String(
            (payload as any)?.type ?? (idx >= 0 ? prev[idx].type : 'sensor')
          ),
          status:
            toUiStatus((payload as any)?.status) ??
            (idx >= 0 ? prev[idx].status : 'offline'),
          lastDataTime: String(
            (payload as any)?.lastDataTime ??
              (payload as any)?.timestamp ??
              (idx >= 0 ? prev[idx].lastDataTime : '')
          ).trim(),
          data:
            (payload as any)?.data ??
            (readings.temperature != null || readings.humidity != null
              ? readings
              : idx >= 0
                ? prev[idx].data
                : null)
        };
        if (idx >= 0) {
          const copy = prev.slice();
          copy[idx] = next;
          return copy;
        }
        return [next, ...prev];
      });
    };
    socket.on('iot:update', onUpdate);
    return () => {
      socket.off('iot:update', onUpdate);
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    devices.forEach((d) => {
      const id = (d.id ?? '').trim();
      if (!id || subscribedRef.current.has(id)) return;
      socket.emit('iot:subscribeDevice', { deviceId: id });
      subscribedRef.current.add(id);
    });
  }, [devices]);

  const refreshDevice = async (id: string) => {
    try {
      const raw = await fetchIoTDeviceById(id);
      setDevices((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                lastDataTime: String(raw?.lastDataTime ?? d.lastDataTime),
                data: raw?.data ?? d.data
              }
            : d
        )
      );
    } catch {}
  };

  return (
    <div className='w-full space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>
            {t('header.title')}
          </h2>
          <p className='text-muted-foreground mt-1'>
            {t('header.description')}
          </p>
        </div>
        <div className='flex gap-2'>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <IconPlus className='mr-2 h-4 w-4' />
                {t('actions.add')}
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-md'>
              <DialogHeader>
                <DialogTitle>{t('dialog.addTitle')}</DialogTitle>
              </DialogHeader>
              <div className='space-y-4 py-4'>
                <div className='space-y-2'>
                  <Label htmlFor='area-id'>{t('edit.areaId')}</Label>
                  <Input
                    id='area-id'
                    placeholder={t('edit.areaPlaceholder')}
                    value={areaIdInput}
                    onChange={(e) => {
                      setAreaIdInput(e.target.value);
                      if (e.target.value) setTruckIdInput('');
                    }}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='truck-id'>{t('edit.truckId')}</Label>
                  <Input
                    id='truck-id'
                    placeholder={t('edit.truckPlaceholder')}
                    value={truckIdInput}
                    onChange={(e) => {
                      setTruckIdInput(e.target.value);
                      if (e.target.value) setAreaIdInput('');
                    }}
                  />
                </div>
                {createError && (
                  <div className='rounded-md bg-red-50 p-3 text-sm text-red-600'>
                    {createError}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant='outline'
                  onClick={() => {
                    setIsCreateOpen(false);
                    setAreaIdInput('');
                    setTruckIdInput('');
                    setCreateError('');
                  }}
                  disabled={creating}
                >
                  {t('actions.cancel')}
                </Button>
                <Button
                  disabled={creating}
                  onClick={async () => {
                    setCreateError('');
                    const hasArea = areaIdInput.trim().length > 0;
                    const hasTruck = truckIdInput.trim().length > 0;
                    if (!hasArea && !hasTruck) {
                      setCreateError(t('errors.createNeedAreaOrTruck'));
                      return;
                    }
                    if (hasArea && hasTruck) {
                      setCreateError(t('errors.createOnlyOne'));
                      return;
                    }
                    setCreating(true);
                    try {
                      const body: any = {
                        status: 'inactive',
                        type: 'sensor'
                      };
                      if (hasArea) body.area = { id: areaIdInput.trim() };
                      if (hasTruck) body.truck = { id: truckIdInput.trim() };
                      await createIoTDevice(body);
                      await loadDevices();
                      setIsCreateOpen(false);
                      setAreaIdInput('');
                      setTruckIdInput('');
                    } catch (e) {
                      setCreateError(t('errors.createFailed'));
                    } finally {
                      setCreating(false);
                    }
                  }}
                >
                  {creating ? t('actions.creating') : t('actions.create')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant='outline' onClick={loadDevices} disabled={isLoading}>
            <IconRefresh
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            {t('actions.refresh')}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
        <Card className='border-2 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10'>
          <CardHeader className='pb-3'>
            <CardDescription className='text-blue-700 dark:text-blue-400'>
              {t('stats.totalDevices')}
            </CardDescription>
            <CardTitle className='text-3xl font-bold text-blue-900 dark:text-blue-100'>
              {isLoading ? (
                <div className='h-8 w-16 animate-pulse rounded bg-blue-200 dark:bg-blue-800' />
              ) : (
                stats.total
              )}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className='border-2 bg-gradient-to-br from-green-50 to-emerald-100/50 dark:from-green-950/20 dark:to-emerald-900/10'>
          <CardHeader className='pb-3'>
            <CardDescription className='text-green-700 dark:text-green-400'>
              {t('stats.online')}
            </CardDescription>
            <CardTitle className='text-3xl font-bold text-green-900 dark:text-green-100'>
              {isLoading ? (
                <div className='h-8 w-16 animate-pulse rounded bg-green-200 dark:bg-green-800' />
              ) : (
                stats.online
              )}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className='border-2 bg-gradient-to-br from-gray-50 to-slate-100/50 dark:from-gray-950/20 dark:to-slate-900/10'>
          <CardHeader className='pb-3'>
            <CardDescription className='text-gray-700 dark:text-gray-400'>
              {t('stats.offline')}
            </CardDescription>
            <CardTitle className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
              {isLoading ? (
                <div className='h-8 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800' />
              ) : (
                stats.offline
              )}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className='border-2 bg-gradient-to-br from-yellow-50 to-amber-100/50 dark:from-yellow-950/20 dark:to-amber-900/10'>
          <CardHeader className='pb-3'>
            <CardDescription className='text-yellow-700 dark:text-yellow-400'>
              {t('stats.warning')}
            </CardDescription>
            <CardTitle className='text-3xl font-bold text-yellow-900 dark:text-yellow-100'>
              {isLoading ? (
                <div className='h-8 w-16 animate-pulse rounded bg-yellow-200 dark:bg-yellow-800' />
              ) : (
                stats.warning
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='flex flex-1 items-center space-x-2'>
              <div className='relative flex-1'>
                <IconSearch className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
                <Input
                  placeholder={t('filters.searchPlaceholder')}
                  className='pl-8'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder={t('filters.statusPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>{t('filters.allStatus')}</SelectItem>
                  <SelectItem value='online'>{t('status.online')}</SelectItem>
                  <SelectItem value='offline'>{t('status.offline')}</SelectItem>
                  <SelectItem value='warning'>{t('status.warning')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Device Grid */}
      {isLoading ? (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <div className='border-primary mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
            <p className='text-muted-foreground'>{t('stats.loading')}</p>
          </CardContent>
        </Card>
      ) : filteredDevices.length === 0 ? (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <IconSearch className='text-muted-foreground mb-4 h-12 w-12' />
            <h3 className='mb-2 text-lg font-semibold'>{t('empty.title')}</h3>
            <p className='text-muted-foreground mb-4'>
              {t('empty.description')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {filteredDevices.map((device) => {
            const IconComponent = getDeviceIcon(device.type);
            return (
              <Card
                key={device.id}
                className={`transition-all hover:shadow-lg ${
                  device.status === 'warning'
                    ? 'border-yellow-300'
                    : device.status === 'online'
                      ? 'border-green-300'
                      : 'border-gray-200'
                }`}
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div
                        className={`rounded-lg p-2 ${
                          device.status === 'online'
                            ? 'bg-green-100'
                            : device.status === 'warning'
                              ? 'bg-yellow-100'
                              : 'bg-gray-100'
                        }`}
                      >
                        <IconComponent
                          className={`h-5 w-5 ${getStatusColor(device.status)}`}
                        />
                      </div>
                      <div>
                        <CardTitle className='text-lg'>{device.id}</CardTitle>
                        <div className='text-muted-foreground text-xs'>
                          {device.type}
                        </div>
                      </div>
                    </div>
                    {(() => {
                      const s = device.status;
                      switch (s) {
                        case 'online':
                          return (
                            <Badge className='bg-green-100 text-green-800'>
                              {t('status.online')}
                            </Badge>
                          );
                        case 'warning':
                          return (
                            <Badge className='bg-yellow-100 text-yellow-800'>
                              {t('status.warning')}
                            </Badge>
                          );
                        case 'offline':
                          return (
                            <Badge className='bg-gray-100 text-gray-800'>
                              {t('status.offline')}
                            </Badge>
                          );
                        default:
                          return (
                            <Badge className='bg-gray-100 text-gray-800'>
                              {t('status.unknown')}
                            </Badge>
                          );
                      }
                    })()}
                  </div>
                </CardHeader>

                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-2 gap-3'>
                    {(() => {
                      const r = parseDeviceData(device);
                      return (
                        <>
                          <div className='rounded-lg border-2 border-blue-200 bg-blue-50/50 p-3 text-center dark:border-blue-800 dark:bg-blue-950/20'>
                            <div className='mb-1 flex items-center justify-center'>
                              <IconTemperature className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                            </div>
                            <div className='text-muted-foreground mb-1 text-xs'>
                              {t('labels.temperature')}
                            </div>
                            <div className='text-xl font-bold text-blue-700 dark:text-blue-300'>
                              {r.temperature != null
                                ? `${r.temperature}°C`
                                : '--'}
                            </div>
                          </div>
                          <div className='rounded-lg border-2 border-cyan-200 bg-cyan-50/50 p-3 text-center dark:border-cyan-800 dark:bg-cyan-950/20'>
                            <div className='mb-1 flex items-center justify-center'>
                              <IconDroplet className='h-4 w-4 text-cyan-600 dark:text-cyan-400' />
                            </div>
                            <div className='text-muted-foreground mb-1 text-xs'>
                              {t('labels.humidity')}
                            </div>
                            <div className='text-xl font-bold text-cyan-700 dark:text-cyan-300'>
                              {r.humidity != null ? `${r.humidity}%` : '--'}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <Separator />
                  <div className='space-y-2'>
                    <div className='text-muted-foreground flex items-center justify-between text-xs'>
                      <span>{t('labels.updated')}:</span>
                      <span className='font-medium'>
                        {formatLastUpdate(device.lastDataTime)}
                      </span>
                    </div>
                    <div className='text-muted-foreground flex items-center justify-between text-xs'>
                      <span>{t('labels.location')}:</span>
                      <span className='font-medium'>
                        {device.truckId
                          ? `${t('labels.truckPrefix')} ${device.truckId.slice(0, 8)}...`
                          : device.areaId
                            ? `${t('labels.areaPrefix')} ${device.areaId.slice(0, 8)}...`
                            : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      className='flex-1'
                      onClick={() => refreshDevice(device.id)}
                    >
                      <IconRefresh className='mr-1 h-3 w-3' />
                      {t('actions.refresh')}
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => setSelectedDevice(device)}
                        >
                          <IconEye className='mr-1 h-3 w-3' />
                          {t('actions.details')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className='max-w-2xl'>
                        <DialogHeader>
                          <div>
                            <DialogTitle>
                              {t('dialog.detailsTitle', {
                                id: selectedDevice?.id ?? ''
                              })}
                            </DialogTitle>
                          </div>
                        </DialogHeader>

                        {selectedDevice && (
                          <div className='space-y-6'>
                            {/* Device Info */}
                            <div className='grid gap-4 md:grid-cols-2'>
                              <div className='space-y-2'>
                                <Label>{t('detail.status')}</Label>
                                {(() => {
                                  const s = selectedDevice.status;
                                  switch (s) {
                                    case 'online':
                                      return (
                                        <Badge className='bg-green-100 text-green-800'>
                                          {t('status.online')}
                                        </Badge>
                                      );
                                    case 'warning':
                                      return (
                                        <Badge className='bg-yellow-100 text-yellow-800'>
                                          {t('status.warning')}
                                        </Badge>
                                      );
                                    case 'offline':
                                      return (
                                        <Badge className='bg-gray-100 text-gray-800'>
                                          {t('status.offline')}
                                        </Badge>
                                      );
                                    default:
                                      return (
                                        <Badge className='bg-gray-100 text-gray-800'>
                                          {t('status.unknown')}
                                        </Badge>
                                      );
                                  }
                                })()}
                              </div>
                              <div className='space-y-2'>
                                <Label>{t('detail.currentValues')}</Label>
                                {(() => {
                                  const r = parseDeviceData(selectedDevice);
                                  return (
                                    <div className='grid grid-cols-2 gap-3'>
                                      <div className='rounded-lg border p-3 text-center'>
                                        <div className='text-muted-foreground text-xs'>
                                          {t('labels.temperature')}
                                        </div>
                                        <div className='text-2xl font-bold'>
                                          {r.temperature != null
                                            ? `${r.temperature}°C`
                                            : '--'}
                                        </div>
                                      </div>
                                      <div className='rounded-lg border p-3 text-center'>
                                        <div className='text-muted-foreground text-xs'>
                                          {t('labels.humidity')}
                                        </div>
                                        <div className='text-2xl font-bold'>
                                          {r.humidity != null
                                            ? `${r.humidity}%`
                                            : '--'}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                              <div className='space-y-2'>
                                <Label>{t('detail.lastUpdate')}</Label>
                                <p>
                                  {formatLastUpdate(
                                    selectedDevice.lastDataTime
                                  )}
                                </p>
                              </div>
                            </div>

                            <Separator />
                            <div className='space-y-4'>
                              <div className='grid gap-4 md:grid-cols-2'>
                                <div className='space-y-2'>
                                  <Label>{t('edit.areaId')}</Label>
                                  <Input
                                    placeholder={t('edit.areaPlaceholder')}
                                    value={editAreaIdInput}
                                    onChange={(e) => {
                                      setEditAreaIdInput(e.target.value);
                                      if (e.target.value)
                                        setEditTruckIdInput('');
                                    }}
                                  />
                                  <p className='text-muted-foreground text-xs'>
                                    {t('edit.hintForTruck')}
                                  </p>
                                </div>
                                <div className='space-y-2'>
                                  <Label>{t('edit.truckId')}</Label>
                                  <Input
                                    placeholder={t('edit.truckPlaceholder')}
                                    value={editTruckIdInput}
                                    onChange={(e) => {
                                      setEditTruckIdInput(e.target.value);
                                      if (e.target.value)
                                        setEditAreaIdInput('');
                                    }}
                                  />
                                  <p className='text-muted-foreground text-xs'>
                                    {t('edit.hintForArea')}
                                  </p>
                                </div>
                              </div>
                              {updateError && (
                                <div className='rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700'>
                                  {updateError}
                                </div>
                              )}
                              <div className='flex items-center justify-end gap-2'>
                                <Button
                                  variant='outline'
                                  onClick={() => {
                                    setEditAreaIdInput('');
                                    setEditTruckIdInput('');
                                    setUpdateError('');
                                  }}
                                  disabled={updating}
                                >
                                  {t('actions.clearInput')}
                                </Button>
                                <Button
                                  onClick={async () => {
                                    const hasArea = !!editAreaIdInput.trim();
                                    const hasTruck = !!editTruckIdInput.trim();
                                    if (hasArea && hasTruck) {
                                      setUpdateError(t('errors.updateOnlyOne'));
                                      return;
                                    }
                                    if (!hasArea && !hasTruck) {
                                      setUpdateError(t('errors.updateNeed'));
                                      return;
                                    }
                                    setUpdating(true);
                                    try {
                                      const body: any = {};
                                      if (hasArea)
                                        body.area = {
                                          id: editAreaIdInput.trim()
                                        };
                                      if (hasTruck)
                                        body.truck = {
                                          id: editTruckIdInput.trim()
                                        };
                                      await updateIoTDevice(
                                        selectedDevice.id,
                                        body
                                      );
                                      const refreshed =
                                        await fetchIoTDeviceById(
                                          selectedDevice.id
                                        );
                                      setDevices((prev) =>
                                        prev.map((d) =>
                                          d.id === selectedDevice.id
                                            ? {
                                                ...d,
                                                areaId: String(
                                                  (refreshed as any)?.area
                                                    ?.id ?? ''
                                                ),
                                                truckId: String(
                                                  (refreshed as any)?.truck
                                                    ?.id ?? ''
                                                ),
                                                lastDataTime: String(
                                                  (refreshed as any)
                                                    ?.lastDataTime ??
                                                    d.lastDataTime
                                                ),
                                                data:
                                                  (refreshed as any)?.data ??
                                                  d.data
                                              }
                                            : d
                                        )
                                      );
                                      setUpdateError('');
                                      setEditAreaIdInput('');
                                      setEditTruckIdInput('');
                                    } catch (e) {
                                      setUpdateError(t('errors.updateFailed'));
                                    } finally {
                                      setUpdating(false);
                                    }
                                  }}
                                  disabled={updating}
                                >
                                  {updating
                                    ? t('actions.updating')
                                    : t('actions.updateLocation')}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

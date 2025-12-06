'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  createIoTDevice,
  fetchIoTDeviceById,
  fetchIoTDevices,
  subscribeIoTDataUpdates,
  subscribeIoTDeviceUpdates
} from '@/services/iotdevice.service';
import { IconEye, IconRefresh, IconTemperature } from '@tabler/icons-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useEffect, useState } from 'react';

type UIIoTDevice = {
  truckId: string;
  areaId: string;
  id: string;
  type: string;
  status: 'online' | 'offline' | 'warning' | 'error';
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
  if (v === 'error') return 'error';
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
    case 'error':
      return 'text-red-500';
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
    case 'error':
      return <Badge className='bg-red-100 text-red-800'>Lỗi</Badge>;
    case 'offline':
      return <Badge className='bg-gray-100 text-gray-800'>Offline</Badge>;
    default:
      return (
        <Badge className='bg-gray-100 text-gray-800'>Không xác định</Badge>
      );
  }
};

export function IoTDeviceManagement() {
  const [devices, setDevices] = useState<UIIoTDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<UIIoTDevice | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [areaIdInput, setAreaIdInput] = useState('');
  const [truckIdInput, setTruckIdInput] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const loadDevices = async () => {
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
    } catch {}
  };

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeIoTDeviceUpdates((payload) => {
      setDevices((prev) => {
        const pId = String(payload.id ?? payload.deviceId ?? '').trim();
        const idx = prev.findIndex((d) => d.id === pId);
        const next: UIIoTDevice = {
          truckId: (payload as any)?.truck?.id || (prev[idx]?.truckId ?? ''),
          areaId: (payload as any)?.area?.id || (prev[idx]?.areaId ?? ''),
          id: pId || (prev[idx]?.id ?? ''),
          type: String(payload.type ?? prev[idx]?.type ?? 'sensor'),
          status: toUiStatus(payload.status) ?? prev[idx]?.status ?? 'offline',
          lastDataTime: String(
            (payload as any)?.lastDataTime ?? prev[idx]?.lastDataTime ?? ''
          ).trim(),
          data: (payload as any)?.data ?? prev[idx]?.data ?? null
        };
        if (idx >= 0) {
          const copy = prev.slice();
          copy[idx] = next;
          return copy;
        }
        return [next, ...prev];
      });
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeIoTDataUpdates((payload) => {
      setDevices((prev) => {
        const pId = String(payload.id ?? payload.deviceId ?? '').trim();
        if (!pId) return prev;
        return prev.map((d) =>
          d.id === pId
            ? {
                ...d,
                lastDataTime: String(
                  (payload as any)?.lastDataTime ?? d.lastDataTime
                ),
                data: (payload as any)?.data ?? d.data
              }
            : d
        );
      });
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      loadDevices();
    }, 10000);
    return () => clearInterval(timer);
  }, []);

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
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-3xl font-bold tracking-tight'>
            Quản lý thiết bị IoT
          </h2>
          <p className='text-muted-foreground'>
            Giám sát và điều khiển các thiết bị IoT trong kho
          </p>
        </div>
        <div className='flex gap-2'>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>Thêm thiết bị</Button>
            </DialogTrigger>
            <DialogContent className='max-w-md'>
              <DialogHeader>
                <DialogTitle>Thêm thiết bị IoT</DialogTitle>
              </DialogHeader>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label>Area ID</Label>
                  <Input
                    placeholder='Ví dụ: AREA_0001'
                    value={areaIdInput}
                    onChange={(e) => {
                      setAreaIdInput(e.target.value);
                      if (e.target.value) setTruckIdInput('');
                    }}
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Truck ID</Label>
                  <Input
                    placeholder='Ví dụ: TRUCK_0001'
                    value={truckIdInput}
                    onChange={(e) => {
                      setTruckIdInput(e.target.value);
                      if (e.target.value) setAreaIdInput('');
                    }}
                  />
                </div>
                {createError && (
                  <p className='text-sm text-red-600'>{createError}</p>
                )}
                <div className='flex justify-end gap-2'>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setIsCreateOpen(false);
                      setAreaIdInput('');
                      setTruckIdInput('');
                      setCreateError('');
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    disabled={creating}
                    onClick={async () => {
                      setCreateError('');
                      const hasArea = areaIdInput.trim().length > 0;
                      const hasTruck = truckIdInput.trim().length > 0;
                      if (!hasArea && !hasTruck) {
                        setCreateError('Cần nhập Area ID hoặc Truck ID');
                        return;
                      }
                      if (hasArea && hasTruck) {
                        setCreateError(
                          'Chỉ được chọn một trong Area hoặc Truck'
                        );
                        return;
                      }
                      setCreating(true);
                      try {
                        const body: any = {
                          status: 'active',
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
                        setCreateError('Tạo thiết bị thất bại');
                      } finally {
                        setCreating(false);
                      }
                    }}
                  >
                    Tạo thiết bị
                  </Button>
                </div>
              </div>
            </DialogContent>{' '}
          </Dialog>
          <Button variant='outline' onClick={loadDevices}>
            <IconRefresh className='mr-2 h-4 w-4' />
            Làm mới tất cả
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className='flex items-center gap-4'>
        <div className='flex-1'>
          <Input
            placeholder='Tìm kiếm thiết bị...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Device Grid */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {devices.map((device) => {
          const IconComponent = getDeviceIcon(device.type);
          return (
            <Card
              key={device.id}
              className={`transition-all hover:shadow-lg ${
                device.status === 'warning'
                  ? 'border-yellow-300'
                  : device.status === 'error'
                    ? 'border-red-300'
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
                            : device.status === 'error'
                              ? 'bg-red-100'
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
                  {getStatusBadge(device.status)}
                </div>
              </CardHeader>

              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  {(() => {
                    const r = parseDeviceData(device);
                    return (
                      <>
                        <div className='rounded-lg border p-3 text-center'>
                          <div className='text-muted-foreground text-xs'>
                            Nhiệt độ
                          </div>
                          <div className='text-2xl font-bold'>
                            {r.temperature != null
                              ? `${r.temperature}°C`
                              : '--'}
                          </div>
                        </div>
                        <div className='rounded-lg border p-3 text-center'>
                          <div className='text-muted-foreground text-xs'>
                            Độ ẩm
                          </div>
                          <div className='text-2xl font-bold'>
                            {r.humidity != null ? `${r.humidity}%` : '--'}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <div className='text-muted-foreground flex items-center justify-between text-xs'>
                  <div>Cập nhật: {formatLastUpdate(device.lastDataTime)}</div>
                  <div>
                    {device.truckId
                      ? `Truck ${device.truckId}`
                      : device.areaId
                        ? `Area ${device.areaId}`
                        : ''}
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
                    Làm mới
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => setSelectedDevice(device)}
                      >
                        <IconEye className='mr-1 h-3 w-3' />
                        Chi tiết
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='max-w-2xl'>
                      <DialogHeader>
                        <div>
                          <DialogTitle>
                            Chi tiết thiết bị {selectedDevice?.id}
                          </DialogTitle>
                        </div>
                      </DialogHeader>

                      {selectedDevice && (
                        <div className='space-y-6'>
                          {/* Device Info */}
                          <div className='grid gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                              <Label>Trạng thái</Label>
                              {getStatusBadge(selectedDevice.status)}
                            </div>
                            <div className='space-y-2'>
                              <Label>Giá trị hiện tại</Label>
                              {(() => {
                                const r = parseDeviceData(selectedDevice);
                                return (
                                  <div className='grid grid-cols-2 gap-3'>
                                    <div className='rounded-lg border p-3 text-center'>
                                      <div className='text-muted-foreground text-xs'>
                                        Nhiệt độ
                                      </div>
                                      <div className='text-2xl font-bold'>
                                        {r.temperature != null
                                          ? `${r.temperature}°C`
                                          : '--'}
                                      </div>
                                    </div>
                                    <div className='rounded-lg border p-3 text-center'>
                                      <div className='text-muted-foreground text-xs'>
                                        Độ ẩm
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
                              <Label>Cập nhật lần cuối</Label>
                              <p>
                                {formatLastUpdate(selectedDevice.lastDataTime)}
                              </p>
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
    </div>
  );
}

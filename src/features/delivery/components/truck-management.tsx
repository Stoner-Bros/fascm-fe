'use client';

import { useMemo, useState } from 'react';
import { Truck } from '@/types/delivery';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  IconTruck,
  IconCpu,
  IconMapPin,
  IconActivity,
  IconUsers,
  IconWeight,
  IconCube,
  IconGasStation
} from '@tabler/icons-react';

const mockTrucks: Truck[] = [
  {
    id: 'TRUCK-001',
    licenseNumber: 'HY-29A-12345',
    model: 'Hyundai H350 Refrigerated',
    capacity: 2000,
    maxWeight: 2500,
    volume: 15.5,
    fuelType: 'diesel',
    status: 'available',
    gpsDevice: {
      deviceId: 'GPS-001',
      isActive: true,
      lastUpdate: new Date().toISOString()
    },
    environmentSensors: {
      temperatureSensorId: 'TEMP-001',
      humiditySensorId: 'HUM-001',
      isActive: true,
      lastUpdate: new Date().toISOString()
    },
    transportStaff: [
      {
        id: 'STAFF-001',
        name: 'Nguyễn Văn A',
        phone: '0987654321',
        role: 'driver',
        licenseNumber: 'B2-123456789',
        experience: 5
      }
    ],
    registrationExpiry: '2025-12-31'
  },
  {
    id: 'TRUCK-002',
    licenseNumber: 'HN-30B-67890',
    model: 'Isuzu NPR Cooler Truck',
    capacity: 1500,
    maxWeight: 2000,
    volume: 12.0,
    fuelType: 'diesel',
    status: 'maintenance',
    gpsDevice: {
      deviceId: 'GPS-002',
      isActive: true,
      lastUpdate: new Date().toISOString()
    },
    environmentSensors: {
      temperatureSensorId: 'TEMP-002',
      humiditySensorId: 'HUM-002',
      isActive: false,
      lastUpdate: new Date().toISOString()
    },
    transportStaff: [
      {
        id: 'STAFF-003',
        name: 'Lê Văn C',
        phone: '0965432109',
        role: 'driver',
        licenseNumber: 'C-987654321',
        experience: 8
      }
    ],
    registrationExpiry: '2025-08-15'
  },
  {
    id: 'TRUCK-003',
    licenseNumber: 'SG-51C-11223',
    model: 'Hino 500 Series',
    capacity: 5000,
    maxWeight: 6500,
    volume: 25.2,
    fuelType: 'diesel',
    status: 'in_use',
    gpsDevice: {
      deviceId: 'GPS-010',
      isActive: true,
      lastUpdate: new Date().toISOString()
    },
    environmentSensors: {
      temperatureSensorId: 'TEMP-010',
      humiditySensorId: 'HUM-010',
      isActive: true,
      lastUpdate: new Date().toISOString()
    },
    transportStaff: [],
    registrationExpiry: '2026-02-10'
  }
];

function StatusBadge({ status }: { status: Truck['status'] }) {
  switch (status) {
    case 'available':
      return (
        <Badge className='border-green-200 bg-green-100 text-green-700'>
          Sẵn sàng
        </Badge>
      );
    case 'in_use':
      return (
        <Badge className='border-blue-200 bg-blue-100 text-blue-700'>
          Đang sử dụng
        </Badge>
      );
    case 'maintenance':
      return (
        <Badge className='border-yellow-200 bg-yellow-100 text-yellow-700'>
          Bảo trì
        </Badge>
      );
    case 'out_of_service':
      return (
        <Badge className='border-red-200 bg-red-100 text-red-700'>
          Ngừng hoạt động
        </Badge>
      );
    default:
      return null;
  }
}

export function TruckManagement() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | Truck['status']>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const trucks = mockTrucks;

  const filtered = useMemo(() => {
    return trucks.filter((t) => {
      const matchText =
        t.licenseNumber.toLowerCase().includes(search.toLowerCase()) ||
        t.model.toLowerCase().includes(search.toLowerCase());
      const matchStatus = status === 'all' || t.status === status;
      return matchText && matchStatus;
    });
  }, [trucks, search, status]);

  const selected = trucks.find((t) => t.id === openId);

  return (
    <>
      <div className='w-full space-y-6'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <Input
            placeholder='Tìm theo biển số, model...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='max-w-sm'
          />
          <Select value={status} onValueChange={(v) => setStatus(v as any)}>
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='Trạng thái' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>Tất cả</SelectItem>
              <SelectItem value='available'>Sẵn sàng</SelectItem>
              <SelectItem value='in_use'>Đang sử dụng</SelectItem>
              <SelectItem value='maintenance'>Bảo trì</SelectItem>
              <SelectItem value='out_of_service'>Ngừng hoạt động</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {filtered.map((t) => (
            <Card
              key={t.id}
              className='cursor-pointer transition hover:shadow-md'
              onClick={() => setOpenId(t.id)}
            >
              <CardHeader className='pb-2'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='flex items-center gap-2 text-lg font-semibold'>
                    <IconTruck className='h-4 w-4' />
                    {t.licenseNumber}
                  </CardTitle>
                  <StatusBadge status={t.status} />
                </div>
                <CardDescription>{t.model}</CardDescription>
              </CardHeader>
              <CardContent className='grid grid-cols-2 gap-3 text-sm'>
                <div className='flex items-center gap-1'>
                  <IconWeight className='h-4 w-4' /> {t.capacity}kg
                </div>
                <div className='flex items-center gap-1'>
                  <IconCube className='h-4 w-4' /> {t.volume}m³
                </div>
                <div className='flex items-center gap-1'>
                  <IconGasStation className='h-4 w-4' /> {t.fuelType}
                </div>
                <div className='flex items-center gap-1'>
                  <IconUsers className='h-4 w-4' /> {t.transportStaff.length}{' '}
                  nhân viên
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Dialog open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className='max-w-[95vw] sm:max-w-3xl'>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-2'>
                  <IconTruck className='h-5 w-5' /> {selected.licenseNumber}
                </DialogTitle>
                <DialogDescription>{selected.model}</DialogDescription>
              </DialogHeader>

              <div className='grid gap-4 md:grid-cols-2'>
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm'>Thông tin cơ bản</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-2 text-sm'>
                    <div>
                      <span className='font-medium'>Model:</span>{' '}
                      {selected.model}
                    </div>
                    <div>
                      <span className='font-medium'>Tải trọng:</span>{' '}
                      {selected.capacity}kg
                    </div>
                    <div>
                      <span className='font-medium'>Giới hạn:</span>{' '}
                      {selected.maxWeight}kg
                    </div>
                    <div>
                      <span className='font-medium'>Thể tích:</span>{' '}
                      {selected.volume}m³
                    </div>
                    <div>
                      <span className='font-medium'>Nhiên liệu:</span>{' '}
                      {selected.fuelType}
                    </div>
                    <div>
                      <span className='font-medium'>Đăng kiểm:</span>{' '}
                      {selected.registrationExpiry}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm'>Thiết bị IoT</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3 text-sm'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <IconCpu className='h-4 w-4' /> GPS:{' '}
                        {selected.gpsDevice.deviceId}
                      </div>
                      <Badge
                        variant='outline'
                        className={
                          selected.gpsDevice.isActive
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-50 text-gray-700'
                        }
                      >
                        {selected.gpsDevice.isActive
                          ? 'Hoạt động'
                          : 'Không hoạt động'}
                      </Badge>
                    </div>
                    <div className='text-muted-foreground text-xs'>
                      Cập nhật:{' '}
                      {new Date(selected.gpsDevice.lastUpdate).toLocaleString(
                        'vi-VN'
                      )}
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <IconActivity className='h-4 w-4' /> Nhiệt độ:{' '}
                        {selected.environmentSensors.temperatureSensorId}
                      </div>
                      <Badge
                        variant='outline'
                        className={
                          selected.environmentSensors.isActive
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-50 text-gray-700'
                        }
                      >
                        {selected.environmentSensors.isActive
                          ? 'Hoạt động'
                          : 'Không hoạt động'}
                      </Badge>
                    </div>
                    <div className='text-muted-foreground flex items-center gap-2 text-xs'>
                      <IconMapPin className='h-3 w-3' /> Độ ẩm:{' '}
                      {selected.environmentSensors.humiditySensorId}
                    </div>
                    <div className='text-muted-foreground text-xs'>
                      Cập nhật:{' '}
                      {new Date(
                        selected.environmentSensors.lastUpdate
                      ).toLocaleString('vi-VN')}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className='grid gap-4'>
                <Card>
                  <CardHeader className='pb-2'>
                    <CardTitle className='text-sm'>
                      Nhân viên vận chuyển
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-2 text-sm'>
                    {selected.transportStaff.length === 0 ? (
                      <div className='text-muted-foreground'>
                        Chưa có nhân viên
                      </div>
                    ) : (
                      selected.transportStaff.map((s) => (
                        <div
                          key={s.id}
                          className='grid grid-cols-1 gap-2 sm:grid-cols-4'
                        >
                          <div className='font-medium'>{s.name}</div>
                          <div>{s.phone}</div>
                          <div>Vai trò: {s.role}</div>
                          <div>KN: {s.experience} năm</div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className='flex justify-end'>
                <Button variant='outline' onClick={() => setOpenId(null)}>
                  Đóng
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TruckManagement;

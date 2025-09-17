'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  IconActivity,
  IconAlertTriangle,
  IconClock,
  IconDroplet,
  IconEye,
  IconMapPin,
  IconRefresh,
  IconRoute,
  IconSettings,
  IconTemperature,
  IconTruck,
  IconGps
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DeliveryViewProps {
  className?: string;
}

interface Container {
  id: string;
  name: string;
  route: string;
  vehicle: string;
  driver: string;
  cargo: string;
  gpsLocation: string;
  locationName: string;
  progress: number;
  estimatedArrival: string;
  status: 'in_transit' | 'delivered' | 'delayed' | 'pending';
  temperature: number;
  humidity: number;
  lastUpdate: string;
  deliveryOrder: string;
  customer: string;
  departureTime: string;
}

function DeliveryView({ className }: DeliveryViewProps) {
  const [realTimeData, setRealTimeData] = useState(
    new Date().toLocaleTimeString()
  );
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());

  // Mock data for delivery containers
  const [containersData, setContainersData] = useState<Container[]>([
    {
      id: 'CNT-001',
      name: 'Container CNT-001',
      route: 'Hà Nội → TP.HCM',
      vehicle: 'Xe tải VN-29A-12345',
      driver: 'Nguyễn Văn A',
      cargo: 'Rau lá tươi (500kg)',
      gpsLocation: '21.0285, 105.8542',
      locationName: 'Cao tốc Hà Nội - Hải Phòng',
      progress: 35,
      estimatedArrival: '14:30 hôm nay',
      status: 'in_transit',
      temperature: 4.2,
      humidity: 65,
      lastUpdate: '2 phút trước',
      deliveryOrder: 'ORD-2024-001',
      customer: 'Siêu thị BigC',
      departureTime: '08:00 sáng nay'
    },
    {
      id: 'CNT-002',
      name: 'Container CNT-002',
      route: 'Đà Nẵng → Hà Nội',
      vehicle: 'Xe tải DN-30B-67890',
      driver: 'Trần Văn B',
      cargo: 'Hải sản đông lạnh (300kg)',
      gpsLocation: '16.4637, 107.5909',
      locationName: 'Quốc lộ 1A - Huế',
      progress: 65,
      estimatedArrival: '10:15 ngày mai',
      status: 'in_transit',
      temperature: -2.1,
      humidity: 45,
      lastUpdate: '1 phút trước',
      deliveryOrder: 'ORD-2024-002',
      customer: 'Nhà hàng Hải Sản Tươi',
      departureTime: '06:30 sáng nay'
    },
    {
      id: 'CNT-003',
      name: 'Container CNT-003',
      route: 'TP.HCM → Cần Thơ',
      vehicle: 'Xe tải SG-51C-11111',
      driver: 'Lê Văn C',
      cargo: 'Thực phẩm khô (800kg)',
      gpsLocation: '10.8231, 106.6297',
      locationName: 'Đường Nguyễn Văn Linh',
      progress: 100,
      estimatedArrival: '12:00 hôm nay',
      status: 'delivered',
      temperature: 25.5,
      humidity: 55,
      lastUpdate: '30 phút trước',
      deliveryOrder: 'ORD-2024-003',
      customer: 'Kho bãi Miền Tây',
      departureTime: '05:00 sáng nay'
    },
    {
      id: 'CNT-004',
      name: 'Container CNT-004',
      route: 'Hải Phòng → Hà Nội',
      vehicle: 'Xe tải HP-14D-22222',
      driver: 'Phạm Văn D',
      cargo: 'Điện tử (200kg)',
      gpsLocation: '20.8449, 106.6881',
      locationName: 'Cầu Chương Dương',
      progress: 15,
      estimatedArrival: '16:45 hôm nay',
      status: 'delayed',
      temperature: 22.0,
      humidity: 60,
      lastUpdate: '5 phút trước',
      deliveryOrder: 'ORD-2024-004',
      customer: 'Cửa hàng điện máy ABC',
      departureTime: '09:15 sáng nay'
    }
  ]);

  // Real-time data simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(new Date().toLocaleTimeString());
      setLastUpdateTime(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: Container['status']) => {
    switch (status) {
      case 'in_transit':
        return (
          <Badge className='border-blue-200 bg-blue-100 text-blue-700'>
            Đang vận chuyển
          </Badge>
        );
      case 'delivered':
        return (
          <Badge className='border-green-200 bg-green-100 text-green-700'>
            Đã giao
          </Badge>
        );
      case 'delayed':
        return (
          <Badge className='border-red-200 bg-red-100 text-red-700'>
            Chậm trễ
          </Badge>
        );
      case 'pending':
        return (
          <Badge className='border-yellow-200 bg-yellow-100 text-yellow-700'>
            Chờ xử lý
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTemperatureStatus = (temp: number, cargo: string) => {
    if (cargo.includes('đông lạnh') || cargo.includes('hải sản')) {
      return temp < 0 ? 'normal' : 'warning';
    }
    if (cargo.includes('rau') || cargo.includes('tươi')) {
      return temp >= 2 && temp <= 8 ? 'normal' : 'warning';
    }
    return temp >= 15 && temp <= 30 ? 'normal' : 'warning';
  };

  const getHumidityStatus = (humidity: number) => {
    return humidity >= 40 && humidity <= 70 ? 'normal' : 'warning';
  };

  const activeContainers = containersData.filter(
    (container) =>
      container.status === 'in_transit' || container.status === 'delayed'
  );
  const deliveredContainers = containersData.filter(
    (container) => container.status === 'delivered'
  );
  const delayedContainers = containersData.filter(
    (container) => container.status === 'delayed'
  );

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='flex items-center gap-2 text-2xl font-bold'>
            <IconTruck className='h-6 w-6 text-blue-600' />
            Theo dõi Vận chuyển Container
          </h2>
          <p className='text-muted-foreground'>
            Giám sát trạng thái và vị trí của các đơn vận chuyển container theo
            thời gian thực
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm'>
            <IconRefresh className='mr-2 h-4 w-4' /> Làm mới
          </Button>
          <Button variant='outline' size='sm'>
            <IconSettings className='mr-2 h-4 w-4' /> Cài đặt
          </Button>
        </div>
      </div>

      {/* Real-time Status */}
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2'>
            <div className='h-2 w-2 animate-pulse rounded-full bg-green-500'></div>
            <Badge
              variant='outline'
              className='border-green-200 bg-green-50 text-green-700'
            >
              LIVE
            </Badge>
            <span className='text-muted-foreground text-sm'>
              Cập nhật: {realTimeData}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Tổng Container
            </CardTitle>
            <IconTruck className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{containersData.length}</div>
            <p className='text-muted-foreground text-xs'>
              containers đang quản lý
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Đang vận chuyển
            </CardTitle>
            <IconRoute className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {activeContainers.length}
            </div>
            <p className='text-muted-foreground text-xs'>
              containers trên đường
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Đã giao thành công
            </CardTitle>
            <IconActivity className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {deliveredContainers.length}
            </div>
            <p className='text-muted-foreground text-xs'>hoàn thành hôm nay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Chậm trễ</CardTitle>
            <IconAlertTriangle className='h-4 w-4 text-red-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {delayedContainers.length}
            </div>
            <p className='text-muted-foreground text-xs'>cần xử lý gấp</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {delayedContainers.length > 0 && (
        <Card className='border-red-200 bg-red-50'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-red-700'>
              <IconAlertTriangle className='h-5 w-5' />
              Cảnh báo: Container chậm trễ
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            {delayedContainers.map((container) => (
              <div
                key={container.id}
                className='flex items-center justify-between rounded-lg bg-white p-3'
              >
                <div>
                  <p className='font-medium'>{container.name}</p>
                  <p className='text-muted-foreground text-sm'>
                    {container.route} - {container.customer}
                  </p>
                </div>
                <Link href={`/dashboard/delivery/${container.id}`}>
                  <Button size='sm' variant='outline'>
                    <IconEye className='mr-2 h-4 w-4' />
                    Xem chi tiết
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Container List */}
      <div className='space-y-4'>
        <h3 className='text-lg font-semibold'>Danh sách Container</h3>
        <div className='grid gap-6 md:grid-cols-1 lg:grid-cols-2'>
          {containersData.map((container) => (
            <Card
              key={container.id}
              className='cursor-pointer transition-shadow hover:shadow-md'
            >
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-lg'>{container.name}</CardTitle>
                  {getStatusBadge(container.status)}
                </div>
                <CardDescription>
                  Đơn hàng: {container.deliveryOrder} - {container.customer}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Route and Progress */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm'>
                    <IconRoute className='h-4 w-4' />
                    <span className='font-medium'>{container.route}</span>
                  </div>
                  <Progress value={container.progress} className='h-2' />
                  <div className='text-muted-foreground flex justify-between text-xs'>
                    <span>{container.progress}% hoàn thành</span>
                    <span>ETA: {container.estimatedArrival}</span>
                  </div>
                </div>

                {/* Location and Vehicle */}
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm'>
                    <IconMapPin className='h-4 w-4 text-red-500' />
                    <span>{container.locationName}</span>
                  </div>
                  <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                    <IconTruck className='h-4 w-4' />
                    <span>
                      {container.vehicle} - {container.driver}
                    </span>
                  </div>
                </div>

                {/* Cargo and Environmental Data */}
                <div className='space-y-2'>
                  <div className='text-sm'>
                    <span className='font-medium'>Hàng hóa:</span>{' '}
                    {container.cargo}
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='flex items-center gap-2'>
                      <IconTemperature
                        className={cn(
                          'h-4 w-4',
                          getTemperatureStatus(
                            container.temperature,
                            container.cargo
                          ) === 'normal'
                            ? 'text-green-500'
                            : 'text-red-500'
                        )}
                      />
                      <span className='text-sm'>{container.temperature}°C</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <IconDroplet
                        className={cn(
                          'h-4 w-4',
                          getHumidityStatus(container.humidity) === 'normal'
                            ? 'text-blue-500'
                            : 'text-orange-500'
                        )}
                      />
                      <span className='text-sm'>{container.humidity}%</span>
                    </div>
                  </div>
                </div>

                {/* GPS and Last Update */}
                <div className='text-muted-foreground flex items-center justify-between border-t pt-3 text-xs'>
                  <div className='flex items-center gap-1'>
                    <IconGps className='h-3 w-3' />
                    <span>{container.gpsLocation}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <IconClock className='h-3 w-3' />
                    <span>{container.lastUpdate}</span>
                  </div>
                </div>

                {/* Action Button */}
                <Link href={`/dashboard/delivery/${container.id}`}>
                  <Button className='mt-4 w-full' variant='outline'>
                    <IconEye className='mr-2 h-4 w-4' />
                    Xem chi tiết container
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export { DeliveryView };

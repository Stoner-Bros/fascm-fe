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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  IconActivity,
  IconAlertTriangle,
  IconArrowLeft,
  IconClock,
  IconDroplet,
  IconGps,
  IconMapPin,
  IconRefresh,
  IconRoute,
  IconTemperature,
  IconTruck,
  IconUser,
  IconPackage,
  IconCalendar,
  IconPhone,
  IconMail,
  IconBuilding
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DeliveryDetailProps {
  containerId: string;
}

interface ContainerDetail {
  id: string;
  name: string;
  route: string;
  vehicle: string;
  driver: string;
  driverPhone: string;
  driverEmail: string;
  cargo: string;
  cargoWeight: number;
  cargoValue: number;
  gpsLocation: string;
  locationName: string;
  progress: number;
  estimatedArrival: string;
  actualDeparture: string;
  status: 'in_transit' | 'delivered' | 'delayed' | 'pending';
  temperature: number;
  humidity: number;
  lastUpdate: string;
  deliveryOrder: string;
  customer: string;
  customerPhone: string;
  customerAddress: string;
  departureTime: string;
  deliveryHistory: {
    timestamp: string;
    location: string;
    status: string;
    description: string;
  }[];
  environmentalData: {
    timestamp: string;
    temperature: number;
    humidity: number;
    gpsLat: number;
    gpsLng: number;
  }[];
}

function DeliveryDetail({ containerId }: DeliveryDetailProps) {
  const router = useRouter();
  const [realTimeData, setRealTimeData] = useState(
    new Date().toLocaleTimeString()
  );

  // Mock data for container detail - in real app, this would be fetched based on containerId
  const [containerData, setContainerData] = useState<ContainerDetail>({
    id: containerId,
    name: `Container ${containerId}`,
    route: 'Hà Nội → TP.HCM',
    vehicle: 'Xe tải VN-29A-12345',
    driver: 'Nguyễn Văn A',
    driverPhone: '0912345678',
    driverEmail: 'nguyenvana@transport.com',
    cargo: 'Rau lá tươi (500kg)',
    cargoWeight: 500,
    cargoValue: 15000000,
    gpsLocation: '21.0285, 105.8542',
    locationName: 'Cao tốc Hà Nội - Hải Phòng',
    progress: 35,
    estimatedArrival: '14:30 hôm nay',
    actualDeparture: '08:00 sáng nay',
    status: 'in_transit',
    temperature: 4.2,
    humidity: 65,
    lastUpdate: '2 phút trước',
    deliveryOrder: 'ORD-2024-001',
    customer: 'Siêu thị BigC',
    customerPhone: '0987654321',
    customerAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    departureTime: '08:00 sáng nay',
    deliveryHistory: [
      {
        timestamp: '08:00 - 17/09/2024',
        location: 'Kho Hà Nội',
        status: 'departed',
        description: 'Container xuất phát từ kho Hà Nội'
      },
      {
        timestamp: '09:30 - 17/09/2024',
        location: 'Trạm dừng Phủ Lý',
        status: 'checkpoint',
        description: 'Kiểm tra an toàn và nhiên liệu'
      },
      {
        timestamp: '12:15 - 17/09/2024',
        location: 'Nghỉ trưa Ninh Bình',
        status: 'rest',
        description: 'Tài xế nghỉ trưa, kiểm tra hàng hóa'
      },
      {
        timestamp: '13:45 - 17/09/2024',
        location: 'Cao tốc Hà Nội - Hải Phòng',
        status: 'in_transit',
        description: 'Tiếp tục hành trình về phía Nam'
      }
    ],
    environmentalData: [
      {
        timestamp: '08:00',
        temperature: 4.5,
        humidity: 60,
        gpsLat: 21.0285,
        gpsLng: 105.8542
      },
      {
        timestamp: '09:00',
        temperature: 4.3,
        humidity: 62,
        gpsLat: 20.8449,
        gpsLng: 105.6881
      },
      {
        timestamp: '10:00',
        temperature: 4.1,
        humidity: 64,
        gpsLat: 20.5447,
        gpsLng: 105.9107
      },
      {
        timestamp: '11:00',
        temperature: 4.2,
        humidity: 65,
        gpsLat: 20.2506,
        gpsLng: 105.9761
      },
      {
        timestamp: '12:00',
        temperature: 4.4,
        humidity: 63,
        gpsLat: 19.9681,
        gpsLng: 105.8457
      },
      {
        timestamp: '13:00',
        temperature: 4.2,
        humidity: 65,
        gpsLat: 19.6769,
        gpsLng: 105.6905
      }
    ]
  });

  // Real-time data simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(new Date().toLocaleTimeString());

      // Simulate real-time updates
      setContainerData((prev) => ({
        ...prev,
        temperature: prev.temperature + (Math.random() - 0.5) * 0.2,
        humidity: Math.max(
          40,
          Math.min(80, prev.humidity + (Math.random() - 0.5) * 2)
        ),
        lastUpdate: 'Vừa xong'
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: ContainerDetail['status']) => {
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

  const getTemperatureStatus = (temp: number) => {
    if (
      containerData.cargo.includes('đông lạnh') ||
      containerData.cargo.includes('hải sản')
    ) {
      return temp < 0 ? 'normal' : 'warning';
    }
    if (
      containerData.cargo.includes('rau') ||
      containerData.cargo.includes('tươi')
    ) {
      return temp >= 2 && temp <= 8 ? 'normal' : 'warning';
    }
    return temp >= 15 && temp <= 30 ? 'normal' : 'warning';
  };

  const getHumidityStatus = (humidity: number) => {
    return humidity >= 40 && humidity <= 70 ? 'normal' : 'warning';
  };

  const getHistoryStatusIcon = (status: string) => {
    switch (status) {
      case 'departed':
        return <IconTruck className='h-4 w-4 text-blue-500' />;
      case 'checkpoint':
        return <IconMapPin className='h-4 w-4 text-orange-500' />;
      case 'rest':
        return <IconClock className='h-4 w-4 text-gray-500' />;
      case 'in_transit':
        return <IconRoute className='h-4 w-4 text-green-500' />;
      default:
        return <IconActivity className='h-4 w-4 text-gray-500' />;
    }
  };

  return (
    <div className='w-full space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='outline' size='sm' onClick={() => router.back()}>
            <IconArrowLeft className='mr-2 h-4 w-4' />
            Quay lại
          </Button>
          <div>
            <h1 className='flex items-center gap-2 text-2xl font-bold'>
              <IconTruck className='h-6 w-6 text-blue-600' />
              {containerData.name}
            </h1>
            <p className='text-muted-foreground'>
              Chi tiết container và thông tin vận chuyển
            </p>
          </div>
        </div>
        <div className='flex gap-2'>
          {getStatusBadge(containerData.status)}
          <Button variant='outline' size='sm'>
            <IconRefresh className='mr-2 h-4 w-4' />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Real-time Status */}
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

      {/* Main Content */}
      <div className='grid gap-6 lg:grid-cols-3'>
        {/* Left Column - Main Info */}
        <div className='space-y-6 lg:col-span-2'>
          {/* Route Progress */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconRoute className='h-5 w-5' />
                Tiến độ vận chuyển
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='font-medium'>{containerData.route}</span>
                <span className='text-muted-foreground text-sm'>
                  {containerData.progress}% hoàn thành
                </span>
              </div>
              <Progress value={containerData.progress} className='h-3' />
              <div className='text-muted-foreground flex justify-between text-sm'>
                <span>Xuất phát: {containerData.actualDeparture}</span>
                <span>Dự kiến đến: {containerData.estimatedArrival}</span>
              </div>
            </CardContent>
          </Card>

          {/* Environmental Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconActivity className='h-5 w-5' />
                Giám sát môi trường
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-6'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <IconTemperature
                      className={cn(
                        'h-5 w-5',
                        getTemperatureStatus(containerData.temperature) ===
                          'normal'
                          ? 'text-green-500'
                          : 'text-red-500'
                      )}
                    />
                    <span className='font-medium'>Nhiệt độ</span>
                  </div>
                  <div className='text-2xl font-bold'>
                    {containerData.temperature.toFixed(1)}°C
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    {getTemperatureStatus(containerData.temperature) ===
                    'normal'
                      ? 'Trong ngưỡng an toàn'
                      : 'Cảnh báo: Ngoài ngưỡng'}
                  </p>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <IconDroplet
                      className={cn(
                        'h-5 w-5',
                        getHumidityStatus(containerData.humidity) === 'normal'
                          ? 'text-blue-500'
                          : 'text-orange-500'
                      )}
                    />
                    <span className='font-medium'>Độ ẩm</span>
                  </div>
                  <div className='text-2xl font-bold'>
                    {Math.round(containerData.humidity)}%
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    {getHumidityStatus(containerData.humidity) === 'normal'
                      ? 'Trong ngưỡng an toàn'
                      : 'Cảnh báo: Ngoài ngưỡng'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for detailed information */}
          <Tabs defaultValue='history' className='w-full'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='history'>Lịch sử vận chuyển</TabsTrigger>
              <TabsTrigger value='environmental'>
                Dữ liệu môi trường
              </TabsTrigger>
              <TabsTrigger value='location'>Vị trí GPS</TabsTrigger>
            </TabsList>

            <TabsContent value='history' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Lịch sử di chuyển</CardTitle>
                  <CardDescription>
                    Theo dõi các điểm dừng và hoạt động của container
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {containerData.deliveryHistory.map((entry, index) => (
                      <div
                        key={index}
                        className='flex items-start gap-3 border-b pb-3 last:border-0'
                      >
                        <div className='mt-1'>
                          {getHistoryStatusIcon(entry.status)}
                        </div>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2'>
                            <span className='font-medium'>
                              {entry.location}
                            </span>
                            <Badge variant='outline' className='text-xs'>
                              {entry.timestamp}
                            </Badge>
                          </div>
                          <p className='text-muted-foreground mt-1 text-sm'>
                            {entry.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='environmental' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Biểu đồ môi trường theo thời gian</CardTitle>
                  <CardDescription>
                    Nhiệt độ và độ ẩm trong 6 giờ qua
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {containerData.environmentalData.map((data, index) => (
                      <div
                        key={index}
                        className='grid grid-cols-4 gap-4 rounded-lg bg-gray-50 p-3'
                      >
                        <div className='text-sm font-medium'>
                          {data.timestamp}
                        </div>
                        <div className='flex items-center gap-2'>
                          <IconTemperature className='h-4 w-4 text-red-500' />
                          <span className='text-sm'>
                            {data.temperature.toFixed(1)}°C
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <IconDroplet className='h-4 w-4 text-blue-500' />
                          <span className='text-sm'>{data.humidity}%</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <IconGps className='h-4 w-4 text-green-500' />
                          <span className='text-xs'>
                            {data.gpsLat.toFixed(4)}, {data.gpsLng.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='location' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin vị trí hiện tại</CardTitle>
                  <CardDescription>
                    GPS và địa điểm của container
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='text-sm font-medium'>Tọa độ GPS</label>
                      <p className='font-mono text-lg'>
                        {containerData.gpsLocation}
                      </p>
                    </div>
                    <div>
                      <label className='text-sm font-medium'>
                        Vị trí hiện tại
                      </label>
                      <p className='text-lg'>{containerData.locationName}</p>
                    </div>
                  </div>
                  <div className='rounded-lg bg-gray-100 p-4'>
                    <p className='text-muted-foreground text-sm'>
                      * Bản đồ chi tiết sẽ được hiển thị tại đây trong phiên bản
                      tương lai
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Info Cards */}
        <div className='space-y-6'>
          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconPackage className='h-5 w-5' />
                Thông tin đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div>
                <span className='text-sm font-medium'>Mã đơn hàng</span>
                <p className='font-mono text-lg'>
                  {containerData.deliveryOrder}
                </p>
              </div>
              <div>
                <span className='text-sm font-medium'>Hàng hóa</span>
                <p>{containerData.cargo}</p>
              </div>
              <div>
                <span className='text-sm font-medium'>Khối lượng</span>
                <p>{containerData.cargoWeight} kg</p>
              </div>
              <div>
                <span className='text-sm font-medium'>Giá trị</span>
                <p>{containerData.cargoValue.toLocaleString('vi-VN')} VND</p>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconBuilding className='h-5 w-5' />
                Thông tin khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div>
                <span className='text-sm font-medium'>Tên khách hàng</span>
                <p>{containerData.customer}</p>
              </div>
              <div>
                <span className='text-sm font-medium'>Địa chỉ giao hàng</span>
                <p className='text-sm'>{containerData.customerAddress}</p>
              </div>
              <div className='flex items-center gap-2'>
                <IconPhone className='h-4 w-4' />
                <span className='text-sm'>{containerData.customerPhone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Driver Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconUser className='h-5 w-5' />
                Thông tin tài xế
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div>
                <span className='text-sm font-medium'>Tài xế</span>
                <p>{containerData.driver}</p>
              </div>
              <div>
                <span className='text-sm font-medium'>Phương tiện</span>
                <p>{containerData.vehicle}</p>
              </div>
              <div className='flex items-center gap-2'>
                <IconPhone className='h-4 w-4' />
                <span className='text-sm'>{containerData.driverPhone}</span>
              </div>
              <div className='flex items-center gap-2'>
                <IconMail className='h-4 w-4' />
                <span className='text-sm'>{containerData.driverEmail}</span>
              </div>
              <div className='pt-2'>
                <Button size='sm' className='w-full'>
                  <IconPhone className='mr-2 h-4 w-4' />
                  Liên hệ tài xế
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <Button variant='outline' className='w-full'>
                <IconGps className='mr-2 h-4 w-4' />
                Theo dõi realtime
              </Button>
              <Button variant='outline' className='w-full'>
                <IconAlertTriangle className='mr-2 h-4 w-4' />
                Báo cáo sự cố
              </Button>
              <Button variant='outline' className='w-full'>
                <IconCalendar className='mr-2 h-4 w-4' />
                Cập nhật thời gian
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export { DeliveryDetail };

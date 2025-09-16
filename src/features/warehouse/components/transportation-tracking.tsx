'use client';

import { useState, useEffect } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  IconTruck,
  IconGps,
  IconTemperature,
  IconDroplet,
  IconMapPin,
  IconClock,
  IconAlertTriangle,
  IconCheck,
  IconRefresh,
  IconPhone,
  IconMessage,
  IconShield,
  IconUser,
  IconCar,
  IconStar,
  IconAward,
  IconGasStation,
  IconCalendar,
  IconRoute
} from '@tabler/icons-react';

// Mock data for active deliveries
const mockDeliveries = [
  {
    id: '1',
    orderId: 'ORD-001',
    vehicle: 'Xe tải 001',
    driver: 'Nguyễn Văn A',
    phone: '0901234567',
    destination: 'Siêu thị BigC Thăng Long',
    progress: 65,
    status: 'Đang vận chuyển',
    currentLocation: 'Đường Nguyễn Trãi, Q.Thanh Xuân',
    estimatedArrival: '14:30',
    temperature: 16.8,
    humidity: 62,
    gpsSignal: 'Mạnh',
    items: [
      {
        name: 'Cà chua',
        quantity: 50,
        unit: 'kg',
        category: 'Rau củ quả',
        condition: 'Tốt',
        temperature: 16.5
      },
      {
        name: 'Táo',
        quantity: 30,
        unit: 'kg',
        category: 'Trái cây',
        condition: 'Tốt',
        temperature: 17.0
      }
    ],
    alerts: [
      { type: 'info', message: 'Nhiệt độ ổn định', time: '13:45' },
      { type: 'warning', message: 'Tắc đường nhẹ phía trước', time: '13:50' }
    ],
    driverDetails: {
      name: 'Nguyễn Văn A',
      license: 'B2-123456',
      experience: '5 năm',
      rating: 4.8,
      totalDeliveries: 1250,
      avatar: '👨‍💼'
    },
    vehicleDetails: {
      model: 'Hyundai Porter H150',
      capacity: '1.5 tấn',
      fuelType: 'Diesel',
      licensePlate: '30A-12345',
      lastMaintenance: '15/12/2024'
    },
    routeHistory: [
      { time: '12:00', location: 'Kho hàng - Xuất phát', status: 'Bắt đầu' },
      { time: '12:30', location: 'Đường Láng, Q.Đống Đa', status: 'Di chuyển' },
      {
        time: '13:00',
        location: 'Đường Giải Phóng, Q.Hai Bà Trưng',
        status: 'Di chuyển'
      },
      {
        time: '13:30',
        location: 'Đường Nguyễn Trãi, Q.Thanh Xuân',
        status: 'Hiện tại'
      }
    ]
  },
  {
    id: '2',
    orderId: 'ORD-002',
    vehicle: 'Xe tải 002',
    driver: 'Trần Văn B',
    phone: '0907654321',
    destination: 'Chợ Hà Đông',
    progress: 25,
    status: 'Đang vận chuyển',
    currentLocation: 'Kho hàng - Chuẩn bị xuất phát',
    estimatedArrival: '15:45',
    temperature: 17.2,
    humidity: 58,
    gpsSignal: 'Mạnh',
    items: [
      {
        name: 'Gạo',
        quantity: 100,
        unit: 'kg',
        category: 'Ngũ cốc',
        condition: 'Tốt',
        temperature: 17.0
      },
      {
        name: 'Đậu xanh',
        quantity: 25,
        unit: 'kg',
        category: 'Đậu',
        condition: 'Tốt',
        temperature: 17.5
      }
    ],
    alerts: [
      { type: 'success', message: 'Tất cả thông số bình thường', time: '14:00' }
    ],
    driverDetails: {
      name: 'Trần Văn B',
      license: 'C-789012',
      experience: '8 năm',
      rating: 4.9,
      totalDeliveries: 2100,
      avatar: '👨‍🚛'
    },
    vehicleDetails: {
      model: 'Isuzu QKR77FE4',
      capacity: '2.4 tấn',
      fuelType: 'Diesel',
      licensePlate: '30B-67890',
      lastMaintenance: '10/12/2024'
    },
    routeHistory: [
      { time: '14:00', location: 'Kho hàng - Chuẩn bị', status: 'Bắt đầu' },
      {
        time: '14:15',
        location: 'Kho hàng - Đang tải hàng',
        status: 'Tải hàng'
      }
    ]
  },
  {
    id: '3',
    orderId: 'ORD-003',
    vehicle: 'Xe tải 003',
    driver: 'Lê Thị C',
    phone: '0912345678',
    destination: 'Vinmart Cầu Giấy',
    progress: 90,
    status: 'Sắp đến nơi',
    currentLocation: 'Đường Xuân Thủy, Q.Cầu Giấy',
    estimatedArrival: '14:15',
    temperature: 16.5,
    humidity: 65,
    gpsSignal: 'Mạnh',
    items: [
      {
        name: 'Xà lách',
        quantity: 20,
        unit: 'kg',
        category: 'Rau lá',
        condition: 'Tốt',
        temperature: 16.2
      },
      {
        name: 'Cải thảo',
        quantity: 35,
        unit: 'kg',
        category: 'Rau lá',
        condition: 'Tốt',
        temperature: 16.8
      }
    ],
    alerts: [
      { type: 'info', message: 'Sắp đến điểm giao hàng', time: '14:10' }
    ],
    driverDetails: {
      name: 'Lê Thị C',
      license: 'B2-345678',
      experience: '3 năm',
      rating: 4.7,
      totalDeliveries: 850,
      avatar: '👩‍💼'
    },
    vehicleDetails: {
      model: 'Thaco Kia K250',
      capacity: '2.5 tấn',
      fuelType: 'Diesel',
      licensePlate: '30C-11111',
      lastMaintenance: '20/12/2024'
    },
    routeHistory: [
      { time: '12:30', location: 'Kho hàng - Xuất phát', status: 'Bắt đầu' },
      {
        time: '13:00',
        location: 'Đường Phạm Hùng, Q.Nam Từ Liêm',
        status: 'Di chuyển'
      },
      {
        time: '13:30',
        location: 'Đường Cầu Giấy, Q.Cầu Giấy',
        status: 'Di chuyển'
      },
      {
        time: '14:00',
        location: 'Đường Xuân Thủy, Q.Cầu Giấy',
        status: 'Sắp đến'
      }
    ]
  }
];

const mockStats = {
  totalDeliveries: 12,
  activeDeliveries: 3,
  completedToday: 8,
  delayedDeliveries: 1,
  averageTemp: 17.2,
  onTimeRate: 94
};

export function TransportationTracking() {
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [deliveries, setDeliveries] = useState(mockDeliveries);
  const [stats, setStats] = useState(mockStats);

  // Real-time data simulation
  const simulateRealTimeData = () => {
    setDeliveries((prevDeliveries) =>
      prevDeliveries.map((delivery) => {
        // Simulate progress increase
        const progressIncrease = Math.random() * 2;
        const newProgress = Math.min(100, delivery.progress + progressIncrease);

        // Simulate temperature fluctuation
        const tempChange = (Math.random() - 0.5) * 0.5;
        const newTemp = Math.max(
          15,
          Math.min(20, delivery.temperature + tempChange)
        );

        // Simulate humidity fluctuation
        const humidityChange = (Math.random() - 0.5) * 2;
        const newHumidity = Math.max(
          50,
          Math.min(70, delivery.humidity + humidityChange)
        );

        // Update status based on progress
        let newStatus = delivery.status;
        if (newProgress >= 95) newStatus = 'Sắp đến nơi';
        else if (newProgress >= 100) newStatus = 'Đã hoàn thành';
        else if (newProgress > 0) newStatus = 'Đang vận chuyển';

        // Simulate location updates
        const locations = [
          'Đường Nguyễn Trãi, Q.Thanh Xuân',
          'Đường Giải Phóng, Q.Hai Bà Trưng',
          'Đường Cầu Giấy, Q.Cầu Giấy',
          'Đường Láng, Q.Đống Đa',
          'Cách điểm giao 1km'
        ];
        const newLocation =
          newProgress > 90
            ? 'Cách điểm giao 1km'
            : locations[Math.floor(Math.random() * locations.length)];

        return {
          ...delivery,
          progress: Math.round(newProgress * 10) / 10,
          temperature: Math.round(newTemp * 10) / 10,
          humidity: Math.round(newHumidity),
          status: newStatus,
          currentLocation: newLocation
        };
      })
    );

    // Update stats
    setStats((prevStats) => ({
      ...prevStats,
      averageTemp: Math.round((15 + Math.random() * 5) * 10) / 10,
      onTimeRate: Math.max(
        90,
        Math.min(98, prevStats.onTimeRate + (Math.random() - 0.5))
      )
    }));

    setLastUpdate(new Date());
  };

  // Auto refresh every 5 seconds for real-time effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      simulateRealTimeData();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = () => {
    simulateRealTimeData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đang vận chuyển':
        return 'bg-blue-500';
      case 'Sắp đến nơi':
        return 'bg-green-500';
      case 'Chậm trễ':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <IconAlertTriangle className='h-4 w-4 text-yellow-500' />;
      case 'success':
        return <IconCheck className='h-4 w-4 text-green-500' />;
      default:
        return <IconShield className='h-4 w-4 text-blue-500' />;
    }
  };

  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>
              Theo dõi vận chuyển
            </h2>
            <p className='text-muted-foreground'>
              Giám sát real-time các chuyến hàng đang vận chuyển
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <div className='text-muted-foreground text-sm'>
              Cập nhật lần cuối: {lastUpdate.toLocaleTimeString('vi-VN')}
            </div>
            <Button variant='outline' size='sm' onClick={handleRefresh}>
              <IconRefresh className='mr-1 h-4 w-4' />
              Làm mới
            </Button>
            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              size='sm'
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Tắt tự động' : 'Bật tự động'}
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className='grid gap-4 md:grid-cols-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Tổng chuyến hàng
              </CardTitle>
              <IconTruck className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.totalDeliveries}</div>
              <p className='text-muted-foreground text-xs'>Hôm nay</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Đang vận chuyển
              </CardTitle>
              <IconRoute className='h-4 w-4 text-blue-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {stats.activeDeliveries}
              </div>
              <p className='text-muted-foreground text-xs'>Đang di chuyển</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Hoàn thành</CardTitle>
              <IconCheck className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {stats.completedToday}
              </div>
              <p className='text-muted-foreground text-xs'>Hôm nay</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Chậm trễ</CardTitle>
              <IconAlertTriangle className='h-4 w-4 text-red-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                {stats.delayedDeliveries}
              </div>
              <p className='text-muted-foreground text-xs'>Cần xử lý</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Nhiệt độ TB</CardTitle>
              <IconTemperature className='h-4 w-4 text-orange-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.averageTemp}°C</div>
              <p className='text-muted-foreground text-xs'>Tất cả xe</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Đúng giờ</CardTitle>
              <IconClock className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {Math.round(stats.onTimeRate)}%
              </div>
              <p className='text-muted-foreground text-xs'>Tỷ lệ đúng hẹn</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue='active' className='space-y-4'>
          <TabsList>
            <TabsTrigger value='active'>
              Đang vận chuyển ({stats.activeDeliveries})
            </TabsTrigger>
            <TabsTrigger value='map'>Bản đồ theo dõi</TabsTrigger>
            <TabsTrigger value='history'>Lịch sử</TabsTrigger>
          </TabsList>

          <TabsContent value='active' className='space-y-4'>
            <div className='grid gap-4'>
              {deliveries.map((delivery) => (
                <Card
                  key={delivery.id}
                  className='cursor-pointer transition-shadow hover:shadow-md'
                  onClick={() =>
                    setSelectedDelivery(
                      selectedDelivery === delivery.id ? null : delivery.id
                    )
                  }
                >
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div
                          className={`h-3 w-3 rounded-full ${getStatusColor(delivery.status)}`}
                        />
                        <div>
                          <CardTitle className='text-lg'>
                            {delivery.orderId}
                          </CardTitle>
                          <p className='text-muted-foreground text-sm'>
                            {delivery.vehicle} - {delivery.driver}
                          </p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <Badge variant='outline'>{delivery.status}</Badge>
                        <p className='text-muted-foreground mt-1 text-sm'>
                          ETA: {delivery.estimatedArrival}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className='space-y-4'>
                      {/* Progress */}
                      <div className='space-y-2'>
                        <div className='flex justify-between text-sm'>
                          <span>Tiến độ</span>
                          <span>{delivery.progress}%</span>
                        </div>
                        <Progress value={delivery.progress} className='h-2' />
                      </div>

                      {/* Location */}
                      <div className='flex items-center gap-2'>
                        <IconMapPin className='h-4 w-4 text-red-500' />
                        <span className='text-sm'>
                          {delivery.currentLocation}
                        </span>
                      </div>

                      {/* Destination */}
                      <div className='flex items-center gap-2'>
                        <IconRoute className='h-4 w-4 text-blue-500' />
                        <span className='text-sm'>
                          Đến: {delivery.destination}
                        </span>
                      </div>

                      {/* Expanded Details */}
                      {selectedDelivery === delivery.id && (
                        <div className='mt-4 space-y-4 border-t pt-4'>
                          {/* Environmental Data */}
                          <div className='grid grid-cols-3 gap-4'>
                            <div className='flex items-center gap-2'>
                              <IconTemperature className='h-4 w-4 text-red-500' />
                              <div>
                                <div className='text-sm font-medium'>
                                  {delivery.temperature}°C
                                </div>
                                <div className='text-muted-foreground text-xs'>
                                  Nhiệt độ
                                </div>
                              </div>
                            </div>
                            <div className='flex items-center gap-2'>
                              <IconDroplet className='h-4 w-4 text-blue-500' />
                              <div>
                                <div className='text-sm font-medium'>
                                  {delivery.humidity}%
                                </div>
                                <div className='text-muted-foreground text-xs'>
                                  Độ ẩm
                                </div>
                              </div>
                            </div>
                            <div className='flex items-center gap-2'>
                              <IconGps className='h-4 w-4 text-green-500' />
                              <div>
                                <div className='text-sm font-medium'>
                                  {delivery.gpsSignal}
                                </div>
                                <div className='text-muted-foreground text-xs'>
                                  GPS
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Items */}
                          <div>
                            <div className='mb-2 text-sm font-medium'>
                              Hàng hóa:
                            </div>
                            <div className='space-y-2'>
                              {delivery.items.map((item, index) => (
                                <div
                                  key={index}
                                  className='bg-muted/50 rounded-lg p-3'
                                >
                                  <div className='mb-2 flex items-start justify-between'>
                                    <div className='text-sm font-medium'>
                                      {item.name}
                                    </div>
                                    <div className='text-muted-foreground text-xs'>
                                      {item.category}
                                    </div>
                                  </div>
                                  <div className='text-muted-foreground grid grid-cols-2 gap-2 text-xs'>
                                    <div>
                                      Số lượng: {item.quantity} {item.unit}
                                    </div>
                                    <div>Tình trạng: {item.condition}</div>
                                    <div>Nhiệt độ: {item.temperature}°C</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Alerts */}
                          <div>
                            <div className='mb-2 text-sm font-medium'>
                              Cảnh báo:
                            </div>
                            <div className='space-y-2'>
                              {delivery.alerts.map((alert, index) => (
                                <div
                                  key={index}
                                  className='flex items-center gap-2 text-xs'
                                >
                                  {getAlertIcon(alert.type)}
                                  <span>{alert.message}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className='flex gap-2'>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size='sm'
                                  variant='outline'
                                  className='flex-1'
                                >
                                  <IconUser className='mr-1 h-4 w-4' />
                                  Xem chi tiết
                                </Button>
                              </DialogTrigger>
                              <DialogContent className='max-h-[80vh] max-w-4xl overflow-y-auto'>
                                <DialogHeader>
                                  <DialogTitle>
                                    Chi tiết vận chuyển - {delivery.orderId}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Thông tin chi tiết về chuyến hàng{' '}
                                    {delivery.vehicle}
                                  </DialogDescription>
                                </DialogHeader>

                                <Tabs
                                  defaultValue='overview'
                                  className='w-full'
                                >
                                  <TabsList className='grid w-full grid-cols-4'>
                                    <TabsTrigger value='overview'>
                                      Tổng quan
                                    </TabsTrigger>
                                    <TabsTrigger value='driver'>
                                      Tài xế
                                    </TabsTrigger>
                                    <TabsTrigger value='vehicle'>
                                      Xe tải
                                    </TabsTrigger>
                                    <TabsTrigger value='route'>
                                      Lịch sử
                                    </TabsTrigger>
                                  </TabsList>

                                  <TabsContent
                                    value='overview'
                                    className='space-y-4'
                                  >
                                    <div className='grid grid-cols-2 gap-4'>
                                      <Card>
                                        <CardHeader className='pb-3'>
                                          <CardTitle className='text-sm'>
                                            Thông tin chuyến hàng
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className='space-y-2'>
                                          <div className='flex justify-between text-sm'>
                                            <span className='text-gray-600'>
                                              Mã đơn:
                                            </span>
                                            <span className='font-medium'>
                                              {delivery.orderId}
                                            </span>
                                          </div>
                                          <div className='flex justify-between text-sm'>
                                            <span className='text-gray-600'>
                                              Điểm đến:
                                            </span>
                                            <span className='font-medium'>
                                              {delivery.destination}
                                            </span>
                                          </div>
                                          <div className='flex justify-between text-sm'>
                                            <span className='text-gray-600'>
                                              Tiến độ:
                                            </span>
                                            <span className='font-medium'>
                                              {delivery.progress}%
                                            </span>
                                          </div>
                                          <div className='flex justify-between text-sm'>
                                            <span className='text-gray-600'>
                                              Dự kiến đến:
                                            </span>
                                            <span className='font-medium'>
                                              {delivery.estimatedArrival}
                                            </span>
                                          </div>
                                        </CardContent>
                                      </Card>

                                      <Card>
                                        <CardHeader className='pb-3'>
                                          <CardTitle className='text-sm'>
                                            Điều kiện vận chuyển
                                          </CardTitle>
                                        </CardHeader>
                                        <CardContent className='space-y-2'>
                                          <div className='flex justify-between text-sm'>
                                            <span className='text-gray-600'>
                                              Nhiệt độ:
                                            </span>
                                            <span className='font-medium'>
                                              {delivery.temperature}°C
                                            </span>
                                          </div>
                                          <div className='flex justify-between text-sm'>
                                            <span className='text-gray-600'>
                                              Độ ẩm:
                                            </span>
                                            <span className='font-medium'>
                                              {delivery.humidity}%
                                            </span>
                                          </div>
                                          <div className='flex justify-between text-sm'>
                                            <span className='text-gray-600'>
                                              Tín hiệu GPS:
                                            </span>
                                            <span className='font-medium'>
                                              {delivery.gpsSignal}
                                            </span>
                                          </div>
                                          <div className='flex justify-between text-sm'>
                                            <span className='text-gray-600'>
                                              Vị trí hiện tại:
                                            </span>
                                            <span className='text-xs font-medium'>
                                              {delivery.currentLocation}
                                            </span>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>

                                    <Card>
                                      <CardHeader className='pb-3'>
                                        <CardTitle className='text-sm'>
                                          Hàng hóa chi tiết
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                                          {delivery.items.map((item, idx) => (
                                            <div
                                              key={idx}
                                              className='rounded-lg border p-3'
                                            >
                                              <div className='mb-2 flex items-start justify-between'>
                                                <div className='font-medium'>
                                                  {item.name}
                                                </div>
                                                <Badge variant='outline'>
                                                  {item.category}
                                                </Badge>
                                              </div>
                                              <div className='grid grid-cols-2 gap-2 text-sm text-gray-600'>
                                                <div>
                                                  Số lượng: {item.quantity}{' '}
                                                  {item.unit}
                                                </div>
                                                <div>
                                                  Tình trạng: {item.condition}
                                                </div>
                                                <div>
                                                  Nhiệt độ: {item.temperature}°C
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </TabsContent>

                                  <TabsContent
                                    value='driver'
                                    className='space-y-4'
                                  >
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className='flex items-center gap-2'>
                                          <IconUser className='h-5 w-5' />
                                          Thông tin tài xế
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent className='space-y-4'>
                                        <div className='flex items-center gap-4'>
                                          <div className='text-4xl'>
                                            {delivery.driverDetails.avatar}
                                          </div>
                                          <div>
                                            <h3 className='text-lg font-semibold'>
                                              {delivery.driverDetails.name}
                                            </h3>
                                            <p className='text-gray-600'>
                                              {delivery.phone}
                                            </p>
                                          </div>
                                        </div>

                                        <div className='grid grid-cols-2 gap-4'>
                                          <div className='space-y-2'>
                                            <div className='flex justify-between'>
                                              <span className='text-gray-600'>
                                                Bằng lái:
                                              </span>
                                              <span className='font-medium'>
                                                {delivery.driverDetails.license}
                                              </span>
                                            </div>
                                            <div className='flex justify-between'>
                                              <span className='text-gray-600'>
                                                Kinh nghiệm:
                                              </span>
                                              <span className='font-medium'>
                                                {
                                                  delivery.driverDetails
                                                    .experience
                                                }
                                              </span>
                                            </div>
                                          </div>
                                          <div className='space-y-2'>
                                            <div className='flex items-center justify-between'>
                                              <span className='text-gray-600'>
                                                Đánh giá:
                                              </span>
                                              <div className='flex items-center gap-1'>
                                                <IconStar className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                                                <span className='font-medium'>
                                                  {
                                                    delivery.driverDetails
                                                      .rating
                                                  }
                                                </span>
                                              </div>
                                            </div>
                                            <div className='flex justify-between'>
                                              <span className='text-gray-600'>
                                                Tổng chuyến:
                                              </span>
                                              <span className='font-medium'>
                                                {delivery.driverDetails.totalDeliveries.toLocaleString()}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </TabsContent>

                                  <TabsContent
                                    value='vehicle'
                                    className='space-y-4'
                                  >
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className='flex items-center gap-2'>
                                          <IconCar className='h-5 w-5' />
                                          Thông tin xe tải
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent className='space-y-4'>
                                        <div className='grid grid-cols-2 gap-4'>
                                          <div className='space-y-3'>
                                            <div className='flex justify-between'>
                                              <span className='text-gray-600'>
                                                Mẫu xe:
                                              </span>
                                              <span className='font-medium'>
                                                {delivery.vehicleDetails.model}
                                              </span>
                                            </div>
                                            <div className='flex justify-between'>
                                              <span className='text-gray-600'>
                                                Biển số:
                                              </span>
                                              <span className='font-medium'>
                                                {
                                                  delivery.vehicleDetails
                                                    .licensePlate
                                                }
                                              </span>
                                            </div>
                                            <div className='flex justify-between'>
                                              <span className='text-gray-600'>
                                                Tải trọng:
                                              </span>
                                              <span className='font-medium'>
                                                {
                                                  delivery.vehicleDetails
                                                    .capacity
                                                }
                                              </span>
                                            </div>
                                          </div>
                                          <div className='space-y-3'>
                                            <div className='flex justify-between'>
                                              <span className='text-gray-600'>
                                                Nhiên liệu:
                                              </span>
                                              <span className='font-medium'>
                                                {
                                                  delivery.vehicleDetails
                                                    .fuelType
                                                }
                                              </span>
                                            </div>
                                            <div className='flex justify-between'>
                                              <span className='text-gray-600'>
                                                Bảo dưỡng cuối:
                                              </span>
                                              <span className='font-medium'>
                                                {
                                                  delivery.vehicleDetails
                                                    .lastMaintenance
                                                }
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </TabsContent>

                                  <TabsContent
                                    value='route'
                                    className='space-y-4'
                                  >
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className='flex items-center gap-2'>
                                          <IconRoute className='h-5 w-5' />
                                          Lịch sử di chuyển
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className='space-y-4'>
                                          {delivery.routeHistory.map(
                                            (route, idx) => (
                                              <div
                                                key={idx}
                                                className='flex items-start gap-3'
                                              >
                                                <div className='flex flex-col items-center'>
                                                  <div
                                                    className={`h-3 w-3 rounded-full ${
                                                      route.status ===
                                                      'Hiện tại'
                                                        ? 'bg-blue-500'
                                                        : route.status ===
                                                            'Sắp đến'
                                                          ? 'bg-orange-500'
                                                          : 'bg-green-500'
                                                    }`}
                                                  />
                                                  {idx <
                                                    delivery.routeHistory
                                                      .length -
                                                      1 && (
                                                    <div className='mt-1 h-8 w-0.5 bg-gray-300' />
                                                  )}
                                                </div>
                                                <div className='flex-1'>
                                                  <div className='flex items-start justify-between'>
                                                    <div>
                                                      <p className='text-sm font-medium'>
                                                        {route.location}
                                                      </p>
                                                      <p className='text-xs text-gray-600'>
                                                        {route.status}
                                                      </p>
                                                    </div>
                                                    <span className='text-xs text-gray-500'>
                                                      {route.time}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </TabsContent>
                                </Tabs>
                              </DialogContent>
                            </Dialog>
                            <Button size='sm' variant='outline'>
                              <IconPhone className='mr-1 h-4 w-4' />
                              Gọi tài xế
                            </Button>
                            <Button size='sm' variant='outline'>
                              <IconMessage className='mr-1 h-4 w-4' />
                              Nhắn tin
                            </Button>
                            <Button size='sm' variant='outline'>
                              <IconMapPin className='mr-1 h-4 w-4' />
                              Xem bản đồ
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value='map'>
            <Card>
              <CardHeader>
                <CardTitle>Bản đồ theo dõi real-time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='bg-muted/50 flex h-96 items-center justify-center rounded-lg'>
                  <div className='text-center'>
                    <IconMapPin className='text-muted-foreground mx-auto mb-2 h-12 w-12' />
                    <p className='text-muted-foreground'>
                      Bản đồ tích hợp sẽ hiển thị ở đây
                    </p>
                    <p className='text-muted-foreground mt-1 text-sm'>
                      Hiển thị vị trí real-time của tất cả xe vận chuyển
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='history'>
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử vận chuyển</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='py-8 text-center'>
                  <IconClock className='text-muted-foreground mx-auto mb-2 h-12 w-12' />
                  <p className='text-muted-foreground'>
                    Lịch sử các chuyến hàng đã hoàn thành
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}

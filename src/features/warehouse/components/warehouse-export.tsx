'use client';

import { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  IconPackageExport,
  IconTruck,
  IconGps,
  IconTemperature,
  IconDroplet,
  IconBrain,
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconRoute,
  IconShield,
  IconMapPin,
  IconCamera,
  IconDevices,
  IconScale,
  IconEye,
  IconRadar,
  IconRefresh,
  IconBattery
} from '@tabler/icons-react';

// Mock data
const mockVehicles = [
  { id: '1', name: 'Xe tải 001', driver: 'Nguyễn Văn A', status: 'Sẵn sàng' },
  {
    id: '2',
    name: 'Xe tải 002',
    driver: 'Trần Văn B',
    status: 'Đang vận chuyển'
  },
  { id: '3', name: 'Xe tải 003', driver: 'Lê Văn C', status: 'Sẵn sàng' }
];

const mockInventory = [
  {
    id: '1',
    name: 'Cà chua',
    category: 'Rau củ quả',
    quantity: 150,
    unit: 'kg'
  },
  { id: '2', name: 'Táo', category: 'Trái cây', quantity: 200, unit: 'kg' },
  { id: '3', name: 'Gạo', category: 'Ngũ cốc', quantity: 500, unit: 'kg' }
];

const mockTransportData = {
  temperature: 16.2,
  humidity: 58,
  gpsStatus: 'Hoạt động',
  currentLocation: 'Đang tải hàng',
  estimatedTime: '45 phút',
  riskLevel: 'Thấp'
};

const mockAIAlerts = [
  { type: 'info', message: 'Nhiệt độ vận chuyển ổn định' },
  { type: 'warning', message: 'Dự báo mưa trên tuyến đường' },
  { type: 'success', message: 'Tuyến đường tối ưu đã được chọn' }
];

// IoT Devices Mock Data
const mockIoTDevices = [
  {
    id: 'temp-001',
    name: 'Cảm biến nhiệt độ T1',
    type: 'temperature',
    status: 'online',
    value: '16.2',
    unit: '°C',
    location: 'Khu vực A1 - Rau lá',
    battery: 85,
    lastUpdate: '2 phút trước',
    image: '/api/placeholder/200/150',
    icon: IconTemperature,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    isActive: true,
    settings: {
      minThreshold: 2,
      maxThreshold: 8,
      alertEnabled: true,
      updateInterval: 30
    }
  },
  {
    id: 'humid-001',
    name: 'Cảm biến độ ẩm H1',
    type: 'humidity',
    status: 'online',
    value: '58',
    unit: '%',
    location: 'Khu vực A1 - Rau lá',
    battery: 92,
    lastUpdate: '1 phút trước',
    image: '/api/placeholder/200/150',
    icon: IconDroplet,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    isActive: true,
    settings: {
      minThreshold: 50,
      maxThreshold: 80,
      alertEnabled: true,
      updateInterval: 45
    }
  },
  {
    id: 'gps-001',
    name: 'GPS Tracker G1',
    type: 'gps',
    status: 'online',
    value: '21.0285, 105.8542',
    location: 'Xe tải VN-001',
    battery: 78,
    lastUpdate: '30 giây trước',
    image: '/api/placeholder/200/150',
    icon: IconGps,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    isActive: true,
    settings: {
      alertEnabled: true,
      updateInterval: 15
    }
  },
  {
    id: 'camera-001',
    name: 'Camera giám sát C1',
    type: 'camera',
    status: 'online',
    value: 'Đang quay',
    location: 'Cổng chính kho A',
    battery: 100,
    lastUpdate: 'Trực tiếp',
    image: '/api/placeholder/200/150',
    icon: IconCamera,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    isActive: true,
    settings: {
      alertEnabled: false,
      updateInterval: 1
    }
  },
  {
    id: 'scale-001',
    name: 'Cân điện tử S1',
    type: 'scale',
    status: 'offline',
    value: '0',
    unit: 'kg',
    location: 'Khu đóng gói',
    battery: 15,
    lastUpdate: '2 giờ trước',
    image: '/api/placeholder/200/150',
    icon: IconScale,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    isActive: false,
    settings: {
      minThreshold: 0,
      maxThreshold: 500,
      alertEnabled: true,
      updateInterval: 5
    }
  },
  {
    id: 'motion-001',
    name: 'Cảm biến chất lượng không khí',
    type: 'sensor',
    status: 'online',
    value: '85',
    unit: 'AQI',
    location: 'Khu vực C3 - Đông lạnh',
    battery: 67,
    lastUpdate: '3 phút trước',
    image: '/api/placeholder/200/150',
    icon: IconRadar,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    isActive: true,
    settings: {
      minThreshold: 70,
      maxThreshold: 100,
      alertEnabled: true,
      updateInterval: 120
    }
  }
];

export function WarehouseExport() {
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [destination, setDestination] = useState('');
  const [customerInfo, setCustomerInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [exportOrders, setExportOrders] = useState<any[]>([]);
  const [isGPSActive, setIsGPSActive] = useState(false);

  // IoT Device Management States
  const [devices, setDevices] = useState(mockIoTDevices);
  const [activeIoTDevices, setActiveIoTDevices] = useState<string[]>([]);

  const handleItemSelect = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleDevice = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((device) =>
        device.id === deviceId
          ? {
              ...device,
              isActive: !device.isActive,
              status: device.isActive ? 'offline' : 'online'
            }
          : device
      )
    );

    if (activeIoTDevices.includes(deviceId)) {
      setActiveIoTDevices((prev) => prev.filter((id) => id !== deviceId));
    } else {
      setActiveIoTDevices((prev) => [...prev, deviceId]);
    }
  };

  const refreshDevice = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((device) =>
        device.id === deviceId ? { ...device, lastUpdate: 'Vừa xong' } : device
      )
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className='bg-green-100 text-green-800'>Hoạt động</Badge>;
      case 'warning':
        return (
          <Badge className='bg-yellow-100 text-yellow-800'>Cảnh báo</Badge>
        );
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

  const handleCreateExportOrder = () => {
    if (!selectedVehicle || selectedItems.length === 0 || !destination) return;

    const newOrder = {
      id: Date.now(),
      vehicle: mockVehicles.find((v) => v.id === selectedVehicle),
      items: mockInventory.filter((item) => selectedItems.includes(item.id)),
      destination,
      customerInfo,
      notes,
      timestamp: new Date().toLocaleString('vi-VN'),
      status: 'Chuẩn bị',
      blockchainHash: `0x${Math.random().toString(16).substr(2, 8)}`,
      gpsEnabled: isGPSActive
    };

    setExportOrders([...exportOrders, newOrder]);

    // Reset form
    setSelectedVehicle('');
    setSelectedItems([]);
    setDestination('');
    setCustomerInfo('');
    setNotes('');
    setIsGPSActive(false);
  };

  const handleStartDelivery = (orderId: number) => {
    setExportOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: 'Đang vận chuyển' } : order
      )
    );
  };

  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>
              Xuất kho & Vận chuyển
            </h2>
            <p className='text-muted-foreground'>
              Quản lý xuất kho với GPS tracking và AI monitoring
            </p>
          </div>
          <div className='flex gap-2'>
            <Button variant='outline'>
              <IconRoute className='mr-2 h-4 w-4' />
              Tối ưu tuyến đường
            </Button>

            <Button>
              <IconTruck className='mr-2 h-4 w-4' />
              Tạo đơn xuất
            </Button>
          </div>
        </div>

        {/* Transport Monitoring */}
        <div className='grid gap-6 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Nhiệt độ vận chuyển
              </CardTitle>
              <IconTemperature className='h-4 w-4 text-red-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {mockTransportData.temperature}°C
              </div>
              <p className='text-muted-foreground text-xs'>
                Trong phạm vi an toàn
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Độ ẩm</CardTitle>
              <IconDroplet className='h-4 w-4 text-blue-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {mockTransportData.humidity}%
              </div>
              <p className='text-muted-foreground text-xs'>Ổn định</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>GPS Status</CardTitle>
              <IconGps className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {mockTransportData.gpsStatus}
              </div>
              <p className='text-muted-foreground text-xs'>
                {mockTransportData.currentLocation}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Thời gian dự kiến
              </CardTitle>
              <IconClock className='h-4 w-4 text-orange-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {mockTransportData.estimatedTime}
              </div>
              <p className='text-muted-foreground text-xs'>
                Đến điểm giao hàng
              </p>
            </CardContent>
          </Card>
        </div>

        {/* IoT Devices Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconDevices className='h-5 w-5' />
              Thiết bị IoT đang hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue='active' className='w-full'>
              <TabsList className='grid w-full grid-cols-4'>
                <TabsTrigger value='active'>
                  Hoạt động ({devices.filter((d) => d.isActive).length})
                </TabsTrigger>
                <TabsTrigger value='all'>Tất cả ({devices.length})</TabsTrigger>
                <TabsTrigger value='offline'>
                  Offline ({devices.filter((d) => !d.isActive).length})
                </TabsTrigger>
                <TabsTrigger value='warning'>
                  Cảnh báo (
                  {devices.filter((d) => d.status === 'warning').length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value='active' className='mt-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                  {devices
                    .filter((d) => d.isActive)
                    .map((device) => {
                      const IconComponent = device.icon;
                      return (
                        <Card key={device.id} className='border-green-200'>
                          <CardContent className='p-4'>
                            <div className='flex items-start gap-3'>
                              <div
                                className={`rounded-lg p-2 ${device.bgColor}`}
                              >
                                <IconComponent
                                  className={`h-5 w-5 ${device.color}`}
                                />
                              </div>
                              <div className='min-w-0 flex-1'>
                                <div className='mb-2 flex items-center justify-between'>
                                  <h4 className='truncate text-sm font-medium'>
                                    {device.name}
                                  </h4>
                                  {getStatusBadge(device.status)}
                                </div>
                                <div className='text-muted-foreground space-y-1 text-xs'>
                                  <p>
                                    <strong>Giá trị:</strong> {device.value}{' '}
                                    {device.unit}
                                  </p>
                                  <p className='truncate'>
                                    <strong>Vị trí:</strong> {device.location}
                                  </p>
                                  <div className='flex items-center gap-2'>
                                    <IconBattery className='h-3 w-3' />
                                    <span>{device.battery}%</span>
                                    <Progress
                                      value={device.battery}
                                      className='h-1 flex-1'
                                    />
                                  </div>
                                  <p>
                                    <strong>Cập nhật:</strong>{' '}
                                    {device.lastUpdate}
                                  </p>
                                </div>
                                <div className='mt-3 flex gap-2'>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() => refreshDevice(device.id)}
                                    className='h-auto px-2 py-1 text-xs'
                                  >
                                    <IconRefresh className='mr-1 h-3 w-3' />
                                    Làm mới
                                  </Button>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() => toggleDevice(device.id)}
                                    className='h-auto px-2 py-1 text-xs'
                                  >
                                    Tắt
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
                {devices.filter((d) => d.isActive).length === 0 && (
                  <div className='py-8 text-center'>
                    <IconDevices className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
                    <h3 className='mb-2 text-lg font-semibold'>
                      Không có thiết bị nào đang hoạt động
                    </h3>
                    <p className='text-muted-foreground'>
                      Kích hoạt thiết bị IoT để bắt đầu giám sát
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value='all' className='mt-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                  {devices.map((device) => {
                    const IconComponent = device.icon;
                    return (
                      <Card
                        key={device.id}
                        className={
                          device.isActive
                            ? 'border-green-200'
                            : 'border-gray-200'
                        }
                      >
                        <CardContent className='p-4'>
                          <div className='flex items-start gap-3'>
                            <div className={`rounded-lg p-2 ${device.bgColor}`}>
                              <IconComponent
                                className={`h-5 w-5 ${device.color}`}
                              />
                            </div>
                            <div className='min-w-0 flex-1'>
                              <div className='mb-2 flex items-center justify-between'>
                                <h4 className='truncate text-sm font-medium'>
                                  {device.name}
                                </h4>
                                {getStatusBadge(device.status)}
                              </div>
                              <div className='text-muted-foreground space-y-1 text-xs'>
                                <p>
                                  <strong>Giá trị:</strong> {device.value}{' '}
                                  {device.unit}
                                </p>
                                <p className='truncate'>
                                  <strong>Vị trí:</strong> {device.location}
                                </p>
                                <div className='flex items-center gap-2'>
                                  <IconBattery className='h-3 w-3' />
                                  <span>{device.battery}%</span>
                                  <Progress
                                    value={device.battery}
                                    className='h-1 flex-1'
                                  />
                                </div>
                                <p>
                                  <strong>Cập nhật:</strong> {device.lastUpdate}
                                </p>
                              </div>
                              <div className='mt-3 flex gap-2'>
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() => refreshDevice(device.id)}
                                  className='h-auto px-2 py-1 text-xs'
                                >
                                  <IconRefresh className='mr-1 h-3 w-3' />
                                  Làm mới
                                </Button>
                                <Button
                                  size='sm'
                                  variant={
                                    device.isActive ? 'outline' : 'default'
                                  }
                                  onClick={() => toggleDevice(device.id)}
                                  className='h-auto px-2 py-1 text-xs'
                                >
                                  {device.isActive ? 'Tắt' : 'Bật'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value='offline' className='mt-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                  {devices
                    .filter((d) => !d.isActive || d.status === 'offline')
                    .map((device) => {
                      const IconComponent = device.icon;
                      return (
                        <Card key={device.id} className='border-gray-200'>
                          <CardContent className='p-4'>
                            <div className='flex items-start gap-3'>
                              <div
                                className={`rounded-lg p-2 ${device.bgColor} opacity-50`}
                              >
                                <IconComponent
                                  className={`h-5 w-5 ${device.color}`}
                                />
                              </div>
                              <div className='min-w-0 flex-1'>
                                <div className='mb-2 flex items-center justify-between'>
                                  <h4 className='truncate text-sm font-medium opacity-75'>
                                    {device.name}
                                  </h4>
                                  {getStatusBadge(device.status)}
                                </div>
                                <div className='text-muted-foreground space-y-1 text-xs'>
                                  <p>
                                    <strong>Giá trị:</strong> {device.value}{' '}
                                    {device.unit}
                                  </p>
                                  <p className='truncate'>
                                    <strong>Vị trí:</strong> {device.location}
                                  </p>
                                  <div className='flex items-center gap-2'>
                                    <IconBattery className='h-3 w-3' />
                                    <span>{device.battery}%</span>
                                    <Progress
                                      value={device.battery}
                                      className='h-1 flex-1'
                                    />
                                  </div>
                                  <p>
                                    <strong>Cập nhật:</strong>{' '}
                                    {device.lastUpdate}
                                  </p>
                                </div>
                                <div className='mt-3 flex gap-2'>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() => refreshDevice(device.id)}
                                    className='h-auto px-2 py-1 text-xs'
                                  >
                                    <IconRefresh className='mr-1 h-3 w-3' />
                                    Làm mới
                                  </Button>
                                  <Button
                                    size='sm'
                                    variant='default'
                                    onClick={() => toggleDevice(device.id)}
                                    className='h-auto px-2 py-1 text-xs'
                                  >
                                    Bật
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
                {devices.filter((d) => !d.isActive || d.status === 'offline')
                  .length === 0 && (
                  <div className='py-8 text-center'>
                    <IconCheck className='mx-auto mb-4 h-12 w-12 text-green-500' />
                    <h3 className='mb-2 text-lg font-semibold'>
                      Tất cả thiết bị đang hoạt động
                    </h3>
                    <p className='text-muted-foreground'>
                      Không có thiết bị nào offline
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value='warning' className='mt-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                  {devices
                    .filter((d) => d.status === 'warning')
                    .map((device) => {
                      const IconComponent = device.icon;
                      return (
                        <Card key={device.id} className='border-yellow-200'>
                          <CardContent className='p-4'>
                            <div className='flex items-start gap-3'>
                              <div
                                className={`rounded-lg p-2 ${device.bgColor}`}
                              >
                                <IconComponent
                                  className={`h-5 w-5 ${device.color}`}
                                />
                              </div>
                              <div className='min-w-0 flex-1'>
                                <div className='mb-2 flex items-center justify-between'>
                                  <h4 className='truncate text-sm font-medium'>
                                    {device.name}
                                  </h4>
                                  {getStatusBadge(device.status)}
                                </div>
                                <div className='text-muted-foreground space-y-1 text-xs'>
                                  <p>
                                    <strong>Giá trị:</strong> {device.value}{' '}
                                    {device.unit}
                                  </p>
                                  <p className='truncate'>
                                    <strong>Vị trí:</strong> {device.location}
                                  </p>
                                  <div className='flex items-center gap-2'>
                                    <IconBattery className='h-3 w-3' />
                                    <span>{device.battery}%</span>
                                    <Progress
                                      value={device.battery}
                                      className='h-1 flex-1'
                                    />
                                  </div>
                                  <p>
                                    <strong>Cập nhật:</strong>{' '}
                                    {device.lastUpdate}
                                  </p>
                                </div>
                                <div className='mt-3 flex gap-2'>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() => refreshDevice(device.id)}
                                    className='h-auto px-2 py-1 text-xs'
                                  >
                                    <IconRefresh className='mr-1 h-3 w-3' />
                                    Làm mới
                                  </Button>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    className='h-auto px-2 py-1 text-xs'
                                  >
                                    <IconEye className='mr-1 h-3 w-3' />
                                    Chi tiết
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
                {devices.filter((d) => d.status === 'warning').length === 0 && (
                  <div className='py-8 text-center'>
                    <IconCheck className='mx-auto mb-4 h-12 w-12 text-green-500' />
                    <h3 className='mb-2 text-lg font-semibold'>
                      Không có cảnh báo
                    </h3>
                    <p className='text-muted-foreground'>
                      Tất cả thiết bị đang hoạt động bình thường
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className='grid gap-6 md:grid-cols-2'>
          {/* Export Form */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconPackageExport className='h-5 w-5' />
                Tạo đơn xuất kho
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='vehicle'>Chọn xe vận chuyển</Label>
                <Select
                  value={selectedVehicle}
                  onValueChange={setSelectedVehicle}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn xe vận chuyển' />
                  </SelectTrigger>
                  <SelectContent>
                    {mockVehicles
                      .filter((v) => v.status === 'Sẵn sàng')
                      .map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.name} - {vehicle.driver}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label>Chọn sản phẩm xuất kho</Label>
                <div className='max-h-40 space-y-2 overflow-y-auto'>
                  {mockInventory.map((item) => (
                    <div key={item.id} className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        id={item.id}
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleItemSelect(item.id)}
                        className='rounded'
                      />
                      <label
                        htmlFor={item.id}
                        className='flex-1 cursor-pointer text-sm'
                      >
                        {item.name} - {item.quantity} {item.unit}
                        <Badge variant='outline' className='ml-2'>
                          {item.category}
                        </Badge>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='destination'>Điểm giao hàng</Label>
                <Input
                  id='destination'
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder='Địa chỉ giao hàng'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='customer'>Thông tin khách hàng</Label>
                <Input
                  id='customer'
                  value={customerInfo}
                  onChange={(e) => setCustomerInfo(e.target.value)}
                  placeholder='Tên và SĐT khách hàng'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='notes'>Ghi chú</Label>
                <Textarea
                  id='notes'
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder='Ghi chú vận chuyển...'
                  rows={3}
                />
              </div>

              <div className='space-y-3'>
                <div className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    id='gps'
                    checked={isGPSActive}
                    onChange={(e) => setIsGPSActive(e.target.checked)}
                    className='rounded'
                  />
                  <Label htmlFor='gps' className='cursor-pointer text-sm'>
                    Kích hoạt GPS tracking và sensors
                  </Label>
                </div>

                {isGPSActive && (
                  <div className='ml-6 space-y-2'>
                    {devices.filter((d) => d.isActive).length > 0 && (
                      <div className='text-muted-foreground text-sm'>
                        <p>Thiết bị đã chọn:</p>
                        <div className='mt-1 flex flex-wrap gap-1'>
                          {devices
                            .filter((d) => d.isActive)
                            .map((device) => (
                              <Badge
                                key={device.id}
                                variant='secondary'
                                className='text-xs'
                              >
                                {device.name}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button onClick={handleCreateExportOrder} className='w-full'>
                <IconPackageExport className='mr-2 h-4 w-4' />
                Tạo đơn xuất kho
              </Button>
            </CardContent>
          </Card>

          {/* AI Analysis & Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconBrain className='h-5 w-5 text-purple-600' />
                AI Monitoring & Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>
                  Mức độ rủi ro vận chuyển:
                </span>
                <Badge
                  variant={
                    mockTransportData.riskLevel === 'Thấp'
                      ? 'default'
                      : 'destructive'
                  }
                >
                  {mockTransportData.riskLevel}
                </Badge>
              </div>

              <div className='space-y-3'>
                <span className='text-sm font-medium'>Cảnh báo AI:</span>
                {mockAIAlerts.map((alert, index) => (
                  <div
                    key={index}
                    className='bg-muted/50 flex items-start gap-2 rounded-lg p-2'
                  >
                    {alert.type === 'warning' && (
                      <IconAlertTriangle className='mt-0.5 h-4 w-4 text-yellow-500' />
                    )}
                    {alert.type === 'success' && (
                      <IconCheck className='mt-0.5 h-4 w-4 text-green-500' />
                    )}
                    {alert.type === 'info' && (
                      <IconShield className='mt-0.5 h-4 w-4 text-blue-500' />
                    )}
                    <span className='text-xs'>{alert.message}</span>
                  </div>
                ))}
              </div>

              <div className='space-y-2'>
                <span className='text-sm font-medium'>
                  Tuyến đường được đề xuất:
                </span>
                <div className='bg-muted/50 rounded-lg p-3'>
                  <div className='mb-2 flex items-center gap-2'>
                    <IconMapPin className='h-4 w-4 text-green-500' />
                    <span className='text-sm font-medium'>Tuyến tối ưu</span>
                  </div>
                  <p className='text-muted-foreground text-xs'>
                    Khoảng cách: 25.4 km
                    <br />
                    Thời gian dự kiến: 45 phút
                    <br />
                    Tránh khu vực có mưa
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Orders */}
        {exportOrders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconShield className='h-5 w-5 text-blue-600' />
                Đơn hàng xuất kho ({exportOrders.length} đơn)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {exportOrders.map((order) => (
                  <div key={order.id} className='rounded-lg border p-4'>
                    <div className='mb-4 flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <Badge variant='outline'>{order.status}</Badge>
                        {order.gpsEnabled && (
                          <Badge variant='secondary'>
                            <IconGps className='mr-1 h-3 w-3' />
                            GPS Active
                          </Badge>
                        )}
                      </div>
                      <div className='flex gap-2'>
                        {order.status === 'Chuẩn bị' && (
                          <Button
                            size='sm'
                            onClick={() => handleStartDelivery(order.id)}
                          >
                            <IconTruck className='mr-1 h-4 w-4' />
                            Bắt đầu vận chuyển
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className='grid gap-4 md:grid-cols-2'>
                      <div>
                        <p className='text-sm'>
                          <strong>Xe vận chuyển:</strong> {order.vehicle?.name}
                        </p>
                        <p className='text-sm'>
                          <strong>Tài xế:</strong> {order.vehicle?.driver}
                        </p>
                        <p className='text-sm'>
                          <strong>Điểm giao:</strong> {order.destination}
                        </p>
                        <p className='text-sm'>
                          <strong>Khách hàng:</strong> {order.customerInfo}
                        </p>
                        <p className='text-sm'>
                          <strong>Thời gian:</strong> {order.timestamp}
                        </p>
                      </div>

                      <div>
                        <p className='mb-2 text-sm font-medium'>Sản phẩm:</p>
                        <div className='space-y-1'>
                          {order.items.map((item: any) => (
                            <div
                              key={item.id}
                              className='bg-muted/50 rounded p-2 text-xs'
                            >
                              {item.name} - {item.quantity} {item.unit}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className='mt-4 flex items-center justify-between border-t pt-4'>
                      <div className='flex items-center gap-2'>
                        <IconShield className='h-4 w-4 text-blue-500' />
                        <span className='font-mono text-xs'>
                          {order.blockchainHash}
                        </span>
                      </div>
                      <Badge variant='outline' className='text-xs'>
                        Blockchain logged
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}

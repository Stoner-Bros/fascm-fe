'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import {
  IconTemperature,
  IconDroplet,
  IconGps,
  IconCamera,
  IconScale,
  IconWifi,
  IconBattery,
  IconSettings,
  IconActivity,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconRefresh,
  IconEye,
  IconVideo,
  IconRadar
} from '@tabler/icons-react';

interface IoTDevice {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'gps' | 'camera' | 'scale' | 'sensor';
  status: 'online' | 'offline' | 'warning' | 'error';
  value: string;
  unit?: string;
  location: string;
  battery: number;
  lastUpdate: string;
  image: string;
  isActive: boolean;
  settings?: {
    minThreshold?: number;
    maxThreshold?: number;
    alertEnabled?: boolean;
    updateInterval?: number;
  };
}

const mockDevices: IoTDevice[] = [
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
    isActive: true,
    settings: {
      minThreshold: 2,
      maxThreshold: 8,
      alertEnabled: true,
      updateInterval: 30
    }
  },
  {
    id: 'temp-002',
    name: 'Cảm biến nhiệt độ T2',
    type: 'temperature',
    status: 'warning',
    value: '9.1',
    unit: '°C',
    location: 'Khu vực B2 - Trái cây',
    battery: 45,
    lastUpdate: '5 phút trước',
    image: '/api/placeholder/200/150',
    isActive: true,
    settings: {
      minThreshold: 0,
      maxThreshold: 6,
      alertEnabled: true,
      updateInterval: 60
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
    isActive: false,
    settings: {
      minThreshold: 0,
      maxThreshold: 500,
      alertEnabled: true,
      updateInterval: 5
    }
  },
  {
    id: 'sensor-001',
    name: 'Cảm biến chất lượng không khí',
    type: 'sensor',
    status: 'online',
    value: '85',
    unit: 'AQI',
    location: 'Khu vực C3 - Đông lạnh',
    battery: 67,
    lastUpdate: '3 phút trước',
    image: '/api/placeholder/200/150',
    isActive: true,
    settings: {
      minThreshold: 70,
      maxThreshold: 100,
      alertEnabled: true,
      updateInterval: 120
    }
  }
];

const getDeviceIcon = (type: string) => {
  switch (type) {
    case 'temperature':
      return IconTemperature;
    case 'humidity':
      return IconDroplet;
    case 'gps':
      return IconGps;
    case 'camera':
      return IconCamera;
    case 'scale':
      return IconScale;
    case 'sensor':
      return IconRadar;
    default:
      return IconRadar;
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
  const [devices, setDevices] = useState<IoTDevice[]>(mockDevices);
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices((prev) =>
        prev.map((device) => {
          if (device.status === 'online' && device.isActive) {
            let newValue = device.value;

            // Simulate value changes
            switch (device.type) {
              case 'temperature':
                const temp =
                  parseFloat(device.value) + (Math.random() - 0.5) * 0.5;
                newValue = temp.toFixed(1);
                break;
              case 'humidity':
                const humid =
                  parseInt(device.value) +
                  Math.floor((Math.random() - 0.5) * 3);
                newValue = Math.max(0, Math.min(100, humid)).toString();
                break;
              case 'sensor':
                const aqi =
                  parseInt(device.value) +
                  Math.floor((Math.random() - 0.5) * 5);
                newValue = Math.max(0, Math.min(100, aqi)).toString();
                break;
            }

            return {
              ...device,
              value: newValue,
              lastUpdate: 'Vừa xong',
              battery: Math.max(0, device.battery - Math.random() * 0.1)
            };
          }
          return device;
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.location.toLowerCase().includes(searchTerm.toLowerCase());

    switch (activeTab) {
      case 'active':
        return device.isActive && matchesSearch;
      case 'offline':
        return (
          !device.isActive || (device.status === 'offline' && matchesSearch)
        );
      case 'warning':
        return device.status === 'warning' && matchesSearch;
      default:
        return matchesSearch;
    }
  });

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
  };

  const refreshDevice = (deviceId: string) => {
    setDevices((prev) =>
      prev.map((device) =>
        device.id === deviceId ? { ...device, lastUpdate: 'Vừa xong' } : device
      )
    );
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
          <Button variant='outline'>
            <IconRefresh className='mr-2 h-4 w-4' />
            Làm mới tất cả
          </Button>
          <Button>
            <IconSettings className='mr-2 h-4 w-4' />
            Cài đặt hệ thống
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value='all'>Tất cả ({devices.length})</TabsTrigger>
            <TabsTrigger value='active'>
              Hoạt động ({devices.filter((d) => d.isActive).length})
            </TabsTrigger>
            <TabsTrigger value='offline'>
              Offline (
              {
                devices.filter((d) => !d.isActive || d.status === 'offline')
                  .length
              }
              )
            </TabsTrigger>
            <TabsTrigger value='warning'>
              Cảnh báo ({devices.filter((d) => d.status === 'warning').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Device Grid */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {filteredDevices.map((device) => {
          const IconComponent = getDeviceIcon(device.type);
          return (
            <Card
              key={device.id}
              className={`transition-all hover:shadow-lg ${
                device.status === 'warning'
                  ? 'border-yellow-300'
                  : device.status === 'error'
                    ? 'border-red-300'
                    : device.isActive
                      ? 'border-green-300'
                      : 'border-gray-200'
              }`}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between'>
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
                      <CardTitle className='text-lg'>{device.name}</CardTitle>
                      <p className='text-muted-foreground text-sm'>
                        {device.location}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={device.isActive}
                    onCheckedChange={() => toggleDevice(device.id)}
                  />
                </div>
              </CardHeader>

              <CardContent className='space-y-4'>
                {/* Device Image */}
                <div className='bg-muted h-32 w-full overflow-hidden rounded-lg'>
                  <img
                    src={device.image}
                    alt={device.name}
                    className='h-full w-full object-cover'
                  />
                </div>

                {/* Status and Value */}
                <div className='flex items-center justify-between'>
                  {getStatusBadge(device.status)}
                  <div className='text-right'>
                    <div className='text-2xl font-bold'>
                      {device.value}
                      {device.unit}
                    </div>
                    <div className='text-muted-foreground text-xs'>
                      {device.lastUpdate}
                    </div>
                  </div>
                </div>

                {/* Battery */}
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='flex items-center gap-1'>
                      <IconBattery className='h-4 w-4' />
                      Pin
                    </span>
                    <span>{Math.round(device.battery)}%</span>
                  </div>
                  <Progress value={device.battery} className='h-2' />
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
                        <DialogTitle className='flex items-center gap-2'>
                          <IconComponent
                            className={`h-5 w-5 ${getStatusColor(device.status)}`}
                          />
                          {device.name}
                        </DialogTitle>
                      </DialogHeader>

                      {selectedDevice && (
                        <div className='space-y-6'>
                          {/* Device Image */}
                          <div className='bg-muted h-48 w-full overflow-hidden rounded-lg'>
                            <img
                              src={selectedDevice.image}
                              alt={selectedDevice.name}
                              className='h-full w-full object-cover'
                            />
                          </div>

                          {/* Device Info */}
                          <div className='grid gap-4 md:grid-cols-2'>
                            <div className='space-y-2'>
                              <Label>Trạng thái</Label>
                              {getStatusBadge(selectedDevice.status)}
                            </div>
                            <div className='space-y-2'>
                              <Label>Giá trị hiện tại</Label>
                              <div className='text-2xl font-bold'>
                                {selectedDevice.value}
                                {selectedDevice.unit}
                              </div>
                            </div>
                            <div className='space-y-2'>
                              <Label>Vị trí</Label>
                              <p>{selectedDevice.location}</p>
                            </div>
                            <div className='space-y-2'>
                              <Label>Cập nhật lần cuối</Label>
                              <p>{selectedDevice.lastUpdate}</p>
                            </div>
                            <div className='space-y-2'>
                              <Label>Mức pin</Label>
                              <div className='flex items-center gap-2'>
                                <Progress
                                  value={selectedDevice.battery}
                                  className='h-2 flex-1'
                                />
                                <span className='text-sm'>
                                  {Math.round(selectedDevice.battery)}%
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Settings */}
                          {selectedDevice.settings && (
                            <div className='space-y-4'>
                              <h3 className='text-lg font-semibold'>
                                Cài đặt thiết bị
                              </h3>
                              <div className='grid gap-4 md:grid-cols-2'>
                                {selectedDevice.settings.minThreshold !==
                                  undefined && (
                                  <div className='space-y-2'>
                                    <Label>Ngưỡng tối thiểu</Label>
                                    <Input
                                      type='number'
                                      value={
                                        selectedDevice.settings.minThreshold
                                      }
                                      readOnly
                                    />
                                  </div>
                                )}
                                {selectedDevice.settings.maxThreshold !==
                                  undefined && (
                                  <div className='space-y-2'>
                                    <Label>Ngưỡng tối đa</Label>
                                    <Input
                                      type='number'
                                      value={
                                        selectedDevice.settings.maxThreshold
                                      }
                                      readOnly
                                    />
                                  </div>
                                )}
                                <div className='space-y-2'>
                                  <Label>Tần suất cập nhật (giây)</Label>
                                  <Input
                                    type='number'
                                    value={
                                      selectedDevice.settings.updateInterval
                                    }
                                    readOnly
                                  />
                                </div>
                                <div className='flex items-center space-x-2'>
                                  <Switch
                                    checked={
                                      selectedDevice.settings.alertEnabled
                                    }
                                    disabled
                                  />
                                  <Label>Bật cảnh báo</Label>
                                </div>
                              </div>
                            </div>
                          )}
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

      {filteredDevices.length === 0 && (
        <div className='py-12 text-center'>
          <IconRadar className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
          <h3 className='mb-2 text-lg font-semibold'>
            Không tìm thấy thiết bị
          </h3>
          <p className='text-muted-foreground'>
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </div>
      )}
    </div>
  );
}

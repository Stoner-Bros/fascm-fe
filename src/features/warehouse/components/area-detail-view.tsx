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
import { Area, Warehouse, Product, Sensor } from '@/types/inventory';
import AreaCharts from '@/components/charts/area-charts';

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

  // Mock data - trong thực tế sẽ fetch từ API
  const mockWarehouse: Warehouse = {
    id: 'WH001',
    name: 'Kho Trung tâm Hà Nội',
    location: '123 Đường ABC, Quận Đống Đa, Hà Nội',
    address: '123 Đường ABC, Quận Đống Đa, Hà Nội',
    manager: 'Nguyễn Văn A',
    phone: '024-1234-5678',
    email: 'manager.hanoi@company.com',
    status: 'active',
    totalCapacity: 1500,
    currentCapacity: 1230,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    areas: []
  };

  const mockArea: Area = {
    id: 'A1',
    warehouseId: 'WH001',
    name: 'Khu vực A1 - Sản phẩm khô',
    type: 'Khô',
    capacity: 500,
    currentStock: 410,
    temperature: 25,
    humidity: 60,
    status: 'normal',
    sensors: [
      {
        id: 'TEMP_001',
        areaId: 'A1',
        type: 'temperature',
        value: 25,
        unit: '°C',
        status: 'normal',
        lastReading: new Date().toISOString(),
        lastUpdate: new Date().toISOString()
      },
      {
        id: 'HUM_001',
        areaId: 'A1',
        type: 'humidity',
        value: 60,
        unit: '%',
        status: 'normal',
        lastReading: new Date().toISOString(),
        lastUpdate: new Date().toISOString()
      }
    ],
    products: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString()
  };

  const mockProducts: Product[] = [
    {
      id: 'PROD001',
      name: 'Cà chua',
      sku: 'TOMATO-001',
      category: {
        id: 'CAT001',
        name: 'Rau củ quả',
        storageType: 'tươi sống',
        shelfLife: 7
      },
      unit: 'kg',
      description: 'Cà chua tươi từ Đà Lạt',
      minStockLevel: 50,
      maxStockLevel: 500,
      currentStock: 150,
      reservedStock: 0,
      availableStock: 150,
      areaId: 'A1',
      batches: [],
      supplier: {
        id: 'SUP001',
        name: 'Nông trại Đà Lạt',
        contactPerson: 'Nguyễn Văn A',
        phone: '0123456789',
        email: 'contact@dalat-farm.com',
        address: 'Đà Lạt, Lâm Đồng',
        rating: 4.5,
        isActive: true,
        certifications: ['VietGAP', 'Organic']
      },
      storageRequirements: {
        minTemperature: 2,
        maxTemperature: 8,
        minHumidity: 85,
        maxHumidity: 95
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'PROD002',
      name: 'Cà rốt',
      sku: 'CARROT-001',
      category: {
        id: 'CAT001',
        name: 'Rau củ quả',
        storageType: 'tươi sống',
        shelfLife: 14
      },
      unit: 'kg',
      description: 'Cà rốt tươi từ Đà Lạt',
      minStockLevel: 30,
      maxStockLevel: 300,
      currentStock: 80,
      reservedStock: 0,
      availableStock: 80,
      areaId: 'A1',
      batches: [],
      supplier: {
        id: 'SUP001',
        name: 'Nông trại Đà Lạt',
        contactPerson: 'Nguyễn Văn A',
        phone: '0123456789',
        email: 'contact@dalat-farm.com',
        address: 'Đà Lạt, Lâm Đồng',
        rating: 4.5,
        isActive: true,
        certifications: ['VietGAP', 'Organic']
      },
      storageRequirements: {
        minTemperature: 0,
        maxTemperature: 4,
        minHumidity: 90,
        maxHumidity: 95
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'PROD003',
      name: 'Dưa',
      sku: 'PEPPER-002',
      category: {
        id: 'CAT001',
        name: 'Rau củ quả',
        storageType: 'khô ráo',
        shelfLife: 365
      },
      unit: 'kg',
      description: 'Dưa tươi từ Đà Lạt',
      minStockLevel: 100,
      maxStockLevel: 500,
      currentStock: 200,
      reservedStock: 0,
      availableStock: 200,
      areaId: 'A1',
      batches: [],
      supplier: {
        id: 'SUP002',
        name: 'Nông trại Đà Lạt',
        contactPerson: 'Nguyễn Văn A',
        phone: '0123456789',
        email: 'contact@dalat-farm.com',
        address: 'Đà Lạt, Lâm Đồng',
        rating: 4.5,
        isActive: true,
        certifications: ['VietGAP', 'Organic']
      },
      storageRequirements: {
        minTemperature: 0,
        maxTemperature: 4,
        minHumidity: 90,
        maxHumidity: 95
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  const mockAlerts = [
    {
      id: 'ALERT001',
      type: 'warning',
      title: 'Nhiệt độ cao',
      message: 'Nhiệt độ khu vực vượt ngưỡng an toàn',
      value: 28,
      threshold: 27,
      unit: '°C',
      time: '10:30 AM',
      status: 'active'
    },
    {
      id: 'ALERT002',
      type: 'info',
      title: 'Tồn kho thấp',
      message: 'Sản phẩm cà rốt sắp hết hàng',
      value: 80,
      threshold: 100,
      unit: 'kg',
      time: '09:15 AM',
      status: 'resolved'
    }
  ];

  const mockActivities = [
    {
      id: 'ACT001',
      type: 'import',
      description: 'Nhập kho 100kg cà chua',
      user: 'Nguyễn Văn B',
      time: '2 giờ trước',
      status: 'completed'
    },
    {
      id: 'ACT002',
      type: 'export',
      description: 'Xuất kho 50kg cà rốt',
      user: 'Trần Thị C',
      time: '4 giờ trước',
      status: 'completed'
    },
    {
      id: 'ACT003',
      type: 'maintenance',
      description: 'Bảo trì cảm biến nhiệt độ',
      user: 'Lê Văn D',
      time: '1 ngày trước',
      status: 'completed'
    }
  ];

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

  const capacityPercentage = (mockArea.currentStock / mockArea.capacity) * 100;

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
            <h1 className='text-3xl font-bold'>{mockArea.name}</h1>
            <p className='text-muted-foreground'>
              {mockWarehouse.name} • Cập nhật lần cuối:{' '}
              {realTimeData.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm'>
            <IconRefresh className='mr-2 h-4 w-4' />
            Làm mới
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
            <div className='text-2xl font-bold'>{mockArea.temperature}°C</div>
            <p className='text-muted-foreground text-xs'>Ngưỡng: 20-27°C</p>
            <div className='mt-2'>{getStatusBadge(mockArea.status)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Độ ẩm</CardTitle>
            <IconDroplet className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{mockArea.humidity}%</div>
            <p className='text-muted-foreground text-xs'>Ngưỡng: 50-70%</p>
            <div className='mt-2'>{getStatusBadge(mockArea.status)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Dung tích</CardTitle>
            <IconBox className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {mockArea.currentStock}/{mockArea.capacity}
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
              {mockAlerts.filter((a) => a.status === 'active').length}
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
                    <p className='font-semibold'>{mockArea.id}</p>
                  </div>
                  <div>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Loại khu vực
                    </p>
                    <Badge variant='outline'>{mockArea.type}</Badge>
                  </div>
                  <div>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Trạng thái
                    </p>
                    {getStatusBadge(mockArea.status)}
                  </div>
                  <div>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Số sản phẩm
                    </p>
                    <p className='font-semibold'>{mockProducts.length} loại</p>
                  </div>
                </div>
                <div>
                  <p className='text-muted-foreground mb-2 text-sm font-medium'>
                    Tỷ lệ sử dụng
                  </p>
                  <Progress value={capacityPercentage} className='h-2' />
                  <p className='text-muted-foreground mt-1 text-xs'>
                    {mockArea.currentStock} / {mockArea.capacity} đơn vị (
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
              <CardContent className='space-y-4'>
                {mockArea.sensors.map((sensor: Sensor) => (
                  <div
                    key={sensor.id}
                    className='flex items-center justify-between rounded-lg border p-3'
                  >
                    <div className='flex items-center gap-3'>
                      <div
                        className={`h-3 w-3 rounded-full ${getStatusColor(sensor.status)}`}
                      />
                      <div>
                        <p className='font-medium'>
                          {sensor.type === 'temperature' ? 'Nhiệt độ' : 'Độ ẩm'}
                        </p>
                        <p className='text-muted-foreground text-sm'>
                          ID: {sensor.id}
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='font-semibold'>
                        {sensor.value}
                        {sensor.unit}
                      </p>
                      <p className='text-muted-foreground text-xs'>
                        {new Date(sensor.lastUpdate!).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
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
              <div className='space-y-3'>
                {mockActivities.slice(0, 5).map((activity) => (
                  <div
                    key={activity.id}
                    className='flex items-center gap-3 rounded-lg border p-3'
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        activity.type === 'import'
                          ? 'bg-green-500'
                          : activity.type === 'export'
                            ? 'bg-blue-500'
                            : 'bg-orange-500'
                      }`}
                    />
                    <div className='flex-1'>
                      <p className='font-medium'>{activity.description}</p>
                      <p className='text-muted-foreground text-sm'>
                        Bởi {activity.user} • {activity.time}
                      </p>
                    </div>
                    <Badge variant='outline' className='text-green-600'>
                      {activity.status === 'completed'
                        ? 'Hoàn thành'
                        : 'Đang xử lý'}
                    </Badge>
                  </div>
                ))}
              </div>
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

          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {mockProducts.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle className='text-base'>{product.name}</CardTitle>
                  <CardDescription>SKU: {product.sku}</CardDescription>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='grid grid-cols-2 gap-2 text-sm'>
                    <div>
                      <p className='text-muted-foreground'>Tồn kho</p>
                      <p className='font-semibold'>
                        {product.currentStock} {product.unit}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className='text-muted-foreground mb-1 text-sm'>
                      Mức tồn kho
                    </p>
                    <Progress
                      value={
                        (product.currentStock / product.maxStockLevel) * 100
                      }
                      className='h-2'
                    />
                    <p className='text-muted-foreground mt-1 text-xs'>
                      {product.minStockLevel} - {product.maxStockLevel}{' '}
                      {product.unit}
                    </p>
                  </div>
                  <div className='flex gap-2'>
                    <Button variant='outline' size='sm' className='flex-1'>
                      <IconEye className='mr-1 h-3 w-3' />
                      Xem
                    </Button>
                    <Button variant='outline' size='sm' className='flex-1'>
                      <IconEdit className='mr-1 h-3 w-3' />
                      Sửa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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

          <div className='space-y-3'>
            {mockAlerts.map((alert) => (
              <Card
                key={alert.id}
                className={`border-l-4 ${
                  alert.type === 'warning'
                    ? 'border-l-yellow-500'
                    : alert.type === 'critical'
                      ? 'border-l-red-500'
                      : 'border-l-blue-500'
                }`}
              >
                <CardContent className='pt-4'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='mb-2 flex items-center gap-2'>
                        <IconAlertTriangle
                          className={`h-4 w-4 ${
                            alert.type === 'warning'
                              ? 'text-yellow-500'
                              : alert.type === 'critical'
                                ? 'text-red-500'
                                : 'text-blue-500'
                          }`}
                        />
                        <h4 className='font-semibold'>{alert.title}</h4>
                        <Badge
                          variant={
                            alert.status === 'active'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {alert.status === 'active'
                            ? 'Đang hoạt động'
                            : 'Đã xử lý'}
                        </Badge>
                      </div>
                      <p className='text-muted-foreground mb-2 text-sm'>
                        {alert.message}
                      </p>
                      <div className='text-muted-foreground flex items-center gap-4 text-xs'>
                        <span>
                          Giá trị: {alert.value}
                          {alert.unit}
                        </span>
                        <span>
                          Ngưỡng: {alert.threshold}
                          {alert.unit}
                        </span>
                        <span>Thời gian: {alert.time}</span>
                      </div>
                    </div>
                    <Button variant='outline' size='sm'>
                      {alert.status === 'active' ? 'Xử lý' : 'Xem chi tiết'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
              <div className='space-y-4'>
                {mockActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className='flex items-center gap-4 rounded-lg border p-4'
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        activity.type === 'import'
                          ? 'bg-green-100 text-green-600'
                          : activity.type === 'export'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-orange-100 text-orange-600'
                      }`}
                    >
                      {activity.type === 'import' ? (
                        <IconPackage className='h-5 w-5' />
                      ) : activity.type === 'export' ? (
                        <IconBarcode className='h-5 w-5' />
                      ) : (
                        <IconSettings className='h-5 w-5' />
                      )}
                    </div>
                    <div className='flex-1'>
                      <p className='font-medium'>{activity.description}</p>
                      <p className='text-muted-foreground text-sm'>
                        Thực hiện bởi {activity.user} • {activity.time}
                      </p>
                    </div>
                    <Badge variant='outline' className='text-green-600'>
                      {activity.status === 'completed'
                        ? 'Hoàn thành'
                        : 'Đang xử lý'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value='settings' className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h3 className='text-lg font-semibold'>Cài đặt khu vực</h3>
            <Button>
              <IconShield className='mr-2 h-4 w-4' />
              Lưu thay đổi
            </Button>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Ngưỡng cảnh báo</CardTitle>
                <CardDescription>
                  Cài đặt các ngưỡng để nhận cảnh báo tự động
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <label className='text-sm font-medium'>
                    Nhiệt độ tối đa (°C)
                  </label>
                  <input
                    type='number'
                    defaultValue='27'
                    className='mt-1 w-full rounded-md border px-3 py-2'
                  />
                </div>
                <div>
                  <label className='text-sm font-medium'>
                    Độ ẩm tối đa (%)
                  </label>
                  <input
                    type='number'
                    defaultValue='70'
                    className='mt-1 w-full rounded-md border px-3 py-2'
                  />
                </div>
                <div>
                  <label className='text-sm font-medium'>
                    Mức tồn kho tối thiểu
                  </label>
                  <input
                    type='number'
                    defaultValue='100'
                    className='mt-1 w-full rounded-md border px-3 py-2'
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thông báo</CardTitle>
                <CardDescription>
                  Cấu hình cách thức nhận thông báo
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <label className='text-sm font-medium'>Email thông báo</label>
                  <input type='checkbox' defaultChecked className='rounded' />
                </div>
                <div className='flex items-center justify-between'>
                  <label className='text-sm font-medium'>
                    SMS cảnh báo khẩn cấp
                  </label>
                  <input type='checkbox' defaultChecked className='rounded' />
                </div>
                <div className='flex items-center justify-between'>
                  <label className='text-sm font-medium'>Thông báo push</label>
                  <input type='checkbox' className='rounded' />
                </div>
                <div>
                  <label className='text-sm font-medium'>
                    Tần suất báo cáo
                  </label>
                  <select className='mt-1 w-full rounded-md border px-3 py-2'>
                    <option>Hàng ngày</option>
                    <option>Hàng tuần</option>
                    <option>Hàng tháng</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

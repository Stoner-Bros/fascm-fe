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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  IconActivity,
  IconAlertTriangle,
  IconAntennaBars5,
  IconBattery,
  IconClock,
  IconDeviceDesktop,
  IconDroplet,
  IconEye,
  IconMapPin,
  IconRefresh,
  IconRoute,
  IconSettings,
  IconShield,
  IconTemperature,
  IconTruck,
  IconWifi,
  IconPackage,
  IconArrowUp,
  IconArrowDown,
  IconBuilding,
  IconContainer,
  IconBox,
  IconFilter,
  IconMap,
  IconSearch,
  IconChevronRight,
  IconAlertCircle,
  IconExclamationMark,
  IconCheck,
  IconPlayerPause,
  IconPlayerPlay,
  IconCircleCheck
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface IoTDashboardProps {
  className?: string;
  warehouseId?: string;
}

interface IoTDevice {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'gps' | 'vibration' | 'pressure' | 'shock';
  value: number | string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  battery: number;
  signal: number;
  location: string;
  lastUpdate: Date;
  threshold: { min: number; max: number } | null;
}

interface ProductBatch {
  id: string;
  name: string;
  productType: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  iotDevices: IoTDevice[];
}

interface Container {
  id: string;
  name: string;
  type: 'import' | 'export';
  status: 'loading' | 'in_transit' | 'arrived' | 'unloading' | 'completed';
  route?: string;
  vehicle?: string;
  driver?: string;
  gpsLocation?: string;
  locationName?: string;
  progress: number;
  estimatedTime: string;
  batches: ProductBatch[];
  cargoType: string;
  departureTime?: string;
  arrivalTime?: string;
}

interface Warehouse {
  id: string;
  name: string;
  location: string;
  containers: Container[];
}

interface MapMarker {
  id: string;
  containerId: string;
  lat: number;
  lng: number;
  status: string;
  temperature: number;
  alerts: number;
}

function IoTDashboard({ className, warehouseId }: IoTDashboardProps) {
  const [realTimeData, setRealTimeData] = useState(
    new Date().toLocaleTimeString()
  );
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [selectedContainer, setSelectedContainer] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  const [routeFilter, setRouteFilter] = useState('all');
  const [cargoFilter, setCargoFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMapPlaying, setIsMapPlaying] = useState(false);

  // Enhanced mock data with more containers and detailed information
  const [warehousesData, setWarehousesData] = useState<Warehouse[]>([
    {
      id: 'wh-001',
      name: 'Kho Trung tâm Hà Nội',
      location: 'Số 123 Đường ABC, Hà Nội',
      containers: [
        {
          id: 'CNT-001',
          name: 'Container CNT-001',
          type: 'export',
          status: 'in_transit',
          route: 'Hà Nội → TP.HCM',
          vehicle: 'Xe tải VN-29A-12345',
          driver: 'Nguyễn Văn A',
          gpsLocation: '21.0285, 105.8542',
          locationName: 'Cao tốc Hà Nội - Hải Phòng',
          progress: 35,
          estimatedTime: '14:30 hôm nay',
          cargoType: 'Rau lá tươi',
          departureTime: '08:00',
          batches: [
            {
              id: 'BATCH-001',
              name: 'Lô rau lá tươi #001',
              productType: 'Rau lá tươi',
              quantity: 500,
              unit: 'kg',
              expiryDate: '2024-01-15',
              iotDevices: [
                {
                  id: 'TEMP-001-B001',
                  name: 'Cảm biến nhiệt độ #1',
                  type: 'temperature',
                  value: 4.2,
                  unit: '°C',
                  status: 'normal',
                  battery: 85,
                  signal: 92,
                  location: 'Góc trái lô hàng',
                  lastUpdate: new Date(),
                  threshold: { min: 2, max: 6 }
                },
                {
                  id: 'HUM-001-B001',
                  name: 'Cảm biến độ ẩm #1',
                  type: 'humidity',
                  value: 65,
                  unit: '%',
                  status: 'normal',
                  battery: 78,
                  signal: 88,
                  location: 'Trung tâm lô hàng',
                  lastUpdate: new Date(),
                  threshold: { min: 60, max: 70 }
                },
                {
                  id: 'SHOCK-001-B001',
                  name: 'Cảm biến rung động #1',
                  type: 'shock',
                  value: 1.2,
                  unit: 'G',
                  status: 'normal',
                  battery: 90,
                  signal: 95,
                  location: 'Đáy container',
                  lastUpdate: new Date(),
                  threshold: { min: 0, max: 2.0 }
                }
              ]
            }
          ]
        },
        {
          id: 'CNT-002',
          name: 'Container CNT-002',
          type: 'import',
          status: 'arrived',
          route: 'Cảng Hải Phòng → Hà Nội',
          vehicle: 'Xe container VN-30B-67890',
          driver: 'Trần Văn B',
          progress: 100,
          estimatedTime: 'Đã đến',
          cargoType: 'Thủy hải sản',
          departureTime: '06:00',
          arrivalTime: '10:30',
          batches: [
            {
              id: 'BATCH-003',
              name: 'Lô thủy hải sản #003',
              productType: 'Thủy hải sản đông lạnh',
              quantity: 800,
              unit: 'kg',
              expiryDate: '2024-02-01',
              iotDevices: [
                {
                  id: 'TEMP-003-B003',
                  name: 'Cảm biến nhiệt độ #3',
                  type: 'temperature',
                  value: -18.2,
                  unit: '°C',
                  status: 'normal',
                  battery: 92,
                  signal: 96,
                  location: 'Trung tâm lô hàng',
                  lastUpdate: new Date(),
                  threshold: { min: -20, max: -15 }
                },
                {
                  id: 'HUM-003-B003',
                  name: 'Cảm biến độ ẩm #3',
                  type: 'humidity',
                  value: 45,
                  unit: '%',
                  status: 'normal',
                  battery: 88,
                  signal: 94,
                  location: 'Hệ thống làm lạnh',
                  lastUpdate: new Date(),
                  threshold: { min: 40, max: 50 }
                }
              ]
            }
          ]
        },
        {
          id: 'CNT-003',
          name: 'Container CNT-003',
          type: 'export',
          status: 'in_transit',
          route: 'Hà Nội → Đà Nẵng',
          vehicle: 'Xe tải VN-35C-11111',
          driver: 'Lê Văn C',
          gpsLocation: '19.8563, 105.9131',
          locationName: 'Quốc lộ 1A - Thanh Hóa',
          progress: 68,
          estimatedTime: '16:20 hôm nay',
          cargoType: 'Điện tử',
          departureTime: '07:30',
          batches: [
            {
              id: 'BATCH-004',
              name: 'Lô thiết bị điện tử #004',
              productType: 'Thiết bị điện tử',
              quantity: 200,
              unit: 'thùng',
              expiryDate: '2025-01-01',
              iotDevices: [
                {
                  id: 'TEMP-004-B004',
                  name: 'Cảm biến nhiệt độ #4',
                  type: 'temperature',
                  value: 28.5,
                  unit: '°C',
                  status: 'warning',
                  battery: 65,
                  signal: 78,
                  location: 'Góc trái container',
                  lastUpdate: new Date(),
                  threshold: { min: 15, max: 25 }
                },
                {
                  id: 'SHOCK-004-B004',
                  name: 'Cảm biến rung động #4',
                  type: 'shock',
                  value: 2.8,
                  unit: 'G',
                  status: 'critical',
                  battery: 72,
                  signal: 81,
                  location: 'Đáy container',
                  lastUpdate: new Date(),
                  threshold: { min: 0, max: 2.0 }
                }
              ]
            }
          ]
        }
      ]
    }
  ]);

  // Mock map markers
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([
    {
      id: '1',
      containerId: 'CNT-001',
      lat: 21.0285,
      lng: 105.8542,
      status: 'in_transit',
      temperature: 4.2,
      alerts: 0
    },
    {
      id: '2',
      containerId: 'CNT-003',
      lat: 19.8563,
      lng: 105.9131,
      status: 'in_transit',
      temperature: 28.5,
      alerts: 2
    }
  ]);

  // Real-time data update simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Set initial warehouse selection
  useEffect(() => {
    if (warehouseId && warehousesData.length > 0) {
      const warehouse = warehousesData.find((w) => w.id === warehouseId);
      if (warehouse) {
        setSelectedWarehouse(warehouse.id);
      }
    } else if (warehousesData.length > 0) {
      setSelectedWarehouse(warehousesData[0].id);
    }
  }, [warehouseId, warehousesData]);

  const currentWarehouse = warehousesData.find(
    (w) => w.id === selectedWarehouse
  );
  const currentContainer = currentWarehouse?.containers.find(
    (c) => c.id === selectedContainer
  );

  // Filter containers based on search and filters
  const filteredContainers =
    currentWarehouse?.containers.filter((container) => {
      const matchesSearch =
        container.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        container.route?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        container.cargoType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRoute =
        routeFilter === 'all' || container.route?.includes(routeFilter);
      const matchesCargo =
        cargoFilter === 'all' || container.cargoType === cargoFilter;

      return matchesSearch && matchesRoute && matchesCargo;
    }) || [];

  // Calculate KPIs
  const calculateKPIs = () => {
    if (!currentWarehouse)
      return {
        safe: 0,
        warning: 0,
        critical: 0,
        avgTemp: 0,
        avgHumidity: 0,
        avgShock: 0
      };

    let safe = 0,
      warning = 0,
      critical = 0;
    let tempSum = 0,
      humiditySum = 0,
      shockSum = 0;
    let tempCount = 0,
      humidityCount = 0,
      shockCount = 0;

    currentWarehouse.containers.forEach((container) => {
      let containerHasWarning = false;
      let containerHasCritical = false;

      container.batches.forEach((batch) => {
        batch.iotDevices.forEach((device) => {
          if (device.status === 'critical') containerHasCritical = true;
          else if (device.status === 'warning') containerHasWarning = true;

          if (device.type === 'temperature') {
            tempSum += Number(device.value);
            tempCount++;
          } else if (device.type === 'humidity') {
            humiditySum += Number(device.value);
            humidityCount++;
          } else if (device.type === 'shock') {
            shockSum += Number(device.value);
            shockCount++;
          }
        });
      });

      if (containerHasCritical) critical++;
      else if (containerHasWarning) warning++;
      else safe++;
    });

    return {
      safe,
      warning,
      critical,
      avgTemp: tempCount > 0 ? (tempSum / tempCount).toFixed(1) : 0,
      avgHumidity:
        humidityCount > 0 ? (humiditySum / humidityCount).toFixed(1) : 0,
      avgShock: shockCount > 0 ? (shockSum / shockCount).toFixed(1) : 0
    };
  };

  const kpis = calculateKPIs();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getContainerStatusColor = (status: string) => {
    switch (status) {
      case 'loading':
        return 'bg-blue-100 text-blue-800';
      case 'in_transit':
        return 'bg-orange-100 text-orange-800';
      case 'arrived':
        return 'bg-green-100 text-green-800';
      case 'unloading':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getContainerTypeIcon = (type: string) => {
    return type === 'import' ? (
      <IconArrowDown className='h-4 w-4 text-blue-600' />
    ) : (
      <IconArrowUp className='h-4 w-4 text-green-600' />
    );
  };

  const getUniqueRoutes = () => {
    const routes = new Set<string>();
    currentWarehouse?.containers.forEach((c) => {
      if (c.route) routes.add(c.route);
    });
    return Array.from(routes);
  };

  const getUniqueCargoTypes = () => {
    const cargoTypes = new Set<string>();
    currentWarehouse?.containers.forEach((c) => {
      cargoTypes.add(c.cargoType);
    });
    return Array.from(cargoTypes);
  };

  return (
    <div className={cn('w-full max-w-full space-y-6', className)}>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='flex items-center gap-2 text-2xl font-bold'>
            <IconActivity className='h-6 w-6 text-blue-600' />
            Giám sát IoT Container
          </h2>
          <p className='text-muted-foreground'>
            Dashboard tổng quan và theo dõi chi tiết container
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

      {/* Warehouse Selection */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IconBuilding className='h-5 w-5 text-blue-600' />
            Chọn Kho
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {warehousesData.map((warehouse) => (
              <Card
                key={warehouse.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  selectedWarehouse === warehouse.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                )}
                onClick={() => {
                  setSelectedWarehouse(warehouse.id);
                  setSelectedContainer('');
                }}
              >
                <CardContent className='p-4'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <h3 className='font-semibold'>{warehouse.name}</h3>
                      <p className='text-muted-foreground text-sm'>
                        {warehouse.location}
                      </p>
                      <div className='mt-2 flex items-center gap-2'>
                        <IconContainer className='h-4 w-4 text-gray-500' />
                        <span className='text-sm'>
                          {warehouse.containers.length} container
                        </span>
                      </div>
                    </div>
                    {selectedWarehouse === warehouse.id && (
                      <Badge variant='default' className='bg-blue-600'>
                        Đã chọn
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      {currentWarehouse && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='overview'>Tổng quan</TabsTrigger>
            <TabsTrigger value='detail'>Chi tiết Container</TabsTrigger>
            <TabsTrigger value='map'>Bản đồ Tracking</TabsTrigger>
            <TabsTrigger value='alerts'>Cảnh báo & Sự kiện</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value='overview' className='space-y-6'>
            {/* KPI Cards */}
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-6'>
              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='flex items-center gap-2 text-sm'>
                    <IconCheck className='h-4 w-4 text-green-500' />
                    An toàn 🟢
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold text-green-600'>
                    {kpis.safe}
                  </div>
                  <p className='text-muted-foreground text-xs'>Container</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='flex items-center gap-2 text-sm'>
                    <IconAlertTriangle className='h-4 w-4 text-yellow-500' />
                    Cảnh báo 🟡
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold text-yellow-600'>
                    {kpis.warning}
                  </div>
                  <p className='text-muted-foreground text-xs'>Container</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='flex items-center gap-2 text-sm'>
                    <IconAlertCircle className='h-4 w-4 text-red-500' />
                    Nguy hiểm 🔴
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold text-red-600'>
                    {kpis.critical}
                  </div>
                  <p className='text-muted-foreground text-xs'>Container</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='flex items-center gap-2 text-sm'>
                    <IconTemperature className='h-4 w-4 text-blue-500' />
                    TB Nhiệt độ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold text-blue-600'>
                    {kpis.avgTemp}°C
                  </div>
                  <p className='text-muted-foreground text-xs'>Trung bình</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='flex items-center gap-2 text-sm'>
                    <IconDroplet className='h-4 w-4 text-cyan-500' />
                    TB Độ ẩm
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold text-cyan-600'>
                    {kpis.avgHumidity}%
                  </div>
                  <p className='text-muted-foreground text-xs'>Trung bình</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='pb-2'>
                  <CardTitle className='flex items-center gap-2 text-sm'>
                    <IconActivity className='h-4 w-4 text-purple-500' />
                    TB Shock
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold text-purple-600'>
                    {kpis.avgShock}G
                  </div>
                  <p className='text-muted-foreground text-xs'>Trung bình</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconFilter className='h-5 w-5 text-blue-600' />
                  Bộ lọc
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid gap-4 sm:grid-cols-4'>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>Tìm kiếm</label>
                    <div className='relative'>
                      <IconSearch className='text-muted-foreground absolute top-2.5 left-2 h-4 w-4' />
                      <Input
                        placeholder='ID, tuyến đường, loại hàng...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='pl-8'
                      />
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>Tuyến đường</label>
                    <Select value={routeFilter} onValueChange={setRouteFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn tuyến đường' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>Tất cả tuyến đường</SelectItem>
                        {getUniqueRoutes().map((route) => (
                          <SelectItem key={route} value={route}>
                            {route}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>Loại hàng</label>
                    <Select value={cargoFilter} onValueChange={setCargoFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn loại hàng' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='all'>Tất cả loại hàng</SelectItem>
                        {getUniqueCargoTypes().map((cargo) => (
                          <SelectItem key={cargo} value={cargo}>
                            {cargo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='flex items-end'>
                    <Button variant='outline' className='w-full'>
                      <IconRefresh className='mr-2 h-4 w-4' />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Container List */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconContainer className='h-5 w-5 text-blue-600' />
                  Danh sách Container đang vận chuyển (
                  {filteredContainers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {filteredContainers.map((container) => (
                    <Card
                      key={container.id}
                      className={cn(
                        'cursor-pointer transition-all hover:shadow-md',
                        selectedContainer === container.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      )}
                      onClick={() => setSelectedContainer(container.id)}
                    >
                      <CardContent className='p-4'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-4'>
                            {getContainerTypeIcon(container.type)}
                            <div>
                              <h3 className='font-semibold'>{container.id}</h3>
                              <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                                <IconRoute className='h-3 w-3' />
                                <span>{container.route}</span>
                              </div>
                              <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                                <IconPackage className='h-3 w-3' />
                                <span>{container.cargoType}</span>
                              </div>
                            </div>
                          </div>
                          <div className='flex items-center gap-4'>
                            <div className='text-right'>
                              <Badge
                                className={getContainerStatusColor(
                                  container.status
                                )}
                              >
                                {container.status === 'loading' && 'Đang tải'}
                                {container.status === 'in_transit' &&
                                  'Đang vận chuyển'}
                                {container.status === 'arrived' && 'Đã đến'}
                                {container.status === 'unloading' && 'Đang dỡ'}
                                {container.status === 'completed' &&
                                  'Hoàn thành'}
                              </Badge>
                              {container.status === 'in_transit' && (
                                <div className='text-muted-foreground mt-1 text-sm'>
                                  {container.progress}% -{' '}
                                  {container.estimatedTime}
                                </div>
                              )}
                            </div>
                            <IconChevronRight className='text-muted-foreground h-4 w-4' />
                          </div>
                        </div>
                        {container.status === 'in_transit' && (
                          <div className='mt-3'>
                            <Progress
                              value={container.progress}
                              className='h-2'
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Container Detail Tab */}
          <TabsContent value='detail' className='space-y-6'>
            {currentContainer ? (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <IconBox className='h-5 w-5 text-green-600' />
                    Chi tiết {currentContainer.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-6'>
                    {/* Container Info */}
                    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                      <div>
                        <label className='text-muted-foreground text-sm font-medium'>
                          Tuyến đường
                        </label>
                        <p className='font-semibold'>
                          {currentContainer.route}
                        </p>
                      </div>
                      <div>
                        <label className='text-muted-foreground text-sm font-medium'>
                          Loại hàng
                        </label>
                        <p className='font-semibold'>
                          {currentContainer.cargoType}
                        </p>
                      </div>
                      <div>
                        <label className='text-muted-foreground text-sm font-medium'>
                          Tài xế
                        </label>
                        <p className='font-semibold'>
                          {currentContainer.driver}
                        </p>
                      </div>
                      <div>
                        <label className='text-muted-foreground text-sm font-medium'>
                          Xe
                        </label>
                        <p className='font-semibold'>
                          {currentContainer.vehicle}
                        </p>
                      </div>
                    </div>

                    {/* Sensor Data Table */}
                    <div>
                      <h4 className='mb-4 font-medium'>Dữ liệu Sensor</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Sensor ID</TableHead>
                            <TableHead>Tên</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Giá trị</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Pin</TableHead>
                            <TableHead>Tín hiệu</TableHead>
                            <TableHead>Vị trí</TableHead>
                            <TableHead>Cập nhật</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentContainer.batches.flatMap((batch) =>
                            batch.iotDevices.map((device) => (
                              <TableRow key={device.id}>
                                <TableCell className='font-mono text-sm'>
                                  {device.id}
                                </TableCell>
                                <TableCell>{device.name}</TableCell>
                                <TableCell>
                                  <Badge variant='outline'>{device.type}</Badge>
                                </TableCell>
                                <TableCell className='font-semibold'>
                                  {device.value}
                                  {device.unit}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={getStatusColor(device.status)}
                                  >
                                    {device.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className='flex items-center gap-1'>
                                    <IconBattery className='h-3 w-3' />
                                    {device.battery}%
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className='flex items-center gap-1'>
                                    <IconAntennaBars5 className='h-3 w-3' />
                                    {device.signal}%
                                  </div>
                                </TableCell>
                                <TableCell className='text-sm'>
                                  {device.location}
                                </TableCell>
                                <TableCell className='text-sm'>
                                  {device.lastUpdate.toLocaleTimeString()}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className='p-8 text-center'>
                  <IconContainer className='text-muted-foreground mx-auto h-12 w-12' />
                  <h3 className='mt-4 text-lg font-semibold'>Chọn Container</h3>
                  <p className='text-muted-foreground'>
                    Vui lòng chọn một container từ tab Tổng quan để xem chi tiết
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Map Tracking Tab */}
          <TabsContent value='map' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconMap className='h-5 w-5 text-green-600' />
                  Bản đồ Tracking Container
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {/* Map Controls */}
                  <div className='flex items-center gap-4'>
                    <Button
                      variant={isMapPlaying ? 'default' : 'outline'}
                      onClick={() => setIsMapPlaying(!isMapPlaying)}
                    >
                      {isMapPlaying ? (
                        <>
                          <IconPlayerPause className='mr-2 h-4 w-4' />
                          Tạm dừng
                        </>
                      ) : (
                        <>
                          <IconPlayerPlay className='mr-2 h-4 w-4' />
                          Phát lại
                        </>
                      )}
                    </Button>
                    <div className='text-muted-foreground text-sm'>
                      Timeline Playback - Xem lại dữ liệu IoT trong quá trình di
                      chuyển
                    </div>
                  </div>

                  {/* Simulated Map */}
                  <div className='relative h-96 rounded-lg border bg-gradient-to-br from-blue-50 to-green-50'>
                    <div className='absolute inset-4'>
                      <div className='text-muted-foreground text-center'>
                        <IconMap className='mx-auto mb-4 h-16 w-16' />
                        <h3 className='mb-2 text-lg font-semibold'>
                          Bản đồ Tracking (Mô phỏng)
                        </h3>
                        <p className='text-sm'>
                          Tích hợp Mapbox/Leaflet để hiển thị:
                        </p>
                        <ul className='mt-2 space-y-1 text-sm'>
                          <li>• Marker container với trạng thái màu</li>
                          <li>• Route từ xuất phát → điểm đến</li>
                          <li>
                            • Tooltip: Container ID, vị trí, nhiệt độ TB, số
                            cảnh báo
                          </li>
                          <li>• Timeline playback dữ liệu IoT</li>
                        </ul>
                      </div>
                    </div>

                    {/* Mock Markers */}
                    {mapMarkers.map((marker, index) => (
                      <div
                        key={marker.id}
                        className={cn(
                          'absolute h-4 w-4 cursor-pointer rounded-full border-2 border-white shadow-lg',
                          marker.status === 'in_transit'
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                        )}
                        style={{
                          left: `${20 + index * 30}%`,
                          top: `${30 + index * 20}%`
                        }}
                        title={`${marker.containerId} - ${marker.temperature}°C - ${marker.alerts} cảnh báo`}
                      />
                    ))}
                  </div>

                  {/* Container Status on Map */}
                  <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                    {filteredContainers
                      .filter((c) => c.status === 'in_transit')
                      .map((container) => (
                        <Card key={container.id} className='border-orange-200'>
                          <CardContent className='p-4'>
                            <div className='mb-2 flex items-center justify-between'>
                              <h4 className='font-semibold'>{container.id}</h4>
                              <div className='h-3 w-3 rounded-full bg-orange-500'></div>
                            </div>
                            <div className='space-y-1 text-sm'>
                              <div>📍 {container.locationName}</div>
                              <div>
                                🌡️ Nhiệt độ TB:{' '}
                                {container.batches
                                  .flatMap((b) => b.iotDevices)
                                  .filter((d) => d.type === 'temperature')
                                  .reduce(
                                    (sum, d, _, arr) =>
                                      sum + Number(d.value) / arr.length,
                                    0
                                  )
                                  .toFixed(1)}
                                °C
                              </div>
                              <div>
                                ⚠️ Cảnh báo:{' '}
                                {
                                  container.batches
                                    .flatMap((b) => b.iotDevices)
                                    .filter((d) => d.status !== 'normal').length
                                }
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts & Events Tab */}
          <TabsContent value='alerts' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconAlertTriangle className='h-5 w-5 text-yellow-600' />
                  Trung tâm Cảnh báo & Sự kiện
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {currentWarehouse?.containers
                    .flatMap((container) =>
                      container.batches.flatMap((batch) =>
                        batch.iotDevices
                          .filter((device) => device.status !== 'normal')
                          .map((device) => ({
                            id: device.id,
                            containerId: container.id,
                            containerName: container.name,
                            batchName: batch.name,
                            deviceName: device.name,
                            type: device.type,
                            status: device.status,
                            value: device.value,
                            unit: device.unit,
                            location: device.location,
                            time: device.lastUpdate.toLocaleTimeString()
                          }))
                      )
                    )
                    .map((alert) => (
                      <Card
                        key={alert.id}
                        className={cn(
                          'border-l-4',
                          alert.status === 'critical'
                            ? 'border-l-red-500 bg-red-50'
                            : 'border-l-yellow-500 bg-yellow-50'
                        )}
                      >
                        <CardContent className='p-4'>
                          <div className='flex items-start justify-between'>
                            <div className='space-y-1'>
                              <div className='flex items-center gap-2'>
                                <Badge className={getStatusColor(alert.status)}>
                                  {alert.status === 'critical'
                                    ? 'NGUY HIỂM'
                                    : 'CẢNH BÁO'}
                                </Badge>
                                <span className='font-semibold'>
                                  {alert.containerName}
                                </span>
                                <span className='text-muted-foreground'>→</span>
                                <span className='text-sm'>
                                  {alert.batchName}
                                </span>
                              </div>
                              <h4 className='font-medium'>
                                {alert.deviceName}
                              </h4>
                              <p className='text-muted-foreground text-sm'>
                                {alert.type === 'temperature' &&
                                  '🌡️ Nhiệt độ bất thường: '}
                                {alert.type === 'humidity' &&
                                  '💧 Độ ẩm bất thường: '}
                                {alert.type === 'shock' &&
                                  '⚡ Rung động mạnh: '}
                                <span className='font-semibold'>
                                  {alert.value}
                                  {alert.unit}
                                </span>
                              </p>
                              <div className='text-muted-foreground flex items-center gap-4 text-xs'>
                                <span>📍 {alert.location}</span>
                                <span>🕒 {alert.time}</span>
                              </div>
                            </div>
                            <Button variant='outline' size='sm'>
                              Xử lý
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                  {currentWarehouse?.containers.flatMap((container) =>
                    container.batches.flatMap((batch) =>
                      batch.iotDevices.filter(
                        (device) => device.status !== 'normal'
                      )
                    )
                  ).length === 0 && (
                    <div className='py-8 text-center'>
                      <IconCircleCheck className='mx-auto mb-4 h-12 w-12 text-green-500' />
                      <h3 className='text-lg font-semibold text-green-700'>
                        Tất cả đều ổn!
                      </h3>
                      <p className='text-muted-foreground'>
                        Không có cảnh báo nào cần xử lý
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export { IoTDashboard };

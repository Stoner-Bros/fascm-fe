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
  IconWifi
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface IoTDashboardProps {
  className?: string;
}

function IoTDashboard({ className }: IoTDashboardProps) {
  // State for real-time data simulation
  const [realTimeData, setRealTimeData] = useState(
    new Date().toLocaleTimeString()
  );
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());

  // Mock data for IoT devices in containers
  const [iotDevicesData, setIotDevicesData] = useState({
    containers: [
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
        iotDevices: [
          {
            id: 'TEMP-001-CNT001',
            name: 'Cảm biến nhiệt độ #1',
            type: 'temperature',
            value: 4.2,
            unit: '°C',
            status: 'normal',
            battery: 85,
            signal: 92,
            location: 'Góc trái container',
            lastUpdate: new Date(),
            threshold: { min: 2, max: 6 }
          },
          {
            id: 'HUM-001-CNT001',
            name: 'Cảm biến độ ẩm #1',
            type: 'humidity',
            value: 65,
            unit: '%',
            status: 'normal',
            battery: 78,
            signal: 88,
            location: 'Trung tâm container',
            lastUpdate: new Date(),
            threshold: { min: 60, max: 70 }
          },
          {
            id: 'GPS-001-CNT001',
            name: 'GPS Tracker #1',
            type: 'gps',
            value: '21.0285, 105.8542',
            unit: 'coordinates',
            status: 'normal',
            battery: 92,
            signal: 95,
            location: 'Mặt trên container',
            lastUpdate: new Date(),
            threshold: null
          },
          {
            id: 'VIB-001-CNT001',
            name: 'Cảm biến rung động #1',
            type: 'vibration',
            value: 2.1,
            unit: 'G',
            status: 'normal',
            battery: 71,
            signal: 85,
            location: 'Đáy container',
            lastUpdate: new Date(),
            threshold: { min: 0, max: 2.5 }
          }
        ]
      },
      {
        id: 'CNT-002',
        name: 'Container CNT-002',
        route: 'Đà Nẵng → Hà Nội',
        vehicle: 'Xe tải VN-43B-67890',
        driver: 'Trần Thị B',
        cargo: 'Trái cây nhiệt đới (800kg)',
        gpsLocation: '19.8563, 105.9131',
        locationName: 'Quốc lộ 1A - Thanh Hóa',
        progress: 68,
        estimatedArrival: '11:45 hôm nay',
        status: 'in_transit',
        iotDevices: [
          {
            id: 'TEMP-001-CNT002',
            name: 'Cảm biến nhiệt độ #1',
            type: 'temperature',
            value: 2.8,
            unit: '°C',
            status: 'normal',
            battery: 91,
            signal: 89,
            location: 'Góc phải container',
            lastUpdate: new Date(),
            threshold: { min: 2, max: 6 }
          },
          {
            id: 'HUM-001-CNT002',
            name: 'Cảm biến độ ẩm #1',
            type: 'humidity',
            value: 70,
            unit: '%',
            status: 'warning',
            battery: 83,
            signal: 91,
            location: 'Trung tâm container',
            lastUpdate: new Date(),
            threshold: { min: 60, max: 70 }
          },
          {
            id: 'GPS-001-CNT002',
            name: 'GPS Tracker #1',
            type: 'gps',
            value: '19.8563, 105.9131',
            unit: 'coordinates',
            status: 'normal',
            battery: 88,
            signal: 93,
            location: 'Mặt trên container',
            lastUpdate: new Date(),
            threshold: null
          }
        ]
      },
      {
        id: 'CNT-003',
        name: 'Container CNT-003',
        route: 'TP.HCM → Cần Thơ',
        vehicle: 'Xe tải VN-50C-11111',
        driver: 'Lê Văn C',
        cargo: 'Củ quả (1200kg)',
        gpsLocation: '10.4515, 106.1256',
        locationName: 'Cao tốc Trung Lương',
        progress: 22,
        estimatedArrival: '16:20 hôm nay',
        status: 'in_transit',
        iotDevices: [
          {
            id: 'TEMP-001-CNT003',
            name: 'Cảm biến nhiệt độ #1',
            type: 'temperature',
            value: 7.2,
            unit: '°C',
            status: 'warning',
            battery: 65,
            signal: 78,
            location: 'Góc trái container',
            lastUpdate: new Date(),
            threshold: { min: 2, max: 6 }
          },
          {
            id: 'VIB-001-CNT003',
            name: 'Cảm biến rung động #1',
            type: 'vibration',
            value: 3.5,
            unit: 'G',
            status: 'warning',
            battery: 72,
            signal: 81,
            location: 'Đáy container',
            lastUpdate: new Date(),
            threshold: { min: 0, max: 2.5 }
          },
          {
            id: 'GPS-001-CNT003',
            name: 'GPS Tracker #1',
            type: 'gps',
            value: '10.4515, 106.1256',
            unit: 'coordinates',
            status: 'normal',
            battery: 79,
            signal: 87,
            location: 'Mặt trên container',
            lastUpdate: new Date(),
            threshold: null
          }
        ]
      },
      {
        id: 'CNT-004',
        name: 'Container CNT-004',
        route: 'Hải Phòng → Hà Nội',
        vehicle: 'Xe tải VN-31D-22222',
        driver: 'Phạm Văn D',
        cargo: 'Thủy hải sản đông lạnh (600kg)',
        gpsLocation: '20.8449, 106.6881',
        locationName: 'Cầu Bính - Hải Phòng',
        progress: 85,
        estimatedArrival: '10:15 hôm nay',
        status: 'arriving_soon',
        iotDevices: [
          {
            id: 'TEMP-001-CNT004',
            name: 'Cảm biến nhiệt độ #1',
            type: 'temperature',
            value: -2.1,
            unit: '°C',
            status: 'normal',
            battery: 94,
            signal: 96,
            location: 'Trung tâm container',
            lastUpdate: new Date(),
            threshold: { min: -5, max: 0 }
          },
          {
            id: 'HUM-001-CNT004',
            name: 'Cảm biến độ ẩm #1',
            type: 'humidity',
            value: 45,
            unit: '%',
            status: 'normal',
            battery: 89,
            signal: 92,
            location: 'Góc phải container',
            lastUpdate: new Date(),
            threshold: { min: 40, max: 50 }
          },
          {
            id: 'GPS-001-CNT004',
            name: 'GPS Tracker #1',
            type: 'gps',
            value: '20.8449, 106.6881',
            unit: 'coordinates',
            status: 'normal',
            battery: 91,
            signal: 98,
            location: 'Mặt trên container',
            lastUpdate: new Date(),
            threshold: null
          }
        ]
      }
    ],
    alerts: [
      {
        id: 1,
        containerId: 'CNT-003',
        containerName: 'Container CNT-003',
        deviceId: 'TEMP-001-CNT003',
        deviceName: 'Cảm biến nhiệt độ #1',
        type: 'temperature',
        message:
          'Thiết bị TEMP-001-CNT003: Nhiệt độ cao bất thường (7.2°C) - Vượt ngưỡng an toàn',
        severity: 'warning',
        time: '10:45 AM',
        location: 'Góc trái container - Cao tốc Trung Lương'
      },
      {
        id: 2,
        containerId: 'CNT-003',
        containerName: 'Container CNT-003',
        deviceId: 'VIB-001-CNT003',
        deviceName: 'Cảm biến rung động #1',
        type: 'vibration',
        message:
          'Thiết bị VIB-001-CNT003: Rung động mạnh (3.5G) - Vượt ngưỡng 2.5G',
        severity: 'warning',
        time: '10:42 AM',
        location: 'Đáy container - Cao tốc Trung Lương'
      },
      {
        id: 3,
        containerId: 'CNT-002',
        containerName: 'Container CNT-002',
        deviceId: 'HUM-001-CNT002',
        deviceName: 'Cảm biến độ ẩm #1',
        type: 'humidity',
        message:
          'Thiết bị HUM-001-CNT002: Độ ẩm ở mức giới hạn (70%) - Theo dõi chặt chẽ',
        severity: 'info',
        time: '10:30 AM',
        location: 'Trung tâm container - Quốc lộ 1A'
      }
    ]
  });

  // Real-time simulation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(new Date().toLocaleTimeString());
      setLastUpdateTime(new Date());

      // Simulate real-time IoT device data changes
      setIotDevicesData((prevData) => ({
        ...prevData,
        containers: prevData.containers.map((container) => ({
          ...container,
          iotDevices: container.iotDevices.map((device) => {
            const newValue = simulateRealTimeValue(device);
            const newStatus = getDeviceStatus(
              newValue,
              device.type,
              device.threshold
            );
            return {
              ...device,
              value: newValue,
              status: newStatus,
              battery: Math.max(10, device.battery - Math.random() * 0.5),
              signal: Math.max(
                50,
                Math.min(100, device.signal + (Math.random() - 0.5) * 5)
              ),
              lastUpdate: new Date()
            };
          })
        }))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Simulate real-time value changes for IoT devices
  const simulateRealTimeValue = (device: any) => {
    const randomFactor = (Math.random() - 0.5) * 0.2;

    switch (device.type) {
      case 'temperature':
        return parseFloat((device.value + randomFactor).toFixed(1));
      case 'humidity':
        return Math.max(
          0,
          Math.min(100, Math.round(device.value + randomFactor * 5))
        );
      case 'vibration':
        return parseFloat(Math.max(0, device.value + randomFactor).toFixed(1));
      case 'gps':
        // For GPS, slightly modify coordinates
        const [lat, lng] = device.value.split(', ').map(parseFloat);
        const newLat = (lat + (Math.random() - 0.5) * 0.001).toFixed(6);
        const newLng = (lng + (Math.random() - 0.5) * 0.001).toFixed(6);
        return `${newLat}, ${newLng}`;
      default:
        return device.value;
    }
  };

  // Get device status based on value and threshold
  const getDeviceStatus = (value: any, type: string, threshold: any) => {
    if (!threshold) return 'normal';

    switch (type) {
      case 'temperature':
      case 'humidity':
      case 'vibration':
        const numValue = parseFloat(value);
        return numValue >= threshold.min && numValue <= threshold.max
          ? 'normal'
          : 'warning';
      default:
        return 'normal';
    }
  };

  // Get icon for device type
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'temperature':
        return IconTemperature;
      case 'humidity':
        return IconDroplet;
      case 'vibration':
        return IconActivity;
      case 'gps':
        return IconMapPin;
      default:
        return IconDeviceDesktop;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal':
        return (
          <Badge variant='default' className='bg-green-100 text-green-800'>
            Bình thường
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant='secondary' className='bg-yellow-100 text-yellow-800'>
            Cảnh báo
          </Badge>
        );
      case 'error':
        return <Badge variant='destructive'>Lỗi</Badge>;
      default:
        return <Badge variant='outline'>Không xác định</Badge>;
    }
  };

  const getTemperatureStatus = (temp: number, cargo: string) => {
    const isRefrigerated = cargo.includes('đông lạnh');
    return isRefrigerated
      ? temp >= -5 && temp <= 0
        ? 'normal'
        : 'warning'
      : temp >= 2 && temp <= 6
        ? 'normal'
        : 'warning';
  };

  const getHumidityStatus = (humidity: number) => {
    return humidity >= 60 && humidity <= 70 ? 'normal' : 'warning';
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='flex items-center gap-2 text-2xl font-bold'>
            <IconActivity className='h-6 w-6 text-blue-600' />
            Giám sát Thiết bị IoT Container
          </h2>
          <p className='text-muted-foreground'>
            Theo dõi trạng thái và hoạt động của các thiết bị IoT trong
            container theo thời gian thực
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

      {/* Real-time Status & Alerts */}
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

      {/* Alerts */}
      {iotDevicesData.alerts.length > 0 && (
        <Card className='border-yellow-200 bg-yellow-50'>
          <CardHeader>
            <CardTitle className='flex items-center text-yellow-800'>
              <IconAlertTriangle className='mr-2 h-5 w-5' />
              Cảnh báo Thiết bị IoT ({iotDevicesData.alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {iotDevicesData.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className='flex items-center justify-between rounded border bg-white p-2'
                >
                  <div className='flex-1'>
                    <div className='mb-1 flex items-center gap-2'>
                      <span className='font-medium'>{alert.containerName}</span>
                      <Badge variant='outline' className='text-xs'>
                        {alert.deviceName}
                      </Badge>
                      <Badge variant='outline' className='text-xs'>
                        {alert.type}
                      </Badge>
                    </div>
                    <p className='text-sm'>{alert.message}</p>
                    <div className='text-muted-foreground mt-1 flex items-center gap-1 text-xs'>
                      <IconMapPin className='h-3 w-3' />
                      {alert.location}
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-muted-foreground text-sm'>
                      {alert.time}
                    </span>
                    <Badge
                      variant={
                        alert.severity === 'warning' ? 'secondary' : 'default'
                      }
                    >
                      {alert.severity === 'warning' ? 'Cảnh báo' : 'Thông tin'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* IoT Devices Grid */}
      <div className='space-y-6'>
        {iotDevicesData.containers.map((container) => {
          const hasWarningDevices = container.iotDevices.some(
            (device) => device.status === 'warning'
          );

          return (
            <Card
              key={container.id}
              className={cn(
                'relative',
                hasWarningDevices ? 'border-yellow-300' : 'border-gray-200'
              )}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='flex items-center gap-2 text-lg font-semibold'>
                      <IconShield className='h-4 w-4 text-blue-500' />
                      {container.name}
                    </CardTitle>
                    <div className='mt-1 flex items-center gap-2'>
                      <IconRoute className='h-3 w-3 text-gray-500' />
                      <span className='text-muted-foreground text-sm'>
                        {container.route}
                      </span>
                    </div>
                  </div>
                  <div className='flex items-center gap-1'>
                    <IconWifi className='h-3 w-3 text-green-500' />
                    <Badge
                      variant={hasWarningDevices ? 'secondary' : 'default'}
                      className={
                        hasWarningDevices
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }
                    >
                      {container.iotDevices.length} thiết bị
                    </Badge>
                  </div>
                </div>

                {/* Transport Info */}
                <div className='space-y-2 border-t pt-2'>
                  <div className='flex items-center justify-between text-sm'>
                    <div className='flex items-center gap-1'>
                      <IconTruck className='h-3 w-3 text-blue-500' />
                      <span>{container.vehicle}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <IconActivity className='h-3 w-3 text-green-500' />
                      <span>{container.driver}</span>
                    </div>
                  </div>
                  <div className='text-muted-foreground text-sm'>
                    <strong>Hàng hóa:</strong> {container.cargo}
                  </div>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-1 text-sm'>
                      <IconMapPin className='h-3 w-3 text-red-500' />
                      <span className='text-muted-foreground'>
                        {container.locationName}
                      </span>
                    </div>
                    <div className='flex items-center gap-1 text-sm'>
                      <IconClock className='h-3 w-3 text-orange-500' />
                      <span className='text-muted-foreground'>
                        {container.estimatedArrival}
                      </span>
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <div className='flex justify-between text-sm'>
                      <span>Tiến độ vận chuyển</span>
                      <span className='font-medium'>{container.progress}%</span>
                    </div>
                    <Progress value={container.progress} className='h-2' />
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* IoT Devices List */}
                <div className='space-y-3'>
                  {container.iotDevices.map((device) => {
                    const DeviceIcon = getDeviceIcon(device.type);

                    return (
                      <div
                        key={device.id}
                        className={cn(
                          'rounded-lg border p-3 transition-colors',
                          device.status === 'warning'
                            ? 'border-yellow-200 bg-yellow-50'
                            : 'border-gray-200 bg-gray-50'
                        )}
                      >
                        <div className='mb-2 flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <DeviceIcon className='h-4 w-4 text-blue-500' />
                            <span className='text-sm font-medium'>
                              {device.name}
                            </span>
                            <Badge variant='outline' className='text-xs'>
                              {device.type}
                            </Badge>
                          </div>
                          <div className='flex items-center gap-2'>
                            <div className='flex items-center gap-1'>
                              <IconBattery className='h-3 w-3 text-green-500' />
                              <span className='text-muted-foreground text-xs'>
                                {Math.round(device.battery)}%
                              </span>
                            </div>
                            <div className='flex items-center gap-1'>
                              <IconAntennaBars5 className='h-3 w-3 text-blue-500' />
                              <span className='text-muted-foreground text-xs'>
                                {Math.round(device.signal)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <span className='text-lg font-semibold'>
                              {device.value}
                              {device.unit}
                            </span>
                            {getStatusBadge(device.status)}
                          </div>
                          {device.threshold && (
                            <div className='text-muted-foreground text-xs'>
                              Ngưỡng: {device.threshold.min}-
                              {device.threshold.max}
                              {device.unit}
                            </div>
                          )}
                        </div>

                        <div className='text-muted-foreground mt-2 text-xs'>
                          Vị trí: {device.location} • ID: {device.id}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Statistics */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-4'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <IconTruck className='h-4 w-4 text-blue-500' />
              Container đang vận chuyển
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {iotDevicesData.containers.length}
            </div>
            <p className='text-muted-foreground text-xs'>
              {
                iotDevicesData.containers.filter(
                  (c) => c.status === 'in_transit'
                ).length
              }{' '}
              đang di chuyển,{' '}
              {
                iotDevicesData.containers.filter(
                  (c) => c.status === 'arriving_soon'
                ).length
              }{' '}
              sắp đến
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <IconDeviceDesktop className='h-4 w-4 text-blue-500' />
              Tổng thiết bị IoT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {iotDevicesData.containers.reduce(
                (sum, c) => sum + c.iotDevices.length,
                0
              )}
            </div>
            <p className='text-muted-foreground text-xs'>
              Trên {iotDevicesData.containers.length} container
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <IconBattery className='h-4 w-4 text-green-500' />
              Pin trung bình
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>
              {(() => {
                const allDevices = iotDevicesData.containers.flatMap(
                  (c) => c.iotDevices
                );
                const avgBattery =
                  allDevices.reduce((sum, d) => sum + d.battery, 0) /
                  allDevices.length;
                return Math.round(avgBattery);
              })()}
              %
            </div>
            <p className='text-muted-foreground text-xs'>Trạng thái pin tốt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-sm'>
              <IconAlertTriangle className='h-4 w-4 text-yellow-500' />
              Thiết bị cảnh báo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-yellow-600'>
              {(() => {
                const allDevices = iotDevicesData.containers.flatMap(
                  (c) => c.iotDevices
                );
                const warningDevices = allDevices.filter(
                  (d) => d.status === 'warning'
                ).length;
                return `${warningDevices}/${allDevices.length}`;
              })()}
            </div>
            <p className='text-muted-foreground text-xs'>
              {iotDevicesData.alerts.length} cảnh báo hoạt động
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { IoTDashboard };

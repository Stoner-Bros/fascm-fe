'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Truck,
  Navigation,
  Thermometer,
  Droplets,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Shield,
  Eye,
  Activity,
  X
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic import toàn bộ component để tránh SSR issues
const LeafletMap = dynamic(() => import('./leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className='flex h-96 items-center justify-center rounded-lg bg-gray-100'>
      Đang tải bản đồ...
    </div>
  )
});

interface TruckData {
  id: string;
  driver: string;
  speed: number;
  position: [number, number];
  temperature: number;
  humidity: number;
  status: 'moving' | 'stopped' | 'delivered';
  eta: string;
}

interface Checkpoint {
  id: string;
  name: string;
  position: [number, number];
  reached: boolean;
  timestamp?: string;
  blockHash?: string;
}

interface BlockchainEvent {
  id: string;
  type: string;
  timestamp: string;
  location: string;
  hash: string;
  data: any;
}

export default function TruckSimulation() {
  const [isClient, setIsClient] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<BlockchainEvent | null>(
    null
  );
  const eventIdCounter = useRef(0); // Counter để đảm bảo unique ID

  // Hàm interpolate để tạo nhiều điểm giữa 2 tọa độ
  const interpolateRoute = (
    start: [number, number],
    end: [number, number],
    steps: number
  ): [number, number][] => {
    const points: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      const lat = start[0] + (end[0] - start[0]) * ratio;
      const lng = start[1] + (end[1] - start[1]) * ratio;
      points.push([lat, lng]);
    }
    return points;
  };

  // Tạo route chi tiết với nhiều điểm interpolated và waypoints thực tế
  const createDetailedRoute = () => {
    const routePoints = [
      [21.0285, 105.8542], // Kho xuất phát (Hà Nội)
      [21.0245, 105.8412], // Checkpoint 1
      [21.0195, 105.8312], // Checkpoint 2
      [21.0145, 105.8212], // Checkpoint 3
      [21.0095, 105.8112] // Điểm giao hàng
    ];

    // Thêm waypoints thực tế để tạo đường đi tự nhiên hơn
    const realisticRoute = [
      [21.0285, 105.8542], // Kho xuất phát
      [21.028, 105.852], // Ra khỏi kho
      [21.0275, 105.85], // Vào đường chính
      [21.027, 105.848], // Theo đường phố
      [21.0265, 105.846], // Rẽ trái
      [21.026, 105.844], // Tiếp tục thẳng
      [21.025, 105.842], // Gần checkpoint 1
      [21.0245, 105.8412], // Checkpoint 1
      [21.024, 105.84], // Rời checkpoint 1
      [21.0235, 105.8385], // Theo đường cong
      [21.023, 105.837], // Đường cong tiếp
      [21.0225, 105.8355], // Rẽ phải
      [21.022, 105.834], // Đường thẳng
      [21.021, 105.8325], // Gần checkpoint 2
      [21.0195, 105.8312], // Checkpoint 2
      [21.0185, 105.83], // Rời checkpoint 2
      [21.018, 105.8285], // Theo đường cong
      [21.0175, 105.827], // Đường cong lớn
      [21.017, 105.8255], // Tiếp tục cong
      [21.0165, 105.824], // Rẽ trái
      [21.016, 105.8225], // Gần checkpoint 3
      [21.0145, 105.8212], // Checkpoint 3
      [21.014, 105.82], // Rời checkpoint 3
      [21.0135, 105.8185], // Đường thẳng cuối
      [21.013, 105.817], // Gần đích
      [21.0125, 105.8155], // Vào khu vực giao hàng
      [21.012, 105.814], // Gần điểm giao hàng
      [21.0115, 105.8125], // Sắp đến
      [21.0095, 105.8112] // Điểm giao hàng
    ];

    const detailedRoute: [number, number][] = [];
    for (let i = 0; i < realisticRoute.length - 1; i++) {
      const segment = interpolateRoute(
        realisticRoute[i] as [number, number],
        realisticRoute[i + 1] as [number, number],
        3 // Ít interpolation hơn vì đã có nhiều waypoints
      );
      // Thêm tất cả điểm trừ điểm cuối (để tránh trùng lặp)
      detailedRoute.push(...segment.slice(0, -1));
    }
    // Thêm điểm cuối cùng
    detailedRoute.push(
      realisticRoute[realisticRoute.length - 1] as [number, number]
    );

    return detailedRoute;
  };

  const [truckData, setTruckData] = useState<TruckData>({
    id: 'TRUCK-001',
    driver: 'Nguyễn Văn A',
    speed: 45,
    position: [21.0285, 105.8542], // Hà Nội
    temperature: 4.2,
    humidity: 68,
    status: 'moving',
    eta: '14:30'
  });

  // Tuyến đường chi tiết với nhiều điểm
  const route = createDetailedRoute();

  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([
    {
      id: 'cp1',
      name: 'Kho xuất phát',
      position: [21.0285, 105.8542],
      reached: true,
      timestamp: '08:00',
      blockHash: '0x7a8b9c2d'
    },
    {
      id: 'cp2',
      name: 'Trạm cân',
      position: [21.0245, 105.8412],
      reached: true,
      timestamp: '09:15',
      blockHash: '0x4e5f6789'
    },
    {
      id: 'cp3',
      name: 'Trạm xăng',
      position: [21.0195, 105.8312],
      reached: false
    },
    {
      id: 'cp4',
      name: 'Kho trung chuyển',
      position: [21.0145, 105.8212],
      reached: false
    },
    {
      id: 'cp5',
      name: 'Điểm giao hàng',
      position: [21.0095, 105.8112],
      reached: false
    }
  ]);

  const [blockchainEvents, setBlockchainEvents] = useState<BlockchainEvent[]>([
    {
      id: '1',
      type: 'Xuất kho',
      timestamp: '08:00:00',
      location: 'Kho Hà Nội',
      hash: '0x7a8b9c2d4e5f6789',
      data: { temperature: 4.0, humidity: 65, weight: '500kg' }
    },
    {
      id: '2',
      type: 'Qua trạm cân',
      timestamp: '09:15:00',
      location: 'Trạm cân Đông Anh',
      hash: '0x4e5f67891a2b3c4d',
      data: { temperature: 4.1, humidity: 67, weight: '500kg' }
    }
  ]);

  const [currentRouteIndex, setCurrentRouteIndex] = useState(1);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Simulation logic
  useEffect(() => {
    if (isSimulationRunning && currentRouteIndex < route.length - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentRouteIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          const nextPosition = route[nextIndex];

          // Cập nhật vị trí truck với callback để tránh stale closure
          setTruckData((prev) => {
            const newTruckData = {
              ...prev,
              position: nextPosition as [number, number],
              temperature: 4.0 + Math.random() * 0.8, // 4.0-4.8°C
              humidity: 65 + Math.random() * 10, // 65-75%
              speed: 40 + Math.random() * 20 // 40-60 km/h
            };

            return newTruckData;
          });

          // Kiểm tra xem có đến checkpoint nào không (mỗi 20 điểm là 1 checkpoint)
          const checkpointIndex = Math.floor(nextIndex / 20);
          const isAtCheckpoint =
            nextIndex % 20 === 0 && checkpointIndex < checkpoints.length;

          if (isAtCheckpoint) {
            // Tạo blockchain event khi đến checkpoint
            eventIdCounter.current += 1;
            const newEvent: BlockchainEvent = {
              id: `event-${eventIdCounter.current}-${Date.now()}`,
              type: `Đến ${checkpoints[checkpointIndex]?.name || 'Checkpoint'}`,
              timestamp: new Date().toLocaleTimeString(),
              location: checkpoints[checkpointIndex]?.name || 'Unknown',
              hash: `0x${Math.random().toString(16).substr(2, 16)}`,
              data: {
                temperature: 4.0 + Math.random() * 0.8,
                humidity: 65 + Math.random() * 10,
                speed: 40 + Math.random() * 20
              }
            };

            setBlockchainEvents((prev) => [...prev, newEvent]);

            // Cập nhật checkpoint
            setCheckpoints((prev) =>
              prev.map((cp, index) => {
                if (index === checkpointIndex) {
                  return {
                    ...cp,
                    reached: true,
                    timestamp: new Date().toLocaleTimeString(),
                    blockHash: `0x${Math.random().toString(16).substr(2, 16)}`
                  };
                }
                return cp;
              })
            );
          }

          // Dừng simulation khi đến điểm cuối
          if (nextIndex >= route.length - 1) {
            setIsSimulationRunning(false);
            setTruckData((prev) => ({ ...prev, status: 'delivered' }));
          }

          return nextIndex;
        });
      }, 500); // Cập nhật mỗi 0.5 giây để animation mượt hơn
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isSimulationRunning, currentRouteIndex, route.length, checkpoints]);

  const startSimulation = () => {
    setIsSimulationRunning(true);
    setTruckData((prev) => ({ ...prev, status: 'moving' })); // Đổi sang moving khi bắt đầu
  };

  const stopSimulation = () => {
    setIsSimulationRunning(false);
  };

  const resetSimulation = () => {
    setIsSimulationRunning(false);
    setCurrentRouteIndex(1);
    eventIdCounter.current = 0; // Reset counter
    setTruckData((prev) => ({
      ...prev,
      position: [21.0285, 105.8542],
      status: 'stopped' // Đặt về stopped thay vì moving
    }));
    setCheckpoints((prev) =>
      prev.map((cp, index) => ({
        ...cp,
        reached: index === 0,
        timestamp: index === 0 ? '08:00' : undefined,
        blockHash: index === 0 ? '0x7a8b9c2d' : undefined
      }))
    );
    setBlockchainEvents([
      {
        id: 'initial-event',
        type: 'Xuất kho',
        timestamp: '08:00:00',
        location: 'Kho Hà Nội',
        hash: '0x7a8b9c2d',
        data: { temperature: 4.1, humidity: 67, weight: '500kg' }
      }
    ]);
  };

  if (!isClient) {
    return <div>Loading map...</div>;
  }

  return (
    <div className='space-y-6'>
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center'>
            <Truck className='mr-2 h-5 w-5 text-blue-600' />
            Điều khiển Simulation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='mb-4 flex space-x-4'>
            <Button
              onClick={startSimulation}
              disabled={isSimulationRunning || truckData.status === 'delivered'}
              className='bg-green-600 hover:bg-green-700'
            >
              Bắt đầu
            </Button>
            <Button
              onClick={stopSimulation}
              disabled={!isSimulationRunning}
              variant='outline'
            >
              Dừng
            </Button>
            <Button onClick={resetSimulation} variant='outline'>
              Reset
            </Button>
          </div>

          {/* Progress Bar */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium text-gray-700'>
                Tiến độ hành trình
              </span>
              <span className='text-sm font-medium text-blue-600'>
                {Math.round((currentRouteIndex / (route.length - 1)) * 100)}%
              </span>
            </div>
            <div className='h-2 w-full rounded-full bg-gray-200'>
              <div
                className='h-2 rounded-full bg-blue-600 transition-all duration-300 ease-out'
                style={{
                  width: `${(currentRouteIndex / (route.length - 1)) * 100}%`
                }}
              ></div>
            </div>
            <div className='flex justify-between text-xs text-gray-500'>
              <span>Điểm xuất phát</span>
              <span>Điểm giao hàng</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className='flex flex-col gap-6 lg:grid lg:grid-cols-3'>
        {/* Map - Hiển thị trước trên mobile */}
        <Card className='order-1 lg:order-none lg:col-span-2'>
          <CardHeader>
            <CardTitle className='flex items-center'>
              <Navigation className='mr-2 h-5 w-5 text-green-600' />
              Bản đồ Vận chuyển
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-64 overflow-hidden rounded-lg lg:h-96'>
              <LeafletMap
                route={route}
                checkpoints={checkpoints}
                truckPosition={truckData.position}
                truckData={truckData}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sidebar - Hiển thị sau trên mobile */}
        <div className='order-2 space-y-6 lg:order-none'>
          {/* Truck Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Activity className='mr-2 h-5 w-5 text-blue-600' />
                Thông tin Xe
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>ID Xe:</span>
                <Badge variant='outline'>{truckData.id}</Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Tài xế:</span>
                <span className='text-sm'>{truckData.driver}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Trạng thái:</span>
                <Badge
                  variant={
                    truckData.status === 'delivered' ? 'default' : 'secondary'
                  }
                  className={
                    truckData.status === 'delivered'
                      ? 'bg-green-100 text-green-800'
                      : truckData.status === 'moving'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                  }
                >
                  {truckData.status === 'delivered'
                    ? 'Đã giao'
                    : truckData.status === 'moving'
                      ? 'Đang di chuyển'
                      : 'Dừng'}
                </Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Tốc độ:</span>
                <span className='text-sm'>
                  {truckData.speed.toFixed(1)} km/h
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>ETA:</span>
                <span className='text-sm'>{truckData.eta}</span>
              </div>
            </CardContent>
          </Card>

          {/* Sensor Data */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Thermometer className='mr-2 h-5 w-5 text-red-600' />
                Dữ liệu Sensor
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div
                className={`flex items-center justify-between rounded-lg p-3 ${
                  truckData.temperature > 5
                    ? 'border border-red-200 bg-red-50'
                    : 'bg-blue-50'
                }`}
              >
                <div className='flex items-center'>
                  <Thermometer
                    className={`mr-2 h-4 w-4 ${
                      truckData.temperature > 5
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }`}
                  />
                  <span className='text-sm font-medium'>Nhiệt độ</span>
                  {truckData.temperature > 5 && (
                    <AlertTriangle className='ml-2 h-4 w-4 text-red-600' />
                  )}
                </div>
                <span
                  className={`text-lg font-bold ${
                    truckData.temperature > 5 ? 'text-red-600' : 'text-blue-600'
                  }`}
                >
                  {truckData.temperature.toFixed(1)}°C
                </span>
              </div>
              <div
                className={`flex items-center justify-between rounded-lg p-3 ${
                  truckData.humidity > 75
                    ? 'border border-red-200 bg-red-50'
                    : 'bg-green-50'
                }`}
              >
                <div className='flex items-center'>
                  <Droplets
                    className={`mr-2 h-4 w-4 ${
                      truckData.humidity > 75
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}
                  />
                  <span className='text-sm font-medium'>Độ ẩm</span>
                  {truckData.humidity > 75 && (
                    <AlertTriangle className='ml-2 h-4 w-4 text-red-600' />
                  )}
                </div>
                <span
                  className={`text-lg font-bold ${
                    truckData.humidity > 75 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {truckData.humidity.toFixed(1)}%
                </span>
              </div>
              <div className='flex items-center justify-between rounded-lg bg-purple-50 p-3'>
                <div className='flex items-center'>
                  <MapPin className='mr-2 h-4 w-4 text-purple-600' />
                  <span className='text-sm font-medium'>Vị trí</span>
                </div>
                <span className='font-mono text-sm text-purple-600'>
                  {truckData.position[0].toFixed(4)},{' '}
                  {truckData.position[1].toFixed(4)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Blockchain Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Shield className='mr-2 h-5 w-5 text-purple-600' />
                Blockchain Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='max-h-64 space-y-3 overflow-y-auto'>
                {blockchainEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className='flex items-start space-x-3 rounded-lg bg-gray-50 p-3'
                  >
                    <div className='flex-shrink-0'>
                      {index === blockchainEvents.length - 1 ? (
                        <div className='h-3 w-3 animate-pulse rounded-full bg-green-500'></div>
                      ) : (
                        <CheckCircle className='h-4 w-4 text-green-500' />
                      )}
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-sm font-medium'>{event.type}</p>
                      <p className='text-xs text-gray-600'>{event.location}</p>
                      <p className='text-xs text-gray-500'>{event.timestamp}</p>
                      <p className='truncate font-mono text-xs text-purple-600'>
                        {event.hash}
                      </p>
                    </div>
                    <Button
                      size='sm'
                      variant='ghost'
                      className='p-1'
                      onClick={() => setSelectedEvent(event)}
                    >
                      <Eye className='h-3 w-3' />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delivery Confirmation */}
      {truckData.status === 'delivered' && (
        <Card className='border-green-200 bg-green-50'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <CheckCircle className='mx-auto mb-4 h-12 w-12 text-green-600' />
              <h3 className='mb-2 text-lg font-semibold text-green-800'>
                Giao hàng thành công!
              </h3>
              <p className='mb-4 text-green-700'>
                Xe tải {truckData.id} đã giao hàng thành công tại điểm đích.
              </p>
              <Button className='bg-green-600 hover:bg-green-700'>
                Xác nhận nhận hàng
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blockchain Event Detail Modal */}
      {selectedEvent && (
        <div
          className='bg-opacity-50 fixed inset-0 flex items-center justify-center bg-black'
          style={{ zIndex: 9999 }}
        >
          <div
            className='relative mx-4 w-full max-w-md rounded-lg bg-white p-6'
            style={{ zIndex: 10000 }}
          >
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>
                Chi tiết Blockchain Event
              </h3>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setSelectedEvent(null)}
                className='p-1'
              >
                <X className='h-4 w-4' />
              </Button>
            </div>

            <div className='space-y-3'>
              <div>
                <label className='text-sm font-medium text-gray-600'>
                  Loại sự kiện:
                </label>
                <p className='text-sm'>{selectedEvent.type}</p>
              </div>

              <div>
                <label className='text-sm font-medium text-gray-600'>
                  Thời gian:
                </label>
                <p className='text-sm'>{selectedEvent.timestamp}</p>
              </div>

              <div>
                <label className='text-sm font-medium text-gray-600'>
                  Vị trí:
                </label>
                <p className='text-sm'>{selectedEvent.location}</p>
              </div>

              <div>
                <label className='text-sm font-medium text-gray-600'>
                  Hash:
                </label>
                <p className='rounded bg-gray-100 p-2 font-mono text-xs break-all'>
                  {selectedEvent.hash}
                </p>
              </div>

              <div>
                <label className='text-sm font-medium text-gray-600'>
                  Dữ liệu cảm biến:
                </label>
                <div className='rounded bg-gray-50 p-3 text-sm'>
                  {selectedEvent.data.temperature && (
                    <div className='flex items-center justify-between'>
                      <span className='flex items-center'>
                        <Thermometer className='mr-1 h-4 w-4 text-blue-500' />
                        Nhiệt độ:
                      </span>
                      <span
                        className={
                          selectedEvent.data.temperature > 5
                            ? 'font-semibold text-red-600'
                            : ''
                        }
                      >
                        {selectedEvent.data.temperature}°C
                        {selectedEvent.data.temperature > 5 && (
                          <AlertTriangle className='ml-1 inline h-4 w-4 text-red-600' />
                        )}
                      </span>
                    </div>
                  )}

                  {selectedEvent.data.humidity && (
                    <div className='mt-2 flex items-center justify-between'>
                      <span className='flex items-center'>
                        <Droplets className='mr-1 h-4 w-4 text-blue-500' />
                        Độ ẩm:
                      </span>
                      <span
                        className={
                          selectedEvent.data.humidity > 75
                            ? 'font-semibold text-red-600'
                            : ''
                        }
                      >
                        {selectedEvent.data.humidity}%
                        {selectedEvent.data.humidity > 75 && (
                          <AlertTriangle className='ml-1 inline h-4 w-4 text-red-600' />
                        )}
                      </span>
                    </div>
                  )}

                  {selectedEvent.data.speed && (
                    <div className='mt-2 flex items-center justify-between'>
                      <span className='flex items-center'>
                        <Activity className='mr-1 h-4 w-4 text-green-500' />
                        Tốc độ:
                      </span>
                      <span>{selectedEvent.data.speed} km/h</span>
                    </div>
                  )}

                  {selectedEvent.data.weight && (
                    <div className='mt-2 flex items-center justify-between'>
                      <span>Trọng lượng:</span>
                      <span>{selectedEvent.data.weight}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  IconActivity,
  IconArrowLeft,
  IconDroplet,
  IconEdit,
  IconGps,
  IconHome,
  IconMail,
  IconMapPin,
  IconPackage,
  IconPhone,
  IconRefresh,
  IconRoute,
  IconTemperature,
  IconTrash,
  IconTruck,
  IconUser
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface InboundDeliveryDetailProps {
  deliveryId: string;
}

interface InboundDetail {
  id: string;
  farmName: string;
  farmAddress: string;
  farmContact: string;
  farmOwner: string;
  driverName: string;
  driverPhone: string;
  driverEmail: string;
  vehicleNumber: string;
  vehicleType: string;
  productType: string;
  quantity: number;
  unit: string;
  estimatedValue: number;
  actualValue?: number;
  departureTime: string;
  estimatedArrival: string;
  actualArrival?: string;
  status:
    | 'scheduled'
    | 'in_transit'
    | 'arrived'
    | 'completed'
    | 'cancelled'
    | 'delayed';
  temperature?: number;
  humidity?: number;
  gpsLocation?: string;
  locationName?: string;
  notes?: string;
  qualityCheck?: {
    grade: 'A' | 'B' | 'C';
    freshness: number;
    damage: number;
    inspector: string;
    checkTime: string;
    notes: string;
  };
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

export function InboundDeliveryDetail({
  deliveryId
}: InboundDeliveryDetailProps) {
  const router = useRouter();
  const [realTimeData, setRealTimeData] = useState(
    new Date().toLocaleTimeString()
  );

  // Mock data based on deliveryId
  const [deliveryData, setDeliveryData] = useState<InboundDetail>({
    id: deliveryId,
    farmName: 'Vườn Organic A',
    farmAddress: 'Xã Tân Tiến, Huyện Văn Giang, Hưng Yên',
    farmContact: '0912345678',
    farmOwner: 'Nguyễn Văn Nam',
    driverName: 'Nguyễn Văn A',
    driverPhone: '0987654321',
    driverEmail: 'nguyenvana@transport.com',
    vehicleNumber: 'HY-29A-12345',
    vehicleType: 'Xe tải 5 tấn',
    productType: 'Rau lá tươi',
    quantity: 500,
    unit: 'kg',
    estimatedValue: 15000000,
    actualValue: 14800000,
    departureTime: '2024-09-18T05:00:00',
    estimatedArrival: '2024-09-18T09:00:00',
    actualArrival: '2024-09-18T09:15:00',
    status: 'completed',
    temperature: 4.2,
    humidity: 65,
    gpsLocation: '21.0285, 105.8542',
    locationName: 'Kho chính - Hà Nội',
    notes: 'Hàng hóa chất lượng tốt, đã kiểm tra kỹ lưỡng',
    qualityCheck: {
      grade: 'A',
      freshness: 95,
      damage: 2,
      inspector: 'Trần Thị B',
      checkTime: '2024-09-18T09:30:00',
      notes: 'Rau xanh tươi, không sâu bệnh, đạt tiêu chuẩn xuất khẩu'
    },
    deliveryHistory: [
      {
        timestamp: '05:00 - 18/09/2024',
        location: 'Vườn Organic A',
        status: 'departed',
        description: 'Xe xuất phát từ vườn với 500kg rau lá tươi'
      },
      {
        timestamp: '06:30 - 18/09/2024',
        location: 'Trạm kiểm soát Văn Giang',
        status: 'checkpoint',
        description: 'Kiểm tra giấy tờ và chất lượng hàng hóa'
      },
      {
        timestamp: '08:00 - 18/09/2024',
        location: 'Cao tốc Hà Nội - Hải Phòng',
        status: 'in_transit',
        description: 'Tiếp tục hành trình về kho Hà Nội'
      },
      {
        timestamp: '09:15 - 18/09/2024',
        location: 'Kho chính Hà Nội',
        status: 'arrived',
        description: 'Đã đến kho, bắt đầu quá trình kiểm tra chất lượng'
      },
      {
        timestamp: '09:45 - 18/09/2024',
        location: 'Kho chính Hà Nội',
        status: 'completed',
        description: 'Hoàn thành nhập kho, hàng hóa đạt tiêu chuẩn'
      }
    ],
    environmentalData: [
      {
        timestamp: '05:00',
        temperature: 4.5,
        humidity: 60,
        gpsLat: 21.0285,
        gpsLng: 105.8542
      },
      {
        timestamp: '06:00',
        temperature: 4.3,
        humidity: 62,
        gpsLat: 20.8449,
        gpsLng: 105.6881
      },
      {
        timestamp: '07:00',
        temperature: 4.1,
        humidity: 64,
        gpsLat: 20.5447,
        gpsLng: 105.9107
      },
      {
        timestamp: '08:00',
        temperature: 4.2,
        humidity: 65,
        gpsLat: 20.2506,
        gpsLng: 105.9761
      },
      {
        timestamp: '09:00',
        temperature: 4.4,
        humidity: 63,
        gpsLat: 19.9681,
        gpsLng: 105.8457
      }
    ]
  });

  // Real-time data simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(new Date().toLocaleTimeString());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: InboundDetail['status']) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge className='border-gray-200 bg-gray-100 text-gray-700'>
            Đã lên lịch
          </Badge>
        );
      case 'in_transit':
        return (
          <Badge className='border-blue-200 bg-blue-100 text-blue-700'>
            Đang vận chuyển
          </Badge>
        );
      case 'arrived':
        return (
          <Badge className='border-orange-200 bg-orange-100 text-orange-700'>
            Đã đến kho
          </Badge>
        );
      case 'completed':
        return (
          <Badge className='border-green-200 bg-green-100 text-green-700'>
            Hoàn thành
          </Badge>
        );
      case 'delayed':
        return (
          <Badge className='border-red-200 bg-red-100 text-red-700'>
            Chậm trễ
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className='border-red-200 bg-red-100 text-red-700'>
            Đã hủy
          </Badge>
        );
      default:
        return null;
    }
  };

  const getGradeColor = (grade: 'A' | 'B' | 'C') => {
    switch (grade) {
      case 'A':
        return 'text-green-600 bg-green-100';
      case 'B':
        return 'text-yellow-600 bg-yellow-100';
      case 'C':
        return 'text-red-600 bg-red-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getHistoryStatusIcon = (status: string) => {
    switch (status) {
      case 'departed':
        return <IconTruck className='h-4 w-4 text-blue-500' />;
      case 'checkpoint':
        return <IconMapPin className='h-4 w-4 text-orange-500' />;
      case 'in_transit':
        return <IconRoute className='h-4 w-4 text-green-500' />;
      case 'arrived':
        return <IconHome className='h-4 w-4 text-purple-500' />;
      case 'completed':
        return <IconPackage className='h-4 w-4 text-green-600' />;
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
              <IconHome className='h-6 w-6 text-green-600' />
              {deliveryData.id} - Nhập kho
            </h1>
            <p className='text-muted-foreground'>
              Chi tiết đợt vận chuyển từ {deliveryData.farmName}
            </p>
          </div>
        </div>
        <div className='flex gap-2'>
          {getStatusBadge(deliveryData.status)}
          <Button variant='outline' size='sm'>
            <IconEdit className='mr-2 h-4 w-4' />
            Chỉnh sửa
          </Button>
          <Button
            variant='outline'
            size='sm'
            className='border-red-200 text-red-600 hover:bg-red-50'
          >
            <IconTrash className='mr-2 h-4 w-4' />
            Xóa
          </Button>
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
          {/* Transport Progress */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconRoute className='h-5 w-5' />
                Tiến độ vận chuyển
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='font-medium'>
                  {deliveryData.farmName} → Kho Hà Nội
                </span>
                <span className='text-muted-foreground text-sm'>
                  {deliveryData.status === 'completed' ? '100' : '85'}% hoàn
                  thành
                </span>
              </div>
              <Progress
                value={deliveryData.status === 'completed' ? 100 : 85}
                className='h-3'
              />
              <div className='text-muted-foreground flex justify-between text-sm'>
                <span>
                  Khởi hành: {formatDateTime(deliveryData.departureTime)}
                </span>
                <span>
                  {deliveryData.actualArrival
                    ? `Đã đến: ${formatDateTime(deliveryData.actualArrival)}`
                    : `Dự kiến: ${formatDateTime(deliveryData.estimatedArrival)}`}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Environmental Data */}
          {(deliveryData.temperature !== undefined ||
            deliveryData.humidity !== undefined) && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconActivity className='h-5 w-5' />
                  Điều kiện môi trường
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-6'>
                  {deliveryData.temperature !== undefined && (
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <IconTemperature className='h-5 w-5 text-blue-500' />
                        <span className='font-medium'>Nhiệt độ</span>
                      </div>
                      <div className='text-2xl font-bold'>
                        {deliveryData.temperature.toFixed(1)}°C
                      </div>
                      <p className='text-muted-foreground text-xs'>
                        Phù hợp cho rau lá tươi
                      </p>
                    </div>
                  )}

                  {deliveryData.humidity !== undefined && (
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2'>
                        <IconDroplet className='h-5 w-5 text-blue-500' />
                        <span className='font-medium'>Độ ẩm</span>
                      </div>
                      <div className='text-2xl font-bold'>
                        {Math.round(deliveryData.humidity)}%
                      </div>
                      <p className='text-muted-foreground text-xs'>
                        Trong ngưỡng an toàn
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quality Check Results */}
          {deliveryData.qualityCheck && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconPackage className='h-5 w-5' />
                  Kết quả kiểm tra chất lượng
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-3 gap-4'>
                  <div className='text-center'>
                    <div
                      className={cn(
                        'mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full text-2xl font-bold',
                        getGradeColor(deliveryData.qualityCheck.grade)
                      )}
                    >
                      {deliveryData.qualityCheck.grade}
                    </div>
                    <div className='text-sm font-medium'>Hạng</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-green-600'>
                      {deliveryData.qualityCheck.freshness}%
                    </div>
                    <div className='text-muted-foreground text-sm'>Độ tươi</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-orange-600'>
                      {deliveryData.qualityCheck.damage}%
                    </div>
                    <div className='text-muted-foreground text-sm'>Hư hỏng</div>
                  </div>
                </div>
                <div className='border-t pt-4'>
                  <div className='flex justify-between text-sm'>
                    <span>
                      Kiểm tra bởi:{' '}
                      <strong>{deliveryData.qualityCheck.inspector}</strong>
                    </span>
                    <span>
                      {formatDateTime(deliveryData.qualityCheck.checkTime)}
                    </span>
                  </div>
                  <p className='text-muted-foreground mt-2 text-sm'>
                    {deliveryData.qualityCheck.notes}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Information Tabs */}
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
                    Theo dõi các điểm dừng và hoạt động trong quá trình vận
                    chuyển
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {deliveryData.deliveryHistory.map((entry, index) => (
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
                    Nhiệt độ và độ ẩm trong quá trình vận chuyển
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {deliveryData.environmentalData.map((data, index) => (
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
                  <CardTitle>Thông tin vị trí</CardTitle>
                  <CardDescription>
                    GPS và địa điểm hiện tại của đợt vận chuyển
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='text-sm font-medium'>Tọa độ GPS</label>
                      <p className='font-mono text-lg'>
                        {deliveryData.gpsLocation}
                      </p>
                    </div>
                    <div>
                      <label className='text-sm font-medium'>
                        Vị trí hiện tại
                      </label>
                      <p className='text-lg'>{deliveryData.locationName}</p>
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
          {/* Farm Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconHome className='h-5 w-5' />
                Thông tin vườn
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div>
                <span className='text-sm font-medium'>Tên vườn</span>
                <p className='text-lg'>{deliveryData.farmName}</p>
              </div>
              <div>
                <span className='text-sm font-medium'>Chủ vườn</span>
                <p>{deliveryData.farmOwner}</p>
              </div>
              <div>
                <span className='text-sm font-medium'>Địa chỉ</span>
                <p className='text-sm'>{deliveryData.farmAddress}</p>
              </div>
              <div className='flex items-center gap-2'>
                <IconPhone className='h-4 w-4' />
                <span className='text-sm'>{deliveryData.farmContact}</span>
              </div>
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconPackage className='h-5 w-5' />
                Thông tin sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div>
                <span className='text-sm font-medium'>Loại sản phẩm</span>
                <p className='text-lg'>{deliveryData.productType}</p>
              </div>
              <div>
                <span className='text-sm font-medium'>Số lượng</span>
                <p>
                  {deliveryData.quantity} {deliveryData.unit}
                </p>
              </div>
              <div>
                <span className='text-sm font-medium'>Giá trị dự kiến</span>
                <p>{formatCurrency(deliveryData.estimatedValue)}</p>
              </div>
              {deliveryData.actualValue && (
                <div>
                  <span className='text-sm font-medium'>Giá trị thực tế</span>
                  <p className='font-medium text-green-600'>
                    {formatCurrency(deliveryData.actualValue)}
                  </p>
                </div>
              )}
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
                <p>{deliveryData.driverName}</p>
              </div>
              <div>
                <span className='text-sm font-medium'>Phương tiện</span>
                <p>
                  {deliveryData.vehicleNumber} - {deliveryData.vehicleType}
                </p>
              </div>
              <div className='flex items-center gap-2'>
                <IconPhone className='h-4 w-4' />
                <span className='text-sm'>{deliveryData.driverPhone}</span>
              </div>
              <div className='flex items-center gap-2'>
                <IconMail className='h-4 w-4' />
                <span className='text-sm'>{deliveryData.driverEmail}</span>
              </div>
              <div className='pt-2'>
                <Button size='sm' className='w-full'>
                  <IconPhone className='mr-2 h-4 w-4' />
                  Liên hệ tài xế
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {deliveryData.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Ghi chú</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm'>{deliveryData.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

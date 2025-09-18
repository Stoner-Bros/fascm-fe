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
import {
  IconActivity,
  IconArrowLeft,
  IconBuilding,
  IconCheck,
  IconDroplet,
  IconEdit,
  IconGps,
  IconMail,
  IconMapPin,
  IconPackage,
  IconPhone,
  IconRefresh,
  IconRoute,
  IconTemperature,
  IconTrash,
  IconTruck,
  IconUser,
  IconX
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface OutboundDeliveryDetailProps {
  deliveryId: string;
}

interface OutboundDetail {
  id: string;
  customerName: string;
  customerAddress: string;
  customerContact: string;
  customerType: 'supermarket' | 'restaurant' | 'distributor' | 'retailer';
  contactPerson: string;
  driverName: string;
  driverPhone: string;
  driverEmail: string;
  vehicleNumber: string;
  vehicleType: string;
  productType: string;
  quantity: number;
  unit: string;
  totalValue: number;
  departureTime: string;
  estimatedArrival: string;
  actualArrival?: string;
  status:
    | 'scheduled'
    | 'loading'
    | 'in_transit'
    | 'arrived'
    | 'delivered'
    | 'returned'
    | 'cancelled';
  temperature?: number;
  humidity?: number;
  gpsLocation?: string;
  locationName?: string;
  notes?: string;
  priorityLevel: 'low' | 'medium' | 'high' | 'urgent';
  requiresSignature: boolean;
  signatureReceived?: boolean;
  signedBy?: string;
  signatureTime?: string;
  specialHandling?: string;
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
  deliveryProof?: {
    photos: string[];
    signatureUrl?: string;
    notes: string;
    timestamp: string;
  };
}

export function OutboundDeliveryDetail({
  deliveryId
}: OutboundDeliveryDetailProps) {
  const router = useRouter();
  const [realTimeData, setRealTimeData] = useState(
    new Date().toLocaleTimeString()
  );

  // Mock data based on deliveryId
  const [deliveryData, setDeliveryData] = useState<OutboundDetail>({
    id: deliveryId,
    customerName: 'Siêu thị BigC',
    customerAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    customerContact: '0281234567',
    customerType: 'supermarket',
    contactPerson: 'Nguyễn Thị Manager',
    driverName: 'Phạm Văn D',
    driverPhone: '0912345678',
    driverEmail: 'phamvand@transport.com',
    vehicleNumber: 'SG-51A-12345',
    vehicleType: 'Xe tải lạnh 10 tấn',
    productType: 'Rau lá tươi',
    quantity: 800,
    unit: 'kg',
    totalValue: 24000000,
    departureTime: '2024-09-18T06:00:00',
    estimatedArrival: '2024-09-18T14:00:00',
    actualArrival: '2024-09-18T13:45:00',
    status: 'delivered',
    temperature: 4.5,
    humidity: 65,
    gpsLocation: '10.7769, 106.7009',
    locationName: 'Siêu thị BigC Quận 1',
    notes: 'Giao hàng thành công, đã có chữ ký xác nhận',
    priorityLevel: 'high',
    requiresSignature: true,
    signatureReceived: true,
    signedBy: 'Nguyễn Thị Manager',
    signatureTime: '2024-09-18T13:50:00',
    specialHandling: 'Bảo quản lạnh 2-8°C',
    deliveryHistory: [
      {
        timestamp: '06:00 - 18/09/2024',
        location: 'Kho chính Hà Nội',
        status: 'departed',
        description: 'Xe xuất phát với 800kg rau lá tươi'
      },
      {
        timestamp: '06:30 - 18/09/2024',
        location: 'Kho chính Hà Nội',
        status: 'loading',
        description: 'Hoàn thành việc chất hàng và kiểm tra nhiệt độ'
      },
      {
        timestamp: '07:00 - 18/09/2024',
        location: 'Cao tốc Pháp Vân - Cầu Giẽ',
        status: 'in_transit',
        description: 'Bắt đầu hành trình vào Nam'
      },
      {
        timestamp: '13:45 - 18/09/2024',
        location: 'Siêu thị BigC Quận 1',
        status: 'arrived',
        description: 'Đã đến điểm giao hàng'
      },
      {
        timestamp: '13:50 - 18/09/2024',
        location: 'Siêu thị BigC Quận 1',
        status: 'delivered',
        description: 'Hoàn thành giao hàng, có chữ ký xác nhận'
      }
    ],
    environmentalData: [
      {
        timestamp: '06:00',
        temperature: 4.5,
        humidity: 65,
        gpsLat: 21.0285,
        gpsLng: 105.8542
      },
      {
        timestamp: '08:00',
        temperature: 4.3,
        humidity: 62,
        gpsLat: 20.8449,
        gpsLng: 105.6881
      },
      {
        timestamp: '10:00',
        temperature: 4.4,
        humidity: 64,
        gpsLat: 18.5447,
        gpsLng: 105.9107
      },
      {
        timestamp: '12:00',
        temperature: 4.2,
        humidity: 65,
        gpsLat: 15.2506,
        gpsLng: 105.9761
      },
      {
        timestamp: '13:45',
        temperature: 4.6,
        humidity: 63,
        gpsLat: 10.7769,
        gpsLng: 106.7009
      }
    ],
    deliveryProof: {
      photos: ['/api/placeholder/photo1.jpg', '/api/placeholder/photo2.jpg'],
      signatureUrl: '/api/placeholder/signature.jpg',
      notes: 'Hàng hóa được giao đầy đủ, chất lượng tốt',
      timestamp: '2024-09-18T13:50:00'
    }
  });

  // Real-time data simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(new Date().toLocaleTimeString());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: OutboundDetail['status']) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge className='border-gray-200 bg-gray-100 text-gray-700'>
            Đã lên lịch
          </Badge>
        );
      case 'loading':
        return (
          <Badge className='border-yellow-200 bg-yellow-100 text-yellow-700'>
            Đang chất hàng
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
            Đã đến nơi
          </Badge>
        );
      case 'delivered':
        return (
          <Badge className='border-green-200 bg-green-100 text-green-700'>
            Đã giao
          </Badge>
        );
      case 'returned':
        return (
          <Badge className='border-purple-200 bg-purple-100 text-purple-700'>
            Đã trả về
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

  const getPriorityBadge = (priority: OutboundDetail['priorityLevel']) => {
    switch (priority) {
      case 'low':
        return (
          <Badge variant='outline' className='bg-gray-50 text-gray-600'>
            Thấp
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant='outline' className='bg-blue-50 text-blue-600'>
            Trung bình
          </Badge>
        );
      case 'high':
        return (
          <Badge variant='outline' className='bg-orange-50 text-orange-600'>
            Cao
          </Badge>
        );
      case 'urgent':
        return (
          <Badge variant='outline' className='bg-red-50 text-red-600'>
            Khẩn cấp
          </Badge>
        );
      default:
        return null;
    }
  };

  const getCustomerTypeLabel = (type: OutboundDetail['customerType']) => {
    switch (type) {
      case 'supermarket':
        return 'Siêu thị';
      case 'restaurant':
        return 'Nhà hàng';
      case 'distributor':
        return 'Nhà phân phối';
      case 'retailer':
        return 'Cửa hàng bán lẻ';
      default:
        return type;
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
      case 'loading':
        return <IconPackage className='h-4 w-4 text-yellow-500' />;
      case 'in_transit':
        return <IconRoute className='h-4 w-4 text-green-500' />;
      case 'arrived':
        return <IconMapPin className='h-4 w-4 text-purple-500' />;
      case 'delivered':
        return <IconCheck className='h-4 w-4 text-green-600' />;
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
              <IconBuilding className='h-6 w-6 text-blue-600' />
              {deliveryData.id} - Xuất kho
            </h1>
            <p className='text-muted-foreground'>
              Chi tiết đợt vận chuyển đến {deliveryData.customerName}
            </p>
          </div>
        </div>
        <div className='flex gap-2'>
          {getStatusBadge(deliveryData.status)}
          {getPriorityBadge(deliveryData.priorityLevel)}
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

        {/* Signature Status */}
        {deliveryData.requiresSignature && (
          <div className='flex items-center gap-2'>
            {deliveryData.signatureReceived ? (
              <>
                <IconCheck className='h-4 w-4 text-green-500' />
                <span className='text-sm text-green-600'>Đã có chữ ký</span>
              </>
            ) : (
              <>
                <IconX className='h-4 w-4 text-orange-500' />
                <span className='text-sm text-orange-600'>Chờ chữ ký</span>
              </>
            )}
          </div>
        )}
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
                  Kho Hà Nội → {deliveryData.customerName}
                </span>
                <span className='text-muted-foreground text-sm'>
                  {deliveryData.status === 'delivered' ? '100' : '75'}% hoàn
                  thành
                </span>
              </div>
              <Progress
                value={deliveryData.status === 'delivered' ? 100 : 75}
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
                  Điều kiện vận chuyển
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
                        {deliveryData.specialHandling || 'Nhiệt độ vận chuyển'}
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

          {/* Delivery Proof */}
          {deliveryData.deliveryProof &&
            deliveryData.status === 'delivered' && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <IconCheck className='h-5 w-5' />
                    Bằng chứng giao hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <span className='text-sm font-medium'>Ảnh giao hàng</span>
                      <div className='mt-2 grid grid-cols-2 gap-2'>
                        {deliveryData.deliveryProof.photos.map(
                          (photo, index) => (
                            <div
                              key={index}
                              className='flex h-20 items-center justify-center rounded-lg bg-gray-100'
                            >
                              <span className='text-xs text-gray-500'>
                                Ảnh {index + 1}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {deliveryData.deliveryProof.signatureUrl && (
                      <div>
                        <span className='text-sm font-medium'>
                          Chữ ký xác nhận
                        </span>
                        <div className='mt-2 flex h-20 items-center justify-center rounded-lg bg-gray-100'>
                          <span className='text-xs text-gray-500'>Chữ ký</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {deliveryData.signatureReceived && (
                    <div className='border-t pt-4'>
                      <div className='flex justify-between text-sm'>
                        <span>
                          Ký nhận bởi: <strong>{deliveryData.signedBy}</strong>
                        </span>
                        <span>
                          {formatDateTime(deliveryData.signatureTime!)}
                        </span>
                      </div>
                      <p className='text-muted-foreground mt-2 text-sm'>
                        {deliveryData.deliveryProof.notes}
                      </p>
                    </div>
                  )}
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
                    Theo dõi các điểm dừng và hoạt động trong quá trình giao
                    hàng
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
                <p className='text-lg'>{deliveryData.customerName}</p>
              </div>
              <div>
                <span className='text-sm font-medium'>Loại khách hàng</span>
                <p>{getCustomerTypeLabel(deliveryData.customerType)}</p>
              </div>
              <div>
                <span className='text-sm font-medium'>Người liên hệ</span>
                <p>{deliveryData.contactPerson}</p>
              </div>
              <div>
                <span className='text-sm font-medium'>Địa chỉ giao hàng</span>
                <p className='text-sm'>{deliveryData.customerAddress}</p>
              </div>
              <div className='flex items-center gap-2'>
                <IconPhone className='h-4 w-4' />
                <span className='text-sm'>{deliveryData.customerContact}</span>
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
                <span className='text-sm font-medium'>Tổng giá trị</span>
                <p className='font-medium text-green-600'>
                  {formatCurrency(deliveryData.totalValue)}
                </p>
              </div>
              {deliveryData.specialHandling && (
                <div>
                  <span className='text-sm font-medium'>Yêu cầu đặc biệt</span>
                  <p className='text-sm'>{deliveryData.specialHandling}</p>
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

          {/* Delivery Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Yêu cầu giao hàng</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Yêu cầu chữ ký</span>
                {deliveryData.requiresSignature ? (
                  <IconCheck className='h-4 w-4 text-green-500' />
                ) : (
                  <IconX className='h-4 w-4 text-gray-400' />
                )}
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm'>Mức độ ưu tiên</span>
                {getPriorityBadge(deliveryData.priorityLevel)}
              </div>

              {deliveryData.notes && (
                <div>
                  <span className='text-sm font-medium'>Ghi chú</span>
                  <p className='text-muted-foreground mt-1 text-sm'>
                    {deliveryData.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

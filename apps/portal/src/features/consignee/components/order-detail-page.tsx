'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Phone,
  Mail,
  Download,
  Eye,
  ThermometerSun,
  Droplets,
  Leaf,
  Calendar,
  Star,
  MessageSquare,
  FileText,
  Camera,
  PenTool,
  AlertTriangle,
  DollarSign,
  Edit,
  Save,
  X
} from 'lucide-react';
import { orderStatuses } from '@/features/consignee/constants/data';

interface OrderDetail {
  id: string;
  orderNumber: string;
  date: string;
  status: keyof typeof orderStatuses;
  totalAmount: number;
  totalWeight: number;
  productCount: number;
  supplierName: string;
  supplierPhone: string;
  supplierEmail: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  consigneeConfirmation?: 'ACCEPTED' | 'REJECTED' | null;
  rejectionReason?: string;
  deliveryAddress: string;
  canEdit: boolean;
  costBredown: {
    productCost: number;
    logisticsCost: number;
    vatAmount: number;
    total: number;
  };
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    price: number;
    acceptedQuantity?: number;
    rejectedQuantity?: number;
    rejectionReason?: string;
    origin?: string;
    harvestDate?: string;
  }>;
  timeline: Array<{
    status: string;
    timestamp: string;
    description: string;
    completed: boolean;
  }>;
  traceability?: {
    origin: string;
    harvestDate: string;
    storageConditions: {
      temperature: number;
      humidity: number;
    };
    transportConditions: {
      temperature: number;
      humidity: number;
    };
    route: Array<{
      location: string;
      timestamp: string;
      temperature: number;
      humidity: number;
    }>;
  };
}

// Mock data
const mockOrderDetail: OrderDetail = {
  id: '1',
  orderNumber: 'ORD-2025-002',
  date: '2025-01-15',
  status: 'DELIVERED',
  totalAmount: 2500000,
  totalWeight: 150,
  productCount: 3,
  supplierName: 'Nông trại Xanh Đà Lạt',
  supplierPhone: '0901234567',
  supplierEmail: 'contact@nongtraixanh.com',
  estimatedDelivery: '2025-01-20',
  actualDelivery: '2025-01-20',
  consigneeConfirmation: null,
  deliveryAddress: '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
  canEdit: false,
  costBredown: {
    productCost: 2000000,
    logisticsCost: 300000,
    vatAmount: 200000,
    total: 2500000
  },
  products: [
    {
      id: '1',
      name: 'Cà chua cherry hữu cơ',
      quantity: 50,
      unit: 'kg',
      price: 25000,
      origin: 'Đà Lạt, Lâm Đồng',
      harvestDate: '2025-01-18'
    },
    {
      id: '2',
      name: 'Xà lách xoăn',
      quantity: 30,
      unit: 'kg',
      price: 20000,
      origin: 'Đà Lạt, Lâm Đồng',
      harvestDate: '2025-01-18'
    },
    {
      id: '3',
      name: 'Cải bó xôi baby',
      quantity: 70,
      unit: 'kg',
      price: 18000,
      origin: 'Đà Lạt, Lâm Đồng',
      harvestDate: '2025-01-17'
    }
  ],
  timeline: [
    {
      status: 'Đặt hàng',
      timestamp: '2025-01-15T08:00:00Z',
      description: 'Đơn hàng được tạo và gửi đến nhà cung cấp',
      completed: true
    },
    {
      status: 'Xác nhận',
      timestamp: '2025-01-15T10:30:00Z',
      description: 'Nhà cung cấp xác nhận đơn hàng',
      completed: true
    },
    {
      status: 'Chuẩn bị',
      timestamp: '2025-01-18T06:00:00Z',
      description: 'Thu hoạch và đóng gói sản phẩm',
      completed: true
    },
    {
      status: 'Xuất kho',
      timestamp: '2025-01-19T14:00:00Z',
      description: 'Hàng hóa được xuất kho và bắt đầu vận chuyển',
      completed: true
    },
    {
      status: 'Đang giao',
      timestamp: '2025-01-20T08:00:00Z',
      description: 'Xe tải đang trên đường giao hàng',
      completed: true
    },
    {
      status: 'Đã giao',
      timestamp: '2025-01-20T15:30:00Z',
      description: 'Hàng hóa đã được giao đến địa chỉ',
      completed: true
    },
    {
      status: 'Xác nhận',
      timestamp: '',
      description: 'Chờ consignee xác nhận nhận hàng',
      completed: false
    }
  ],
  traceability: {
    origin: 'Nông trại Xanh, Đà Lạt, Lâm Đồng',
    harvestDate: '2025-01-18',
    storageConditions: {
      temperature: 4,
      humidity: 85
    },
    transportConditions: {
      temperature: 6,
      humidity: 80
    },
    route: [
      {
        location: 'Nông trại Xanh - Đà Lạt',
        timestamp: '2025-01-19T14:00:00Z',
        temperature: 4,
        humidity: 85
      },
      {
        location: 'Trung tâm phân phối - TP.HCM',
        timestamp: '2025-01-20T06:00:00Z',
        temperature: 5,
        humidity: 82
      },
      {
        location: 'Kho Quận 7 - TP.HCM',
        timestamp: '2025-01-20T15:30:00Z',
        temperature: 6,
        humidity: 80
      }
    ]
  }
};

interface OrderDetailPageProps {
  orderId?: string;
}

export function OrderDetailPage({ orderId = '1' }: OrderDetailPageProps) {
  const [order, setOrder] = useState<OrderDetail>(mockOrderDetail);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAddress, setEditedAddress] = useState(order.deliveryAddress);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showTraceability, setShowTraceability] = useState(false);
  const [showCostBreakdown, setShowCostBreakdown] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Tính toán progress timeline
  const completedSteps = order.timeline.filter((step) => step.completed).length;
  const progressPercentage = (completedSteps / order.timeline.length) * 100;

  // Xác nhận đơn hàng
  const confirmOrder = (confirmation: 'ACCEPTED' | 'REJECTED') => {
    if (confirmation === 'REJECTED' && !rejectionReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    setOrder((prev) => ({
      ...prev,
      consigneeConfirmation: confirmation,
      rejectionReason: confirmation === 'REJECTED' ? rejectionReason : undefined
    }));

    // Update timeline
    const updatedTimeline = order.timeline.map((step) =>
      step.status === 'Xác nhận'
        ? { ...step, completed: true, timestamp: new Date().toISOString() }
        : step
    );

    setOrder((prev) => ({ ...prev, timeline: updatedTimeline }));
  };

  // Xác nhận từng phần sản phẩm
  const confirmPartialProduct = (
    productId: string,
    accepted: number,
    rejected: number,
    reason?: string
  ) => {
    setOrder((prev) => ({
      ...prev,
      products: prev.products.map((product) =>
        product.id === productId
          ? {
              ...product,
              acceptedQuantity: accepted,
              rejectedQuantity: rejected,
              rejectionReason: reason
            }
          : product
      )
    }));
  };

  // Lưu chỉnh sửa địa chỉ
  const saveAddressEdit = () => {
    setOrder((prev) => ({ ...prev, deliveryAddress: editedAddress }));
    setIsEditing(false);
  };

  // Upload file
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles((prev) => [...prev, ...files]);
  };

  // Gửi feedback
  const submitFeedback = () => {
    if (rating === 0) {
      alert('Vui lòng chọn số sao đánh giá');
      return;
    }

    console.log('Feedback submitted:', { rating, feedback });
    alert('Cảm ơn bạn đã đánh giá!');
    setRating(0);
    setFeedback('');
  };

  const getStatusIcon = (status: keyof typeof orderStatuses) => {
    switch (status) {
      case 'PENDING':
        return <Clock className='h-4 w-4' />;
      case 'PREPARING':
        return <Package className='h-4 w-4' />;
      case 'IN_TRANSIT':
        return <Truck className='h-4 w-4' />;
      case 'DELIVERED':
        return <CheckCircle className='h-4 w-4' />;
      case 'CANCELLED':
        return <XCircle className='h-4 w-4' />;
      default:
        return <Clock className='h-4 w-4' />;
    }
  };

  const getStatusVariant = (status: keyof typeof orderStatuses) => {
    switch (status) {
      case 'PENDING':
        return 'secondary';
      case 'PREPARING':
        return 'default';
      case 'IN_TRANSIT':
        return 'default';
      case 'DELIVERED':
        return 'default';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className='mx-auto max-w-6xl flex-1 space-y-6 p-6'>
      {/* Header với Back Button */}
      <div className='mb-6 flex items-center gap-4'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => window.history.back()}
        >
          <ArrowLeft className='mr-2 h-4 w-4' />
          TRỞ LẠI
        </Button>
      </div>

      {/* Header thông tin đơn hàng */}
      <div className='mb-6 rounded-lg border bg-white p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <div className='mb-2 flex items-center gap-4'>
              <span className='text-sm text-gray-600'>MÃ ĐƠN HÀNG</span>
              <span className='text-lg font-semibold'>{order.orderNumber}</span>
              <span className='text-gray-400'>|</span>
              <Badge
                variant={order.status === 'DELIVERED' ? 'default' : 'secondary'}
                className={`${
                  order.status === 'DELIVERED'
                    ? 'border-green-200 bg-green-100 text-green-800'
                    : 'border-orange-200 bg-orange-100 text-orange-800'
                }`}
              >
                {order.status === 'DELIVERED'
                  ? 'ĐƠN HÀNG ĐÃ HOÀN THÀNH'
                  : orderStatuses[order.status].label}
              </Badge>
            </div>
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              className='border-orange-600 text-orange-600 hover:bg-orange-50'
            >
              Mua Lại
            </Button>
            <Button
              variant='outline'
              className='border-blue-600 text-blue-600 hover:bg-blue-50'
            >
              Liên Hệ Người Bán
            </Button>
          </div>
        </div>

        {/* Timeline ngang */}
        <div className='relative'>
          <div className='mb-8 flex items-center justify-between'>
            {order.timeline.slice(0, 5).map((step, index) => (
              <div key={index} className='relative flex flex-col items-center'>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                    step.completed
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-gray-300 bg-gray-100 text-gray-400'
                  }`}
                >
                  {index === 0 && <FileText className='h-5 w-5' />}
                  {index === 1 && <DollarSign className='h-5 w-5' />}
                  {index === 2 && <Truck className='h-5 w-5' />}
                  {index === 3 && <Package className='h-5 w-5' />}
                  {index === 4 && <Star className='h-5 w-5' />}
                </div>
                <div className='mt-3 text-center'>
                  <div
                    className={`text-sm font-medium ${
                      step.completed ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    {step.status}
                  </div>
                  {step.timestamp && (
                    <div className='mt-1 text-xs text-gray-500'>
                      {new Date(step.timestamp).toLocaleDateString('vi-VN')}
                    </div>
                  )}
                </div>
                {index < 4 && (
                  <div
                    className={`absolute left-12 top-6 h-0.5 w-full ${
                      order.timeline[index + 1]?.completed
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                    style={{ width: 'calc(100vw / 5 - 48px)' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline chi tiết dọc */}
      <Card>
        <CardContent className='p-6'>
          <div className='space-y-6'>
            {[
              {
                time: '18:20 25-04-2025',
                status: 'Đã giao',
                description: 'Giao hàng thành công',
                completed: true,
                isDelivered: true
              },
              {
                time: '07:53 25-04-2025',
                status: 'Đang vận chuyển',
                description:
                  'Đơn hàng sẽ sớm được giao, vui lòng chú ý điện thoại',
                completed: true
              },
              {
                time: '06:24 25-04-2025',
                status: '',
                description:
                  'Đơn hàng đã đến trạm giao hàng tại khu vực của bạn ABC, Hồ Chí Minh và sẽ được giao trong vòng 24 giờ tiếp theo',
                completed: true
              },
              {
                time: '02:02 25-04-2025',
                status: '',
                description:
                  'Đơn hàng đang được trung chuyển đến địa điểm kế tiếp',
                completed: true
              },
              {
                time: '22:29 24-04-2025',
                status: '',
                description:
                  'Đơn hàng đã đến kho phân loại Xã Mỹ Hạnh Bắc, Huyện Đức Hòa, Long An',
                completed: true
              },
              {
                time: '22:29 24-04-2025',
                status: '',
                description:
                  'Đơn hàng đã đến kho phân loại Xã Mỹ Hạnh Bắc, Huyện Đức Hòa, Long An',
                completed: true
              }
            ].map((item, index) => (
              <div key={index} className='flex gap-4'>
                <div className='flex flex-col items-center'>
                  <div
                    className={`h-3 w-3 rounded-full ${
                      item.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                  {index < 5 && <div className='mt-2 h-12 w-0.5 bg-gray-200' />}
                </div>
                <div className='flex-1 pb-4'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      {item.status && (
                        <div
                          className={`mb-1 font-medium ${
                            item.isDelivered
                              ? 'text-green-600'
                              : 'text-gray-900'
                          }`}
                        >
                          {item.status}
                        </div>
                      )}
                      <div className='text-sm leading-relaxed text-gray-600'>
                        {item.description}
                      </div>
                      {index === 5 && (
                        <Button
                          variant='link'
                          className='mt-2 h-auto p-0 text-blue-600'
                        >
                          Xem thêm
                        </Button>
                      )}
                    </div>
                    <div className='ml-4 whitespace-nowrap text-sm text-gray-500'>
                      {item.time}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Products List - Moved to bottom */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {order.products.map((product) => (
              <div key={product.id} className='rounded-lg border p-4'>
                <div className='flex items-start justify-between'>
                  <div className='space-y-1'>
                    <h4 className='font-medium'>{product.name}</h4>
                    <p className='text-muted-foreground text-sm'>
                      {product.quantity} {product.unit} ×{' '}
                      {product.price.toLocaleString('vi-VN')} VNĐ
                    </p>
                    {product.origin && (
                      <p className='text-muted-foreground flex items-center gap-1 text-sm'>
                        <MapPin className='h-3 w-3' />
                        Xuất xứ: {product.origin}
                      </p>
                    )}
                    {product.harvestDate && (
                      <p className='text-muted-foreground flex items-center gap-1 text-sm'>
                        <Calendar className='h-3 w-3' />
                        Thu hoạch:{' '}
                        {new Date(product.harvestDate).toLocaleDateString(
                          'vi-VN'
                        )}
                      </p>
                    )}
                  </div>
                  <div className='text-right'>
                    <p className='font-medium'>
                      {(product.quantity * product.price).toLocaleString(
                        'vi-VN'
                      )}{' '}
                      VNĐ
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <DollarSign className='h-5 w-5' />
            Tổng kết đơn hàng
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='flex justify-between'>
            <span>Tổng tiền hàng:</span>
            <span>
              {order.costBredown.productCost.toLocaleString('vi-VN')} VNĐ
            </span>
          </div>
          <div className='flex justify-between'>
            <span>Phí vận chuyển:</span>
            <span>
              {order.costBredown.logisticsCost.toLocaleString('vi-VN')} VNĐ
            </span>
          </div>
          <div className='flex justify-between'>
            <span>VAT:</span>
            <span>
              {order.costBredown.vatAmount.toLocaleString('vi-VN')} VNĐ
            </span>
          </div>
          <Separator />
          <div className='flex justify-between text-lg font-semibold'>
            <span>Tổng thanh toán:</span>
            <span className='text-red-600'>
              {order.costBredown.total.toLocaleString('vi-VN')} VNĐ
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {order.status === 'DELIVERED' && !order.consigneeConfirmation && (
        <Card>
          <CardHeader>
            <CardTitle>Xác nhận nhận hàng</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex gap-2'>
              <Button
                className='bg-green-600 hover:bg-green-700'
                onClick={() => confirmOrder('ACCEPTED')}
              >
                <CheckCircle className='mr-2 h-4 w-4' />
                Xác nhận nhận hàng
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant='destructive'>
                    <XCircle className='mr-2 h-4 w-4' />
                    Từ chối nhận hàng
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Từ chối nhận hàng</DialogTitle>
                    <DialogDescription>
                      Vui lòng cho biết lý do từ chối để chúng tôi có thể hỗ trợ
                      tốt hơn.
                    </DialogDescription>
                  </DialogHeader>
                  <div className='space-y-4'>
                    <div>
                      <Label htmlFor='rejection-reason'>Lý do từ chối</Label>
                      <Textarea
                        id='rejection-reason'
                        placeholder='Ví dụ: Hàng hóa bị hỏng, thiếu số lượng, bao bì rách...'
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor='evidence-upload'>
                        Upload ảnh chứng minh (tùy chọn)
                      </Label>
                      <Input
                        id='evidence-upload'
                        type='file'
                        multiple
                        accept='image/*'
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant='destructive'
                      onClick={() => confirmOrder('REJECTED')}
                    >
                      Xác nhận từ chối
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Section - Only for completed orders */}
      {order.status === 'DELIVERED' &&
        order.consigneeConfirmation === 'ACCEPTED' && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Star className='h-5 w-5' />
                Đánh giá & Phản hồi
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label>Đánh giá chất lượng (1-5 sao)</Label>
                <div className='mt-2 flex gap-1'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1 ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      <Star className='h-6 w-6 fill-current' />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor='feedback-text'>Nhận xét của bạn</Label>
                <Textarea
                  id='feedback-text'
                  placeholder='Chia sẻ trải nghiệm của bạn về sản phẩm và dịch vụ giao hàng...'
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              <Button onClick={submitFeedback} className='w-full'>
                <MessageSquare className='mr-2 h-4 w-4' />
                Gửi đánh giá
              </Button>
            </CardContent>
          </Card>
        )}

      {/* Traceability Information */}
      {order.traceability && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Leaf className='h-5 w-5' />
              Thông tin truy xuất nguồn gốc
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div>
                <Label>Nguồn gốc</Label>
                <p className='text-sm'>{order.traceability.origin}</p>
              </div>
              <div>
                <Label>Ngày thu hoạch</Label>
                <p className='text-sm'>
                  {new Date(order.traceability.harvestDate).toLocaleDateString(
                    'vi-VN'
                  )}
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div>
                <Label className='flex items-center gap-1'>
                  <ThermometerSun className='h-4 w-4' />
                  Điều kiện bảo quản
                </Label>
                <p className='text-sm'>
                  Nhiệt độ: {order.traceability.storageConditions.temperature}
                  °C, Độ ẩm: {order.traceability.storageConditions.humidity}%
                </p>
              </div>
              <div>
                <Label className='flex items-center gap-1'>
                  <Droplets className='h-4 w-4' />
                  Điều kiện vận chuyển
                </Label>
                <p className='text-sm'>
                  Nhiệt độ: {order.traceability.transportConditions.temperature}
                  °C, Độ ẩm: {order.traceability.transportConditions.humidity}%
                </p>
              </div>
            </div>

            <Dialog open={showTraceability} onOpenChange={setShowTraceability}>
              <DialogTrigger asChild>
                <Button variant='outline' className='w-full'>
                  <Eye className='mr-2 h-4 w-4' />
                  Xem chi tiết hành trình
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-2xl'>
                <DialogHeader>
                  <DialogTitle>Hành trình sản phẩm</DialogTitle>
                </DialogHeader>
                <div className='max-h-96 space-y-4 overflow-y-auto'>
                  {order.traceability.route.map((point, index) => (
                    <div
                      key={index}
                      className='flex items-center gap-4 rounded-lg border p-3'
                    >
                      <MapPin className='h-5 w-5 text-blue-500' />
                      <div className='flex-1'>
                        <p className='font-medium'>{point.location}</p>
                        <p className='text-muted-foreground text-sm'>
                          {new Date(point.timestamp).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <div className='text-right text-sm'>
                        <p>{point.temperature}°C</p>
                        <p>{point.humidity}% RH</p>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Search,
  Filter,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Truck,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { orderStatuses } from '@/features/consignee/constants/data';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: keyof typeof orderStatuses;
  totalAmount: number;
  totalWeight: number;
  productCount: number;
  supplierName: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  consigneeConfirmation?: 'ACCEPTED' | 'REJECTED' | null;
  rejectionReason?: string;
  products: Array<{
    name: string;
    quantity: number;
    unit: string;
    price: number;
  }>;
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    date: '2024-01-15',
    status: 'DELIVERED',
    totalAmount: 2500000,
    totalWeight: 150,
    productCount: 3,
    supplierName: 'Nông trường Đồng Tâm',
    estimatedDelivery: '2024-01-20',
    actualDelivery: '2024-01-20',
    consigneeConfirmation: 'ACCEPTED',
    products: [
      { name: 'Gạo ST25', quantity: 50, unit: 'kg', price: 25000 },
      { name: 'Cà chua', quantity: 30, unit: 'kg', price: 15000 },
      { name: 'Rau cải', quantity: 20, unit: 'kg', price: 12000 }
    ]
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    date: '2024-01-18',
    status: 'DELIVERED',
    totalAmount: 1800000,
    totalWeight: 100,
    productCount: 2,
    supplierName: 'Hợp tác xã Xanh',
    estimatedDelivery: '2024-01-25',
    actualDelivery: '2024-01-25',
    consigneeConfirmation: null, // Chờ xác nhận
    products: [
      { name: 'Dưa chuột', quantity: 40, unit: 'kg', price: 18000 },
      { name: 'Ớt chuông', quantity: 25, unit: 'kg', price: 35000 }
    ]
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    date: '2024-01-20',
    status: 'IN_TRANSIT',
    totalAmount: 3200000,
    totalWeight: 200,
    productCount: 4,
    supplierName: 'Trang trại Organic',
    estimatedDelivery: '2024-01-28',
    products: [
      { name: 'Bắp cải', quantity: 60, unit: 'kg', price: 20000 },
      { name: 'Cà rót', quantity: 35, unit: 'kg', price: 22000 },
      { name: 'Đậu đũa', quantity: 25, unit: 'kg', price: 28000 },
      { name: 'Rau muống', quantity: 15, unit: 'kg', price: 15000 }
    ]
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    date: '2024-01-22',
    status: 'CANCELLED',
    totalAmount: 1200000,
    totalWeight: 80,
    productCount: 2,
    supplierName: 'Vườn rau sạch Miền Nam',
    estimatedDelivery: '2024-01-30',
    products: [
      { name: 'Xà lách', quantity: 30, unit: 'kg', price: 25000 },
      { name: 'Cải thảo', quantity: 25, unit: 'kg', price: 18000 }
    ]
  }
];

export function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Xác nhận đơn hàng
  const confirmOrder = (
    orderId: string,
    confirmation: 'ACCEPTED' | 'REJECTED',
    reason?: string
  ) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              consigneeConfirmation: confirmation,
              rejectionReason: confirmation === 'REJECTED' ? reason : undefined,
              status: confirmation === 'ACCEPTED' ? 'CONFIRMED' : 'DELIVERED'
            }
          : order
      )
    );
  };

  // Kiểm tra xem đơn hàng có cần xác nhận không
  const needsConfirmation = (order: Order) => {
    return order.status === 'DELIVERED' && order.consigneeConfirmation === null;
  };

  // Lấy badge xác nhận
  const getConfirmationBadge = (order: Order) => {
    if (order.consigneeConfirmation === 'ACCEPTED') {
      return (
        <Badge
          variant='default'
          className='flex items-center gap-1 bg-green-100 text-green-800'
        >
          <ThumbsUp className='h-3 w-3' />
          Đã chấp nhận
        </Badge>
      );
    }
    if (order.consigneeConfirmation === 'REJECTED') {
      return (
        <Badge variant='destructive' className='flex items-center gap-1'>
          <ThumbsDown className='h-3 w-3' />
          Đã từ chối
        </Badge>
      );
    }
    if (needsConfirmation(order)) {
      return (
        <Badge
          variant='secondary'
          className='flex items-center gap-1 bg-yellow-100 text-yellow-800'
        >
          <AlertTriangle className='h-3 w-3' />
          Chờ xác nhận
        </Badge>
      );
    }
    return null;
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
    <div className='flex-1 space-y-6 p-6'>
      <div className='space-y-2 text-center'>
        <h1 className='text-3xl font-bold tracking-tight'>Đơn hàng của tôi</h1>
        <p className='text-muted-foreground'>
          Theo dõi và quản lý tất cả đơn hàng đã đặt
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Filter className='h-5 w-5' />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='text-muted-foreground absolute left-3 top-3 h-4 w-4' />
                <Input
                  placeholder='Tìm kiếm theo mã đơn hàng hoặc nhà cung cấp...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-48'>
                <SelectValue placeholder='Trạng thái' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả trạng thái</SelectItem>
                {Object.entries(orderStatuses).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className='space-y-4'>
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-12'>
              <Package className='text-muted-foreground mb-4 h-12 w-12' />
              <h3 className='mb-2 text-lg font-medium'>
                Không tìm thấy đơn hàng
              </h3>
              <p className='text-muted-foreground text-center'>
                Thử thay đổi bộ lọc hoặc tạo đơn hàng mới
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className='transition-shadow hover:shadow-md'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <CardTitle className='text-lg'>
                      {order.orderNumber}
                    </CardTitle>
                    <CardDescription>
                      Đặt ngày{' '}
                      {new Date(order.date).toLocaleDateString('vi-VN')} •{' '}
                      {order.supplierName}
                    </CardDescription>
                  </div>

                  <div className='flex flex-col items-end gap-2'>
                    <Badge
                      variant={getStatusVariant(order.status)}
                      className='flex items-center gap-1'
                    >
                      {getStatusIcon(order.status)}
                      {orderStatuses[order.status].label}
                    </Badge>
                    {getConfirmationBadge(order)}
                  </div>
                </div>
              </CardHeader>

              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-4'>
                  <div>
                    <p className='text-muted-foreground'>Số sản phẩm</p>
                    <p className='font-medium'>{order.productCount} sản phẩm</p>
                  </div>
                  <div>
                    <p className='text-muted-foreground'>Tổng trọng lượng</p>
                    <p className='font-medium'>{order.totalWeight}kg</p>
                  </div>
                  <div>
                    <p className='text-muted-foreground'>Tổng giá trị</p>
                    <p className='font-medium'>
                      {order.totalAmount.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
                  <div>
                    <p className='text-muted-foreground'>Dự kiến giao</p>
                    <p className='font-medium'>
                      {new Date(order.estimatedDelivery).toLocaleDateString(
                        'vi-VN'
                      )}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className='flex items-center justify-between'>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className='mr-2 h-4 w-4' />
                      Xem chi tiết
                    </Button>

                    {order.status === 'DELIVERED' && (
                      <Button variant='outline' size='sm'>
                        <Download className='mr-2 h-4 w-4' />
                        Tải hóa đơn
                      </Button>
                    )}
                  </div>

                  <div className='flex gap-2'>
                    {/* Nút xác nhận cho đơn hàng đã giao */}
                    {needsConfirmation(order) && (
                      <>
                        <Button
                          variant='default'
                          size='sm'
                          className='bg-green-600 hover:bg-green-700'
                          onClick={() => confirmOrder(order.id, 'ACCEPTED')}
                        >
                          <ThumbsUp className='mr-2 h-4 w-4' />
                          Chấp nhận
                        </Button>
                        <Button
                          variant='destructive'
                          size='sm'
                          onClick={() => {
                            const reason = prompt(
                              'Lý do từ chối (hàng hỏng, thiếu, v.v.):'
                            );
                            if (reason) {
                              confirmOrder(order.id, 'REJECTED', reason);
                            }
                          }}
                        >
                          <ThumbsDown className='mr-2 h-4 w-4' />
                          Từ chối
                        </Button>
                      </>
                    )}

                    {order.status === 'PENDING' && (
                      <Button variant='destructive' size='sm'>
                        Hủy đơn hàng
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <Card className='max-h-[80vh] w-full max-w-2xl overflow-y-auto'>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>
                    Chi tiết đơn hàng {selectedOrder.orderNumber}
                  </CardTitle>
                  <CardDescription>
                    Đặt ngày{' '}
                    {new Date(selectedOrder.date).toLocaleDateString('vi-VN')}
                  </CardDescription>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setSelectedOrder(null)}
                >
                  Đóng
                </Button>
              </div>
            </CardHeader>

            <CardContent className='space-y-6'>
              {/* Order Status */}
              <div className='flex flex-wrap items-center gap-2'>
                <Badge
                  variant={getStatusVariant(selectedOrder.status)}
                  className='flex items-center gap-1'
                >
                  {getStatusIcon(selectedOrder.status)}
                  {orderStatuses[selectedOrder.status].label}
                </Badge>
                <span className='text-muted-foreground text-sm'>
                  {orderStatuses[selectedOrder.status].description}
                </span>
                {getConfirmationBadge(selectedOrder)}
              </div>

              {/* Consignee Confirmation Section */}
              {selectedOrder.consigneeConfirmation === 'REJECTED' &&
                selectedOrder.rejectionReason && (
                  <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
                    <h4 className='mb-2 font-medium text-red-800'>
                      Lý do từ chối
                    </h4>
                    <p className='text-sm text-red-700'>
                      {selectedOrder.rejectionReason}
                    </p>
                  </div>
                )}

              {/* Delivery Information */}
              {selectedOrder.actualDelivery && (
                <div>
                  <h4 className='mb-2 font-medium'>Thông tin giao hàng</h4>
                  <p className='text-muted-foreground text-sm'>
                    Đã giao:{' '}
                    {new Date(selectedOrder.actualDelivery).toLocaleDateString(
                      'vi-VN'
                    )}
                  </p>
                </div>
              )}

              {/* Supplier Info */}
              <div>
                <h4 className='mb-2 font-medium'>Thông tin nhà cung cấp</h4>
                <p className='text-sm'>{selectedOrder.supplierName}</p>
                <p className='text-muted-foreground text-sm'>
                  Dự kiến giao:{' '}
                  {new Date(selectedOrder.estimatedDelivery).toLocaleDateString(
                    'vi-VN'
                  )}
                </p>
              </div>

              {/* Products */}
              <div>
                <h4 className='mb-3 font-medium'>Sản phẩm đã đặt</h4>
                <div className='space-y-2'>
                  {selectedOrder.products.map((product, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between rounded border p-3'
                    >
                      <div>
                        <p className='font-medium'>{product.name}</p>
                        <p className='text-muted-foreground text-sm'>
                          {product.quantity} {product.unit} ×{' '}
                          {product.price.toLocaleString('vi-VN')} VNĐ
                        </p>
                      </div>
                      <p className='font-medium'>
                        {(product.quantity * product.price).toLocaleString(
                          'vi-VN'
                        )}{' '}
                        VNĐ
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className='border-t pt-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span>Tổng trọng lượng:</span>
                    <span className='font-medium'>
                      {selectedOrder.totalWeight}kg
                    </span>
                  </div>
                  <div className='flex justify-between text-lg font-bold'>
                    <span>Tổng cộng:</span>
                    <span>
                      {selectedOrder.totalAmount.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

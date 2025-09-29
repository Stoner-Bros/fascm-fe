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
  X
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
    orderNumber: 'ORD-2025-001',
    date: '2025-01-15',
    status: 'DELIVERED',
    totalAmount: 2500000,
    totalWeight: 150,
    productCount: 3,
    supplierName: 'Nông trường Đồng Tâm',
    estimatedDelivery: '2025-01-20',
    actualDelivery: '2025-01-20',
    consigneeConfirmation: 'ACCEPTED',
    products: [
      { name: 'Gạo ST25', quantity: 50, unit: 'kg', price: 25000 },
      { name: 'Cà chua', quantity: 30, unit: 'kg', price: 15000 },
      { name: 'Rau cải', quantity: 20, unit: 'kg', price: 12000 }
    ]
  },
  {
    id: '2',
    orderNumber: 'ORD-2025-002',
    date: '2025-01-18',
    status: 'DELIVERED',
    totalAmount: 1800000,
    totalWeight: 100,
    productCount: 2,
    supplierName: 'Hợp tác xã Xanh',
    estimatedDelivery: '2025-01-25',
    actualDelivery: '2025-01-25',
    consigneeConfirmation: null, // Chờ xác nhận
    products: [
      { name: 'Dưa chuột', quantity: 40, unit: 'kg', price: 18000 },
      { name: 'Ớt chuông', quantity: 25, unit: 'kg', price: 35000 }
    ]
  },
  {
    id: '3',
    orderNumber: 'ORD-2025-003',
    date: '2025-01-20',
    status: 'IN_TRANSIT',
    totalAmount: 3200000,
    totalWeight: 200,
    productCount: 4,
    supplierName: 'Trang trại Organic',
    estimatedDelivery: '2025-01-28',
    products: [
      { name: 'Bắp cải', quantity: 60, unit: 'kg', price: 20000 },
      { name: 'Cà rót', quantity: 35, unit: 'kg', price: 22000 },
      { name: 'Đậu đũa', quantity: 25, unit: 'kg', price: 28000 },
      { name: 'Rau muống', quantity: 15, unit: 'kg', price: 15000 }
    ]
  },
  {
    id: '4',
    orderNumber: 'ORD-2025-004',
    date: '2025-01-22',
    status: 'CANCELLED',
    totalAmount: 1200000,
    totalWeight: 80,
    productCount: 2,
    supplierName: 'Vườn rau sạch Miền Nam',
    estimatedDelivery: '2025-01-30',
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Hủy đơn hàng (chỉ khi PENDING)
  const cancelOrder = (orderId: string) => {
    if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: 'CANCELLED' } : order
        )
      );
    }
  };

  // Điều hướng đến trang chi tiết đơn hàng
  const viewOrderDetail = (orderId: string) => {
    window.location.href = `/consignee/my-orders/${orderId}`;
  };

  // Tải hóa đơn
  const downloadInvoice = (orderId: string) => {
    // TODO: Implement invoice download
    console.log('Download invoice for order:', orderId);
    alert('Tính năng tải hóa đơn sẽ được triển khai sớm!');
  };

  // Lấy badge xác nhận đơn giản
  const getConfirmationBadge = (order: Order) => {
    if (order.consigneeConfirmation === 'ACCEPTED') {
      return (
        <Badge variant='default' className='bg-green-100 text-green-800'>
          ✓ Đã xác nhận
        </Badge>
      );
    }
    if (order.consigneeConfirmation === 'REJECTED') {
      return <Badge variant='destructive'>✗ Đã từ chối</Badge>;
    }
    if (order.status === 'DELIVERED' && order.consigneeConfirmation === null) {
      return (
        <Badge variant='secondary' className='bg-yellow-100 text-yellow-800'>
          ⚠ Chờ xác nhận
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
          Tổng quan và quản lý nhanh các đơn hàng
        </p>
      </div>

      {/* Filters - Simplified */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Filter className='h-5 w-5' />
            Tìm kiếm & Lọc
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

      {/* Orders List - Simplified */}
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
                {/* Quick Overview Info */}
                <div className='grid grid-cols-2 gap-4 text-sm md:grid-cols-4'>
                  <div>
                    <p className='text-muted-foreground'>Sản phẩm</p>
                    <p className='font-medium'>{order.productCount} loại</p>
                  </div>
                  <div>
                    <p className='text-muted-foreground'>Trọng lượng</p>
                    <p className='font-medium'>{order.totalWeight}kg</p>
                  </div>
                  <div>
                    <p className='text-muted-foreground'>Giá trị</p>
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

                {/* Basic Actions Only */}
                <div className='flex items-center justify-between border-t pt-4'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => viewOrderDetail(order.id)}
                    className='flex items-center gap-2'
                  >
                    <Eye className='h-4 w-4' />
                    Xem chi tiết
                  </Button>

                  <div className='flex gap-2'>
                    {/* Hủy đơn - chỉ khi PENDING */}
                    {order.status === 'PENDING' && (
                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => cancelOrder(order.id)}
                        className='flex items-center gap-2'
                      >
                        <X className='h-4 w-4' />
                        Hủy đơn
                      </Button>
                    )}

                    {/* Tải hóa đơn - chỉ khi DELIVERED */}
                    {order.status === 'DELIVERED' && (
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => downloadInvoice(order.id)}
                        className='flex items-center gap-2'
                      >
                        <Download className='h-4 w-4' />
                        Tải hóa đơn
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

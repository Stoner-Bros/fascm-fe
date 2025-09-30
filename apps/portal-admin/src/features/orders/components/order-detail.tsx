'use client';

import { Order } from '@/types/delivery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  IconArrowLeft,
  IconPackage,
  IconMapPin,
  IconWeight,
  IconCube,
  IconCalendar,
  IconUser,
  IconPhone,
  IconCurrencyDong,
  IconFileText,
  IconTruck,
  IconClock
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface OrderDetailProps {
  order: Order;
}

export function OrderDetail({ order }: OrderDetailProps) {
  const router = useRouter();

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge
            variant='outline'
            className='border-gray-200 bg-gray-50 text-gray-700'
          >
            Chờ xử lý
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge
            variant='outline'
            className='border-blue-200 bg-blue-50 text-blue-700'
          >
            Đã xác nhận
          </Badge>
        );
      case 'packed':
        return (
          <Badge
            variant='outline'
            className='border-yellow-200 bg-yellow-50 text-yellow-700'
          >
            Đã đóng gói
          </Badge>
        );
      case 'assigned':
        return (
          <Badge
            variant='outline'
            className='border-purple-200 bg-purple-50 text-purple-700'
          >
            Đã phân xe
          </Badge>
        );
      case 'in_transit':
        return (
          <Badge
            variant='outline'
            className='border-orange-200 bg-orange-50 text-orange-700'
          >
            Đang giao
          </Badge>
        );
      case 'delivered':
        return (
          <Badge
            variant='outline'
            className='border-green-200 bg-green-50 text-green-700'
          >
            Đã giao
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge
            variant='outline'
            className='border-red-200 bg-red-50 text-red-700'
          >
            Đã hủy
          </Badge>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: Order['priority']) => {
    switch (priority) {
      case 'low':
        return (
          <Badge
            variant='outline'
            className='border-gray-200 bg-gray-50 text-gray-600'
          >
            Thấp
          </Badge>
        );
      case 'medium':
        return (
          <Badge
            variant='outline'
            className='border-blue-200 bg-blue-50 text-blue-600'
          >
            Trung bình
          </Badge>
        );
      case 'high':
        return (
          <Badge
            variant='outline'
            className='border-orange-200 bg-orange-50 text-orange-600'
          >
            Cao
          </Badge>
        );
      case 'urgent':
        return (
          <Badge
            variant='outline'
            className='border-red-200 bg-red-50 text-red-600'
          >
            Khẩn cấp
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Button variant='outline' size='sm' onClick={() => router.back()}>
          <IconArrowLeft className='mr-2 h-4 w-4' />
          Quay lại
        </Button>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Chi tiết đơn hàng
          </h1>
          <p className='text-muted-foreground'>Mã đơn hàng: {order.id}</p>
        </div>
      </div>

      <div className='grid gap-6 lg:grid-cols-3'>
        {/* Main Content */}
        <div className='space-y-6 lg:col-span-2'>
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconPackage className='h-5 w-5' />
                Trạng thái đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center justify-between'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium'>Trạng thái:</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium'>Mức độ ưu tiên:</span>
                    {getPriorityBadge(order.priority)}
                  </div>
                </div>
                <div className='text-muted-foreground text-right text-sm'>
                  <div>Tạo lúc: {formatDateTime(order.createdAt)}</div>
                  <div>Cập nhật: {formatDateTime(order.updatedAt)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconUser className='h-5 w-5' />
                Thông tin khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    Tên khách hàng
                  </label>
                  <p className='text-lg font-semibold'>{order.customerName}</p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    Loại khách hàng
                  </label>
                  <p className='text-lg capitalize'>{order.customerType}</p>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    Số điện thoại
                  </label>
                  <div className='flex items-center gap-2'>
                    <IconPhone className='h-4 w-4' />
                    <span>{order.customerContact}</span>
                  </div>
                </div>
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    Yêu cầu ký nhận
                  </label>
                  <p className='text-lg'>
                    {order.requiresSignature ? 'Có' : 'Không'}
                  </p>
                </div>
              </div>
              <div>
                <label className='text-muted-foreground text-sm font-medium'>
                  Địa chỉ giao hàng
                </label>
                <div className='mt-1 flex items-start gap-2'>
                  <IconMapPin className='text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0' />
                  <span>{order.customerAddress}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconPackage className='h-5 w-5' />
                Sản phẩm trong đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên sản phẩm</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Trọng lượng</TableHead>
                    <TableHead>Thể tích</TableHead>
                    <TableHead>Yêu cầu đặc biệt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className='font-medium'>
                        {item.productName}
                      </TableCell>
                      <TableCell>
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell>{item.weight}kg</TableCell>
                      <TableCell>{item.volume}m³</TableCell>
                      <TableCell>
                        {item.specialRequirements ? (
                          <span className='text-muted-foreground text-sm'>
                            {item.specialRequirements}
                          </span>
                        ) : (
                          <span className='text-muted-foreground text-sm'>
                            Không có
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconFileText className='h-5 w-5' />
                  Ghi chú
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm'>{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconPackage className='h-5 w-5' />
                Tóm tắt đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Tổng sản phẩm:</span>
                <span className='font-semibold'>{order.items.length} loại</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Tổng trọng lượng:</span>
                <div className='flex items-center gap-1'>
                  <IconWeight className='h-4 w-4' />
                  <span className='font-semibold'>{order.totalWeight}kg</span>
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Tổng thể tích:</span>
                <div className='flex items-center gap-1'>
                  <IconCube className='h-4 w-4' />
                  <span className='font-semibold'>{order.totalVolume}m³</span>
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Tổng giá trị:</span>
                <div className='flex items-center gap-1 text-green-600'>
                  <IconCurrencyDong className='h-4 w-4' />
                  <span className='font-semibold'>
                    {formatCurrency(order.totalValue)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconTruck className='h-5 w-5' />
                Thông tin giao hàng
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <label className='text-muted-foreground text-sm font-medium'>
                  Ngày giao hàng
                </label>
                <div className='mt-1 flex items-center gap-2'>
                  <IconCalendar className='h-4 w-4' />
                  <span className='font-semibold'>
                    {formatDate(order.deliveryDate)}
                  </span>
                </div>
              </div>
              {order.specialHandling && (
                <div>
                  <label className='text-muted-foreground text-sm font-medium'>
                    Xử lý đặc biệt
                  </label>
                  <p className='mt-1 text-sm'>{order.specialHandling}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Hành động</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <Button
                className='w-full'
                disabled={
                  order.status === 'delivered' || order.status === 'cancelled'
                }
              >
                Cập nhật trạng thái
              </Button>
              <Button
                variant='outline'
                className='w-full'
                disabled={
                  order.status === 'delivered' || order.status === 'cancelled'
                }
              >
                Chỉnh sửa đơn hàng
              </Button>
              <Button
                variant='outline'
                className='w-full'
                disabled={
                  order.status === 'delivered' || order.status === 'cancelled'
                }
              >
                Hủy đơn hàng
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

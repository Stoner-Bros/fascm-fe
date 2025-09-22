'use client';

import { Order } from '@/types/delivery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  IconPackage,
  IconMapPin,
  IconWeight,
  IconCube,
  IconCalendar,
  IconUser,
  IconArrowRight,
  IconCurrencyDong
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dashboard/order/${order.id}`);
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card
      className='group cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md'
      onClick={handleClick}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='space-y-1'>
            <CardTitle className='group-hover:text-primary text-lg font-semibold transition-colors'>
              {order.id}
            </CardTitle>
            <div className='text-muted-foreground flex items-center gap-2 text-sm'>
              <IconUser className='h-4 w-4' />
              <span className='font-medium'>{order.customerName}</span>
            </div>
          </div>
          <div className='flex flex-col gap-1'>
            {getStatusBadge(order.status)}
            {getPriorityBadge(order.priority)}
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Customer Address */}
        <div className='flex items-start gap-2 text-sm'>
          <IconMapPin className='text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0' />
          <span className='text-muted-foreground line-clamp-2'>
            {order.customerAddress}
          </span>
        </div>

        {/* Order Items Summary */}
        <div className='space-y-2'>
          <div className='flex items-center gap-2 text-sm font-medium'>
            <IconPackage className='h-4 w-4' />
            <span>Sản phẩm ({order.items.length})</span>
          </div>
          <div className='text-muted-foreground space-y-1 text-sm'>
            {order.items.slice(0, 2).map((item, index) => (
              <div key={item.id} className='flex justify-between'>
                <span className='truncate'>{item.productName}</span>
                <span className='text-muted-foreground ml-2'>
                  {item.quantity} {item.unit}
                </span>
              </div>
            ))}
            {order.items.length > 2 && (
              <div className='text-muted-foreground text-xs'>
                +{order.items.length - 2} sản phẩm khác
              </div>
            )}
          </div>
        </div>

        {/* Weight and Volume */}
        <div className='flex items-center gap-4 text-sm'>
          <div className='flex items-center gap-1'>
            <IconWeight className='text-muted-foreground h-4 w-4' />
            <span className='font-medium'>{order.totalWeight}kg</span>
          </div>
          <div className='flex items-center gap-1'>
            <IconCube className='text-muted-foreground h-4 w-4' />
            <span className='font-medium'>{order.totalVolume}m³</span>
          </div>
        </div>

        {/* Value and Delivery Date */}
        <div className='flex items-center justify-between text-sm'>
          <div className='flex items-center gap-1 font-semibold text-green-600'>
            <IconCurrencyDong className='h-4 w-4' />
            <span>{formatCurrency(order.totalValue)}</span>
          </div>
          <div className='text-muted-foreground flex items-center gap-1'>
            <IconCalendar className='h-4 w-4' />
            <span>{formatDate(order.deliveryDate)}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className='border-t pt-2'>
          <Button
            variant='ghost'
            size='sm'
            className='group-hover:bg-primary group-hover:text-primary-foreground w-full transition-colors'
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            Xem chi tiết
            <IconArrowRight className='ml-2 h-4 w-4' />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

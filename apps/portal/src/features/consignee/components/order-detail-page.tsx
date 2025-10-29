'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import {
  IconArrowLeft,
  IconTruck,
  IconPackage,
  IconCheck,
  IconX,
  IconClock,
  IconMapPin,
  IconPhone,
  IconMail,
  IconCalendar,
  IconFileText,
  IconEdit,
  IconTrash
} from '@tabler/icons-react';
import { OrderDetail, OrderService } from '@/features/consignee';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const orderId = params.id as string;

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!orderId) return;

      try {
        setLoading(true);
        const orderData = await OrderService.getOrderDetail(orderId);
        if (!orderData) {
          toast({
            title: 'Không tìm thấy đơn hàng',
            description: 'Đơn hàng không tồn tại hoặc đã bị xóa.',
            variant: 'destructive'
          });
          return;
        }

        setOrder(orderData);
      } catch (error) {
        toast({
          title: 'Lỗi tải dữ liệu',
          description: 'Không thể tải thông tin đơn hàng. Vui lòng thử lại.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId]);

  const handleCancelOrder = () => {
    toast({
      title: 'Hủy đơn hàng',
      description: 'Chức năng hủy đơn hàng sẽ được triển khai sau.'
    });
  };

  const handleEditOrder = () => {
    router.push(`/consignee/orders/${orderId}/edit`);
  };

  if (loading) {
    return (
      <PageContainer scrollable>
        <div className='flex min-h-[400px] items-center justify-center'>
          <div className='text-center'>
            <div className='border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2'></div>
            <p className='text-muted-foreground'>
              Đang tải thông tin đơn hàng...
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer scrollable>
        <div className='flex min-h-[400px] items-center justify-center'>
          <div className='text-center'>
            <IconPackage className='text-muted-foreground mx-auto mb-4 h-16 w-16' />
            <h3 className='mb-2 text-lg font-semibold'>
              Không tìm thấy đơn hàng
            </h3>
            <p className='text-muted-foreground mb-4'>
              Đơn hàng với ID {orderId} không tồn tại.
            </p>
            <Button onClick={() => router.push('/consignee/orders')}>
              <IconArrowLeft className='mr-2 h-4 w-4' />
              Quay lại danh sách đơn hàng
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  const summary = OrderService.calculateOrderSummary(order);
  const statusColor = OrderService.getStatusColor(order.status);
  const statusText = OrderService.getStatusText(order.status);

  return (
    <PageContainer scrollable>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => router.push('/consignee/orders')}
            >
              <IconArrowLeft className='mr-2 h-4 w-4' />
              Quay lại
            </Button>
            <div>
              <h1 className='text-2xl font-bold'>Chi tiết đơn hàng</h1>
              <p className='text-muted-foreground'>
                Mã đơn hàng: {order.orderNumber}
              </p>
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <Badge className={statusColor}>
              {order.status === 'pending' && (
                <IconClock className='mr-1 h-3 w-3' />
              )}
              {order.status === 'indelivery' && (
                <IconTruck className='mr-1 h-3 w-3' />
              )}
              {order.status === 'delivered' && (
                <IconCheck className='mr-1 h-3 w-3' />
              )}
              {order.status === 'cancel' && <IconX className='mr-1 h-3 w-3' />}
              {statusText}
            </Badge>
          </div>
        </div>

        <div className='grid gap-6 lg:grid-cols-3'>
          {/* Main Content */}
          <div className='space-y-6 lg:col-span-2'>
            {/* Order Status & Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <IconTruck className='mr-2 h-5 w-5' />
                  Trạng thái đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {order.trackingInfo && order.status === 'indelivery' && (
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>
                        Tiến độ giao hàng
                      </span>
                      <span className='text-muted-foreground text-sm'>
                        {order.trackingInfo.deliveryProgress}%
                      </span>
                    </div>
                    <Progress value={order.trackingInfo.deliveryProgress} />
                    <div className='text-muted-foreground flex items-center text-sm'>
                      <IconMapPin className='mr-1 h-4 w-4' />
                      {order.trackingInfo.currentLocation}
                    </div>
                    {order.trackingInfo.estimatedDelivery && (
                      <div className='text-muted-foreground flex items-center text-sm'>
                        <IconCalendar className='mr-1 h-4 w-4' />
                        Dự kiến giao:{' '}
                        {OrderService.formatDate(
                          order.trackingInfo.estimatedDelivery
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Status History */}
                <div className='space-y-3'>
                  <h4 className='font-medium'>Lịch sử trạng thái</h4>
                  <div className='space-y-2'>
                    {order.statusHistory.map((history, index) => (
                      <div
                        key={index}
                        className='flex items-start space-x-3 text-sm'
                      >
                        <div
                          className={`mt-2 h-2 w-2 rounded-full ${
                            history.status === 'delivered'
                              ? 'bg-green-500'
                              : history.status === 'indelivery'
                                ? 'bg-blue-500'
                                : history.status === 'cancel'
                                  ? 'bg-red-500'
                                  : 'bg-yellow-500'
                          }`}
                        />
                        <div className='flex-1'>
                          <div className='flex items-center justify-between'>
                            <span className='font-medium'>
                              {OrderService.getStatusText(history.status)}
                            </span>
                            <span className='text-muted-foreground'>
                              {OrderService.formatDate(history.timestamp)}
                            </span>
                          </div>
                          {history.note && (
                            <p className='text-muted-foreground mt-1'>
                              {history.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <IconPackage className='mr-2 h-5 w-5' />
                  Sản phẩm đặt hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {order.items.map((item, index) => (
                    <div key={item.id}>
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <h4 className='font-medium'>{item.product}</h4>
                          <p className='text-muted-foreground text-sm'>
                            {item.quantity} {item.unit} ×{' '}
                            {OrderService.formatCurrency(item.pricePerUnit)}
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='font-medium'>
                            {OrderService.formatCurrency(item.totalPrice)}
                          </p>
                        </div>
                      </div>
                      {index < order.items.length - 1 && (
                        <Separator className='mt-4' />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Supplier Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <IconFileText className='mr-2 h-5 w-5' />
                  Thông tin nhà cung cấp
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div>
                  <h4 className='font-medium'>{order.supplier.name}</h4>
                  <p className='text-muted-foreground text-sm'>
                    {order.supplier.address}
                  </p>
                </div>
                <div className='flex items-center space-x-4 text-sm'>
                  <div className='flex items-center'>
                    <IconPhone className='mr-1 h-4 w-4' />
                    {order.supplier.phone}
                  </div>
                  <div className='flex items-center'>
                    <IconMail className='mr-1 h-4 w-4' />
                    {order.supplier.email}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span>Tổng sản phẩm:</span>
                  <span>{summary.totalItems} sản phẩm</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Tạm tính:</span>
                  <span>{OrderService.formatCurrency(summary.subtotal)}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Thuế VAT (10%):</span>
                  <span>{OrderService.formatCurrency(summary.tax)}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Phí vận chuyển:</span>
                  <span>
                    {summary.shippingFee === 0
                      ? 'Miễn phí'
                      : OrderService.formatCurrency(summary.shippingFee)}
                  </span>
                </div>
                <Separator />
                <div className='flex justify-between font-medium'>
                  <span>Tổng cộng:</span>
                  <span>{OrderService.formatCurrency(order.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Ngày đặt hàng:</span>
                  <span>{OrderService.formatDate(order.orderDate)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Ngày giao hàng:</span>
                  <span>{OrderService.formatDate(order.deliveryDate)}</span>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    Địa chỉ giao hàng:
                  </span>
                  <p className='mt-1'>{order.deliveryAddress}</p>
                </div>
                {order.notes && (
                  <div>
                    <span className='text-muted-foreground'>Ghi chú:</span>
                    <p className='mt-1'>{order.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Thao tác</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                {OrderService.canModifyOrder(order.status) && (
                  <Button
                    variant='outline'
                    className='w-full'
                    onClick={handleEditOrder}
                  >
                    <IconEdit className='mr-2 h-4 w-4' />
                    Chỉnh sửa đơn hàng
                  </Button>
                )}
                {OrderService.canCancelOrder(order.status) && (
                  <Button
                    variant='destructive'
                    className='w-full'
                    onClick={handleCancelOrder}
                  >
                    <IconTrash className='mr-2 h-4 w-4' />
                    Hủy đơn hàng
                  </Button>
                )}
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={() => window.print()}
                >
                  <IconFileText className='mr-2 h-4 w-4' />
                  In đơn hàng
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

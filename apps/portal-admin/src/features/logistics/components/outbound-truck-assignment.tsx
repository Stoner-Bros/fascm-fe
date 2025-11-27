'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  IconTruckDelivery,
  IconRefresh,
  IconEye,
  IconPackage,
  IconMapPin,
  IconTruck
} from '@tabler/icons-react';
import { fetchOrders } from '@/services/order.service';
import { fetchTrucks } from '@/services/truck.service';
import { createDelivery, fetchDeliveries } from '@/services/delivery.service';
import type { OrderBE } from '@/types/order';
import type { Truck } from '@/types/truck';
import type { Delivery } from '@/types/delivery';
import { useToast } from '@/components/ui/use-toast';
import { DateTimePicker } from '@/components/ui/date-time-picker';

function OrderStatusBadge({ status }: { status?: string | null }) {
  if (!status) return <Badge variant='outline'>Unknown</Badge>;

  const variants: Record<string, { label: string; variant: any }> = {
    IN_PROGRESS: { label: 'Đang xử lý', variant: 'secondary' },
    APPROVED: { label: 'Đã duyệt', variant: 'default' },
    PENDING_ASSIGNMENT: { label: 'Chờ phân xe', variant: 'secondary' },
    PENDING_PICKUP: { label: 'Chờ giao hàng', variant: 'default' },
    CANCELLED: { label: 'Đã hủy', variant: 'destructive' },
    REJECTED: { label: 'Từ chối', variant: 'destructive' }
  };

  const config = variants[status] || { label: status, variant: 'outline' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function TruckStatusBadge({ status }: { status?: string | null }) {
  if (!status) return <Badge variant='outline'>Unknown</Badge>;

  const variants: Record<string, { label: string; variant: any }> = {
    active: { label: 'Hoạt động', variant: 'default' },
    in_use: { label: 'Đang dùng', variant: 'secondary' },
    maintenance: { label: 'Bảo trì', variant: 'destructive' },
    inactive: { label: 'Không hoạt động', variant: 'outline' }
  };

  const config = variants[status] || { label: status, variant: 'outline' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function OutboundTruckAssignment() {
  const { toast } = useToast();

  const [orders, setOrders] = useState<OrderBE[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<OrderBE | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const [assignmentForm, setAssignmentForm] = useState({
    truckId: '',
    startTime: null as Date | null,
    estimatedArrival: null as Date | null
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    hasNextPage: false
  });

  // Load deliveries to check assignments
  const loadDeliveries = async () => {
    try {
      const res = await fetchDeliveries({ page: 1, limit: 1000 });
      setDeliveries(res.data);
    } catch (error) {
      // Silent error - deliveries will be empty
    }
  };

  // Load orders ready for delivery (approved or pending pickup)
  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetchOrders({
        page: pagination.page,
        limit: pagination.limit
      });
      // Filter orders that are ready for delivery
      const readyOrders = res.data.filter(
        (o: OrderBE) =>
          o.orderSchedule?.status === 'APPROVED' ||
          o.orderSchedule?.status === 'PENDING_ASSIGNMENT' ||
          o.orderSchedule?.status === 'PENDING_PICKUP'
      );

      // Filter out orders that already have truck assignments
      const assignedOrderScheduleIds = new Set(
        deliveries
          .filter((d) => d.orderSchedule?.id)
          .map((d) => d.orderSchedule!.id)
      );

      const unassignedOrders = readyOrders.filter(
        (o: OrderBE) =>
          o.orderSchedule && !assignedOrderScheduleIds.has(o.orderSchedule.id)
      );

      setOrders(unassignedOrders);
      setPagination((prev) => ({ ...prev, hasNextPage: res.hasNextPage }));
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể tải danh sách đơn hàng',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load available trucks
  const loadTrucks = async () => {
    try {
      const res = await fetchTrucks({ page: 1, limit: 100 });
      // Filter only active trucks (not maintenance or inactive)
      const availableTrucks = res.data.filter(
        (t: Truck) => t.status === 'active'
      );
      setTrucks(availableTrucks);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể tải danh sách xe',
        description: error instanceof Error ? error.message : undefined
      });
    }
  };

  useEffect(() => {
    loadDeliveries();
    loadTrucks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (deliveries.length > 0 || pagination.page === 1) {
      loadOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, deliveries]);

  // Handle assign truck for outbound delivery
  const handleAssignTruck = async () => {
    if (
      !selectedOrder ||
      !assignmentForm.truckId ||
      !selectedOrder.orderSchedule
    )
      return;

    setIsSubmitting(true);
    try {
      // Create an outbound delivery record
      await createDelivery({
        truck: { id: assignmentForm.truckId },
        orderSchedule: { id: selectedOrder.orderSchedule.id },
        startTime: assignmentForm.startTime?.toISOString() || null,
        endTime: assignmentForm.estimatedArrival?.toISOString() || null,
        status: 'scheduled',
        startLat: null,
        startLng: null,
        endLat: null,
        endLng: null,
        startAddress: 'Kho trung tâm',
        endAddress:
          selectedOrder.orderSchedule.consignee?.address ||
          'Địa chỉ khách hàng',
        harvestSchedule: null
      });

      toast({
        title: 'Thành công',
        description: 'Đã phân công xe giao hàng'
      });
      setIsAssignDialogOpen(false);
      setSelectedOrder(null);
      setAssignmentForm({
        truckId: '',
        startTime: null,
        estimatedArrival: null
      });
      // Reload deliveries and orders
      await loadDeliveries();
      loadOrders();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description:
          error instanceof Error ? error.message : 'Không thể phân công xe'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date
  const formatDate = (date?: string | Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount?: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <IconTruckDelivery className='h-5 w-5' />
                Phân Công Xe Giao Hàng (Outbound)
              </CardTitle>
              <CardDescription>
                Phân công xe giao hàng từ kho đến khách hàng
                {deliveries.length > 0 && (
                  <span className='text-muted-foreground ml-2 text-xs'>
                    ({deliveries.filter((d) => d.orderSchedule).length} đã phân
                    công)
                  </span>
                )}
              </CardDescription>
            </div>
            <Button
              onClick={async () => {
                await loadDeliveries();
                loadOrders();
              }}
              variant='outline'
              size='sm'
            >
              <IconRefresh className='mr-2 h-4 w-4' />
              Làm mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className='text-right'>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center'>
                      Đang tải...
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center'>
                      Không có đơn hàng cần giao
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className='font-mono text-sm'>
                        {order.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {order.orderSchedule?.consignee?.organizationName ||
                          order.orderSchedule?.consignee?.representativeName ||
                          'N/A'}
                      </TableCell>
                      <TableCell>{formatDate(order.orderDate)}</TableCell>
                      <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                      <TableCell>
                        <OrderStatusBadge
                          status={order.orderSchedule?.status}
                        />
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDetailDialogOpen(true);
                            }}
                          >
                            <IconEye className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='default'
                            size='sm'
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsAssignDialogOpen(true);
                            }}
                          >
                            <IconTruck className='mr-1 h-4 w-4' />
                            Phân công xe
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className='mt-4 flex items-center justify-between'>
            <div className='text-muted-foreground text-sm'>
              Trang {pagination.page}
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page === 1}
              >
                Trước
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={!pagination.hasNextPage}
              >
                Sau
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Trucks Card */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IconTruck className='h-5 w-5' />
            Xe Khả Dụng ({trucks.length})
          </CardTitle>
          <CardDescription>
            Danh sách xe tải đang sẵn sàng để phân công
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {trucks.length === 0 ? (
              <p className='text-muted-foreground col-span-full py-4 text-center'>
                Không có xe khả dụng
              </p>
            ) : (
              trucks.map((truck) => (
                <Card key={truck.id}>
                  <CardContent className='pt-6'>
                    <div className='space-y-2'>
                      <div className='flex items-center justify-between'>
                        <span className='text-lg font-semibold'>
                          {truck.licensePlate}
                        </span>
                        <TruckStatusBadge status={truck.status} />
                      </div>
                      <div className='text-muted-foreground space-y-1 text-sm'>
                        <div>Model: {truck.model || 'N/A'}</div>
                        <div>
                          Tải trọng:{' '}
                          {truck.capacity ? `${truck.capacity} kg` : 'N/A'}
                        </div>
                        {truck.currentLocation && (
                          <div className='mt-1 flex items-center gap-1'>
                            <IconMapPin className='h-3 w-3' />
                            {truck.currentLocation}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-muted-foreground'>Mã đơn</Label>
                  <p className='font-mono text-sm'>{selectedOrder.id}</p>
                </div>
                <div>
                  <Label className='text-muted-foreground'>Trạng thái</Label>
                  <div className='mt-1'>
                    <OrderStatusBadge
                      status={selectedOrder.orderSchedule?.status}
                    />
                  </div>
                </div>
                <div>
                  <Label className='text-muted-foreground'>Khách hàng</Label>
                  <p>
                    {selectedOrder.orderSchedule?.consignee?.organizationName ||
                      selectedOrder.orderSchedule?.consignee
                        ?.representativeName ||
                      'N/A'}
                  </p>
                </div>
                <div>
                  <Label className='text-muted-foreground'>Ngày đặt hàng</Label>
                  <p>{formatDate(selectedOrder.orderDate)}</p>
                </div>
                <div className='col-span-2'>
                  <Label className='text-muted-foreground'>
                    Địa chỉ giao hàng
                  </Label>
                  <p>
                    {selectedOrder.orderSchedule?.consignee?.address || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className='text-muted-foreground'>
                    Tổng khối lượng
                  </Label>
                  <p>
                    {selectedOrder.totalMass
                      ? `${selectedOrder.totalMass} kg`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className='text-muted-foreground'>Tổng thể tích</Label>
                  <p>
                    {selectedOrder.totalVolume
                      ? `${selectedOrder.totalVolume} m³`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className='text-muted-foreground'>
                    Tổng tiền hàng
                  </Label>
                  <p>{formatCurrency(selectedOrder.totalPayment)}</p>
                </div>
                <div>
                  <Label className='text-muted-foreground'>
                    Tổng cộng (bao gồm VAT)
                  </Label>
                  <p className='font-semibold'>
                    {formatCurrency(selectedOrder.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Truck Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Phân công xe giao hàng</DialogTitle>
            <DialogDescription>
              Chọn xe và lên lịch giao hàng từ kho đến khách hàng
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className='space-y-4'>
              <div className='bg-muted rounded-lg p-4'>
                <h4 className='mb-2 flex items-center gap-2 font-semibold'>
                  <IconPackage className='h-4 w-4' />
                  Thông tin đơn hàng
                </h4>
                <div className='grid grid-cols-2 gap-2 text-sm'>
                  <div>
                    <span className='text-muted-foreground'>Khách hàng:</span>{' '}
                    <span className='font-medium'>
                      {selectedOrder.orderSchedule?.consignee
                        ?.organizationName ||
                        selectedOrder.orderSchedule?.consignee
                          ?.representativeName ||
                        'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className='text-muted-foreground'>Tổng tiền:</span>{' '}
                    <span className='font-medium'>
                      {formatCurrency(selectedOrder.totalAmount)}
                    </span>
                  </div>
                  <div className='col-span-2'>
                    <span className='text-muted-foreground'>Địa chỉ:</span>{' '}
                    <span className='font-medium'>
                      {selectedOrder.orderSchedule?.consignee?.address || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className='space-y-4'>
                <div>
                  <Label htmlFor='truck-select'>Chọn xe *</Label>
                  <Select
                    value={assignmentForm.truckId}
                    onValueChange={(value) =>
                      setAssignmentForm((prev) => ({ ...prev, truckId: value }))
                    }
                  >
                    <SelectTrigger id='truck-select'>
                      <SelectValue placeholder='Chọn xe...' />
                    </SelectTrigger>
                    <SelectContent>
                      {trucks.map((truck) => (
                        <SelectItem key={truck.id} value={truck.id}>
                          {truck.licensePlate} - {truck.model} (
                          {truck.capacity ? `${truck.capacity} kg` : 'N/A'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor='start-time'>Thời gian khởi hành từ kho</Label>
                  <DateTimePicker
                    value={assignmentForm.startTime || undefined}
                    onChange={(value) =>
                      setAssignmentForm((prev) => ({
                        ...prev,
                        startTime: new Date(value)
                      }))
                    }
                    placeholder='Chọn thời gian khởi hành'
                  />
                </div>

                <div>
                  <Label htmlFor='estimated-arrival'>
                    Thời gian dự kiến đến khách hàng
                  </Label>
                  <DateTimePicker
                    value={assignmentForm.estimatedArrival || undefined}
                    onChange={(value) =>
                      setAssignmentForm((prev) => ({
                        ...prev,
                        estimatedArrival: new Date(value)
                      }))
                    }
                    placeholder='Chọn thời gian dự kiến'
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setIsAssignDialogOpen(false);
                setAssignmentForm({
                  truckId: '',
                  startTime: null,
                  estimatedArrival: null
                });
              }}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleAssignTruck}
              disabled={isSubmitting || !assignmentForm.truckId}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận phân công'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  IconSearch,
  IconCheck,
  IconTruck,
  IconPackage,
  IconCalendar,
  IconMapPin,
  IconAlertCircle,
  IconRefresh
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { fetchDeliveries, type Delivery } from '@/services/delivery.service';
import { completeHarvestSchedule } from '@/services/harvest-schedule.service';

export default function PickupConfirmationPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null
  );

  // Load deliveries for inbound pickup (harvest schedules only)
  const loadDeliveries = async () => {
    setIsLoading(true);
    try {
      const res = await fetchDeliveries({ page: 1, limit: 100 });
      // Filter only inbound deliveries with harvest schedules that are scheduled or in transit
      const inboundDeliveries = res.data.filter(
        (d) =>
          d.harvestSchedule &&
          (d.status === 'scheduled' ||
            d.status === 'departed' ||
            d.status === 'in_transit')
      );
      setDeliveries(inboundDeliveries);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể tải danh sách',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirmPickup = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setConfirmDialogOpen(true);
  };

  const confirmPickupAction = async () => {
    if (selectedDelivery && selectedDelivery.harvestSchedule) {
      try {
        // Complete the harvest schedule
        await completeHarvestSchedule(selectedDelivery.harvestSchedule.id);
        toast({
          title: 'Xác nhận thành công',
          description: `Đã xác nhận xe ${selectedDelivery.truck?.licensePlate} đã thu mua hàng.`
        });
        // Reload deliveries
        await loadDeliveries();
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Lỗi',
          description:
            error instanceof Error ? error.message : 'Không thể xác nhận'
        });
      }
    }
    setConfirmDialogOpen(false);
    setSelectedDelivery(null);
  };

  const filteredDeliveries = deliveries.filter(
    (delivery) =>
      delivery.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.harvestSchedule?.id
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      delivery.truck?.licensePlate
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const formatDate = (date?: string | Date | null) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (d.getFullYear() === 1970) return 'N/A';
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (date?: string | Date | null) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (d.getFullYear() === 1970) return 'N/A';
    return d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTodayDeliveries = () => {
    const today = new Date().toISOString().split('T')[0];
    return deliveries.filter((d) => {
      if (!d.startTime) return false;
      const deliveryDate = new Date(d.startTime).toISOString().split('T')[0];
      return deliveryDate === today;
    });
  };

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>
              Xác Nhận Thu Mua
            </h2>
            <p className='text-muted-foreground'>
              Xác nhận khi xe tải đã thu mua hàng của bạn
            </p>
          </div>
          <Button onClick={loadDeliveries} variant='outline' size='sm'>
            <IconRefresh className='mr-2 h-4 w-4' />
            Làm mới
          </Button>
        </div>

        {/* Alert Banner */}
        {deliveries.length > 0 && (
          <Card className='border-yellow-200 bg-yellow-50'>
            <CardContent className='flex items-center gap-3 pt-6'>
              <IconAlertCircle className='h-5 w-5 text-yellow-600' />
              <div>
                <p className='font-medium text-yellow-900'>
                  {deliveries.length} chuyến xe đang chờ xác nhận
                </p>
                <p className='text-sm text-yellow-700'>
                  Vui lòng xác nhận khi xe tải đã thu mua hàng thành công
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <Card>
            <CardHeader className='pb-3'>
              <CardDescription className='flex items-center gap-2'>
                <IconTruck className='h-4 w-4' />
                Chờ Xác Nhận
              </CardDescription>
              <CardTitle className='text-3xl'>{deliveries.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground text-xs'>
                Xe đang trên đường thu mua
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardDescription className='flex items-center gap-2'>
                <IconCalendar className='h-4 w-4' />
                Hôm Nay
              </CardDescription>
              <CardTitle className='text-3xl'>
                {getTodayDeliveries().length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground text-xs'>Chuyến xe hôm nay</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardDescription className='flex items-center gap-2'>
                <IconPackage className='h-4 w-4' />
                Lịch Thu Hoạch
              </CardDescription>
              <CardTitle className='text-3xl'>{deliveries.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground text-xs'>Đang chờ hoàn tất</p>
            </CardContent>
          </Card>
        </div>

        {/* Pickups List */}
        <Card>
          <CardHeader>
            <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
              <div>
                <CardTitle>Xe Đang Thu Mua</CardTitle>
                <CardDescription>
                  Xác nhận khi xe tải đã thu mua hàng thành công
                </CardDescription>
              </div>
              <div className='relative flex-1 md:max-w-sm'>
                <IconSearch className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
                <Input
                  placeholder='Tìm theo mã xe, lịch thu hoạch...'
                  className='pl-8'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex items-center justify-center py-12'>
                <p className='text-muted-foreground'>Đang tải...</p>
              </div>
            ) : filteredDeliveries.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <IconCheck className='text-muted-foreground mb-4 h-12 w-12' />
                <h3 className='mb-2 text-lg font-semibold'>
                  {deliveries.length === 0
                    ? 'Không có xe nào cần xác nhận'
                    : 'Không tìm thấy kết quả'}
                </h3>
                <p className='text-muted-foreground mb-4'>
                  {deliveries.length === 0
                    ? 'Tất cả xe đã được xác nhận. Tuyệt vời!'
                    : 'Thử điều chỉnh từ khóa tìm kiếm'}
                </p>
              </div>
            ) : (
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã Giao Hàng</TableHead>
                      <TableHead>Lịch Thu Hoạch</TableHead>
                      <TableHead>Ngày & Giờ</TableHead>
                      <TableHead>Địa Điểm</TableHead>
                      <TableHead>Xe</TableHead>
                      <TableHead>Trạng Thái</TableHead>
                      <TableHead className='text-right'>Thao Tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeliveries.map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell className='font-mono text-sm font-medium'>
                          {delivery.id}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/supplier/harvest-schedules/${delivery.harvestSchedule?.id}`}
                            className='text-primary hover:underline'
                          >
                            {delivery.harvestSchedule?.id}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col'>
                            <span className='font-medium'>
                              {formatDate(delivery.startTime)}
                            </span>
                            <span className='text-muted-foreground text-xs'>
                              {formatTime(delivery.startTime)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex max-w-[200px] items-center gap-1'>
                            <IconMapPin className='text-muted-foreground h-3 w-3 flex-shrink-0' />
                            <span
                              className='truncate'
                              title={delivery.endAddress || ''}
                            >
                              {delivery.endAddress || 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col'>
                            <Badge variant='outline'>
                              {delivery.truck?.licensePlate || 'N/A'}
                            </Badge>
                            <span className='text-muted-foreground mt-1 text-xs'>
                              {delivery.truck?.model}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant='secondary'>
                            {delivery.status === 'scheduled' && 'Đã lên lịch'}
                            {delivery.status === 'departed' && 'Đã khởi hành'}
                            {delivery.status === 'in_transit' &&
                              'Đang vận chuyển'}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                          <Button
                            size='sm'
                            onClick={() => handleConfirmPickup(delivery)}
                          >
                            <IconCheck className='mr-2 h-4 w-4' />
                            Xác nhận
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác Nhận Thu Mua Hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Vui lòng xác nhận rằng xe tải đã thu mua hàng thành công từ bạn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedDelivery && (
            <div className='space-y-3 py-4'>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Mã giao hàng:</span>
                <span className='font-mono text-xs font-medium'>
                  {selectedDelivery.id}
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Lịch thu hoạch:</span>
                <span className='font-mono text-xs font-medium'>
                  {selectedDelivery.harvestSchedule?.id}
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Biển số xe:</span>
                <span className='font-medium'>
                  {selectedDelivery.truck?.licensePlate || 'N/A'}
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Model xe:</span>
                <span className='font-medium'>
                  {selectedDelivery.truck?.model || 'N/A'}
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Địa điểm:</span>
                <span className='max-w-[200px] truncate text-right font-medium'>
                  {selectedDelivery.endAddress || 'N/A'}
                </span>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPickupAction}>
              Xác Nhận Thu Mua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

'use client';

import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchHarvestDetailsByHarvestTicketId } from '@/services/harvest-detail.service';
import {
  completeHarvestSchedule,
  confirmHarvestSchedule,
  fetchHarvestScheduleById
} from '@/services/harvest-schedule.service';
import {
  fetchHarvestTicketInvoice,
  fetchHarvestTickets
} from '@/services/harvest-ticket.service';
import type { HarvestDetail } from '@/types/harvest-detail';
import type { HarvestSchedule } from '@/types/harvest-schedule';
import {
  IconArrowLeft,
  IconCalendar,
  IconCheck,
  IconDownload,
  IconFileText,
  IconUser,
  IconX
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

type DetailRow = {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
};

export default function HarvestScheduleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [harvestSchedule, setHarvestSchedule] =
    useState<HarvestSchedule | null>(null);
  const [detailRows, setDetailRows] = useState<DetailRow[]>([]);
  const [harvestTickets, setHarvestTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);

        const scheduleData = await fetchHarvestScheduleById(id);

        // Tickets of this schedule
        const ticketsRes = await fetchHarvestTickets({
          page: 1,
          limit: 20,
          harvestScheduleId: scheduleData.id
        });

        const ticketsData = ticketsRes.data ?? [];

        // Lọc kỹ lại ticket đúng schedule hiện tại (phòng khi backend trả dư)
        const tickets = ticketsData.filter((ticket) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ticketScheduleId =
            (ticket as any)?.harvestScheduleId?.id ??
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (ticket as any)?.harvestSchedule?.id ??
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (ticket as any)?.harvestScheduleId ??
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (ticket as any)?.scheduleId ??
            '';

          return String(ticketScheduleId) === String(scheduleData.id);
        });

        // Details of tickets
        const detailResponses = await Promise.all(
          tickets.map(async (ticket) => {
            try {
              const ds =
                (await fetchHarvestDetailsByHarvestTicketId(ticket.id)) ?? [];
              return ds;
            } catch (error) {
              console.error(
                `Failed to fetch harvest details for ticket ${ticket.id}`,
                error
              );
              return [] as HarvestDetail[];
            }
          })
        );

        // *** CHỈ LẤY DETAIL CỦA SCHEDULE NÀY ***
        const scheduleIdStr = String(scheduleData.id);

        const detailsOfThisSchedule = detailResponses
          .flat()
          .filter((detail) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const scheduleFromDetail =
              (detail as any)?.harvestTicket?.harvestScheduleId?.id ??
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (detail as any)?.harvestTicket?.harvestScheduleId ??
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (detail as any)?.harvestTicket?.harvestSchedule?.id ??
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (detail as any)?.harvestScheduleId?.id ??
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (detail as any)?.harvestScheduleId ??
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (detail as any)?.harvestSchedule?.id ??
              null;

            // Nếu backend đã filter rồi và không gửi kèm scheduleId,
            // thì giữ lại (không filter tiếp) để không làm mất dữ liệu hợp lệ
            if (!scheduleFromDetail) return true;

            return String(scheduleFromDetail) === scheduleIdStr;
          });

        // Tính toán amount cho mỗi detail: quantity * unitPrice
        const rows: DetailRow[] = detailsOfThisSchedule.map((detail) => {
          const quantity = Number(detail.quantity ?? 0);
          const unitPrice = Number(detail.unitPrice ?? 0);
          const amount = quantity * unitPrice; // Tính amount
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const productName =
            (detail as any)?.product?.name ||
            (detail as any)?.productName ||
            (detail as any)?.product?.id ||
            'Unknown product';

          return {
            id: detail.id,
            productName: String(productName),
            quantity,
            unit: String(detail.unit ?? 'kg'),
            unitPrice,
            totalPrice: amount // amount = quantity * unitPrice
          };
        });

        if (cancelled) return;

        // Tính toán cho tickets - CHỈ LẤY TICKETS THUỘC SCHEDULE NÀY
        const updatedTickets = tickets.map((ticket) => {
          // Lấy details của ticket này
          const ticketDetails = detailsOfThisSchedule.filter(
            (detail) => detail.harvestTicket?.id === ticket.id
          );

          // Tính tổng quantity từ details (unit = kg)
          const totalQuantity = ticketDetails.reduce(
            (sum, detail) => sum + Number(detail.quantity ?? 0),
            0
          );

          // Tính tổng amount từ details
          const totalAmount = ticketDetails.reduce((sum, detail) => {
            const qty = Number(detail.quantity ?? 0);
            const price = Number(detail.unitPrice ?? 0);
            return sum + qty * price;
          }, 0);

          return {
            ...ticket,
            quantity: totalQuantity,
            unit: 'kg',
            totalPayment: totalAmount,
            totalAmount: totalAmount
          };
        });

        setHarvestSchedule(scheduleData);
        setDetailRows(rows);
        // CHỈ LƯU TICKETS THUỘC SCHEDULE NÀY
        setHarvestTickets(updatedTickets);
        setError(null);
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message ?? 'Không thể tải thông tin lịch thu hoạch');
        console.error('Error loading harvest schedule:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) {
      void loadData();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Chuẩn hóa status về UPPERCASE và default PENDING
  const normalizeStatus = (status?: string | null): string => {
    if (!status || status.trim() === '') return 'PENDING';
    return status.toUpperCase().trim();
  };

  const getStatusLabel = (status?: string | null) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case 'PENDING':
        return 'Chờ xử lý';
      case 'APPROVED':
        return 'Đã duyệt';
      case 'REJECTED':
        return 'Đã từ chối';
      case 'COMPLETED':
        return 'Đã hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return 'Chờ xử lý';
    }
  };

  const getStatusColor = (status?: string | null) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case 'PENDING':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'APPROVED':
        return 'text-green-600 dark:text-green-400';
      case 'REJECTED':
        return 'text-red-600 dark:text-red-400';
      case 'COMPLETED':
        return 'text-blue-600 dark:text-blue-400';
      case 'CANCELLED':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  const getStatusBadgeVariant = (status?: string | null) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case 'PENDING':
        return 'secondary';
      case 'APPROVED':
        return 'default';
      case 'COMPLETED':
        return 'default';
      case 'REJECTED':
      case 'CANCELED':
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (date?: string | Date | null) => {
    if (!date) return 'Chưa có ngày';
    try {
      return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return 'Ngày không hợp lệ';
    }
  };

  const handleApprove = async () => {
    if (!harvestSchedule) return;
    try {
      setActionLoading(true);
      const updated = await confirmHarvestSchedule(
        harvestSchedule.id,
        'approved'
      );
      setHarvestSchedule(updated);
      setError(null);
      toast.success('Đã duyệt lịch thu hoạch thành công!', {
        description: `Lịch thu hoạch ${harvestSchedule.id} đã được duyệt.`
      });
    } catch (err: any) {
      const errorMsg = err?.message ?? 'Không thể duyệt lịch thu hoạch';
      setError(errorMsg);
      toast.error('Không thể duyệt lịch thu hoạch', {
        description: errorMsg
      });
      console.error('Error approving harvest schedule:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!harvestSchedule) return;
    try {
      setActionLoading(true);
      const updated = await confirmHarvestSchedule(
        harvestSchedule.id,
        'rejected'
      );
      setHarvestSchedule(updated);
      setError(null);
      toast.error('Đã từ chối lịch thu hoạch', {
        description: `Lịch thu hoạch ${harvestSchedule.id} đã bị từ chối.`
      });
    } catch (err: any) {
      const errorMsg = err?.message ?? 'Không thể từ chối lịch thu hoạch';
      setError(errorMsg);
      toast.error('Không thể từ chối lịch thu hoạch', {
        description: errorMsg
      });
      console.error('Error rejecting harvest schedule:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!harvestSchedule) return;
    try {
      setActionLoading(true);
      const updated = await completeHarvestSchedule(harvestSchedule.id);
      setHarvestSchedule(updated);
      setError(null);
      toast.success('Đã hoàn thành lịch thu hoạch!', {
        description: `Lịch thu hoạch ${harvestSchedule.id} đã được hoàn thành.`
      });
    } catch (err: any) {
      const errorMsg = err?.message ?? 'Không thể hoàn thành lịch thu hoạch';
      setError(errorMsg);
      toast.error('Không thể hoàn thành lịch thu hoạch', {
        description: errorMsg
      });
      console.error('Error completing harvest schedule:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Tổng số lượng & tổng tiền (memo để tránh tính lại không cần thiết)
  const totalQuantity = useMemo(
    () => detailRows.reduce((sum, d) => sum + d.quantity, 0),
    [detailRows]
  );

  const totalPrice = useMemo(
    () => detailRows.reduce((sum, d) => sum + d.totalPrice, 0),
    [detailRows]
  );

  // Hàm tải hóa đơn điện tử
  const handleDownloadInvoice = async (ticketId: string) => {
    try {
      setInvoiceLoading(true);
      const blob = await fetchHarvestTicketInvoice(ticketId);

      // Tạo URL từ blob và tải xuống
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${ticketId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Đã tải hóa đơn điện tử thành công!');
    } catch (err: any) {
      toast.error('Không thể tải hóa đơn điện tử', {
        description: err?.message ?? 'Có lỗi xảy ra khi tải hóa đơn'
      });
      console.error('Error downloading invoice:', err);
    } finally {
      setInvoiceLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className='space-y-6'>
          <Skeleton className='h-12 w-full' />
          <Skeleton className='h-64 w-full' />
          <Skeleton className='h-64 w-full' />
        </div>
      </PageContainer>
    );
  }

  if (error || !harvestSchedule) {
    return (
      <PageContainer>
        <div className='flex flex-col items-center justify-center py-12'>
          <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'>
            <p className='font-medium'>
              {error || 'Không tìm thấy lịch thu hoạch'}
            </p>
          </div>
          <Button
            variant='outline'
            className='mt-4'
            onClick={() => router.push('/dashboard/harvest')}
          >
            <IconArrowLeft className='mr-2 h-4 w-4' />
            Quay lại danh sách
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button variant='ghost' size='icon' onClick={() => router.back()}>
              <IconArrowLeft className='h-5 w-5' />
            </Button>
            <div>
              <h2 className='text-3xl font-bold tracking-tight'>
                Chi tiết Lịch Thu Hoạch
              </h2>
              <p className='text-muted-foreground'>ID: {harvestSchedule.id}</p>
            </div>
          </div>
          <div>
            <Badge
              variant={getStatusBadgeVariant(harvestSchedule.status)}
              className={`text-sm font-semibold ${getStatusColor(harvestSchedule.status)}`}
            >
              {getStatusLabel(harvestSchedule.status)}
            </Badge>
          </div>
        </div>

        <Separator />

        <div className='grid gap-6 md:grid-cols-3'>
          {/* Main Content */}
          <div className='space-y-6 md:col-span-2'>
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
                <CardDescription>
                  Chi tiết về lịch thu hoạch này
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-muted-foreground mb-1 text-sm'>
                      Trạng thái
                    </p>
                    <Badge
                      variant={getStatusBadgeVariant(harvestSchedule.status)}
                    >
                      {getStatusLabel(harvestSchedule.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className='text-muted-foreground mb-1 text-sm'>
                      Ngày thu hoạch
                    </p>
                    <div className='flex items-center gap-2'>
                      <IconCalendar className='h-4 w-4' />
                      <p className='text-sm font-medium'>
                        {formatDate(harvestSchedule.harvestDate)}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className='text-muted-foreground mb-2 text-sm'>Mô tả</p>
                  <p className='text-sm'>
                    {harvestSchedule.description || 'Không có mô tả'}
                  </p>
                </div>

                {harvestSchedule.supplierId && (
                  <>
                    <Separator />
                    <div>
                      <p className='text-muted-foreground mb-1 text-sm'>
                        Supplier Name
                      </p>
                      <div className='flex items-center gap-2'>
                        <IconUser className='h-4 w-4' />
                        <p className='text-sm font-medium'>
                          {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (harvestSchedule as any)?.supplierId?.user
                              ?.firstName
                          }{' '}
                          {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (harvestSchedule as any)?.supplierId?.user?.lastName
                          }
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-muted-foreground mb-1 text-sm'>
                      Ngày tạo
                    </p>
                    <p className='text-sm'>
                      {formatDate(harvestSchedule.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className='text-muted-foreground mb-1 text-sm'>
                      Cập nhật lần cuối
                    </p>
                    <p className='text-sm'>
                      {formatDate(harvestSchedule.updatedAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Harvest Details (như bên Supplier) */}
            <Card>
              <CardHeader>
                <CardTitle>Harvest Details</CardTitle>
                <CardDescription>
                  Danh sách chi tiết thu hoạch của lịch này
                </CardDescription>
              </CardHeader>
              <CardContent>
                {detailRows.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-8 text-center'>
                    <IconFileText className='text-muted-foreground mb-2 h-12 w-12' />
                    <p className='text-muted-foreground text-sm'>
                      Chưa có chi tiết nào
                    </p>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <div className='rounded-md border text-sm'>
                      <div className='bg-muted text-muted-foreground grid grid-cols-5 gap-2 border-b px-3 py-2 text-xs font-medium tracking-wide uppercase'>
                        <span className='col-span-2'>Sản phẩm</span>
                        <span>Số lượng</span>
                        <span>Đơn vị</span>
                        <span>Đơn giá</span>
                      </div>
                      {detailRows.map((row) => (
                        <div
                          key={row.id}
                          className='grid grid-cols-5 gap-2 border-b px-3 py-2 last:border-b-0'
                        >
                          <div className='col-span-2'>
                            <p className='font-medium'>{row.productName}</p>
                          </div>
                          <div>
                            <p className='font-medium'>{row.quantity}</p>
                          </div>
                          <div>
                            <p className='font-medium'>{row.unit}</p>
                          </div>
                          <div>
                            <p className='font-medium'>
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(row.unitPrice)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className='grid grid-cols-2 gap-4 border-t pt-4'>
                      <div>
                        <p className='text-muted-foreground text-sm'>
                          Tổng số lượng
                        </p>
                        <p className='font-medium'>{totalQuantity}</p>
                      </div>
                      <div>
                        <p className='text-muted-foreground text-sm'>
                          Tổng tiền
                        </p>
                        <p className='text-primary text-lg font-bold'>
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(totalPrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Status Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Thao tác</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                {normalizeStatus(harvestSchedule.status) === 'PENDING' && (
                  <>
                    <Button
                      className='w-full justify-start'
                      variant='default'
                      onClick={handleApprove}
                      disabled={actionLoading}
                    >
                      <IconCheck className='mr-2 h-4 w-4' />
                      {actionLoading ? 'Đang xử lý...' : 'Approve'}
                    </Button>
                    <Button
                      className='w-full justify-start'
                      variant='destructive'
                      onClick={handleReject}
                      disabled={actionLoading}
                    >
                      <IconX className='mr-2 h-4 w-4' />
                      {actionLoading ? 'Đang xử lý...' : 'Reject'}
                    </Button>
                  </>
                )}
                {normalizeStatus(harvestSchedule.status) === 'APPROVED' && (
                  <Button
                    className='w-full justify-start'
                    variant='default'
                    onClick={handleComplete}
                    disabled={actionLoading}
                  >
                    <IconCheck className='mr-2 h-4 w-4' />
                    {actionLoading ? 'Đang xử lý...' : 'Complete'}
                  </Button>
                )}
                {normalizeStatus(harvestSchedule.status) === 'COMPLETED' && (
                  <Button
                    className='w-full justify-start'
                    variant='outline'
                    disabled
                  >
                    <IconCheck className='mr-2 h-4 w-4' />
                    Đã hoàn thành
                  </Button>
                )}
                {(normalizeStatus(harvestSchedule.status) === 'REJECTED' ||
                  normalizeStatus(harvestSchedule.status) === 'CANCELED' ||
                  normalizeStatus(harvestSchedule.status) === 'CANCELLED') && (
                  <Button
                    className='w-full justify-start'
                    variant='outline'
                    disabled
                  >
                    <IconX className='mr-2 h-4 w-4' />
                    {normalizeStatus(harvestSchedule.status) === 'REJECTED'
                      ? 'Đã từ chối'
                      : 'Đã hủy'}
                  </Button>
                )}
                {/* <Link href='/dashboard/harvest' className='block w-full'>
                  <Button variant='outline' className='w-full justify-start'>
                    <IconArrowLeft className='mr-2 h-4 w-4' />
                    Quay lại danh sách
                  </Button>
                </Link> */}
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin nhanh</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <p className='text-muted-foreground mb-1 text-sm'>
                    Tổng số details
                  </p>
                  <p className='text-2xl font-bold'>{detailRows.length}</p>
                </div>
                <Separator />
                <div>
                  <p className='text-muted-foreground mb-1 text-sm'>
                    Tổng số lượng
                  </p>
                  <p className='text-lg font-bold'>{totalQuantity} kg</p>
                </div>
                <Separator />
                <div>
                  <p className='text-muted-foreground mb-1 text-sm'>
                    ID Schedule
                  </p>
                  <p className='font-mono text-sm'>{harvestSchedule.id}</p>
                </div>
              </CardContent>
            </Card>

            {/* Download Invoice */}
            {harvestTickets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Hóa đơn điện tử</CardTitle>
                  <CardDescription>Tải hóa đơn cho các ticket</CardDescription>
                </CardHeader>
                <CardContent className='space-y-2'>
                  {harvestTickets.map((ticket) => (
                    <Button
                      key={ticket.id}
                      variant='outline'
                      className='w-full justify-start'
                      onClick={() => handleDownloadInvoice(ticket.id)}
                      disabled={invoiceLoading}
                    >
                      <IconDownload className='mr-2 h-4 w-4' />
                      {invoiceLoading
                        ? 'Đang tải...'
                        : `Tải hóa đơn ${ticket.ticketNumber || ticket.id.slice(0, 8)}`}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

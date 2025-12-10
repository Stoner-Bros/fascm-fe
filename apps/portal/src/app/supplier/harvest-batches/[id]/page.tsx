'use client';

import PageContainer from '@/components/layout/page-container';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  fetchHarvestScheduleById,
  updateHarvestScheduleStatus
} from '@/services/harvest-schedule.service';
import type { HarvestSchedule } from '@/types/harvest-schedule';
import {
  IconAlertCircle,
  IconArrowLeft,
  IconCalendar,
  IconCheck,
  IconClock,
  IconEdit,
  IconInfoCircle,
  IconMapPin,
  IconPackage,
  IconX
} from '@tabler/icons-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
const HarvestRouteSim = dynamic(
  () => import('@/components/map/harvest-route-sim'),
  { ssr: false }
);

import { fetchDeliveriesByHarvestSchedule } from '@/services/delivery.service';
import { fetchHarvestPhasesBySchedule } from '@/services/harvest-phase.service';
import type { HarvestPhase } from '@/types/harvest-phase';
import dynamic from 'next/dynamic';

type DetailRow = {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
};

type StatusConfig = {
  label: string;
  icon: React.ReactNode;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  bgColor: string;
  textColor: string;
};

const STATUS_MAP: Record<string, StatusConfig> = {
  pending: {
    label: 'Chờ duyệt đơn',
    icon: <IconClock className='h-4 w-4' />,
    variant: 'outline',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700'
  },
  rejected: {
    label: 'Đã từ chối',
    icon: <IconX className='h-4 w-4' />,
    variant: 'destructive',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700'
  },
  approved: {
    label: 'Đã duyệt đơn',
    icon: <IconCheck className='h-4 w-4' />,
    variant: 'default',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  processing: {
    label: 'Đang xử lý',
    icon: <IconPackage className='h-4 w-4' />,
    variant: 'secondary',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700'
  },
  completed: {
    label: 'Hoàn thành',
    icon: <IconCheck className='h-4 w-4' />,
    variant: 'default',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700'
  },
  canceled: {
    label: 'Đã hủy',
    icon: <IconX className='h-4 w-4' />,
    variant: 'destructive',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700'
  }
};

const PHASE_STATUS_MAP: Record<string, StatusConfig> = {
  preparing: {
    label: 'Đang chuẩn bị',
    icon: <IconClock className='h-4 w-4' />,
    variant: 'outline',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700'
  },
  delivering: {
    label: 'Đang giao hàng',
    icon: <IconPackage className='h-4 w-4' />,
    variant: 'secondary',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  delivered: {
    label: 'Đã giao hàng',
    icon: <IconCheck className='h-4 w-4' />,
    variant: 'default',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700'
  },
  completed: {
    label: 'Hoàn thành',
    icon: <IconCheck className='h-4 w-4' />,
    variant: 'default',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700'
  },
  canceled: {
    label: 'Đã hủy',
    icon: <IconX className='h-4 w-4' />,
    variant: 'destructive',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700'
  }
};

const getStatusConfig = (status?: string | null): StatusConfig => {
  const normalizedStatus = status?.toLowerCase() || 'pending';
  return STATUS_MAP[normalizedStatus] || STATUS_MAP.pending;
};

const getPhaseStatusConfig = (status?: string | null): StatusConfig => {
  const normalizedStatus = status?.toLowerCase() || 'preparing';
  return PHASE_STATUS_MAP[normalizedStatus] || PHASE_STATUS_MAP.preparing;
};

const formatCurrency = (value: number) =>
  value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

export default function HarvestBatchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const scheduleId = String(params.id);

  const [schedule, setSchedule] = useState<HarvestSchedule | null>(null);
  const [details, setDetails] = useState<DetailRow[]>([]);
  const [phases, setPhases] = useState<HarvestPhase[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeDeliveryId, setActiveDeliveryId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const s = await fetchHarvestScheduleById(scheduleId);

        // Extract details from schedule response (already included)
        const rows: DetailRow[] = (s.harvestDetails ?? []).map((detail) => {
          const quantity = Number(detail.quantity ?? 0);
          const unitPrice = Number(detail.unitPrice ?? 0);
          const productName =
            detail.product?.name || detail.product?.id || 'Unknown product';

          return {
            id: detail.id,
            productName: String(productName),
            quantity,
            unit: String(detail.unit ?? 'kg'),
            unitPrice,
            totalPrice: quantity * unitPrice
          };
        });

        if (cancelled) return;
        setSchedule(s);
        setDetails(rows);
      } catch (err) {
        if (cancelled) return;
        toast({
          title: 'Error',
          description: 'Failed to load harvest batch details',
          variant: 'destructive'
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleId]); // không để toast trong deps để tránh loop
  useEffect(() => {
    const sid = String(schedule?.id ?? '').trim();
    if (!sid) return;
    fetchDeliveriesByHarvestSchedule({
      harvestScheduleId: sid,
      page: 1,
      limit: 10
    })
      .then((res) => {
        const all = Array.isArray(res?.data) ? res.data : [];
        const list = all.filter(
          (x) => String(x?.harvestSchedule?.id ?? '') === sid
        );
        const prefer =
          list.find(
            (x) => String(x.status ?? '').toLowerCase() === 'delivering'
          ) ||
          list.find(
            (x) => String(x.status ?? '').toLowerCase() === 'scheduled'
          ) ||
          list
            .filter((x) => String(x.status ?? '').toLowerCase() !== 'completed')
            .sort(
              (a, b) =>
                new Date(String(b.updatedAt ?? b.createdAt ?? 0)).getTime() -
                new Date(String(a.updatedAt ?? a.createdAt ?? 0)).getTime()
            )[0] ||
          (list.length === 0 ? all : list)
            .slice()
            .sort(
              (a, b) =>
                new Date(String(b.updatedAt ?? b.createdAt ?? 0)).getTime() -
                new Date(String(a.updatedAt ?? a.createdAt ?? 0)).getTime()
            )[0];
        if (prefer?.id) {
          setActiveDeliveryId(String(prefer.id));
        }
      })
      .catch(() => {});

    // Load phases
    fetchHarvestPhasesBySchedule({
      harvestScheduleId: sid,
      page: 1,
      limit: 100
    })
      .then((res) => {
        const phasesList = Array.isArray(res?.data) ? res.data : [];
        // Sort by phaseNumber
        phasesList.sort((a, b) => (a.phaseNumber ?? 0) - (b.phaseNumber ?? 0));
        setPhases(phasesList);
      })
      .catch(() => {
        setPhases([]);
      });
  }, [schedule?.id]);

  // Realtime: keep delivery events but refresh harvest schedule status when any event arrives
  const handleCancelBatch = () => {
    if (scheduleId) {
      // call API để hủy batch
      updateHarvestScheduleStatus(scheduleId, 'canceled')
        .then(() => {
          if (schedule) {
            setSchedule({ ...schedule, status: 'CANCELED' });
          }
          toast({
            title: 'Batch Cancelled',
            description: `Harvest batch ${scheduleId} has been cancelled.`
          });
        })
        .catch(() => {
          toast({
            title: 'Error',
            description: `Failed to cancel harvest batch ${scheduleId}.`,
            variant: 'destructive'
          });
        });
    }
  };

  const statusConfig = getStatusConfig(schedule?.status);
  const statusNormalized = String(schedule?.status ?? 'pending').toLowerCase();
  const showMap = [
    'preparing',
    'delivering',
    'delivered',
    'returning'
  ].includes(statusNormalized);

  const totalQuantity = useMemo(
    () => details.reduce((sum, d) => sum + d.quantity, 0),
    [details]
  );
  const totalPrice = useMemo(
    () => details.reduce((sum, d) => sum + d.totalPrice, 0),
    [details]
  );

  const harvestDate = schedule?.harvestDate
    ? new Date(schedule.harvestDate as unknown as string).toLocaleString(
        'vi-VN',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }
      )
    : '-';

  const createdDate = schedule?.createdAt
    ? new Date(schedule.createdAt as unknown as string).toLocaleString('vi-VN')
    : '-';

  const updatedDate = schedule?.updatedAt
    ? new Date(schedule.updatedAt as unknown as string).toLocaleString('vi-VN')
    : '-';

  if (loading) {
    return (
      <PageContainer>
        <div className='flex h-[50vh] w-full items-center justify-center'>
          <div className='flex flex-col items-center gap-2'>
            <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
            <p className='text-muted-foreground'>Loading harvest details...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!schedule) {
    return (
      <PageContainer>
        <div className='flex h-[50vh] w-full items-center justify-center'>
          <div className='text-center'>
            <IconAlertCircle className='text-muted-foreground mx-auto mb-4 h-12 w-12' />
            <h3 className='mb-2 text-lg font-semibold'>
              Harvest Batch Not Found
            </h3>
            <p className='text-muted-foreground mb-4'>
              The requested harvest batch could not be found.
            </p>
            <Button onClick={() => router.push('/supplier/harvest-batches')}>
              Back to Batches
            </Button>
          </div>
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
                Chi tiết lô thu hoạch
              </h2>
              <p className='text-muted-foreground'>ID: {scheduleId}</p>
            </div>
          </div>
          <div className='flex gap-2'>
            {schedule.status?.toLowerCase() === 'pending' && (
              <>
                <Link href={`/supplier/harvest-batches/${scheduleId}/edit`}>
                  <Button variant='outline'>
                    <IconEdit className='mr-2 h-4 w-4' />
                    Chỉnh sửa
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant='destructive'>
                      <IconX className='mr-2 h-4 w-4' />
                      Hủy đơn
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hủy lô thu hoạch?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Hành động này sẽ hủy lô thu hoạch{' '}
                        <strong>{scheduleId}</strong>. Không thể hoàn tác sau
                        khi thực hiện.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Không</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelBatch}>
                        Xác nhận hủy
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        <Separator />

        {/* Status Banner */}
        <Card className={statusConfig.bgColor}>
          <CardContent>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div
                  className={`rounded-full p-2 ${statusConfig.textColor} bg-white`}
                >
                  {statusConfig.icon}
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold ${statusConfig.textColor}`}
                  >
                    {statusConfig.label}
                  </h3>
                  <p className='text-sm text-gray-600'>
                    Cập nhật lần cuối: {updatedDate}
                  </p>
                </div>
              </div>
              <Badge variant={statusConfig.variant} className='px-4 py-2'>
                {statusConfig.label}
              </Badge>
            </div>
            {schedule.status?.toUpperCase() === 'REJECTED' &&
              schedule.reason && (
                <div className='mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-white p-3'>
                  <IconInfoCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-red-600' />
                  <div>
                    <p className='text-sm font-medium text-red-900'>
                      Lý do từ chối:
                    </p>
                    <p className='text-sm text-red-700'>{schedule.reason}</p>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>

        <div className='grid gap-6 lg:grid-cols-3'>
          {/* Main Content */}
          <div className='space-y-6 lg:col-span-2'>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value='overview'>Tổng quan</TabsTrigger>
                <TabsTrigger value='phases'>Đợt ({phases.length})</TabsTrigger>
                <TabsTrigger value='products'>Sản phẩm</TabsTrigger>
              </TabsList>

              <TabsContent value='overview' className='space-y-6'>
                {showMap && (
                  <Card>
                    <CardHeader>
                      <CardTitle className='flex items-center gap-2'>
                        <IconMapPin className='h-5 w-5' />
                        Theo dõi vận chuyển
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <HarvestRouteSim
                        cargo={`Khối lượng ${totalQuantity} kg`}
                        startAddress={'Kho Nhà Cung Cấp'}
                        endAddress={String(schedule.address ?? '')}
                        harvestScheduleId={String(schedule.id ?? '')}
                        deliveryId={activeDeliveryId}
                        productName={details
                          .map((d) => d.productName)
                          .join(', ')}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Harvest Schedule Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <IconCalendar className='h-5 w-5' />
                      Thông tin thu hoạch
                    </CardTitle>
                    <CardDescription>
                      Chi tiết thời gian và địa điểm thu hoạch
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='grid gap-4'>
                      <div className='flex items-start gap-3 rounded-lg border p-3'>
                        <IconCalendar className='text-primary mt-0.5 h-5 w-5' />
                        <div className='flex-1'>
                          <p className='text-muted-foreground text-sm'>
                            Ngày thu hoạch
                          </p>
                          <p className='font-medium'>{harvestDate}</p>
                        </div>
                      </div>
                      <div className='flex items-start gap-3 rounded-lg border p-3'>
                        <IconMapPin className='text-primary mt-0.5 h-5 w-5' />
                        <div className='flex-1'>
                          <p className='text-muted-foreground text-sm'>
                            Địa điểm
                          </p>
                          <p className='font-medium'>
                            {schedule?.supplier?.gardenName || '-'}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-start gap-3 rounded-lg border p-3'>
                        <IconMapPin className='text-primary mt-0.5 h-5 w-5' />
                        <div className='flex-1'>
                          <p className='text-muted-foreground text-sm'>
                            Địa chỉ thu hoạch
                          </p>
                          <p className='font-medium'>
                            {schedule?.address || '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {schedule.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Ghi chú</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className='text-sm text-gray-700'>
                        {schedule.description}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value='phases' className='space-y-6'>
                {phases.length > 0 ? (
                  <div className='space-y-3'>
                    {phases.map((phase) => {
                      const phaseConfig = getPhaseStatusConfig(phase.status);
                      const totalPhaseQuantity =
                        phase.harvestInvoiceDetails?.reduce(
                          (sum, detail) => sum + (detail.quantity ?? 0),
                          0
                        ) ?? 0;
                      const totalPhaseAmount =
                        phase.harvestInvoice?.totalAmount ?? 0;

                      return (
                        <Card key={phase.id}>
                          <CardContent className='pt-6'>
                            <div className='flex items-start justify-between gap-3'>
                              <div className='flex-1'>
                                <div className='mb-2 flex items-center gap-2'>
                                  <h4 className='text-lg font-semibold'>
                                    Đợt {phase.phaseNumber ?? '?'}
                                  </h4>
                                  <Badge
                                    variant={phaseConfig.variant}
                                    className='text-xs'
                                  >
                                    <span className='mr-1'>
                                      {phaseConfig.icon}
                                    </span>
                                    {phaseConfig.label}
                                  </Badge>
                                </div>

                                {phase.description && (
                                  <p className='text-muted-foreground mb-3 text-sm'>
                                    {phase.description}
                                  </p>
                                )}

                                <div className='mb-3 grid grid-cols-2 gap-3'>
                                  <div className='rounded-lg border bg-gray-50 p-3'>
                                    <p className='text-muted-foreground text-xs'>
                                      Khối lượng
                                    </p>
                                    <p className='text-lg font-semibold'>
                                      {totalPhaseQuantity} kg
                                    </p>
                                  </div>
                                  <div className='rounded-lg border bg-gray-50 p-3'>
                                    <p className='text-muted-foreground text-xs'>
                                      Giá trị
                                    </p>
                                    <p className='text-lg font-semibold'>
                                      {formatCurrency(totalPhaseAmount)}
                                    </p>
                                  </div>
                                </div>

                                {phase.harvestInvoiceDetails &&
                                  phase.harvestInvoiceDetails.length > 0 && (
                                    <div className='rounded-md border bg-white p-3'>
                                      <p className='text-muted-foreground mb-2 text-sm font-medium'>
                                        Sản phẩm:
                                      </p>
                                      <div className='space-y-2'>
                                        {phase.harvestInvoiceDetails.map(
                                          (detail) => (
                                            <div
                                              key={detail.id}
                                              className='flex items-center justify-between text-sm'
                                            >
                                              <span className='font-medium'>
                                                {detail.product?.name ||
                                                  'Unknown'}
                                              </span>
                                              <span className='text-muted-foreground'>
                                                {detail.quantity} {detail.unit}{' '}
                                                x{' '}
                                                {formatCurrency(
                                                  detail.unitPrice ?? 0
                                                )}
                                              </span>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card>
                    <CardContent className='py-12 text-center'>
                      <IconClock className='text-muted-foreground mx-auto mb-3 h-12 w-12' />
                      <h3 className='mb-2 text-lg font-semibold'>
                        Chưa có đợt thu hoạch
                      </h3>
                      <p className='text-muted-foreground text-sm'>
                        Các đợt thu hoạch sẽ xuất hiện sau khi được tạo
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value='products' className='space-y-6'>
                {/* Product Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <IconPackage className='h-5 w-5' />
                      Thông tin sản phẩm
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <p className='text-muted-foreground text-sm'>
                          Total Quantity
                        </p>
                        <p className='font-medium'>
                          {loading ? '...' : totalQuantity}
                        </p>
                      </div>
                      <div>
                        <p className='text-muted-foreground text-sm'>
                          Total Price
                        </p>
                        <p className='text-lg font-bold'>
                          {loading ? '...' : formatCurrency(totalPrice)}
                        </p>
                      </div>
                    </div>

                    {details.length > 0 && (
                      <div className='border-t pt-4'>
                        <p className='text-muted-foreground mb-3 text-sm'>
                          Products
                        </p>
                        <div className='rounded-md border text-sm'>
                          <div className='bg-muted text-muted-foreground grid grid-cols-5 gap-2 border-b px-3 py-2 text-xs font-medium tracking-wide uppercase'>
                            <span className='col-span-2'>Product</span>
                            <span>Quantity</span>
                            <span>Unit</span>
                            <span>Unit Price</span>
                          </div>
                          {details.map((product) => (
                            <div
                              key={product.id}
                              className='grid grid-cols-5 gap-2 border-b px-3 py-2 last:border-b-0'
                            >
                              <div className='col-span-2'>
                                <p className='font-medium'>
                                  {product.productName}
                                </p>
                              </div>
                              <div>
                                <p className='font-medium'>
                                  {product.quantity}
                                </p>
                              </div>
                              <div>
                                <p className='font-medium'>{product.unit}</p>
                              </div>
                              <div>
                                <p className='font-medium'>
                                  {formatCurrency(product.unitPrice)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Tổng quan</CardTitle>
                <CardDescription>Thống kê lô thu hoạch</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='rounded-lg border p-3'>
                  <p className='text-muted-foreground mb-1 text-sm'>
                    Tổng khối lượng
                  </p>
                  <p className='text-2xl font-bold'>{totalQuantity} kg</p>
                </div>
                <div className='rounded-lg border p-3'>
                  <p className='text-muted-foreground mb-1 text-sm'>
                    Tổng giá trị
                  </p>
                  <p className='text-2xl font-bold'>
                    {formatCurrency(totalPrice)}
                  </p>
                </div>
                <div className='rounded-lg border p-3'>
                  <p className='text-muted-foreground mb-1 text-sm'>
                    Số sản phẩm
                  </p>
                  <p className='text-2xl font-bold'>{details.length}</p>
                </div>
                <div className='rounded-lg border p-3'>
                  <p className='text-muted-foreground mb-1 text-sm'>
                    Số đợt thu hoạch
                  </p>
                  <p className='text-2xl font-bold'>{phases.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thông tin bổ sung</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                <div>
                  <p className='text-muted-foreground'>Ngày tạo</p>
                  <p className='font-medium'>{createdDate}</p>
                </div>
                <Separator />
                <div>
                  <p className='text-muted-foreground'>Cập nhật lần cuối</p>
                  <p className='font-medium'>{updatedDate}</p>
                </div>
                {schedule.supplier && (
                  <>
                    <Separator />
                    <div>
                      <p className='text-muted-foreground'>Nhà cung cấp</p>
                      <p className='font-medium'>
                        {schedule.supplier.gardenName || 'N/A'}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <Link href='/supplier/harvest-batches' className='block w-full'>
                  <Button variant='outline' className='w-full justify-start'>
                    <IconPackage className='mr-2 h-4 w-4' />
                    Xem tất cả lô hàng
                  </Button>
                </Link>
                <Link
                  href='/supplier/harvest-batches/new'
                  className='block w-full'
                >
                  <Button variant='outline' className='w-full justify-start'>
                    <IconPackage className='mr-2 h-4 w-4' />
                    Tạo lô hàng mới
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

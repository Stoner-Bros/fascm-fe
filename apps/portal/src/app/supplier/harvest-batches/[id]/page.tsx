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
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('SupplierHarvestBatches');

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
          title: t('detail.toast.errorTitle'),
          description: t('detail.toast.errorLoadDetails'),
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
            title: t('toast.cancelTitle'),
            description: t('toast.cancelDescription', { id: scheduleId })
          });
        })
        .catch(() => {
          toast({
            title: t('detail.toast.errorTitle'),
            description: t('detail.toast.cancelErrorDescription', {
              id: scheduleId
            }),
            variant: 'destructive'
          });
        });
    }
  };

  const statusConfig = getStatusConfig(schedule?.status);
  const statusNormalized = String(schedule?.status ?? 'pending').toLowerCase();
  const statusKeyMap: Record<string, string> = {
    pending: 'pending',
    rejected: 'rejected',
    approved: 'approved',
    processing: 'inProgress',
    completed: 'completed',
    canceled: 'cancelled'
  };
  const statusLabel = t(
    `statuses.${statusKeyMap[statusNormalized] ?? 'unknown'}`
  );
  const statusConfigI18n = { ...statusConfig, label: statusLabel };
  const showMap = phases.some((p) =>
    ['delivering', 'delivered'].includes(String(p.status ?? '').toLowerCase())
  );

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
            <p className='text-muted-foreground'>{t('detail.loading')}</p>
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
              {t('detail.notFound.title')}
            </h3>
            <p className='text-muted-foreground mb-4'>
              {t('detail.notFound.description')}
            </p>
            <Button onClick={() => router.push('/supplier/harvest-batches')}>
              {t('detail.notFound.backButton')}
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
                {t('detail.title')}
              </h2>
              <p className='text-muted-foreground'>
                {t('detail.id')}: {scheduleId}
              </p>
            </div>
          </div>
          <div className='flex gap-2'>
            {schedule.status?.toLowerCase() === 'pending' && (
              <>
                <Link href={`/supplier/harvest-batches/${scheduleId}/edit`}>
                  <Button variant='outline'>
                    <IconEdit className='mr-2 h-4 w-4' />
                    {t('actionsMenu.edit')}
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant='destructive'>
                      <IconX className='mr-2 h-4 w-4' />
                      {t('actionsMenu.cancelBatch')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('dialog.title')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('dialog.description', { id: scheduleId })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('dialog.keep')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelBatch}>
                        {t('dialog.confirm')}
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
        <Card className={statusConfigI18n.bgColor}>
          <CardContent>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div
                  className={`rounded-full p-2 ${statusConfigI18n.textColor} bg-white`}
                >
                  {statusConfigI18n.icon}
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold ${statusConfigI18n.textColor}`}
                  >
                    {statusConfigI18n.label}
                  </h3>
                  <p className='text-sm text-gray-600'>
                    {t('detail.statusBanner.lastUpdated', {
                      date: updatedDate
                    })}
                  </p>
                </div>
              </div>
              <Badge variant={statusConfigI18n.variant} className='px-4 py-2'>
                {statusConfigI18n.label}
              </Badge>
            </div>
            {schedule.status?.toUpperCase() === 'REJECTED' &&
              schedule.reason && (
                <div className='mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-white p-3'>
                  <IconInfoCircle className='mt-0.5 h-5 w-5 flex-shrink-0 text-red-600' />
                  <div>
                    <p className='text-sm font-medium text-red-900'>
                      {t('reason.title')}
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
                <TabsTrigger value='overview'>
                  {t('detail.tabs.overview')}
                </TabsTrigger>
                <TabsTrigger value='phases'>
                  {t('detail.tabs.phases', { count: phases.length })}
                </TabsTrigger>
                <TabsTrigger value='products'>
                  {t('detail.tabs.products')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value='overview' className='space-y-6'>
                {/* Harvest Schedule Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <IconCalendar className='h-5 w-5' />
                      {t('detail.overview.title')}
                    </CardTitle>
                    <CardDescription>
                      {t('detail.overview.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='grid gap-4'>
                      <div className='flex items-start gap-3 rounded-lg border p-3'>
                        <IconCalendar className='text-primary mt-0.5 h-5 w-5' />
                        <div className='flex-1'>
                          <p className='text-muted-foreground text-sm'>
                            {t('detail.overview.harvestDate')}
                          </p>
                          <p className='font-medium'>{harvestDate}</p>
                        </div>
                      </div>
                      <div className='flex items-start gap-3 rounded-lg border p-3'>
                        <IconMapPin className='text-primary mt-0.5 h-5 w-5' />
                        <div className='flex-1'>
                          <p className='text-muted-foreground text-sm'>
                            {t('detail.overview.location')}
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
                            {t('detail.overview.harvestAddress')}
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
                      <CardTitle>{t('detail.overview.notes')}</CardTitle>
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
                      const phaseConfigBase = getPhaseStatusConfig(
                        phase.status
                      );
                      const phaseStatusNormalized = String(
                        phase.status ?? ''
                      ).toLowerCase();
                      const phaseKeyMap: Record<string, string> = {
                        preparing: 'preparing',
                        delivering: 'delivering',
                        delivered: 'delivered',
                        completed: 'completed',
                        canceled: 'canceled'
                      };
                      const phaseLabel = t(
                        `phaseStatuses.${phaseKeyMap[phaseStatusNormalized] ?? 'preparing'}`
                      );
                      const phaseConfig = {
                        ...phaseConfigBase,
                        label: phaseLabel
                      };
                      const totalPhaseQuantity =
                        phase.harvestInvoiceDetails?.reduce(
                          (sum, detail) => sum + (detail.quantity ?? 0),
                          0
                        ) ?? 0;
                      const totalPhaseAmount =
                        phase.harvestInvoice?.totalPayment ?? 0;

                      return (
                        <Card key={phase.id}>
                          <CardContent className='pt-6'>
                            <div className='flex items-start justify-between gap-3'>
                              <div className='flex-1'>
                                <div className='mb-2 flex items-center gap-2'>
                                  <h4 className='text-lg font-semibold'>
                                    {t('detail.phases.phaseLabel', {
                                      number: phase.phaseNumber ?? '?'
                                    })}
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
                                {['delivering', 'delivered'].includes(
                                  String(phase.status ?? '').toLowerCase()
                                ) && (
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className='flex items-center gap-2'>
                                        <IconMapPin className='h-5 w-5' />
                                        {t('detail.phases.trackingTitle')}
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <HarvestRouteSim
                                        cargo={t('detail.phases.cargo', {
                                          quantity: totalPhaseQuantity
                                        })}
                                        startAddress={t(
                                          'detail.phases.startAddressDefault'
                                        )}
                                        endAddress={String(
                                          schedule.address ?? ''
                                        )}
                                        harvestScheduleId={String(
                                          schedule.id ?? ''
                                        )}
                                        deliveryId={activeDeliveryId}
                                        productName={(
                                          phase.harvestInvoiceDetails || []
                                        )
                                          .map((d) => d.product?.name)
                                          .filter(Boolean)
                                          .join(', ')}
                                      />
                                    </CardContent>
                                  </Card>
                                )}
                                {phase.description && (
                                  <p className='text-muted-foreground mb-3 text-sm'>
                                    {phase.description}
                                  </p>
                                )}

                                <div className='mb-3 grid grid-cols-2 gap-3'>
                                  <div className='rounded-lg border bg-gray-50 p-3'>
                                    <p className='text-muted-foreground text-xs'>
                                      {t('detail.phases.quantity')}
                                    </p>
                                    <p className='text-lg font-semibold'>
                                      {totalPhaseQuantity} kg
                                    </p>
                                  </div>
                                  <div className='rounded-lg border bg-gray-50 p-3'>
                                    <p className='text-muted-foreground text-xs'>
                                      {t('detail.phases.amount')}
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
                                        {t('detail.phases.productsLabel')}
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
                                                  t(
                                                    'detail.products.unknownProduct'
                                                  )}
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
                                        {phase.harvestInvoice?.taxRate !=
                                          null && (
                                          <>
                                            <div className='border-t pt-2'>
                                              <div className='flex items-center justify-between text-sm'>
                                                <span className='text-muted-foreground'>
                                                  {t(
                                                    'detail.phases.taxWithRate',
                                                    {
                                                      rate: phase.harvestInvoice
                                                        .taxRate
                                                    }
                                                  )}
                                                </span>
                                                <span className='text-muted-foreground'>
                                                  {formatCurrency(
                                                    (phase.harvestInvoiceDetails?.reduce(
                                                      (sum, d) =>
                                                        sum +
                                                        (d.quantity ?? 0) *
                                                          (d.unitPrice ?? 0),
                                                      0
                                                    ) ?? 0) *
                                                      (phase.harvestInvoice
                                                        .taxRate /
                                                        100)
                                                  )}
                                                </span>
                                              </div>
                                            </div>
                                          </>
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
                        {t('detail.phases.emptyTitle')}
                      </h3>
                      <p className='text-muted-foreground text-sm'>
                        {t('detail.phases.emptyDescription')}
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
                      {t('detail.products.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <p className='text-muted-foreground text-sm'>
                          {t('detail.products.totalQuantity')}
                        </p>
                        <p className='font-medium'>
                          {loading ? '...' : totalQuantity}
                        </p>
                      </div>
                      <div>
                        <p className='text-muted-foreground text-sm'>
                          {t('detail.products.totalPrice')}
                        </p>
                        <p className='text-lg font-bold'>
                          {loading ? '...' : formatCurrency(totalPrice)}
                        </p>
                      </div>
                    </div>

                    {details.length > 0 && (
                      <div className='border-t pt-4'>
                        <p className='text-muted-foreground mb-3 text-sm'>
                          {t('detail.products.listLabel')}
                        </p>
                        <div className='rounded-md border text-sm'>
                          <div className='bg-muted text-muted-foreground grid grid-cols-5 gap-2 border-b px-3 py-2 text-xs font-medium tracking-wide uppercase'>
                            <span className='col-span-2'>
                              {t('detail.products.table.product')}
                            </span>
                            <span>{t('detail.products.table.quantity')}</span>
                            <span>{t('detail.products.table.unit')}</span>
                            <span>{t('detail.products.table.unitPrice')}</span>
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
                <CardTitle>{t('detail.sidebar.overviewTitle')}</CardTitle>
                <CardDescription>
                  {t('detail.sidebar.overviewDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='rounded-lg border p-3'>
                  <p className='text-muted-foreground mb-1 text-sm'>
                    {t('detail.sidebar.totalQuantity')}
                  </p>
                  <p className='text-2xl font-bold'>{totalQuantity} kg</p>
                </div>
                <div className='rounded-lg border p-3'>
                  <p className='text-muted-foreground mb-1 text-sm'>
                    {t('detail.sidebar.totalPriceBeforeTax')}
                  </p>
                  <p className='text-2xl font-bold'>
                    {formatCurrency(totalPrice)}
                  </p>
                </div>
                <div className='rounded-lg border p-3'>
                  <p className='text-muted-foreground mb-1 text-sm'>
                    {t('detail.sidebar.productsCount')}
                  </p>
                  <p className='text-2xl font-bold'>{details.length}</p>
                </div>
                <div className='rounded-lg border p-3'>
                  <p className='text-muted-foreground mb-1 text-sm'>
                    {t('detail.sidebar.phasesCount')}
                  </p>
                  <p className='text-2xl font-bold'>{phases.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('detail.extra.title')}</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                <div>
                  <p className='text-muted-foreground'>
                    {t('detail.extra.createdAt')}
                  </p>
                  <p className='font-medium'>{createdDate}</p>
                </div>
                <Separator />
                <div>
                  <p className='text-muted-foreground'>
                    {t('detail.extra.updatedAt')}
                  </p>
                  <p className='font-medium'>{updatedDate}</p>
                </div>
                {schedule.supplier && (
                  <>
                    <Separator />
                    <div>
                      <p className='text-muted-foreground'>
                        {t('detail.extra.supplier')}
                      </p>
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
                <CardTitle>{t('detail.quickActions.title')}</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <Link href='/supplier/harvest-batches' className='block w-full'>
                  <Button variant='outline' className='w-full justify-start'>
                    <IconPackage className='mr-2 h-4 w-4' />
                    {t('detail.quickActions.viewAllBatches')}
                  </Button>
                </Link>
                <Link
                  href='/supplier/harvest-batches/new'
                  className='block w-full'
                >
                  <Button variant='outline' className='w-full justify-start'>
                    <IconPackage className='mr-2 h-4 w-4' />
                    {t('detail.quickActions.createNewBatch')}
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

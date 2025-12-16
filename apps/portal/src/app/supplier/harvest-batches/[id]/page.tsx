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
  IconArrowLeft,
  IconBuilding,
  IconCalendar,
  IconCheck,
  IconClock,
  IconEdit,
  IconFileInvoice,
  IconMapPin,
  IconPackage,
  IconTruck,
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
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import Image from 'next/image';

type DetailRow = {
  id: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
};

type HarvestScheduleStatus =
  | 'pending'
  | 'rejected'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'canceled';

type HarvestPhaseStatus =
  | 'preparing'
  | 'delivering'
  | 'delivered'
  | 'completed'
  | 'canceled';

const getStatusIcon = (status: HarvestScheduleStatus) => {
  switch (status) {
    case 'pending':
      return <IconClock className='h-4 w-4' />;
    case 'approved':
      return <IconCheck className='h-4 w-4' />;
    case 'processing':
      return <IconTruck className='h-4 w-4' />;
    case 'completed':
      return <IconCheck className='h-4 w-4' />;
    case 'rejected':
      return <IconX className='h-4 w-4' />;
    case 'canceled':
      return <IconX className='h-4 w-4' />;
    default:
      return <IconPackage className='h-4 w-4' />;
  }
};

const getPhaseStatusIcon = (status?: HarvestPhaseStatus | null) => {
  if (!status) return <IconClock className='h-4 w-4' />;
  switch (status) {
    case 'preparing':
      return <IconPackage className='h-4 w-4' />;
    case 'delivering':
      return <IconTruck className='h-4 w-4' />;
    case 'delivered':
      return <IconCheck className='h-4 w-4' />;
    case 'completed':
      return <IconCheck className='h-4 w-4' />;
    case 'canceled':
      return <IconX className='h-4 w-4' />;
    default:
      return <IconClock className='h-4 w-4' />;
  }
};

const getPhaseStatusVariant = (
  status?: HarvestPhaseStatus | null
): 'outline' | 'default' | 'secondary' | 'destructive' => {
  if (!status) return 'outline';
  switch (status) {
    case 'preparing':
      return 'secondary';
    case 'delivering':
      return 'default';
    case 'delivered':
      return 'default';
    case 'completed':
      return 'default';
    case 'canceled':
      return 'destructive';
    default:
      return 'outline';
  }
};

const formatCurrency = (value: number) =>
  value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

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
  const [phasesLoading, setPhasesLoading] = useState(true);
  const [activeDeliveryId, setActiveDeliveryId] = useState<string>('');

  const getStatusLabel = (status: HarvestScheduleStatus) => {
    switch (status) {
      case 'pending':
        return t('statuses.pending');
      case 'rejected':
        return t('statuses.rejected');
      case 'approved':
        return t('statuses.approved');
      case 'processing':
        return t('statuses.inProgress');
      case 'completed':
        return t('statuses.completed');
      case 'canceled':
        return t('statuses.cancelled');
      default:
        return status || t('statuses.unknown');
    }
  };

  const getPhaseStatusLabel = (status?: HarvestPhaseStatus | null) => {
    if (!status) return t('phaseStatuses.preparing');
    switch (status) {
      case 'preparing':
        return t('phaseStatuses.preparing');
      case 'delivering':
        return t('phaseStatuses.delivering');
      case 'delivered':
        return t('phaseStatuses.delivered');
      case 'completed':
        return t('phaseStatuses.completed');
      case 'canceled':
        return t('phaseStatuses.canceled');
      default:
        return status || t('statuses.unknown');
    }
  };

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
            detail.product?.name ||
            detail.product?.id ||
            t('detail.products.unknownProduct');

          const unitRaw =
            typeof detail.unit === 'string' ? detail.unit.trim() : '';
          const unit = unitRaw || 'kg';

          return {
            id: detail.id,
            productName: String(productName),
            productImage: detail.product?.image as string | undefined,
            quantity,
            unit,
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
  }, [scheduleId]);

  useEffect(() => {
    const sid = String(schedule?.id ?? '').trim();
    if (!sid) return;

    setPhasesLoading(true);

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
      })
      .finally(() => {
        setPhasesLoading(false);
      });
  }, [schedule?.id]);

  const handleCancelBatch = () => {
    if (scheduleId) {
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

  const totalQuantity = useMemo(
    () => details.reduce((sum, d) => sum + d.quantity, 0),
    [details]
  );
  const totalPrice = useMemo(
    () => details.reduce((sum, d) => sum + d.totalPrice, 0),
    [details]
  );

  const unitLabel = useMemo(() => {
    const firstUnit =
      details.find((d) => d.unit && d.unit.trim() !== '')?.unit ?? '';
    return firstUnit || 'kg';
  }, [details]);

  // Status stepper steps
  const getStatusSteps = () => {
    const steps = [
      {
        key: 'pending',
        label: t('detail.statusSteps.pending'),
        icon: IconClock
      },
      {
        key: 'approved',
        label: t('detail.statusSteps.approved'),
        icon: IconCheck
      },
      {
        key: 'processing',
        label: t('detail.statusSteps.processing'),
        icon: IconTruck
      },
      {
        key: 'completed',
        label: t('detail.statusSteps.completed'),
        icon: IconCheck
      }
    ];

    const currentStatus = (schedule?.status?.toLowerCase() ||
      'pending') as HarvestScheduleStatus;
    let currentStepIndex = 0;

    if (currentStatus === 'pending') currentStepIndex = 0;
    else if (currentStatus === 'approved') currentStepIndex = 1;
    else if (currentStatus === 'processing') currentStepIndex = 2;
    else if (currentStatus === 'completed') currentStepIndex = 3;
    else if (currentStatus === 'rejected' || currentStatus === 'canceled')
      currentStepIndex = -1; // Special case

    return { steps, currentStepIndex };
  };

  const { steps, currentStepIndex } = getStatusSteps();

  if (loading) {
    return (
      <PageContainer>
        <div className='flex flex-1 flex-col items-center justify-center py-12'>
          <div className='border-primary mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
          <p className='text-muted-foreground'>{t('detail.loading')}</p>
        </div>
      </PageContainer>
    );
  }

  if (!schedule) {
    return (
      <PageContainer>
        <div className='flex flex-1 flex-col items-center justify-center py-12'>
          <IconPackage className='text-muted-foreground mb-4 h-16 w-16' />
          <p className='text-muted-foreground'>{t('detail.notFound.title')}</p>
          <Button
            variant='outline'
            onClick={() => router.push('/supplier/harvest-batches')}
            className='mt-4'
          >
            <IconArrowLeft className='mr-2 h-4 w-4' />
            {t('detail.notFound.backButton')}
          </Button>
        </div>
      </PageContainer>
    );
  }

  const currentStatus = (schedule.status?.toLowerCase() ||
    'pending') as HarvestScheduleStatus;

  return (
    <PageContainer>
      <div className='w-full flex-1 space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <div className='flex items-center gap-4'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => router.push('/supplier/harvest-batches')}
              >
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
          </div>
          <div className='flex items-center gap-2'>
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

        {/* Status Stepper */}
        <Card>
          <CardContent>
            {currentStatus === 'rejected' || currentStatus === 'canceled' ? (
              <div className='flex items-center justify-center gap-3 p-4'>
                <Badge
                  variant='destructive'
                  className='flex items-center gap-2 px-4 py-2 text-base'
                >
                  {getStatusIcon(currentStatus)}
                  {getStatusLabel(currentStatus)}
                </Badge>
                {schedule.reason && (
                  <p className='text-muted-foreground text-sm'>
                    {t('common.separator')} {schedule.reason}
                  </p>
                )}
              </div>
            ) : (
              <div className='flex items-center justify-between'>
                {steps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const isLast = index === steps.length - 1;

                  return (
                    <div key={step.key} className='flex flex-1 items-center'>
                      <div className='flex flex-col items-center'>
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors ${
                            isCompleted || isCurrent
                              ? 'border-primary bg-primary text-white'
                              : 'border-muted-foreground/30 bg-muted text-muted-foreground'
                          }`}
                        >
                          <StepIcon className='h-6 w-6' />
                        </div>
                        <p
                          className={`mt-2 text-sm font-medium ${
                            isCompleted || isCurrent
                              ? 'text-foreground'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                      {!isLast && (
                        <div
                          className={`mx-2 h-[2px] flex-1 transition-colors ${
                            isCompleted
                              ? 'bg-primary'
                              : 'bg-muted-foreground/30'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue='overview' className='w-full'>
          <TabsList className='gap-1'>
            <TabsTrigger
              value='overview'
              className='hover:border-primary flex cursor-pointer items-center gap-2 hover:bg-transparent'
            >
              <IconPackage className='h-4 w-4' />
              {t('detail.tabs.overview')}
            </TabsTrigger>
            <TabsTrigger
              value='phases'
              className='hover:border-primary flex cursor-pointer items-center gap-2 hover:bg-transparent'
            >
              <IconTruck className='h-4 w-4' />
              {t('detail.tabs.phases')}
              {phases.length > 0 && (
                <Badge variant='secondary' className='ml-1'>
                  {phases.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value='overview' className='mt-6'>
            <div className='grid grid-cols-1 gap-6'>
              {/* Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <IconPackage className='h-5 w-5' />
                    {t('detail.overview.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Harvest Schedule Information Section */}
                  <div>
                    <h3 className='mb-3 flex items-center gap-2 text-sm font-semibold'>
                      <IconCalendar className='h-4 w-4' />
                      {t('detail.overview.harvestDetails')}
                    </h3>
                    <div className='grid grid-cols-2 gap-4 md:grid-cols-5'>
                      <div>
                        <p className='text-muted-foreground mb-1 text-xs'>
                          {t('detail.id')}
                        </p>
                        <p className='font-medium'>{scheduleId}</p>
                      </div>
                      <div>
                        <p className='text-muted-foreground mb-1 text-xs'>
                          {t('detail.products.totalQuantity')}
                        </p>
                        <p className='font-medium'>{totalQuantity}</p>
                      </div>
                      {/* <div>
                        <p className='text-muted-foreground mb-1 text-xs'>
                          Unit
                        </p>
                        <p className='font-medium'>
                          {unitLabel}
                        </p>
                      </div> */}
                      <div>
                        <p className='text-muted-foreground mb-1 text-xs'>
                          {t('detail.overview.harvestDate')}
                        </p>
                        <p className='text-sm font-medium'>
                          {schedule.harvestDate
                            ? formatDate(
                                schedule.harvestDate as unknown as string
                              )
                            : t('common.notSpecified')}
                        </p>
                      </div>
                      <div>
                        <p className='text-muted-foreground mb-1 text-xs'>
                          {t('detail.extra.createdAt')}
                        </p>
                        <p className='text-sm font-medium'>
                          {schedule.createdAt
                            ? formatDate(
                                schedule.createdAt as unknown as string
                              )
                            : t('common.notSpecified')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* <Separator /> */}

                  {/* Supplier Information Section */}
                  {/* <div>
                    <h3 className='mb-3 flex items-center gap-2 text-sm font-semibold'>
                      <IconBuilding className='h-4 w-4' />
                      {t('detail.extra.supplier')}
                    </h3>
                    <div className='grid grid-cols-2 gap-4 md:grid-cols-3'>
                      <div>
                        <p className='text-muted-foreground mb-1 text-xs'>
                          {t('detail.overview.location')}
                        </p>
                        <p className='font-medium'>
                          {schedule.supplier?.gardenName ||
                            t('common.notSpecified')}
                        </p>
                      </div>
                      <div>
                        <p className='text-muted-foreground mb-1 text-xs'>
                          {t('detail.overview.harvestAddress')}
                        </p>
                        <p className='font-medium'>
                          {schedule.address || t('common.notSpecified')}
                        </p>
                      </div>
                    </div>
                  </div> */}

                  <Separator />

                  {/* Delivery Information Section */}
                  <div>
                    <h3 className='mb-3 flex items-center gap-2 text-sm font-semibold'>
                      <IconTruck className='h-4 w-4' />
                      {t('detail.overview.deliveryInformation')}
                    </h3>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                      <div>
                        <p className='text-muted-foreground mb-1 flex items-center gap-1 text-xs'>
                          <IconCalendar className='h-3 w-3' />
                          {t('detail.overview.harvestDate')}
                        </p>
                        <p className='font-medium'>
                          {schedule.harvestDate
                            ? formatDate(
                                schedule.harvestDate as unknown as string
                              )
                            : t('detail.overview.notSpecified')}
                        </p>
                      </div>
                      <div>
                        <p className='text-muted-foreground mb-1 flex items-center gap-1 text-xs'>
                          <IconMapPin className='h-3 w-3' />
                          {t('detail.overview.harvestAddress')}
                        </p>
                        <p className='text-sm font-medium'>
                          {schedule.address ||
                            t('detail.overview.notSpecified')}
                        </p>
                      </div>
                    </div>
                    {schedule.description && (
                      <div className='mt-3'>
                        <p className='text-muted-foreground mb-1 text-xs'>
                          {t('detail.overview.notes')}
                        </p>
                        <p className='bg-muted/50 rounded-md border p-3 text-sm'>
                          {schedule.description}
                        </p>
                      </div>
                    )}
                    {schedule.reason && currentStatus === 'rejected' && (
                      <div className='mt-3'>
                        <p className='text-destructive mb-1 text-xs font-semibold'>
                          {t('reason.title')}
                        </p>
                        <p className='border-destructive bg-destructive/10 rounded-md border p-3 text-sm'>
                          {schedule.reason}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Product Details */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('detail.products.title')}</CardTitle>
                  <CardDescription>
                    {details.length} {t('detail.products.itemsInHarvest')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {details.map((product) => (
                      <div
                        key={product.id}
                        className='flex items-center gap-4 rounded-lg border p-4'
                      >
                        <div className='relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-gray-100'>
                          {product.productImage ? (
                            <Image
                              src={product.productImage}
                              alt={product.productName}
                              fill
                              className='object-cover'
                            />
                          ) : (
                            <div className='flex h-full w-full items-center justify-center'>
                              <IconPackage className='text-muted-foreground h-8 w-8' />
                            </div>
                          )}
                        </div>
                        <div className='flex-1'>
                          <h4 className='font-semibold'>
                            {product.productName}
                          </h4>
                          <div className='mt-2 flex items-center gap-4 text-sm'>
                            <span>
                              {t('detail.products.table.quantity')}:{' '}
                              <strong>{product.quantity}</strong> {product.unit}
                            </span>
                            <span>
                              {t('detail.products.table.unitPrice')}:{' '}
                              <strong>
                                {formatCurrency(product.unitPrice)}
                              </strong>
                            </span>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='text-muted-foreground text-sm'>
                            {t('detail.products.amount')}
                          </p>
                          <p className='text-lg font-bold'>
                            {formatCurrency(product.totalPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className='my-4' />

                  <div className='flex justify-end'>
                    <div className='space-y-2'>
                      <div className='flex justify-between gap-8'>
                        <span className='text-muted-foreground'>
                          {t('detail.products.subtotal')}:
                        </span>
                        <span className='font-medium'>
                          {formatCurrency(totalPrice)}
                        </span>
                      </div>
                      <div className='flex justify-between gap-8'>
                        <span className='text-lg font-bold'>
                          {t('detail.products.total')}:
                        </span>
                        <span className='text-lg font-bold'>
                          {formatCurrency(totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Phases Tab */}
          <TabsContent value='phases' className='mt-6'>
            <div className='space-y-6'>
              {phasesLoading ? (
                <Card>
                  <CardContent className='py-12'>
                    <div className='flex flex-col items-center justify-center'>
                      <div className='border-primary mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
                      <p className='text-muted-foreground'>
                        {t('detail.phases.loading')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : phases.length === 0 ? (
                <Card>
                  <CardContent className='py-12'>
                    <div className='flex flex-col items-center justify-center'>
                      <IconPackage className='text-muted-foreground mb-4 h-16 w-16' />
                      <p className='text-muted-foreground text-lg font-medium'>
                        {t('detail.phases.emptyTitle')}
                      </p>
                      <p className='text-muted-foreground text-sm'>
                        {t('detail.phases.emptyDescription')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                phases.map((phase) => {
                  const phaseStatus = (phase.status?.toLowerCase() ||
                    'preparing') as HarvestPhaseStatus;
                  const totalPhaseQuantity =
                    phase.harvestInvoiceDetails?.reduce(
                      (sum, detail) => sum + (detail.quantity ?? 0),
                      0
                    ) ?? 0;

                  return (
                    <Card key={phase.id}>
                      <CardHeader>
                        <div className='flex items-center justify-between'>
                          <CardTitle className='flex items-center gap-2'>
                            {getPhaseStatusIcon(phaseStatus)}
                            {t('detail.phases.phaseLabel', {
                              number: phase.phaseNumber ?? '?'
                            })}
                          </CardTitle>
                          <Badge
                            variant={getPhaseStatusVariant(phaseStatus)}
                            className='flex items-center gap-1'
                          >
                            {getPhaseStatusIcon(phaseStatus)}
                            {getPhaseStatusLabel(phaseStatus)}
                          </Badge>
                        </div>
                        {phase.description && (
                          <CardDescription>{phase.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className='space-y-6'>
                        {/* Delivery Tracking Map */}
                        {['delivering', 'delivered'].includes(phaseStatus) && (
                          <Card>
                            <CardHeader>
                              <CardTitle className='flex items-center gap-2'>
                                <IconTruck className='h-5 w-5' />
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
                                endAddress={String(schedule.address ?? '')}
                                harvestScheduleId={String(schedule.id ?? '')}
                                deliveryId={activeDeliveryId}
                                productName={(phase.harvestInvoiceDetails || [])
                                  .map((d) => d.product?.name)
                                  .filter(Boolean)
                                  .join(', ')}
                              />
                            </CardContent>
                          </Card>
                        )}

                        {/* Invoice Details (Products) */}
                        {phase.harvestInvoiceDetails &&
                          phase.harvestInvoiceDetails.length > 0 && (
                            <div className='space-y-3'>
                              <h5 className='flex items-center gap-2 font-semibold'>
                                <IconPackage className='h-4 w-4' />
                                {t('detail.phases.productsLabel')}
                              </h5>
                              <div className='grid gap-3'>
                                {phase.harvestInvoiceDetails.map((detail) => (
                                  <div
                                    key={detail.id}
                                    className='bg-card flex items-center gap-4 rounded-lg border p-4'
                                  >
                                    <div className='relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-gray-100'>
                                      {detail.product?.image &&
                                      typeof detail.product.image ===
                                        'string' ? (
                                        <Image
                                          src={detail.product.image}
                                          alt={
                                            detail.product?.name ||
                                            t('detail.products.unknownProduct')
                                          }
                                          fill
                                          className='object-cover'
                                        />
                                      ) : (
                                        <div className='flex h-full w-full items-center justify-center'>
                                          <IconPackage className='text-muted-foreground h-8 w-8' />
                                        </div>
                                      )}
                                    </div>
                                    <div className='min-w-0 flex-1'>
                                      <h6 className='text-base font-semibold'>
                                        {detail.product?.name ||
                                          t('detail.products.unknownProduct')}
                                      </h6>
                                      <div className='mt-2 flex items-center gap-4 text-sm'>
                                        <span className='text-muted-foreground'>
                                          {t('detail.products.table.quantity')}:{' '}
                                          <strong className='text-foreground'>
                                            {detail.quantity}
                                          </strong>{' '}
                                          {detail.unit}
                                        </span>
                                        <span className='text-muted-foreground'>
                                          ×
                                        </span>
                                        <span className='text-muted-foreground'>
                                          {t('detail.products.table.unitPrice')}
                                          :{' '}
                                          <strong className='text-foreground'>
                                            {formatCurrency(
                                              detail.unitPrice ?? 0
                                            )}
                                          </strong>
                                        </span>
                                      </div>
                                    </div>
                                    <div className='text-right'>
                                      <p className='text-muted-foreground mb-1 text-xs'>
                                        {t('detail.products.amount')}
                                      </p>
                                      <p className='text-xl font-bold'>
                                        {formatCurrency(
                                          (detail.quantity ?? 0) *
                                            (detail.unitPrice ?? 0)
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Phase Dates */}
                        <div className='text-muted-foreground flex items-center justify-between border-t pt-4 text-sm'>
                          <div>
                            <span>{t('detail.phases.created')}: </span>
                            <span className='text-foreground font-medium'>
                              {formatDate(phase.createdAt as unknown as string)}
                            </span>
                          </div>
                          <div>
                            <span>{t('detail.phases.updated')}: </span>
                            <span className='text-foreground font-medium'>
                              {formatDate(phase.updatedAt as unknown as string)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}

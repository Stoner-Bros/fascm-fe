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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  IconArrowLeft,
  IconCalendar,
  IconEdit,
  IconMapPin,
  IconPackage,
  IconX
} from '@tabler/icons-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  fetchHarvestScheduleById,
  fetchHarvestTickets,
  fetchHarvestDetailsByHarvestTicketId,
  fetchSupplierById
} from '@/features/supplier';
import type { HarvestSchedule } from '@/types/harvest-schedule';
import type { HarvestDetail } from '@/types/harvest-detail';
import type { Supplier } from '@/types/supplier';
const HarvestRouteSim = dynamic(
  () => import('@/components/map/harvest-route-sim'),
  { ssr: false }
);

import { fetchDeliveriesByHarvestSchedule } from '@/services/delivery.service';
import dynamic from 'next/dynamic';
import { confirmHarvestSchedule } from '@/services/harvest-schedule.service';

type DetailRow = {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
};

/* ----- helper để ngoài component cho ổn định ----- */

const statusColor = (status: string) => {
  const s = status?.toUpperCase();
  switch (s) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'DELIVERING':
      return 'bg-blue-100 text-blue-800';
    case 'DELIVERED':
      return 'bg-blue-100 text-blue-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
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
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeDeliveryId, setActiveDeliveryId] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const s = await fetchHarvestScheduleById(scheduleId);

        // Supplier
        let sup: Supplier | null = null;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const supplierId = (s as any)?.supplierId?.id ?? (s as any)?.supplierId;
        if (supplierId) {
          try {
            sup = await fetchSupplierById(String(supplierId));
          } catch {
            // ignore supplier error
          }
        }

        // Tickets of this schedule
        const ticketsRes = await fetchHarvestTickets({
          page: 1,
          limit: 20,
          harvestScheduleId: s.id
        });
        const tickets =
          ticketsRes.data?.filter((ticket) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ticketScheduleId =
              (ticket as any)?.harvestScheduleId?.id ??
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (ticket as any)?.harvestScheduleId ??
              '';
            return String(ticketScheduleId) === String(s.id);
          }) ?? [];

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

        const rows: DetailRow[] = detailResponses.flat().map((detail) => {
          const quantity = Number(detail.quantity ?? 0);
          const unitPrice = Number(detail.unitPrice ?? 0);
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
            totalPrice: quantity * unitPrice
          };
        });

        if (cancelled) return;
        setSchedule(s);
        setSupplier(sup);
        setDetails(rows);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load harvest batch detail', err);
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
  }, [schedule?.id]);

  // Realtime: keep delivery events but refresh harvest schedule status when any event arrives
  const handleCancelBatch = () => {
    // TODO: call cancelHarvestSchedule(scheduleId)
    toast({
      title: 'Batch Cancelled',
      description: `Harvest batch ${scheduleId} has been cancelled.`
    });
    router.push('/supplier/harvest-batches');
  };

  const [confirming, setConfirming] = useState(false);
  const handleConfirmComplete = async () => {
    if (!scheduleId) return;
    try {
      setConfirming(true);
      const updated = await confirmHarvestSchedule(scheduleId);
      setSchedule(updated);
      toast({
        title: 'Thành công',
        description: 'Đã xác nhận hoàn thành đơn hàng'
      });
    } catch (err) {
      toast({
        title: 'Lỗi',
        description: 'Xác nhận hoàn thành thất bại',
        variant: 'destructive'
      });
    } finally {
      setConfirming(false);
    }
  };

  const status = loading ? 'LOADING' : (schedule?.status ?? 'PENDING');
  const statusNormalized = String(status).toLowerCase();
  const showMap = [
    'preparing',
    'delivering',
    'delivered',
    'returning'
  ].includes(statusNormalized);

  // Dùng useMemo để tránh tính lại khi details không đổi
  const totalQuantity = useMemo(
    () => details.reduce((sum, d) => sum + d.quantity, 0),
    [details]
  );
  const totalPrice = useMemo(
    () => details.reduce((sum, d) => sum + d.totalPrice, 0),
    [details]
  );

  const harvestDate = schedule?.harvestDate
    ? new Date(schedule.harvestDate as unknown as string).toLocaleString()
    : '-';
  const notes = schedule?.description ?? '';

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button variant='ghost' size='icon' onClick={() => router.back()}>
              <IconArrowLeft className='h-5 w-5' />
            </Button>
            <div>
              <h2 className='text-3xl font-bold tracking-tight'>
                Harvest Batch Details
              </h2>
              <p className='text-muted-foreground'>Batch ID: {scheduleId}</p>
            </div>
          </div>
          <div className='flex gap-2'>
            {status.toUpperCase() === 'PENDING' && (
              <>
                <Link href={`/supplier/harvest-batches/${scheduleId}/edit`}>
                  <Button variant='outline'>
                    <IconEdit className='mr-2 h-4 w-4' />
                    Edit
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant='destructive'>
                      <IconX className='mr-2 h-4 w-4' />
                      Cancel Batch
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Harvest Batch?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will cancel the harvest batch{' '}
                        <strong>{scheduleId}</strong>. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>No, Keep It</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelBatch}>
                        Yes, Cancel Batch
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>

        <Separator />

        <div className='grid gap-6 md:grid-cols-3'>
          <div className='space-y-6 md:col-span-2'>
            {showMap && (
              <HarvestRouteSim
                cargo={`Khối lượng ${String(
                  details.reduce((sum, d) => sum + d.quantity, 0)
                )} kg`}
                startAddress={'Kho Nhà Cung Cấp'}
                endAddress={String(schedule?.address ?? '')}
                harvestScheduleId={String(schedule?.id ?? '')}
                deliveryId={activeDeliveryId}
                productName={String(
                  details.map((d) => d.productName).join(', ')
                )}
              />
            )}
            {status.toUpperCase() === 'COMPLETED' && (
              <div className='rounded-md border border-green-200 bg-green-50 p-4'>
                <div className='font-medium text-green-700'>
                  Đơn hàng đã hoàn thành
                </div>
                <div className='text-sm text-green-600'>
                  Thời gian:{' '}
                  {schedule?.updatedAt
                    ? new Date(String(schedule.updatedAt)).toLocaleString()
                    : '-'}
                </div>
              </div>
            )}
            {/* Product Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconPackage className='h-5 w-5' />
                  Product Information
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
                    <p className='text-muted-foreground text-sm'>Total Price</p>
                    <p className='text-primary text-lg font-bold'>
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
                            <p className='font-medium'>{product.productName}</p>
                          </div>
                          <div>
                            <p className='font-medium'>{product.quantity}</p>
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

                {notes && (
                  <div className='border-t pt-4'>
                    <p className='text-muted-foreground mb-2 text-sm'>Notes</p>
                    <p className='text-sm'>{notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Harvest Details */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconCalendar className='h-5 w-5' />
                  Harvest Details
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-muted-foreground text-sm'>Date</p>
                    <p className='font-medium'>
                      {loading ? '...' : harvestDate}
                    </p>
                  </div>
                  <div>
                    <p className='text-muted-foreground text-sm'>
                      Storage Location
                    </p>
                    <div className='flex items-center gap-1'>
                      <IconMapPin className='h-4 w-4' />
                      <p className='font-medium'>
                        {supplier?.gardenName || '-'}
                      </p>
                    </div>
                  </div>
                  <div className='col-span-2'>
                    <p className='text-muted-foreground text-sm'>Address</p>
                    <p className='font-medium'>{schedule?.address || '—'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  className={`w-full justify-center py-2 ${statusColor(status)}`}
                >
                  {status}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <Link href='/supplier/harvest-batches' className='block w-full'>
                  <Button variant='outline' className='w-full justify-start'>
                    <IconPackage className='mr-2 h-4 w-4' />
                    View All Batches
                  </Button>
                </Link>
                <Link
                  href='/supplier/harvest-batches/new'
                  className='block w-full'
                >
                  <Button variant='outline' className='w-full justify-start'>
                    <IconPackage className='mr-2 h-4 w-4' />
                    Create New Batch
                  </Button>
                </Link>
                {/* {status.toUpperCase() === 'DELIVERED' && (
                  <Button
                    className='w-full'
                    onClick={handleConfirmComplete}
                    disabled={confirming}
                  >
                    Xác nhận hoàn thành
                  </Button>
                )} */}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

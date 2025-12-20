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
  AlertDialogTitle
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  fetchMyHarvestSchedules,
  updateHarvestScheduleStatus
} from '@/services/harvest-schedule.service';
import {
  IconCheck,
  IconClock,
  IconEdit,
  IconEye,
  IconInfoCircle,
  IconPackage,
  IconPlus,
  IconSearch,
  IconTruck,
  IconX
} from '@tabler/icons-react';
import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  type PaginationState,
  useReactTable
} from '@tanstack/react-table';
import { MoreVertical } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { parseAsInteger, useQueryState } from 'nuqs';

type HarvestBatchRow = {
  id: string;
  products: string;
  harvestDate: string;
  location: string;
  status: string;
  reason?: string | null;
};

const normalizeStatus = (status?: string | null): string => {
  if (!status || status.trim() === '') return 'pending';
  return status.toLowerCase().trim();
};

const getStatusIcon = (status: string) => {
  const s = normalizeStatus(status);
  switch (s) {
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

const getStatusVariant = (status: string) => {
  const s = normalizeStatus(status);
  switch (s) {
    case 'pending':
      return 'outline';
    case 'approved':
      return 'default';
    case 'processing':
      return 'default';
    case 'completed':
      return 'default';
    case 'rejected':
    case 'canceled':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusLabel = (status: string) => {
  const s = normalizeStatus(status);
  switch (s) {
    case 'pending':
      return 'statuses.pending';
    case 'rejected':
      return 'statuses.rejected';
    case 'approved':
      return 'statuses.approved';
    case 'processing':
      return 'statuses.inProgress';
    case 'completed':
      return 'statuses.completed';
    case 'canceled':
      return 'statuses.cancelled';
    default:
      return 'statuses.unknown';
  }
};

export default function SupplierHarvestBatchesFeature() {
  const { toast } = useToast();
  const t = useTranslations('SupplierHarvestBatches');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    | 'ALL'
    | 'pending'
    | 'rejected'
    | 'approved'
    | 'processing'
    | 'completed'
    | 'canceled'
  >('ALL');
  const [batches, setBatches] = useState<HarvestBatchRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(
    'limit',
    parseAsInteger.withDefault(7)
  );
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      try {
        const schedulesRes = await fetchMyHarvestSchedules({
          page,
          limit,
          sort: 'desc'
        });

        if (cancelled) return;

        const schedules = schedulesRes.data ?? [];

        const rows: HarvestBatchRow[] = schedules.map((schedule) => {
          const productNames = new Set<string>();
          if (
            schedule.harvestDetails &&
            Array.isArray(schedule.harvestDetails)
          ) {
            for (const detail of schedule.harvestDetails) {
              const productName = detail?.product?.name || detail?.product?.id;
              if (productName) productNames.add(String(productName));
            }
          }

          const products =
            Array.from(productNames).join(', ') || t('table.noProducts');

          const harvestDate = schedule.harvestDate
            ? new Date(
                schedule.harvestDate as unknown as string
              ).toLocaleString()
            : '-';

          const location = schedule.address || '-';

          return {
            id: schedule.id,
            products,
            harvestDate,
            location,
            status: schedule.status ?? 'PENDING',
            reason: schedule.reason
          };
        });

        setBatches(rows);
        setPageCount((prev) => {
          const minimalTotal = schedulesRes.hasNextPage ? page + 1 : page;
          return Math.max(prev, minimalTotal);
        });
      } catch (err) {
        if (cancelled) return;
        toast({
          title: t('toast.errorTitle'),
          description: t('toast.errorDescription'),
          variant: 'destructive'
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const handleCancelBatch = (batchId: string) => {
    setSelectedBatchId(batchId);
    setCancelDialogOpen(true);
  };

  const confirmCancelBatch = () => {
    if (selectedBatchId) {
      // call API để hủy batch
      updateHarvestScheduleStatus(selectedBatchId, 'canceled')
        .then(() => {
          setBatches((prev) =>
            prev.map((batch) =>
              batch.id === selectedBatchId
                ? { ...batch, status: 'canceled' }
                : batch
            )
          );
          toast({
            title: t('toast.cancelTitle'),
            description: t('toast.cancelDescription', { id: selectedBatchId })
          });
        })
        .catch(() => {
          toast({
            title: t('toast.errorTitle'),
            description: t('toast.errorDescription'),
            variant: 'destructive'
          });
        });
    }
    setCancelDialogOpen(false);
    setSelectedBatchId(null);
  };

  /* ======= derived state dùng useMemo cho nhẹ ======= */

  const filteredBatches = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return batches.filter((batch) => {
      const matchesSearch =
        batch.id.toLowerCase().includes(q) ||
        batch.products.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'ALL' ||
        normalizeStatus(batch.status) === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [batches, searchQuery, statusFilter]);

  const statusCounts = useMemo(
    () => ({
      all: batches.length,
      pending: batches.filter((b) => normalizeStatus(b.status) === 'pending')
        .length,
      rejected: batches.filter((b) => normalizeStatus(b.status) === 'rejected')
        .length,
      approved: batches.filter((b) => normalizeStatus(b.status) === 'approved')
        .length,
      processing: batches.filter(
        (b) => normalizeStatus(b.status) === 'processing'
      ).length,
      completed: batches.filter(
        (b) => normalizeStatus(b.status) === 'completed'
      ).length,
      canceled: batches.filter((b) => normalizeStatus(b.status) === 'canceled')
        .length
    }),
    [batches]
  );

  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: (page ?? 1) - 1,
      pageSize: limit ?? 7
    }),
    [page, limit]
  );

  const columns: ColumnDef<HarvestBatchRow>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: t('table.id'),
        cell: ({ row }) => (
          <div
            className='max-w-[120px] truncate font-medium'
            title={row.original.id}
          >
            {row.original.id}
          </div>
        )
      },
      {
        accessorKey: 'products',
        header: t('table.products'),
        cell: ({ row }) => (
          <div className='max-w-[200px] truncate' title={row.original.products}>
            {row.original.products}
          </div>
        )
      },
      {
        accessorKey: 'harvestDate',
        header: t('table.harvestDate'),
        cell: ({ row }) => (
          <div className='w-[160px] whitespace-nowrap'>
            {row.original.harvestDate}
          </div>
        )
      },
      {
        accessorKey: 'location',
        header: t('table.location'),
        cell: ({ row }) => (
          <div className='max-w-[200px] truncate' title={row.original.location}>
            {row.original.location}
          </div>
        )
      },
      {
        accessorKey: 'status',
        header: t('table.status'),
        cell: ({ row }) => (
          <Badge
            variant={getStatusVariant(row.original.status)}
            className='flex w-fit items-center gap-1'
          >
            {getStatusIcon(row.original.status)}
            {t(getStatusLabel(row.original.status))}
          </Badge>
        )
      },
      {
        id: 'actions',
        header: () => (
          <div className='w-full pr-2 text-right'>{t('table.actions')}</div>
        ),
        cell: ({ row }) => (
          <div className='text-right'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm'>
                  <MoreVertical className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem className='cursor-pointer' asChild>
                  <Link
                    href={`/supplier/harvest-batches/${row.original.id}`}
                    className='flex items-center'
                  >
                    <IconEye className='mr-2 h-4 w-4' />
                    {t('actionsMenu.viewDetails')}
                  </Link>
                </DropdownMenuItem>
                {normalizeStatus(row.original.status) === 'pending' && (
                  <>
                    <DropdownMenuItem className='cursor-pointer' asChild>
                      <Link
                        href={`/supplier/harvest-batches/${row.original.id}/edit`}
                        className='flex items-center'
                      >
                        <IconEdit className='mr-2 h-4 w-4' />
                        {t('actionsMenu.edit')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleCancelBatch(row.original.id)}
                      className='text-destructive cursor-pointer'
                    >
                      <IconX className='mr-2 h-4 w-4 text-red-500' />
                      {t('actionsMenu.cancelBatch')}
                    </DropdownMenuItem>
                  </>
                )}
                {normalizeStatus(row.original.status) === 'rejected' && (
                  <DropdownMenuItem
                    className='cursor-pointer'
                    onClick={() => {
                      const reason = row.original.reason || t('reason.default');

                      toast({
                        title: t('reason.title'),
                        description: reason,
                        variant: 'default'
                      });
                    }}
                  >
                    <IconInfoCircle className='mr-2 h-4 w-4' />
                    {t('actionsMenu.viewReason')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
    ],
    [t]
  );

  const table = useReactTable({
    data: filteredBatches,
    columns,
    pageCount,
    state: { pagination },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const next = updater(pagination);
        void setPage(next.pageIndex + 1);
        void setLimit(next.pageSize);
      } else {
        void setPage(updater.pageIndex + 1);
        void setLimit(updater.pageSize);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true
  });

  return (
    <PageContainer>
      <div className='w-full flex-1 space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>
              {t('header.title')}
            </h2>
            <p className='text-muted-foreground'>{t('header.subtitle')}</p>
          </div>
          <Link href='/supplier/harvest-batches/new'>
            <Button>
              <IconPlus className='mr-2 h-4 w-4' />
              {t('header.newBatch')}
            </Button>
          </Link>
        </div>

        {/* Status Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card
            className='hover:border-primary cursor-pointer'
            onClick={() => setStatusFilter('ALL')}
          >
            <CardHeader className='pb-3'>
              <CardDescription>{t('cards.total')}</CardDescription>
              <CardTitle className='text-3xl'>
                {loading ? (
                  <div className='bg-muted h-8 w-16 animate-pulse rounded' />
                ) : (
                  statusCounts.all
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card
            className='hover:border-primary cursor-pointer'
            onClick={() => setStatusFilter('pending')}
          >
            <CardHeader className='pb-3'>
              <CardDescription className='flex items-center gap-2'>
                <IconClock className='h-4 w-4' />
                {t('statuses.pending')}
              </CardDescription>
              <CardTitle className='text-3xl'>
                {loading ? (
                  <div className='bg-muted h-8 w-16 animate-pulse rounded' />
                ) : (
                  statusCounts.pending
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card
            className='hover:border-primary cursor-pointer'
            onClick={() => setStatusFilter('approved')}
          >
            <CardHeader className='pb-3'>
              <CardDescription className='flex items-center gap-2'>
                <IconCheck className='h-4 w-4' />
                {t('statuses.approved')}
              </CardDescription>
              <CardTitle className='text-3xl'>
                {loading ? (
                  <div className='bg-muted h-8 w-16 animate-pulse rounded' />
                ) : (
                  statusCounts.approved
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card
            className='hover:border-primary cursor-pointer'
            onClick={() => setStatusFilter('completed')}
          >
            <CardHeader className='pb-3'>
              <CardDescription className='flex items-center gap-2'>
                <IconCheck className='h-4 w-4' />
                {t('statuses.completed')}
              </CardDescription>
              <CardTitle className='text-3xl'>
                {loading ? (
                  <div className='bg-muted h-8 w-16 animate-pulse rounded' />
                ) : (
                  statusCounts.completed
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
              <div className='flex flex-1 items-center space-x-2'>
                <div className='relative flex-1'>
                  <IconSearch className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
                  <Input
                    placeholder={t('filters.searchPlaceholder')}
                    className='pl-8'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(v) =>
                    setStatusFilter(
                      (v as
                        | 'ALL'
                        | 'pending'
                        | 'rejected'
                        | 'approved'
                        | 'processing'
                        | 'completed'
                        | 'canceled') || 'ALL'
                    )
                  }
                >
                  <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder={t('filters.statusPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ALL'>
                      {t('filters.allStatus')}
                    </SelectItem>
                    <SelectItem value='pending'>
                      {t('statuses.pending')}
                    </SelectItem>
                    <SelectItem value='rejected'>
                      {t('statuses.rejected')}
                    </SelectItem>
                    <SelectItem value='approved'>
                      {t('statuses.approved')}
                    </SelectItem>
                    <SelectItem value='processing'>
                      {t('statuses.inProgress')}
                    </SelectItem>
                    <SelectItem value='completed'>
                      {t('statuses.completed')}
                    </SelectItem>
                    <SelectItem value='canceled'>
                      {t('statuses.cancelled')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <DataTableSkeleton columnCount={6} rowCount={7} />
            ) : filteredBatches.length === 0 ? (
              <div className='text-muted-foreground rounded-md border p-6 text-center text-sm'>
                {t('table.empty')}
              </div>
            ) : (
              <DataTable table={table} pageSizeOptions={[]} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('dialog.description', { id: selectedBatchId ?? '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('dialog.keep')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelBatch}>
              {t('dialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
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
import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  type PaginationState,
  useReactTable
} from '@tanstack/react-table';
import {
  fetchExportTicketById,
  fetchExportTickets
} from '@/services/export-ticket.service';
import { fetchImportTickets } from '@/services/import-ticket.service';
import { fetchWarehouseTickets } from '@/services/warehouse.service';
import {
  IconArrowDown,
  IconArrowUp,
  IconCalendar,
  IconFilter,
  IconPackage,
  IconRefresh,
  IconSearch
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { useTranslations, useLocale } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseAsInteger, useQueryState } from 'nuqs';

// Define types for warehouse activities
export interface WarehouseActivity {
  id: string;
  date: string;
  code: string;
  type: 'import' | 'export';
  productName: string;
  productCode: string;
  quantity: number;
  unit: string;
  warehouse: string;
  warehouseArea?: string;
  user: string;
  notes?: string;
  status:
    | 'pending_assignment'
    | 'assigned'
    | 'delivering'
    | 'completed'
    | 'cancelled';
  batchNumber?: string;
  supplier?: string;
  customer?: string;
  deliveryStaff?: string;
  assignedAt?: string;
  deliveryStartedAt?: string;
  completedAt?: string;
}

interface WarehouseActivitiesTableProps {
  warehouseId?: string;
}

export function WarehouseActivitiesTable({
  warehouseId
}: WarehouseActivitiesTableProps = {}) {
  const t = useTranslations('WarehouseActivities');
  const locale = useLocale();
  const [activities, setActivities] = useState<WarehouseActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [selectedActivityType, setSelectedActivityType] = useState<
    'all' | 'export' | 'import'
  >('all');
  const [selectedStatus, setSelectedStatus] = useState<
    'all' | WarehouseActivity['status']
  >('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] =
    useState<WarehouseActivity | null>(null);
  const [importDetail, setImportDetail] = useState<any | null>(null);
  const [exportDetail, setExportDetail] = useState<any | null>(null);
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit] = useQueryState('limit', parseAsInteger.withDefault(10));
  const [pageCount, setPageCount] = useState(1);

  const warehouses = useMemo(
    () => [
      { value: 'all', label: t('filters.warehouseOptions.all') },
      { value: 'main', label: t('filters.warehouseOptions.main') },
      { value: 'retail', label: t('filters.warehouseOptions.retail') },
      { value: 'cold', label: t('filters.warehouseOptions.cold') },
      { value: 'fresh', label: t('filters.warehouseOptions.fresh') },
      {
        value: 'confectionery',
        label: t('filters.warehouseOptions.confectionery')
      }
    ],
    [t]
  );

  const activityTypes = useMemo(
    () => [
      { value: 'all', label: t('filters.activityTypeOptions.all') },
      { value: 'export', label: t('filters.activityTypeOptions.export') },
      { value: 'import', label: t('filters.activityTypeOptions.import') }
    ],
    [t]
  );

  const loadActivities = useCallback(async () => {
    setLoading(true);
    try {
      if (warehouseId) {
        // Use new service to fetch tickets by warehouse ID
        const ticketsRes = await fetchWarehouseTickets(warehouseId);

        const importActivities: WarehouseActivity[] = (
          ticketsRes.importTickets ?? []
        ).map((it) => ({
          id: String(it.id),
          date: String(
            it.importDate ?? it.createdAt ?? new Date().toISOString()
          ),
          code: String(it.id),
          type: 'import',
          productName: String(it?.productName ?? '-'),
          productCode: '-',
          quantity: Number(it.quantity ?? it.percent ?? 0),
          unit: String(it?.unit ?? ''),
          warehouse: '-',
          warehouseArea: it.areaName ?? undefined,
          user: '-',
          notes: undefined,
          status: 'completed',
          batchNumber:
            it.numberOfBatch !== undefined && it.numberOfBatch !== null
              ? String(it.numberOfBatch)
              : undefined
        }));

        const exportActivities: WarehouseActivity[] = (
          ticketsRes.exportTickets ?? []
        ).map((et) => ({
          id: String(et.id ?? ''),
          date: String(
            et.exportDate ?? et.createdAt ?? new Date().toISOString()
          ),
          code: String(et.id ?? ''),
          type: 'export',
          productName: String(et.productName ?? '-'),
          productCode: '-',
          quantity: Number(et.quantity ?? 0),
          unit: String(et.unit ?? ''),
          warehouse: '-',
          warehouseArea: et.areaName ?? undefined,
          user: '-',
          notes: undefined,
          status: 'completed',
          batchNumber: undefined,
          customer: undefined
        }));

        const allActivities = [...importActivities, ...exportActivities];
        setActivities(allActivities);
        // Calculate pageCount for warehouse-specific data
        const totalPages = Math.ceil(allActivities.length / (limit ?? 10));
        setPageCount(Math.max(1, totalPages));
      } else {
        // Fallback to old behavior when no warehouseId is provided
        const [importsRes, exportsRes] = await Promise.all([
          fetchImportTickets({ page: page ?? 1, limit: limit ?? 10 }),
          fetchExportTickets({ page: page ?? 1, limit: limit ?? 10 })
        ]);

        const importActivities: any[] = (importsRes.data ?? []).map((it) => ({
          id: String(it.id),
          date: String(
            it.importDate ?? it.createdAt ?? new Date().toISOString()
          ),
          code: String(it.id),
          type: 'import',
          productName: String(it?.productName ?? '-'),
          quantity: Number(it.quantity ?? it.percent ?? 0),
          unit: String(it?.unit ?? it?.unit ?? ''),
          warehouseArea: it.areaName ?? undefined,
          notes: undefined,
          status: 'completed',
          batchNumber:
            it.numberOfBatch !== undefined && it.numberOfBatch !== null
              ? String(it.numberOfBatch)
              : undefined
        }));

        const exportActivities: WarehouseActivity[] = (
          exportsRes.data ?? []
        ).map((et) => ({
          id: String((et as any).id ?? ''),
          date: String(
            (et as any).ExportDate ??
              (et as any).createdAt ??
              new Date().toISOString()
          ),
          code: String(
            (et as any).orderDetail?.order?.id ?? (et as any).id ?? ''
          ),
          type: 'export',
          productName: String((et as any).productName ?? '-'),
          productCode: String((et as any).orderDetail?.product?.id ?? '-'),
          quantity: Number((et as any).quantity ?? 0),
          unit: String((et as any).unit ?? ''),
          warehouse: '-',
          warehouseArea: undefined,
          user: String(
            (et as any).orderDetail?.order?.orderSchedule?.consignee
              ?.representativeName ?? '-'
          ),
          notes: undefined,
          status: 'completed',
          batchNumber:
            (et as any).numberOfBatch !== undefined &&
            (et as any).numberOfBatch !== null
              ? String((et as any).numberOfBatch)
              : undefined,
          customer:
            (et as any).orderDetail?.order?.orderSchedule?.consignee
              ?.organizationName ?? undefined
        }));

        const allActivities = [...importActivities, ...exportActivities];
        setActivities(allActivities);

        // Calculate pageCount based on hasNextPage
        const hasMore = importsRes.hasNextPage || exportsRes.hasNextPage;
        if (hasMore) {
          setPageCount((prev) => Math.max(prev, (page ?? 1) + 1));
        } else {
          setPageCount(page ?? 1);
        }
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  }, [warehouseId, page, limit]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Filter and search logic
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch =
        activity.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.notes &&
          activity.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesWarehouse =
        selectedWarehouse === 'all' ||
        activity.warehouse ===
          (warehouses.find((w) => w.value === selectedWarehouse)?.label ?? '');

      const matchesActivityType =
        selectedActivityType === 'all' ||
        (selectedActivityType === 'export' && activity.type === 'export') ||
        (selectedActivityType === 'import' && activity.type === 'import');

      const matchesStatus =
        selectedStatus === 'all' || selectedStatus === activity.status;

      return (
        matchesSearch &&
        matchesWarehouse &&
        matchesActivityType &&
        matchesStatus
      );
    });
  }, [
    activities,
    searchTerm,
    selectedWarehouse,
    selectedActivityType,
    selectedStatus,
    warehouses
  ]);

  // Paginate filtered activities
  const paginatedActivities = useMemo(() => {
    const startIndex = ((page ?? 1) - 1) * (limit ?? 10);
    const endIndex = startIndex + (limit ?? 10);
    return filteredActivities.slice(startIndex, endIndex);
  }, [filteredActivities, page, limit]);

  // Update pageCount based on filtered results
  useEffect(() => {
    const totalPages = Math.ceil(filteredActivities.length / (limit ?? 10));
    setPageCount(Math.max(1, totalPages));
  }, [filteredActivities.length, limit]);

  const openDetail = async (activity: WarehouseActivity) => {
    setSelectedActivity(activity);
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    setImportDetail(null);
    setExportDetail(null);
    try {
      if (activity.type === 'import') {
        const { fetchImportTicketById } = await import(
          '@/services/import-ticket.service'
        );
        const data = await fetchImportTicketById(activity.id);
        setImportDetail(data);
      } else {
        const data = await fetchExportTicketById(activity.id);
        setExportDetail(data);
      }
    } catch (err: any) {
      setDetailError(
        typeof err?.message === 'string' ? err.message : 'Lỗi tải chi tiết'
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const getActivityTypeIcon = (type: 'import' | 'export') => {
    return type === 'import' ? (
      <IconArrowDown className='h-4 w-4 text-green-600' />
    ) : (
      <IconArrowUp className='h-4 w-4 text-blue-600' />
    );
  };

  const getActivityTypeBadge = (type: 'import' | 'export') => {
    return type === 'import' ? (
      <Badge variant='secondary' className='bg-green-100 text-green-800'>
        {t('badges.import')}
      </Badge>
    ) : (
      <Badge variant='secondary' className='bg-blue-100 text-blue-800'>
        {t('badges.export')}
      </Badge>
    );
  };

  const getStatusBadge = (status: WarehouseActivity['status']) => {
    const statusConfig = {
      pending_assignment: {
        label: t('status.pendingAssignment'),
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      assigned: {
        label: t('status.assigned'),
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      delivering: {
        label: t('status.delivering'),
        className: 'bg-purple-100 text-purple-800 border-purple-200'
      },
      completed: {
        label: t('status.completed'),
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      cancelled: {
        label: t('status.cancelled'),
        className: 'bg-red-100 text-red-800 border-red-200'
      }
    };

    const config = statusConfig[status];
    return (
      <span
        className={`rounded-full border px-2 py-1 text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedWarehouse('all');
    setSelectedActivityType('all');
    setSelectedStatus('all');
    if (page !== 1) {
      setPage(1);
    }
  };

  // DataTable columns
  const columns: ColumnDef<WarehouseActivity>[] = useMemo(
    () => [
      {
        accessorKey: 'date',
        header: t('table.date'),
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <IconCalendar className='h-4 w-4 text-gray-400' />
            <span className='text-sm'>
              {format(new Date(row.original.date), 'dd/MM/yyyy')}
            </span>
          </div>
        )
      },
      {
        accessorKey: 'code',
        header: t('table.code'),
        cell: ({ row }) => (
          <code className='rounded bg-gray-100 px-2 py-1 text-xs'>
            {row.original.code}
          </code>
        )
      },
      {
        accessorKey: 'type',
        header: t('table.activityType'),
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            {getActivityTypeIcon(row.original.type)}
            {getActivityTypeBadge(row.original.type)}
          </div>
        )
      },
      {
        accessorKey: 'productName',
        header: t('table.product'),
        cell: ({ row }) => (
          <div className='text-sm font-medium'>{row.original.productName}</div>
        )
      },
      {
        accessorKey: 'quantity',
        header: t('table.quantity'),
        cell: ({ row }) => (
          <span className='text-sm font-medium'>
            {row.original.quantity.toLocaleString()}
          </span>
        )
      },
      {
        accessorKey: 'unit',
        header: t('table.unit'),
        cell: ({ row }) => <span>{row.original.unit}</span>
      },
      {
        accessorKey: 'status',
        header: t('table.status'),
        cell: ({ row }) => getStatusBadge(row.original.status)
      }
    ],
    [t]
  );

  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: (page ?? 1) - 1,
      pageSize: limit ?? 10
    }),
    [page, limit]
  );

  const table = useReactTable({
    data: paginatedActivities,
    columns,
    pageCount,
    state: { pagination },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const next = updater(pagination);
        setPage(next.pageIndex + 1);
      } else {
        setPage(updater.pageIndex + 1);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true
  });

  return (
    <>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <IconPackage className='h-5 w-5' />
                {t('title')}
              </CardTitle>
              <CardDescription>{t('description')}</CardDescription>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                clearFilters();
                loadActivities();
              }}
              disabled={loading}
            >
              <IconRefresh
                className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
              {t('actions.refresh')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className='mb-6 space-y-4'>
            <div className='flex flex-wrap items-center gap-4'>
              <div className='min-w-[200px] flex-1'>
                <div className='relative'>
                  <IconSearch className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400' />
                  <Input
                    placeholder={t('searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
            </div>

            <div className='flex flex-wrap items-center gap-4'>
              <div className='flex items-center gap-2'>
                <IconFilter className='h-4 w-4 text-gray-500' />
                <span className='text-sm font-medium text-gray-700'>
                  {t('filters.label')}:
                </span>
              </div>

              <Select
                value={selectedActivityType}
                onValueChange={(v) =>
                  setSelectedActivityType(v as 'all' | 'export' | 'import')
                }
              >
                <SelectTrigger className='w-[140px]'>
                  <SelectValue placeholder={t('filters.activityType')} />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedWarehouse}
                onValueChange={setSelectedWarehouse}
              >
                <SelectTrigger className='w-[140px]'>
                  <SelectValue placeholder={t('filters.warehouse')} />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.value} value={warehouse.value}>
                      {warehouse.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedStatus}
                onValueChange={(v) =>
                  setSelectedStatus(v as 'all' | WarehouseActivity['status'])
                }
              >
                <SelectTrigger className='w-[180px]'>
                  <SelectValue placeholder={t('filters.allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>
                    {t('filters.allStatuses')}
                  </SelectItem>
                  <SelectItem value='pending_assignment'>
                    {t('status.pendingAssignment')}
                  </SelectItem>
                  <SelectItem value='assigned'>
                    {t('status.assigned')}
                  </SelectItem>
                  <SelectItem value='delivering'>
                    {t('status.delivering')}
                  </SelectItem>
                  <SelectItem value='completed'>
                    {t('status.completed')}
                  </SelectItem>
                  <SelectItem value='cancelled'>
                    {t('status.cancelled')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Summary */}
          <div className='mb-4 text-sm text-gray-600'>
            {t('summary', {
              count: filteredActivities.length,
              total: activities.length
            })}
          </div>

          {/* Activities Table */}
          {loading ? (
            <DataTableSkeleton columnCount={7} rowCount={10} />
          ) : filteredActivities.length === 0 ? (
            <div className='text-muted-foreground rounded-md border p-6 text-center text-sm'>
              {t('noResults')}
            </div>
          ) : (
            <DataTable table={table} pageSizeOptions={[]} />
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      {detailOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4'>
          <div className='max-h-[80vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-4 shadow-lg'>
            <div className='mb-3 flex items-center justify-between'>
              <div className='text-lg font-semibold'>
                {t('detail.title')}{' '}
                {selectedActivity?.type === 'import'
                  ? t('detail.importTicket')
                  : t('detail.exportTicket')}
              </div>
              <Button variant='ghost' onClick={() => setDetailOpen(false)}>
                {t('detail.close')}
              </Button>
            </div>
            {detailLoading ? (
              <div className='text-sm text-gray-500'>{t('detail.loading')}</div>
            ) : detailError ? (
              <div className='text-red-600'>{detailError}</div>
            ) : selectedActivity?.type === 'import' && importDetail ? (
              <div className='space-y-2 text-sm'>
                <div>
                  <span className='font-medium'>{t('detail.fields.id')}:</span>{' '}
                  {importDetail.id}
                </div>
                <div>
                  <span className='font-medium'>
                    {t('detail.fields.importDate')}:
                  </span>{' '}
                  {importDetail.importDate
                    ? new Date(importDetail.importDate).toLocaleString(locale)
                    : '-'}
                </div>
                <div>
                  <span className='font-medium'>
                    {t('detail.fields.batchCount')}:
                  </span>{' '}
                  {importDetail.numberOfBatch ?? '-'}
                </div>
                <div>
                  <span className='font-medium'>
                    {t('detail.fields.product')}:
                  </span>{' '}
                  {importDetail.inboundBatch?.product?.name ??
                    importDetail.inboundBatch?.harvestDetail?.product?.name ??
                    '-'}
                </div>
                <div>
                  <span className='font-medium'>
                    {t('detail.fields.actualQuantity')}:
                  </span>{' '}
                  {importDetail.percent ?? '-'}
                </div>
                <div>
                  <span className='font-medium'>
                    {t('detail.fields.unit')}:
                  </span>{' '}
                  {importDetail.inboundBatch?.unit ??
                    importDetail.inboundBatch?.harvestTicket?.unit ??
                    '-'}
                </div>
                <div>
                  <span className='font-medium'>
                    {t('detail.fields.area')}:
                  </span>{' '}
                  {importDetail.area?.name ?? '-'}
                </div>
              </div>
            ) : selectedActivity?.type === 'export' && exportDetail ? (
              <div className='space-y-2 text-sm'>
                <div>
                  <span className='font-medium'>{t('detail.fields.id')}:</span>{' '}
                  {exportDetail.id}
                </div>
                <div>
                  <span className='font-medium'>
                    {t('detail.fields.exportDate')}:
                  </span>{' '}
                  {exportDetail.ExportDate
                    ? new Date(exportDetail.ExportDate).toLocaleString(locale)
                    : '-'}
                </div>
                <div>
                  <span className='font-medium'>
                    {t('detail.fields.batchCount')}:
                  </span>{' '}
                  {exportDetail.numberOfBatch ?? '-'}
                </div>
                <div>
                  <span className='font-medium'>
                    {t('detail.fields.product')}:
                  </span>{' '}
                  {exportDetail.orderDetail?.product?.name ?? '-'}
                </div>
                <div>
                  <span className='font-medium'>
                    {t('detail.fields.quantity')}:
                  </span>{' '}
                  {exportDetail.orderDetail?.quantity ?? '-'}
                </div>
                <div>
                  <span className='font-medium'>
                    {t('detail.fields.unit')}:
                  </span>{' '}
                  {exportDetail.orderDetail?.unit ?? '-'}
                </div>
                <div>
                  <span className='font-medium'>
                    {t('detail.fields.consignee')}:
                  </span>{' '}
                  {exportDetail.orderDetail?.order?.orderSchedule?.consignee
                    ?.organizationName ??
                    exportDetail.orderDetail?.order?.orderSchedule?.consignee
                      ?.representativeName ??
                    '-'}
                </div>
              </div>
            ) : (
              <div className='text-sm text-gray-500'>{t('detail.empty')}</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

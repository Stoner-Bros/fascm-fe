'use client';

import { PermissionGuard } from '@/components/permissions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { Permission } from '@/constants/permissions';
import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  type PaginationState,
  useReactTable
} from '@tanstack/react-table';
import { Check, Edit, Eye, Loader2, MoreVertical, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useMemo } from 'react';
import { normalizeStatus } from '../../hooks/harvest-list/use-harvest-list';
import type { HarvestScheduleRow } from '../../types/types';
import { getHarvestStatusBadge } from '../../utils/status-badges';

type HarvestTableProps = {
  loading: boolean;
  schedules: HarvestScheduleRow[];
  updatingStatusIds: Set<string>;
  page: number;
  limit: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onConfirmSchedule: (scheduleId: string) => void;
  onOpenCancelDialog: (scheduleId: string) => void;
  onOpenRejectDialog: (scheduleId: string) => void;
  onShowRejectionReason: (reason?: string) => void;
};

export function HarvestTable({
  loading,
  schedules,
  updatingStatusIds,
  page,
  limit,
  pageCount,
  onPageChange,
  onConfirmSchedule,
  onOpenCancelDialog,
  onOpenRejectDialog
}: HarvestTableProps) {
  const t = useTranslations('HarvestOrders.list');

  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: (page ?? 1) - 1,
      pageSize: limit ?? 10
    }),
    [page, limit]
  );

  const columns: ColumnDef<HarvestScheduleRow>[] = useMemo(
    () => [
      {
        accessorKey: 'scheduleNumber',
        header: t('table.scheduleNumber'),
        cell: ({ row }) => (
          <div
            className='max-w-[150px] truncate font-medium'
            title={row.original.scheduleNumber}
          >
            {row.original.scheduleNumber.slice(0, 8)}
          </div>
        )
      },
      {
        accessorKey: 'supplierName',
        header: t('table.supplier'),
        cell: ({ row }) => (
          <div
            className='max-w-[200px] truncate'
            title={row.original.supplierName}
          >
            {row.original.supplierName}
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
          <div className='max-w-[180px] truncate whitespace-nowrap'>
            {row.original.harvestDate}
          </div>
        )
      },
      {
        accessorKey: 'createdAt',
        header: t('table.createdAt'),
        cell: ({ row }) => (
          <div className='max-w-[180px] truncate whitespace-nowrap'>
            {row.original.createdAt}
          </div>
        )
      },
      {
        accessorKey: 'address',
        header: t('table.address'),
        cell: ({ row }) => (
          <div className='max-w-[200px] truncate' title={row.original.address}>
            {row.original.address}
          </div>
        )
      },
      {
        accessorKey: 'status',
        header: t('table.status'),
        cell: ({ row }) => (
          <div>
            {updatingStatusIds.has(row.original.id) ? (
              <div className='flex items-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' />
              </div>
            ) : (
              getHarvestStatusBadge(row.original.status, (key) =>
                t(`statuses.${key}` as any)
              )
            )}
          </div>
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
                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/order-purchase/order/${row.original.id}`}
                    className='hover:border-primary flex cursor-pointer items-center hover:bg-transparent'
                  >
                    <Eye className='mr-2 h-4 w-4' />
                    {t('actions.viewDetails')}
                  </Link>
                </DropdownMenuItem>
                {normalizeStatus(row.original.status) === 'pending' && (
                  <>
                    <PermissionGuard
                      permission={Permission.UPDATE_PURCHASE_ORDER}
                    >
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/dashboard/order-purchase/order/${row.original.id}/edit`}
                          className='hover:border-primary flex cursor-pointer items-center hover:bg-transparent'
                        >
                          <Edit className='mr-2 h-4 w-4' />
                          {t('actions.edit')}
                        </Link>
                      </DropdownMenuItem>
                    </PermissionGuard>
                    <PermissionGuard
                      permission={Permission.UPDATE_PURCHASE_ORDER}
                    >
                      <DropdownMenuItem
                        onClick={() => onConfirmSchedule(row.original.id)}
                        className='cursor-pointer hover:bg-transparent'
                      >
                        <Check className='mr-2 h-4 w-4' />
                        {t('actions.confirm')}
                      </DropdownMenuItem>
                    </PermissionGuard>
                    <PermissionGuard
                      permission={Permission.UPDATE_PURCHASE_ORDER}
                    >
                      <DropdownMenuItem
                        onClick={() => onOpenRejectDialog(row.original.id)}
                        className='text-destructive cursor-pointer hover:bg-transparent'
                      >
                        <X className='text-destructive mr-2 h-4 w-4' />
                        {t('actions.reject')}
                      </DropdownMenuItem>
                    </PermissionGuard>
                    <PermissionGuard
                      permission={Permission.DELETE_PURCHASE_ORDER}
                    >
                      <DropdownMenuItem
                        onClick={() => onOpenCancelDialog(row.original.id)}
                        className='text-destructive cursor-pointer hover:bg-transparent'
                      >
                        <X className='text-destructive mr-2 h-4 w-4' />
                        {t('actions.cancelSchedule')}
                      </DropdownMenuItem>
                    </PermissionGuard>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
    ],
    [
      t,
      updatingStatusIds,
      onConfirmSchedule,
      onOpenCancelDialog,
      onOpenRejectDialog
    ]
  );

  const table = useReactTable({
    data: schedules,
    columns,
    pageCount,
    state: { pagination },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const next = updater(pagination);
        onPageChange(next.pageIndex + 1);
      } else {
        onPageChange(updater.pageIndex + 1);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true
  });

  if (loading) {
    return <DataTableSkeleton columnCount={8} rowCount={10} />;
  }

  return <DataTable table={table} pageSizeOptions={[]} />;
}

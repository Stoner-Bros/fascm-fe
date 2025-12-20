'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  type PaginationState,
  useReactTable
} from '@tanstack/react-table';
import { Check, Edit, Eye, Info, Loader2, MoreVertical, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useMemo } from 'react';
import { normalizeStatus } from '../../hooks/order-list/use-order-list';
import type { OrderScheduleRow } from '../../types/types';
import { getOrderStatusBadge } from '../../utils/status-badges';

type OrderTableProps = {
  loading: boolean;
  schedules: OrderScheduleRow[];
  updatingStatusIds: Set<string>;
  page: number;
  limit: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onApproveOrder: (scheduleId: string) => void;
  onOpenCancelDialog: (scheduleId: string) => void;
  onOpenRejectDialog: (scheduleId: string) => void;
  onShowRejectionReason: (reason?: string) => void;
};

export function OrderTable({
  loading,
  schedules,
  updatingStatusIds,
  page,
  limit,
  pageCount,
  onPageChange,
  onApproveOrder,
  onOpenCancelDialog,
  onOpenRejectDialog,
  onShowRejectionReason
}: OrderTableProps) {
  const t = useTranslations('Orders.list');

  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: (page ?? 1) - 1,
      pageSize: limit ?? 10
    }),
    [page, limit]
  );

  const columns: ColumnDef<OrderScheduleRow>[] = useMemo(
    () => [
      {
        accessorKey: 'orderNumber',
        header: t('table.orderNumber'),
        cell: ({ row }) => (
          <div
            className='max-w-[150px] truncate font-medium'
            title={row.original.orderNumber}
          >
            {row.original.orderNumber}
          </div>
        )
      },
      {
        accessorKey: 'consigneeName',
        header: t('table.customer'),
        cell: ({ row }) => (
          <div
            className='max-w-[200px] truncate'
            title={row.original.consigneeName}
          >
            {row.original.consigneeName}
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
        accessorKey: 'deliveryDate',
        header: t('table.deliveryDate'),
        cell: ({ row }) => (
          <div className='max-w-[180px] truncate whitespace-nowrap'>
            {row.original.deliveryDate}
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
              getOrderStatusBadge(row.original.status, (key) =>
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
                    href={`/dashboard/order-sale/order/${row.original.id}`}
                    className='hover:border-primary flex cursor-pointer items-center hover:bg-transparent'
                  >
                    <Eye className='mr-2 h-4 w-4' />
                    {t('actions.viewDetails')}
                  </Link>
                </DropdownMenuItem>
                {normalizeStatus(row.original.status) === 'pending' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/order-sale/order/${row.original.id}/edit`}
                        className='hover:border-primary flex cursor-pointer items-center hover:bg-transparent'
                      >
                        <Edit className='mr-2 h-4 w-4' />
                        {t('actions.edit')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onApproveOrder(row.original.id)}
                      className='cursor-pointer hover:bg-transparent'
                    >
                      <Check className='mr-2 h-4 w-4' />
                      {t('actions.approve')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onOpenRejectDialog(row.original.id)}
                      className='text-destructive cursor-pointer hover:bg-transparent'
                    >
                      <X className='text-destructive mr-2 h-4 w-4' />
                      {t('actions.reject')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onOpenCancelDialog(row.original.id)}
                      className='text-destructive cursor-pointer hover:bg-transparent'
                    >
                      <X className='text-destructive mr-2 h-4 w-4' />
                      {t('actions.cancelOrder')}
                    </DropdownMenuItem>
                  </>
                )}
                {normalizeStatus(row.original.status) === 'rejected' && (
                  <DropdownMenuItem
                    onClick={() => {
                      const reason =
                        row.original.reason ||
                        t('dialog.rejectionReasonDefault');

                      onShowRejectionReason(reason);
                    }}
                  >
                    <Info className='mr-2 h-4 w-4' />
                    {t('actions.viewRejectionReason')}
                  </DropdownMenuItem>
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
      onApproveOrder,
      onOpenCancelDialog,
      onOpenRejectDialog,
      onShowRejectionReason
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

'use client';

import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { formatDebtAmount } from '@/features/payment/utils/utils';
import type { Payment } from '@/types/payment';
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

interface PaymentHistoryTableProps {
  payments: Payment[];
  page: number;
  limit: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export function PaymentHistoryTable({
  payments,
  page,
  limit,
  pageCount,
  onPageChange,
  onLimitChange
}: PaymentHistoryTableProps) {
  const t = useTranslations('Payment.historyTable');
  const tStatus = useTranslations('Payment.status');

  const columns = useMemo<ColumnDef<Payment>[]>(
    () => [
      {
        accessorKey: 'paymentCode',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('headers.code')} />
        ),
        cell: ({ row }) => (
          <div className='font-medium'>
            {row.original.paymentCode || t('na')}
          </div>
        )
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('headers.date')} />
        ),
        cell: ({ row }) => {
          return new Date(row.original.createdAt).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      },
      {
        accessorKey: 'paymentType',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('headers.type')} />
        ),
        cell: ({ row }) => (
          <div className='capitalize'>{row.original.paymentType}</div>
        )
      },
      {
        accessorKey: 'paymentMethod',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('headers.method')} />
        ),
        cell: ({ row }) => (
          <div className='capitalize'>
            {row.original.paymentMethod?.replace('_', ' ')}
          </div>
        )
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('headers.status')} />
        ),
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge
              variant={status === 'paid' ? 'default' : 'secondary'}
              className='capitalize'
            >
              {tStatus(status || 'pending')}
            </Badge>
          );
        }
      },
      {
        accessorKey: 'amount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('headers.amount')} />
        ),
        cell: ({ row }) => (
          <div className='font-bold'>
            {formatDebtAmount(row.original.amount)}
          </div>
        )
      }
    ],
    [t, tStatus]
  );

  const table = useReactTable({
    data: payments,
    columns,
    pageCount: pageCount,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize: limit
      }
    },
    manualPagination: true,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({
          pageIndex: page - 1,
          pageSize: limit
        });
        onPageChange(newState.pageIndex + 1);
        if (onLimitChange && newState.pageSize !== limit) {
          onLimitChange(newState.pageSize);
        }
      } else {
        onPageChange(updater.pageIndex + 1);
        if (onLimitChange && updater.pageSize !== limit) {
          onLimitChange(updater.pageSize);
        }
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  return <DataTable table={table} pageSizeOptions={[5, 10, 20, 50]} />;
}

'use client';

import { PermissionGuard } from '@/components/permissions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Calendar, MapPin, Package, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import type { ImportTicketRow } from '../types/types';

type ImportTableProps = {
  loading: boolean;
  tickets: ImportTicketRow[];
  page: number;
  limit: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onDeleteTicket: (ticketId: string) => void;
};

const formatDate = (date: string | null) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN');
};

export function ImportTable({
  loading,
  tickets,
  page,
  limit,
  pageCount,
  onPageChange,
  onDeleteTicket
}: ImportTableProps) {
  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: (page ?? 1) - 1,
      pageSize: limit ?? 10
    }),
    [page, limit]
  );

  const columns: ColumnDef<ImportTicketRow>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Mã phiếu',
        cell: ({ row }) => (
          <div
            className='max-w-[150px] truncate font-medium'
            title={row.original.id}
          >
            {row.original.id.slice(0, 8)}
          </div>
        )
      },
      {
        accessorKey: 'batchCode',
        header: 'Lô hàng',
        cell: ({ row }) => (
          <div
            className='max-w-[200px] truncate'
            title={row.original.batchCode}
          >
            {row.original.batchCode}
          </div>
        )
      },
      {
        accessorKey: 'productName',
        header: 'Sản phẩm',
        cell: ({ row }) => (
          <div
            className='max-w-[200px] truncate'
            title={row.original.productName}
          >
            <div className='flex items-center gap-2'>
              <Package className='text-muted-foreground h-4 w-4' />
              <span>{row.original.productName}</span>
            </div>
          </div>
        )
      },
      {
        accessorKey: 'quantity',
        header: 'Số lượng',
        cell: ({ row }) => (
          <Badge variant='outline'>
            {row.original.quantity} {row.original.unit}
          </Badge>
        )
      },
      {
        accessorKey: 'numberOfBatch',
        header: 'Số lô',
        cell: ({ row }) => <div>{row.original.numberOfBatch}</div>
      },
      {
        accessorKey: 'areaName',
        header: 'Khu vực',
        cell: ({ row }) => (
          <div className='max-w-[200px] truncate' title={row.original.areaName}>
            <div className='flex items-center gap-2'>
              <MapPin className='text-muted-foreground h-4 w-4' />
              <span>{row.original.areaName}</span>
            </div>
          </div>
        )
      },
      {
        accessorKey: 'importDate',
        header: 'Ngày nhập',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Calendar className='text-muted-foreground h-4 w-4' />
            <span>{formatDate(row.original.importDate)}</span>
          </div>
        )
      },
      {
        accessorKey: 'expiredAt',
        header: 'Hạn sử dụng',
        cell: ({ row }) => (
          <div>
            {row.original.expiredAt ? (
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4 text-orange-500' />
                <span className='text-sm'>
                  {formatDate(row.original.expiredAt)}
                </span>
              </div>
            ) : (
              <span className='text-muted-foreground'>-</span>
            )}
          </div>
        )
      },
      {
        id: 'actions',
        header: () => <div className='w-full pr-2 text-right'>Thao tác</div>,
        cell: ({ row }) => (
          <div className='text-right'>
            <PermissionGuard permission={Permission.MANAGE_PURCHASE_IMPORT}>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => onDeleteTicket(row.original.id)}
              >
                <Trash2 className='text-destructive h-4 w-4' />
              </Button>
            </PermissionGuard>
          </div>
        )
      }
    ],
    [onDeleteTicket]
  );

  const table = useReactTable({
    data: tickets,
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
    return <DataTableSkeleton columnCount={9} rowCount={10} />;
  }

  return <DataTable table={table} pageSizeOptions={[]} />;
}

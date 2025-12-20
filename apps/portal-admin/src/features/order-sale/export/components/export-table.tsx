'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  type PaginationState,
  useReactTable
} from '@tanstack/react-table';
import { Calendar, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import type { ExportTicket } from '@/services/export-ticket.service';

type ExportTableProps = {
  loading: boolean;
  tickets: ExportTicket[];
  page: number;
  limit: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onDeleteTicket: (ticketId: string) => void;
};

const formatDate = (date: string | undefined) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export function ExportTable({
  loading,
  tickets,
  page,
  limit,
  pageCount,
  onPageChange,
  onDeleteTicket
}: ExportTableProps) {
  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: (page ?? 1) - 1,
      pageSize: limit ?? 10
    }),
    [page, limit]
  );

  const columns: ColumnDef<ExportTicket>[] = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Mã phiếu',
        cell: ({ row }) => (
          <div
            className='max-w-[150px] truncate font-mono text-sm font-medium'
            title={row.original.id}
          >
            {row.original.id.slice(0, 8).toUpperCase()}
          </div>
        )
      },
      {
        accessorKey: 'createdAt',
        header: 'Ngày tạo',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Calendar className='text-muted-foreground h-4 w-4' />
            <span>{formatDate(row.original.createdAt)}</span>
          </div>
        )
      },
      {
        accessorKey: 'updatedAt',
        header: 'Cập nhật',
        cell: ({ row }) => (
          <span className='text-muted-foreground'>
            {formatDate(row.original.updatedAt)}
          </span>
        )
      },
      {
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: () => <Badge variant='default'>Đã tạo</Badge>
      },
      {
        id: 'actions',
        header: () => <div className='w-full pr-2 text-right'>Thao tác</div>,
        cell: ({ row }) => (
          <div className='text-right'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => onDeleteTicket(row.original.id)}
            >
              <Trash2 className='text-destructive h-4 w-4' />
            </Button>
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
    return <DataTableSkeleton columnCount={5} rowCount={10} />;
  }

  return <DataTable table={table} pageSizeOptions={[]} />;
}

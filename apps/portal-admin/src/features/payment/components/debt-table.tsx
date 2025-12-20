'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Debt } from '@/types/debt';
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable
} from '@tanstack/react-table';
import { Eye, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import {
  formatDebtAmount,
  getDebtStatusColor,
  getDebtStatusLabel
} from '../utils/utils';
import { useTranslations } from 'next-intl';

interface DebtTableProps {
  debts: Debt[];
  page: number;
  limit: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export function DebtTable({
  debts,
  page,
  limit,
  pageCount,
  onPageChange
}: DebtTableProps) {
  const t = useTranslations('Orders.list');
  const router = useRouter();

  const columns = useMemo<ColumnDef<Debt>[]>(
    () => [
      {
        accessorKey: 'index',
        header: '#',
        cell: ({ row, table }) => {
          const pageIndex = table.getState().pagination.pageIndex;
          const pageSize = table.getState().pagination.pageSize;
          return (
            <div className='max-w-[150px] truncate font-medium'>
              {pageIndex * pageSize + table.getRowModel().rows.indexOf(row) + 1}
            </div>
          );
        }
      },
      {
        accessorKey: 'partnerName',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Partner' />
        ),
        cell: ({ row }) => {
          const debt = row.original;
          if (debt.partnerType === 'supplier' && debt.supplier) {
            return (
              <div className='max-w-[300px]'>
                <div
                  className='truncate font-medium'
                  title={debt.supplier.gardenName}
                >
                  {debt.supplier.gardenName}
                </div>
                <div
                  className='text-muted-foreground truncate text-sm'
                  title={debt.supplier.representativeName}
                >
                  {debt.supplier.representativeName}
                </div>
              </div>
            );
          }
          if (debt.partnerType === 'consignee' && debt.consignee) {
            const name =
              debt.consignee.organizationName ||
              `${debt.consignee.user?.firstName || ''} ${debt.consignee.user?.lastName || ''}`.trim();
            return (
              <div className='max-w-[300px]'>
                <div className='truncate font-medium'>{name}</div>
                <div
                  className='text-muted-foreground truncate text-sm'
                  title={debt.consignee.representativeName}
                >
                  {debt.consignee.representativeName}
                </div>
              </div>
            );
          }
          return <span className='text-muted-foreground'>—</span>;
        }
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Status' />
        ),
        cell: ({ row }) => {
          const status = row.original.status;
          const colors = getDebtStatusColor(status);
          return (
            <Badge
              variant='outline'
              className={`${colors.bg} ${colors.text} ${colors.border} capitalize`}
            >
              {getDebtStatusLabel(status)}
            </Badge>
          );
        }
      },
      {
        accessorKey: 'originalAmount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Original Amount' />
        ),
        cell: ({ row }) => {
          return (
            <div className='font-medium'>
              {formatDebtAmount(row.original.originalAmount)}
            </div>
          );
        }
      },
      {
        accessorKey: 'paidAmount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Paid Amount' />
        ),
        cell: ({ row }) => {
          return (
            <div className='font-medium text-green-600'>
              {formatDebtAmount(row.original.paidAmount)}
            </div>
          );
        }
      },
      {
        accessorKey: 'remainingAmount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Remaining Amount' />
        ),
        cell: ({ row }) => {
          const amount = row.original.remainingAmount || 0;
          return (
            <div
              className={`font-medium ${
                amount > 0 ? 'text-red-600' : 'text-muted-foreground'
              }`}
            >
              {formatDebtAmount(amount)}
            </div>
          );
        }
      },
      {
        accessorKey: 'dueDate',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title='Due Date' />
        ),
        cell: ({ row }) => {
          const dueDate = row.original.dueDate;
          if (!dueDate) return <span className='text-muted-foreground'>—</span>;
          return new Date(dueDate).toLocaleDateString('vi-VN');
        }
      },
      {
        id: 'actions',
        header: () => <div className='w-full pr-2 text-right'>Actions</div>,
        cell: ({ row }) => (
          <div className='text-right'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm'>
                  <MoreVertical className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem
                  onClick={() => {
                    router.push(`/dashboard/payment/${row.original.id}`);
                  }}
                  className='hover:border-primary flex cursor-pointer items-center hover:bg-transparent'
                >
                  <Eye className='mr-2 h-4 w-4' />
                  {t('actions.viewDetails')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
    ],
    [router, t]
  );

  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: page - 1,
      pageSize: limit
    }),
    [page, limit]
  );

  const table = useReactTable({
    data: debts,
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

  return <DataTable table={table} pageSizeOptions={[10, 20, 30, 50]} />;
}

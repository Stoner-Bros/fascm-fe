'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { formatCurrency } from '../utils/formatting';
import type { Payment } from '@/types/payment';
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { confirmCashPayment } from '@/services/payment.service';
import { useToast } from '@/hooks/use-toast';
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
import { useTranslations } from 'next-intl';

interface PaymentHistoryTableProps {
  payments: Payment[];
  page: number;
  limit: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onPaymentConfirmed?: () => void;
}

export function PaymentHistoryTable({
  payments,
  page,
  limit,
  pageCount,
  onPageChange,
  onLimitChange,
  onPaymentConfirmed
}: PaymentHistoryTableProps) {
  const { toast } = useToast();
  const t = useTranslations('Payment');
  const [confirmingPayment, setConfirmingPayment] = useState<Payment | null>(
    null
  );
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmPayment = async () => {
    if (!confirmingPayment?.paymentCode) return;

    try {
      setIsConfirming(true);
      await confirmCashPayment(confirmingPayment.paymentCode);
      toast({
        title: t('toast.successTitle'),
        description: t('toast.successDescription')
      });
      onPaymentConfirmed?.();
    } catch (error) {
      toast({
        title: t('toast.errorTitle'),
        description: t('toast.errorDescription'),
        variant: 'destructive'
      });
    } finally {
      setIsConfirming(false);
      setConfirmingPayment(null);
    }
  };

  const columns = useMemo<ColumnDef<Payment>[]>(
    () => [
      {
        accessorKey: 'paymentCode',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.code')} />
        ),
        cell: ({ row }) => (
          <div className='font-medium'>{row.original.paymentCode || 'N/A'}</div>
        )
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.date')} />
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
          <DataTableColumnHeader column={column} title={t('table.type')} />
        ),
        cell: ({ row }) => (
          <div className='capitalize'>
            {t(`type.${row.original.paymentType}` as any)}
          </div>
        )
      },
      {
        accessorKey: 'paymentMethod',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.method')} />
        ),
        cell: ({ row }) => (
          <div className='capitalize'>
            {t(`method.${row.original.paymentMethod}` as any)}
          </div>
        )
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.status')} />
        ),
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <Badge
              variant={status === 'paid' ? 'default' : 'secondary'}
              className='capitalize'
            >
              {t(`status.${status}` as any)}
            </Badge>
          );
        }
      },
      {
        accessorKey: 'amount',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.amount')} />
        ),
        cell: ({ row }) => (
          <div className='font-bold'>{formatCurrency(row.original.amount)}</div>
        )
      },
      {
        id: 'actions',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t('table.actions')} />
        ),
        cell: ({ row }) => {
          const payment = row.original;
          const isCashPending =
            payment.paymentMethod === 'cash' && payment.status === 'pending';

          if (!isCashPending) return null;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                  <span className='sr-only'>{t('table.openMenu')}</span>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem onClick={() => setConfirmingPayment(payment)}>
                  {t('table.confirmPayment')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
      }
    ],
    []
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

  return (
    <>
      <DataTable table={table} pageSizeOptions={[5, 10, 20, 50]} />

      <AlertDialog
        open={!!confirmingPayment}
        onOpenChange={(open) => !open && setConfirmingPayment(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('dialog.description', {
                amount: formatCurrency(confirmingPayment?.amount),
                code: confirmingPayment?.paymentCode || ''
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isConfirming}>
              {t('dialog.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmPayment();
              }}
              disabled={isConfirming}
            >
              {isConfirming ? t('dialog.confirming') : t('dialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

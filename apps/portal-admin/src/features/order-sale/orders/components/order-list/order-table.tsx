'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Check, Edit, Eye, Info, Loader2, MoreVertical, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { normalizeStatus } from '../../hooks/order-list/use-order-list';
import type { OrderScheduleRow } from '../../types/types';
import { getOrderStatusBadge } from '../../utils/status-badges';

type OrderTableProps = {
  loading: boolean;
  schedules: OrderScheduleRow[];
  updatingStatusIds: Set<string>;
  onApproveOrder: (scheduleId: string) => void;
  onOpenCancelDialog: (scheduleId: string) => void;
  onOpenRejectDialog: (scheduleId: string) => void;
  onShowRejectionReason: (reason?: string) => void;
};

export function OrderTable({
  loading,
  schedules,
  updatingStatusIds,
  onApproveOrder,
  onOpenCancelDialog,
  onOpenRejectDialog,
  onShowRejectionReason
}: OrderTableProps) {
  const t = useTranslations('Orders.list');
  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('table.orderNumber')}</TableHead>
            <TableHead>{t('table.customer')}</TableHead>
            <TableHead>{t('table.products')}</TableHead>
            <TableHead>{t('table.deliveryDate')}</TableHead>
            <TableHead>{t('table.createdAt')}</TableHead>
            <TableHead>{t('table.address')}</TableHead>
            <TableHead>{t('table.status')}</TableHead>
            <TableHead className='text-right'>{t('table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className='text-center'>
                <div className='flex flex-col items-center justify-center py-12'>
                  <div className='border-primary mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
                  <p className='text-muted-foreground'>{t('table.loading')}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : schedules.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className='text-center'>
                {t('table.empty')}
              </TableCell>
            </TableRow>
          ) : (
            schedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell className='max-w-[150px] truncate font-medium'>
                  {schedule.orderNumber}
                </TableCell>
                <TableCell className='max-w-[200px] truncate'>
                  {schedule.consigneeName}
                </TableCell>
                <TableCell className='max-w-[200px] truncate'>
                  {schedule.products}
                </TableCell>
                <TableCell className='max-w-[180px] truncate'>
                  {schedule.deliveryDate}
                </TableCell>
                <TableCell className='max-w-[180px] truncate'>
                  {schedule.createdAt}
                </TableCell>
                <TableCell className='max-w-[200px] truncate'>
                  {schedule.address}
                </TableCell>
                <TableCell>
                  {updatingStatusIds.has(schedule.id) ? (
                    <div className='flex items-center gap-2'>
                      <Loader2 className='h-4 w-4 animate-spin' />
                    </div>
                  ) : (
                    getOrderStatusBadge(schedule.status, (key) =>
                      t(`statuses.${key}` as any)
                    )
                  )}
                </TableCell>
                <TableCell className='text-right'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='sm'>
                        <MoreVertical className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/dashboard/order-sale/order/${schedule.id}`}
                          className='hover:border-primary flex cursor-pointer items-center hover:bg-transparent'
                        >
                          <Eye className='mr-2 h-4 w-4' />
                          {t('actions.viewDetails')}
                        </Link>
                      </DropdownMenuItem>
                      {normalizeStatus(schedule.status) === 'pending' && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/order-sale/order/${schedule.id}/edit`}
                              className='hover:border-primary flex cursor-pointer items-center hover:bg-transparent'
                            >
                              <Edit className='mr-2 h-4 w-4' />
                              {t('actions.edit')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onApproveOrder(schedule.id)}
                            className='cursor-pointer hover:bg-transparent'
                          >
                            <Check className='mr-2 h-4 w-4' />
                            {t('actions.approve')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onOpenRejectDialog(schedule.id)}
                            className='text-destructive cursor-pointer hover:bg-transparent'
                          >
                            <X className='text-destructive mr-2 h-4 w-4' />
                            {t('actions.reject')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onOpenCancelDialog(schedule.id)}
                            className='text-destructive cursor-pointer hover:bg-transparent'
                          >
                            <X className='text-destructive mr-2 h-4 w-4' />
                            {t('actions.cancelOrder')}
                          </DropdownMenuItem>
                        </>
                      )}
                      {normalizeStatus(schedule.status) === 'rejected' && (
                        <DropdownMenuItem
                          onClick={() => {
                            const reason =
                              schedule.reason ||
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

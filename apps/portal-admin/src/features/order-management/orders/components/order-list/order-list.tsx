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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { fetchOrderSchedules } from '@/services/order-schedule.service';
import type { OrderSchedule, OrderScheduleStatus } from '@/types/order';
import { IconCircleCheck } from '@tabler/icons-react';
import {
  Check,
  Clock,
  Edit,
  Eye,
  Info,
  MoreVertical,
  Search,
  Truck,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useReducer } from 'react';
import type {
  Action,
  OrderScheduleRow,
  State,
  StatusFilter
} from '../../types/types';
import { getOrderStatusBadge } from '../../utils/status-badges';

const initialState: State = {
  orderSchedules: [],
  loading: false,
  searchQuery: '',
  statusFilter: 'ALL',
  cancelDialogOpen: false,
  selectedScheduleId: null
};

function orderSchedulesReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ORDER_SCHEDULES':
      return { ...state, orderSchedules: action.payload, loading: false };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_STATUS_FILTER':
      return { ...state, statusFilter: action.payload };
    case 'OPEN_CANCEL_DIALOG':
      return {
        ...state,
        cancelDialogOpen: true,
        selectedScheduleId: action.payload
      };
    case 'CLOSE_CANCEL_DIALOG':
      return {
        ...state,
        cancelDialogOpen: false,
        selectedScheduleId: null
      };
    case 'CANCEL_ORDER':
      return {
        ...state,
        orderSchedules: state.orderSchedules.map((schedule) =>
          schedule.id === action.payload
            ? { ...schedule, status: 'canceled' as OrderScheduleStatus }
            : schedule
        ),
        cancelDialogOpen: false,
        selectedScheduleId: null
      };
    case 'LOAD_ERROR':
      return { ...state, loading: false };
    default:
      return state;
  }
}

const normalizeStatus = (
  status?: OrderScheduleStatus | null
): OrderScheduleStatus => {
  if (!status || status.trim() === '') return 'pending';
  return status.toLowerCase().trim() as OrderScheduleStatus;
};

export default function OrderList() {
  const { toast } = useToast();
  const t = useTranslations('Orders.list');
  const [state, dispatch] = useReducer(orderSchedulesReducer, initialState);

  const loadData = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Fetch all order schedules
      const schedulesRes = await fetchOrderSchedules({
        page: 1,
        limit: 50,
        sort: 'desc'
      });
      const schedules: OrderSchedule[] = schedulesRes.data ?? [];

      // Process schedules into rows
      const rows: OrderScheduleRow[] = schedules.map((schedule) => {
        // Extract product names from order details
        const productNames = new Set<string>();
        const orderDetails = schedule.orderDetails ?? [];
        for (const detail of orderDetails) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const productName =
            (detail as any)?.product?.name ||
            (detail as any)?.productName ||
            (detail as any)?.product?.id;
          if (productName) productNames.add(String(productName));
        }

        const products =
          Array.from(productNames).join(', ') || t('table.noProducts');

        const formatDateTime = (date: string | Date | null | undefined) => {
          if (!date) return '-';
          const d = new Date(date as unknown as string);
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = d.getFullYear();
          const hours = String(d.getHours()).padStart(2, '0');
          const minutes = String(d.getMinutes()).padStart(2, '0');
          return `${day}/${month}/${year} ${hours}:${minutes}`;
        };

        const deliveryDate = formatDateTime(schedule.deliveryDate);
        const orderNumber =
          (schedule.orders && schedule.orders[0]?.id) || schedule.id;
        const address = schedule.address || '-';
        const createdAt = formatDateTime(schedule.createdAt);
        const consigneeName = schedule.consignee?.organizationName || '-';

        return {
          id: schedule.id,
          orderNumber,
          products,
          deliveryDate,
          address,
          status: (schedule.status ?? 'pending') as OrderScheduleStatus,
          description: schedule.description ?? undefined,
          reason: schedule.reason ?? undefined,
          createdAt,
          consigneeName
        };
      });

      dispatch({ type: 'SET_ORDER_SCHEDULES', payload: rows });
    } catch (err) {
      dispatch({ type: 'LOAD_ERROR' });
      toast({
        title: t('toast.errorTitle'),
        description: t('toast.errorDescription'),
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancelOrder = (scheduleId: string) => {
    dispatch({ type: 'OPEN_CANCEL_DIALOG', payload: scheduleId });
  };

  const confirmCancelOrder = () => {
    if (state.selectedScheduleId) {
      dispatch({ type: 'CANCEL_ORDER', payload: state.selectedScheduleId });
      toast({
        title: t('toast.cancelTitle'),
        description: t('toast.cancelDescription', {
          id: state.selectedScheduleId
        })
      });
    }
  };

  const handleCloseDialog = () => {
    dispatch({ type: 'CLOSE_CANCEL_DIALOG' });
  };

  const filteredSchedules = useMemo(() => {
    const q = state.searchQuery.toLowerCase();
    return state.orderSchedules.filter((schedule) => {
      const matchesSearch =
        schedule.id.toLowerCase().includes(q) ||
        schedule.orderNumber.toLowerCase().includes(q) ||
        schedule.products.toLowerCase().includes(q) ||
        schedule.consigneeName?.toLowerCase().includes(q) ||
        false;
      const matchesStatus =
        state.statusFilter === 'ALL' ||
        normalizeStatus(schedule.status) === state.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [state.orderSchedules, state.searchQuery, state.statusFilter]);

  const statusCounts = useMemo(
    () => ({
      all: state.orderSchedules.length,
      pending: state.orderSchedules.filter(
        (s) => normalizeStatus(s.status) === 'pending'
      ).length,
      rejected: state.orderSchedules.filter(
        (s) => normalizeStatus(s.status) === 'rejected'
      ).length,
      approved: state.orderSchedules.filter(
        (s) => normalizeStatus(s.status) === 'approved'
      ).length,
      processing: state.orderSchedules.filter(
        (s) => normalizeStatus(s.status) === 'processing'
      ).length,
      completed: state.orderSchedules.filter(
        (s) => normalizeStatus(s.status) === 'completed'
      ).length,
      canceled: state.orderSchedules.filter(
        (s) => normalizeStatus(s.status) === 'canceled'
      ).length
    }),
    [state.orderSchedules]
  );

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>{t('title')}</h2>
            <p className='text-muted-foreground'>{t('subtitle')}</p>
          </div>
        </div>

        {/* Status Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-5'>
          <Card
            className='hover:border-primary cursor-pointer'
            onClick={() =>
              dispatch({ type: 'SET_STATUS_FILTER', payload: 'ALL' })
            }
          >
            <CardHeader>
              <CardDescription>{t('cards.totalOrders')}</CardDescription>
              <CardTitle className='text-3xl'>
                {state.loading ? (
                  <div className='bg-muted h-8 w-16 animate-pulse rounded' />
                ) : (
                  statusCounts.all
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card
            className='hover:border-primary cursor-pointer'
            onClick={() =>
              dispatch({ type: 'SET_STATUS_FILTER', payload: 'pending' })
            }
          >
            <CardHeader>
              <CardDescription className='flex items-center gap-2'>
                <Clock className='h-4 w-4' />
                {t('cards.pending')}
              </CardDescription>
              <CardTitle className='text-3xl'>
                {state.loading ? (
                  <div className='bg-muted h-8 w-16 animate-pulse rounded' />
                ) : (
                  statusCounts.pending
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card
            className='hover:border-primary cursor-pointer'
            onClick={() =>
              dispatch({ type: 'SET_STATUS_FILTER', payload: 'approved' })
            }
          >
            <CardHeader>
              <CardDescription className='flex items-center gap-2'>
                <Check className='h-4 w-4' />
                {t('cards.approved')}
              </CardDescription>
              <CardTitle className='text-3xl'>
                {state.loading ? (
                  <div className='bg-muted h-8 w-16 animate-pulse rounded' />
                ) : (
                  statusCounts.approved
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card
            className='hover:border-primary cursor-pointer'
            onClick={() =>
              dispatch({ type: 'SET_STATUS_FILTER', payload: 'processing' })
            }
          >
            <CardHeader>
              <CardDescription className='flex items-center gap-2'>
                <Truck className='h-4 w-4' />
                {t('cards.processing')}
              </CardDescription>
              <CardTitle className='text-3xl'>
                {state.loading ? (
                  <div className='bg-muted h-8 w-16 animate-pulse rounded' />
                ) : (
                  statusCounts.processing
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card
            className='hover:border-primary cursor-pointer'
            onClick={() =>
              dispatch({ type: 'SET_STATUS_FILTER', payload: 'completed' })
            }
          >
            <CardHeader>
              <CardDescription className='flex items-center gap-2'>
                <IconCircleCheck className='h-4 w-4' />
                {t('cards.completed')}
              </CardDescription>
              <CardTitle className='text-3xl'>
                {state.loading ? (
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
                  <Search className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
                  <Input
                    placeholder={t('filters.searchPlaceholder')}
                    className='pl-8'
                    value={state.searchQuery}
                    onChange={(e) =>
                      dispatch({
                        type: 'SET_SEARCH_QUERY',
                        payload: e.target.value
                      })
                    }
                  />
                </div>
                <Select
                  value={state.statusFilter}
                  onValueChange={(v) =>
                    dispatch({
                      type: 'SET_STATUS_FILTER',
                      payload: (v as StatusFilter) || 'ALL'
                    })
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
                      {t('statuses.processing')}
                    </SelectItem>
                    <SelectItem value='completed'>
                      {t('statuses.completed')}
                    </SelectItem>
                    <SelectItem value='canceled'>
                      {t('statuses.canceled')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
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
                    <TableHead className='text-right'>
                      {t('table.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className='text-center'>
                        <div className='flex flex-col items-center justify-center py-12'>
                          <div className='border-primary mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
                          <p className='text-muted-foreground'>
                            {t('table.loading')}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredSchedules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className='text-center'>
                        {t('table.empty')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSchedules.map((schedule) => (
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
                          {getOrderStatusBadge(schedule.status, (key) =>
                            t(`statuses.${key}` as any)
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
                                  href={`/dashboard/order-management/order/${schedule.id}`}
                                  className='hover:border-primary flex cursor-pointer items-center hover:bg-transparent'
                                >
                                  <Eye className='mr-2 h-4 w-4' />
                                  {t('actions.viewDetails')}
                                </Link>
                              </DropdownMenuItem>
                              {normalizeStatus(schedule.status) ===
                                'pending' && (
                                <>
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`/dashboard/order/${schedule.id}/edit`}
                                      className='hover:border-primary flex cursor-pointer items-center hover:bg-transparent'
                                    >
                                      <Edit className='mr-2 h-4 w-4' />
                                      {t('actions.edit')}
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleCancelOrder(schedule.id)
                                    }
                                    className='text-destructive cursor-pointer hover:bg-transparent'
                                  >
                                    <X className='text-destructive mr-2 h-4 w-4' />
                                    {t('actions.reject')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleCancelOrder(schedule.id)
                                    }
                                    className='text-destructive cursor-pointer hover:bg-transparent'
                                  >
                                    <X className='text-destructive mr-2 h-4 w-4' />
                                    {t('actions.cancelOrder')}
                                  </DropdownMenuItem>
                                </>
                              )}
                              {normalizeStatus(schedule.status) ===
                                'rejected' && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    const reason =
                                      schedule.reason ||
                                      t('dialog.rejectionReasonDefault');

                                    toast({
                                      title: t('dialog.rejectionReasonTitle'),
                                      description: reason,
                                      variant: 'default'
                                    });
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
          </CardContent>
        </Card>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog
        open={state.cancelDialogOpen}
        onOpenChange={handleCloseDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialog.cancelTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('dialog.cancelDescription', {
                id: state.selectedScheduleId || ''
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('dialog.cancelKeep')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelOrder}>
              {t('dialog.cancelConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

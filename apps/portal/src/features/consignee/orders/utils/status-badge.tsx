import { Badge } from '@/components/ui/badge';
import {
  IconCheck,
  IconClock,
  IconPackage,
  IconTruck,
  IconX
} from '@tabler/icons-react';
import type { OrderPhaseStatus, OrderScheduleStatus } from '@/types/order';

type TranslationFunction = (key: string) => string;

// Icon functions (for separate use in titles, etc.)
export const getStatusIcon = (status: OrderScheduleStatus) => {
  switch (status) {
    case 'pending':
      return <IconClock className='h-4 w-4' />;
    case 'approved':
      return <IconCheck className='h-4 w-4' />;
    case 'processing':
      return <IconTruck className='h-4 w-4' />;
    case 'completed':
      return <IconCheck className='h-4 w-4' />;
    case 'rejected':
      return <IconX className='h-4 w-4' />;
    case 'canceled':
      return <IconX className='h-4 w-4' />;
    default:
      return <IconPackage className='h-4 w-4' />;
  }
};

export const getPhaseStatusIcon = (status?: OrderPhaseStatus | null) => {
  if (!status) return <IconClock className='h-4 w-4' />;
  switch (status) {
    case 'preparing':
      return <IconPackage className='h-4 w-4' />;
    case 'delivering':
      return <IconTruck className='h-4 w-4' />;
    case 'delivered':
      return <IconCheck className='h-4 w-4' />;
    case 'completed':
      return <IconCheck className='h-4 w-4' />;
    case 'canceled':
      return <IconX className='h-4 w-4' />;
    default:
      return <IconClock className='h-4 w-4' />;
  }
};

// Badge functions (like status-badges.tsx)
export function getOrderStatusBadge(
  status?: OrderScheduleStatus | null,
  t?: TranslationFunction
) {
  const getLabel = (statusKey: string) => {
    if (t) {
      return t(`statuses.${statusKey}` as any);
    }
    const labels: Record<string, string> = {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Từ chối',
      processing: 'Đang xử lý',
      completed: 'Hoàn thành',
      canceled: 'Đã hủy'
    };
    return labels[statusKey] || '-';
  };

  if (!status) {
    const defaultLabel = t ? t('common.notSpecified') : '-';
    return <Badge variant='outline'>{defaultLabel}</Badge>;
  }

  switch (status) {
    case 'pending':
      return (
        <Badge
          variant='outline'
          className='border-yellow-200 bg-yellow-50 text-yellow-700'
        >
          {getStatusIcon(status)}
          {getLabel('pending')}
        </Badge>
      );
    case 'approved':
      return (
        <Badge
          variant='outline'
          className='border-green-200 bg-green-50 text-green-700'
        >
          {getStatusIcon(status)}
          {getLabel('approved')}
        </Badge>
      );
    case 'rejected':
      return (
        <Badge
          variant='outline'
          className='border-red-200 bg-red-50 text-red-700'
        >
          {getStatusIcon(status)}
          {getLabel('rejected')}
        </Badge>
      );
    case 'processing':
      return (
        <Badge
          variant='outline'
          className='border-blue-200 bg-blue-50 text-blue-700'
        >
          {getStatusIcon(status)}
          {getLabel('processing')}
        </Badge>
      );
    case 'completed':
      return (
        <Badge
          variant='outline'
          className='border-gray-200 bg-gray-50 text-gray-700'
        >
          {getStatusIcon(status)}
          {getLabel('completed')}
        </Badge>
      );
    case 'canceled':
      return (
        <Badge
          variant='outline'
          className='border-gray-200 bg-gray-50 text-gray-700'
        >
          {getStatusIcon(status)}
          {getLabel('canceled')}
        </Badge>
      );
    default:
      const defaultLabel = t ? t('common.notSpecified') : '-';
      return <Badge variant='outline'>{defaultLabel}</Badge>;
  }
}

export function getPhaseStatusBadge(
  status?: OrderPhaseStatus | null,
  t?: TranslationFunction
) {
  const getLabel = (statusKey: string) => {
    if (t) {
      // t is already scoped to 'Orders', so we just need the phaseStatuses key
      return t(`phaseStatuses.${statusKey}` as any);
    }
    const labels: Record<string, string> = {
      preparing: 'Chuẩn bị',
      delivering: 'Đang giao',
      delivered: 'Đã giao',
      completed: 'Hoàn thành',
      canceled: 'Đã hủy'
    };
    return labels[statusKey] || '-';
  };

  if (!status) {
    const defaultLabel = t ? t('phaseStatuses.notStarted') : 'Đợi xử lý';
    return (
      <Badge variant='outline' className='flex items-center gap-1'>
        {getPhaseStatusIcon(null)}
        {defaultLabel}
      </Badge>
    );
  }

  switch (status) {
    case 'preparing':
      return (
        <Badge
          variant='outline'
          className='flex items-center gap-1 border-yellow-200 bg-yellow-50 text-yellow-700'
        >
          {getPhaseStatusIcon(status)}
          {getLabel('preparing')}
        </Badge>
      );
    case 'delivering':
      return (
        <Badge
          variant='outline'
          className='flex items-center gap-1 border-blue-200 bg-blue-50 text-blue-700'
        >
          {getPhaseStatusIcon(status)}
          {getLabel('delivering')}
        </Badge>
      );
    case 'delivered':
      return (
        <Badge
          variant='outline'
          className='flex items-center gap-1 border-purple-200 bg-purple-50 text-purple-700'
        >
          {getPhaseStatusIcon(status)}
          {getLabel('delivered')}
        </Badge>
      );
    case 'completed':
      return (
        <Badge
          variant='outline'
          className='flex items-center gap-1 border-green-200 bg-green-50 text-green-700'
        >
          {getPhaseStatusIcon(status)}
          {getLabel('completed')}
        </Badge>
      );
    case 'canceled':
      return (
        <Badge
          variant='outline'
          className='flex items-center gap-1 border-gray-200 bg-gray-50 text-gray-700'
        >
          {getPhaseStatusIcon(status)}
          {getLabel('canceled')}
        </Badge>
      );
    default:
      const defaultLabel = t ? t('phaseStatuses.notStarted') : 'Đợi xử lý';
      return (
        <Badge variant='outline' className='flex items-center gap-1'>
          {getPhaseStatusIcon(status)}
          {defaultLabel}
        </Badge>
      );
  }
}

// Legacy functions for backward compatibility
export const getPhaseStatusVariant = (
  status?: OrderPhaseStatus | null
): 'outline' | 'default' | 'secondary' | 'destructive' => {
  if (!status) return 'outline';
  switch (status) {
    case 'preparing':
      return 'secondary';
    case 'delivering':
      return 'default';
    case 'delivered':
      return 'default';
    case 'completed':
      return 'default';
    case 'canceled':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const getStatusLabel = (
  status: OrderScheduleStatus,
  t: (key: string) => string
) => {
  switch (status) {
    case 'pending':
      return t('statuses.pending');
    case 'rejected':
      return t('statuses.rejected');
    case 'approved':
      return t('statuses.approved');
    case 'processing':
      return t('statuses.processing');
    case 'completed':
      return t('statuses.completed');
    case 'canceled':
      return t('statuses.canceled');
    default:
      return status || t('statuses.unknown');
  }
};

export const getPhaseStatusLabel = (
  status: OrderPhaseStatus | null | undefined,
  t: (key: string) => string
) => {
  if (!status) return t('phaseStatuses.notStarted');
  switch (status) {
    case 'preparing':
      return t('phaseStatuses.preparing');
    case 'delivering':
      return t('phaseStatuses.delivering');
    case 'delivered':
      return t('phaseStatuses.delivered');
    case 'completed':
      return t('phaseStatuses.completed');
    case 'canceled':
      return t('phaseStatuses.canceled');
    default:
      return status || t('statuses.unknown');
  }
};

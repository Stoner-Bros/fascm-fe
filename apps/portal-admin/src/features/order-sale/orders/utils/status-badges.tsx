import { Badge } from '@/components/ui/badge';
import type { OrderScheduleStatus } from '@/types/order';

type TranslationFunction = (key: string) => string;

export function getOrderStatusBadge(
  status?: OrderScheduleStatus | null,
  t?: TranslationFunction
) {
  const getLabel = (statusKey: string) => {
    if (t) {
      return t(statusKey);
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

  switch (status) {
    case 'pending':
      return (
        <Badge
          variant='outline'
          className='border-yellow-200 bg-yellow-50 text-yellow-700'
        >
          {getLabel('pending')}
        </Badge>
      );
    case 'approved':
      return (
        <Badge
          variant='outline'
          className='border-green-200 bg-green-50 text-green-700'
        >
          {getLabel('approved')}
        </Badge>
      );
    case 'rejected':
      return (
        <Badge
          variant='outline'
          className='border-red-200 bg-red-50 text-red-700'
        >
          {getLabel('rejected')}
        </Badge>
      );
    case 'processing':
      return (
        <Badge
          variant='outline'
          className='border-blue-200 bg-blue-50 text-blue-700'
        >
          {getLabel('processing')}
        </Badge>
      );
    case 'completed':
      return (
        <Badge
          variant='outline'
          className='border-gray-200 bg-gray-50 text-gray-700'
        >
          {getLabel('completed')}
        </Badge>
      );
    case 'canceled':
      return (
        <Badge
          variant='outline'
          className='border-gray-200 bg-gray-50 text-gray-700'
        >
          {getLabel('canceled')}
        </Badge>
      );
    default:
      return <Badge variant='outline'>-</Badge>;
  }
}

export function getPhaseStatusBadge(
  status?: string | null,
  t?: TranslationFunction
) {
  const getLabel = (statusKey: string) => {
    if (t) {
      return t(statusKey);
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

  switch (status) {
    case 'preparing':
      return (
        <Badge
          variant='outline'
          className='border-yellow-200 bg-yellow-50 text-yellow-700'
        >
          {getLabel('preparing')}
        </Badge>
      );
    case 'delivering':
      return (
        <Badge
          variant='outline'
          className='border-blue-200 bg-blue-50 text-blue-700'
        >
          {getLabel('delivering')}
        </Badge>
      );
    case 'delivered':
      return (
        <Badge
          variant='outline'
          className='border-purple-200 bg-purple-50 text-purple-700'
        >
          {getLabel('delivered')}
        </Badge>
      );
    case 'completed':
      return (
        <Badge
          variant='outline'
          className='border-green-200 bg-green-50 text-green-700'
        >
          {getLabel('completed')}
        </Badge>
      );
    case 'canceled':
      return (
        <Badge
          variant='outline'
          className='border-gray-200 bg-gray-50 text-gray-700'
        >
          {getLabel('canceled')}
        </Badge>
      );
    default:
      return <Badge variant='outline'>Đợi xử lý</Badge>;
  }
}

import { Badge } from '@/components/ui/badge';
import type { OrderScheduleStatus } from '@/types/order';

export function getOrderStatusBadge(status?: OrderScheduleStatus | null) {
  switch (status) {
    case 'pending':
      return (
        <Badge
          variant='outline'
          className='border-yellow-200 bg-yellow-50 text-yellow-700'
        >
          Chờ duyệt
        </Badge>
      );
    case 'approved':
      return (
        <Badge
          variant='outline'
          className='border-green-200 bg-green-50 text-green-700'
        >
          Đã duyệt
        </Badge>
      );
    case 'rejected':
      return (
        <Badge
          variant='outline'
          className='border-red-200 bg-red-50 text-red-700'
        >
          Từ chối
        </Badge>
      );
    case 'processing':
      return (
        <Badge
          variant='outline'
          className='border-blue-200 bg-blue-50 text-blue-700'
        >
          Đang xử lý
        </Badge>
      );
    case 'completed':
      return (
        <Badge
          variant='outline'
          className='border-gray-200 bg-gray-50 text-gray-700'
        >
          Hoàn thành
        </Badge>
      );
    case 'canceled':
      return (
        <Badge
          variant='outline'
          className='border-gray-200 bg-gray-50 text-gray-700'
        >
          Đã hủy
        </Badge>
      );
    default:
      return <Badge variant='outline'>-</Badge>;
  }
}

export function getPhaseStatusBadge(status?: string | null) {
  switch (status) {
    case 'preparing':
      return (
        <Badge
          variant='outline'
          className='border-yellow-200 bg-yellow-50 text-yellow-700'
        >
          Chuẩn bị
        </Badge>
      );
    case 'delivering':
      return (
        <Badge
          variant='outline'
          className='border-blue-200 bg-blue-50 text-blue-700'
        >
          Đang giao
        </Badge>
      );
    case 'delivered':
      return (
        <Badge
          variant='outline'
          className='border-purple-200 bg-purple-50 text-purple-700'
        >
          Đã giao
        </Badge>
      );
    case 'completed':
      return (
        <Badge
          variant='outline'
          className='border-green-200 bg-green-50 text-green-700'
        >
          Hoàn thành
        </Badge>
      );
    case 'canceled':
      return (
        <Badge
          variant='outline'
          className='border-gray-200 bg-gray-50 text-gray-700'
        >
          Đã hủy
        </Badge>
      );
    default:
      return <Badge variant='outline'>-</Badge>;
  }
}

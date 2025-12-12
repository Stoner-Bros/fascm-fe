import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { OrderSchedule } from '@/types/order';
import { formatDateTime } from '../../utils/formatting';
import { getOrderStatusBadge } from '../../utils/status-badges';

interface OrderInfoCardProps {
  schedule: OrderSchedule;
}

export function OrderInfoCard({ schedule }: OrderInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin chung</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div>
            <Label className='text-muted-foreground text-sm'>Trạng thái</Label>
            <div className='mt-2'>{getOrderStatusBadge(schedule.status)}</div>
          </div>
          <div>
            <Label className='text-muted-foreground text-sm'>
              Ngày giao hàng
            </Label>
            <p className='mt-2 font-medium'>
              {formatDateTime(schedule.deliveryDate)}
            </p>
          </div>
        </div>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div>
            <Label className='text-muted-foreground text-sm'>Khách hàng</Label>
            <p className='mt-2 font-medium'>
              {schedule.consignee?.organizationName || '-'}
            </p>
          </div>
          <div>
            <Label className='text-muted-foreground text-sm'>
              Địa chỉ giao hàng
            </Label>
            <p className='mt-2 font-medium'>{schedule.address || '-'}</p>
          </div>
        </div>
        {schedule.description && (
          <div>
            <Label className='text-muted-foreground text-sm'>Mô tả</Label>
            <p className='mt-2'>{schedule.description}</p>
          </div>
        )}
        {schedule.reason && (
          <div>
            <Label className='text-muted-foreground text-sm'>
              Lý do từ chối
            </Label>
            <p className='text-destructive mt-2'>{schedule.reason}</p>
          </div>
        )}
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div>
            <Label className='text-muted-foreground text-sm'>Ngày tạo</Label>
            <p className='mt-2 font-medium'>
              {formatDateTime(schedule.createdAt)}
            </p>
          </div>
          <div>
            <Label className='text-muted-foreground text-sm'>
              Cập nhật lần cuối
            </Label>
            <p className='mt-2 font-medium'>
              {formatDateTime(schedule.updatedAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

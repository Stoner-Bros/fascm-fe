'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { OrderSchedule } from '@/types/order';
import { Calendar, CheckCircle2, MapPin, RefreshCw, User } from 'lucide-react';

interface ScheduleSelectorProps {
  schedules: OrderSchedule[];
  selectedSchedule: OrderSchedule | null;
  loading: boolean;
  error: string | null;
  onSelect: (schedule: OrderSchedule) => void;
  onRefresh: () => void;
  onNext: () => void;
}

export function ScheduleSelector({
  schedules,
  selectedSchedule,
  loading,
  error,
  onSelect,
  onRefresh,
  onNext
}: ScheduleSelectorProps) {
  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-6 w-48' />
          <Skeleton className='h-9 w-24' />
        </div>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className='h-40 rounded-lg' />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className='border-destructive'>
        <CardContent className='flex flex-col items-center justify-center py-10'>
          <p className='text-destructive mb-4'>{error}</p>
          <Button variant='outline' onClick={onRefresh}>
            <RefreshCw className='mr-2 h-4 w-4' />
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (schedules.length === 0) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-10'>
          <Calendar className='text-muted-foreground mb-4 h-12 w-12' />
          <p className='text-muted-foreground mb-4'>
            Không có lịch giao hàng nào đang xử lý
          </p>
          <Button variant='outline' onClick={onRefresh}>
            <RefreshCw className='mr-2 h-4 w-4' />
            Tải lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold'>Chọn lịch giao hàng</h3>
          <p className='text-muted-foreground text-sm'>
            Chọn một lịch giao hàng để tiếp tục
          </p>
        </div>
        <Button variant='outline' size='sm' onClick={onRefresh}>
          <RefreshCw className='mr-2 h-4 w-4' />
          Tải lại
        </Button>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {schedules.map((schedule) => {
          const isSelected = selectedSchedule?.id === schedule.id;

          return (
            <Card
              key={schedule.id}
              className={cn(
                'hover:border-primary/50 cursor-pointer transition-all hover:shadow-md',
                isSelected && 'border-primary ring-primary/20 ring-2'
              )}
              onClick={() => onSelect(schedule)}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-base'>
                    Lịch #{schedule.id.slice(0, 11)}
                  </CardTitle>
                  <Badge variant='secondary'>{schedule.status}</Badge>
                </div>
                <CardDescription className='line-clamp-2'>
                  {schedule.description || 'Không có mô tả'}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='flex items-center gap-2 text-sm'>
                  <Calendar className='text-muted-foreground h-4 w-4' />
                  <span>Ngày giao: {formatDate(schedule.deliveryDate)}</span>
                </div>
                {schedule.consignee && (
                  <div className='flex items-center gap-2 text-sm'>
                    <User className='text-muted-foreground h-4 w-4' />
                    <span className='truncate'>
                      {schedule.consignee.organizationName ||
                        schedule.consignee.representativeName ||
                        '-'}
                    </span>
                  </div>
                )}
                {schedule.address && (
                  <div className='flex items-center gap-2 text-sm'>
                    <MapPin className='text-muted-foreground h-4 w-4' />
                    <span className='line-clamp-1'>{schedule.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedSchedule && (
        <div className='flex justify-end pt-4'>
          <Button onClick={onNext}>Tiếp tục</Button>
        </div>
      )}
    </div>
  );
}

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderSchedule, OrderScheduleStatus } from '@/types/order';
import { cn } from '@/lib/utils';
import { Calendar, ChevronRight, RefreshCw, Search, Truck } from 'lucide-react';

interface ScheduleListPaneProps {
  schedules: OrderSchedule[];
  loading: boolean;
  selectedScheduleId: string | null;
  searchQuery: string;
  statusFilter: OrderScheduleStatus | 'all';
  page: number;
  pageCount: number;
  limit: number;
  hasNextPage: boolean;
  onSelectSchedule: (id: string) => void;
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: OrderScheduleStatus | 'all') => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

const statusConfig: Record<
  OrderScheduleStatus | 'all',
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  all: { label: 'Tất cả', variant: 'outline' },
  pending: { label: 'Chờ duyệt', variant: 'secondary' },
  approved: { label: 'Đã duyệt', variant: 'default' },
  processing: { label: 'Đang xử lý', variant: 'default' },
  completed: { label: 'Hoàn thành', variant: 'default' },
  rejected: { label: 'Từ chối', variant: 'destructive' },
  canceled: { label: 'Đã hủy', variant: 'destructive' }
};

function formatDate(date: string | Date | undefined | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function ScheduleCardSkeleton() {
  return (
    <div className='space-y-2 rounded-md border p-3'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-4 w-20' />
        <Skeleton className='h-4 w-14' />
      </div>
      <Skeleton className='h-4 w-full' />
      <div className='flex items-center gap-3'>
        <Skeleton className='h-3 w-16' />
        <Skeleton className='h-3 w-20' />
      </div>
    </div>
  );
}

export function ScheduleListPane({
  schedules,
  loading,
  selectedScheduleId,
  searchQuery,
  statusFilter,
  page,
  pageCount,
  limit,
  hasNextPage,
  onSelectSchedule,
  onSearchChange,
  onStatusFilterChange,
  onPageChange,
  onRefresh
}: ScheduleListPaneProps) {
  return (
    <Card className='flex h-full flex-col'>
      <CardHeader className='flex-shrink-0 space-y-1.5'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-1.5 text-base'>
            <Truck className='h-4 w-4' />
            Lịch giao hàng
          </CardTitle>
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7'
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={cn('h-3.5 w-3.5', loading && 'animate-spin')}
            />
          </Button>
        </div>

        {/* Search */}
        <div className='relative'>
          <Search className='text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2' />
          <Input
            placeholder='Tìm kiếm...'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className='h-8 pl-8 text-sm'
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className='h-8 text-sm'>
            <SelectValue placeholder='Lọc theo trạng thái' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Tất cả trạng thái</SelectItem>
            <SelectItem value='processing'>Đang xử lý</SelectItem>
            <SelectItem value='approved'>Đã duyệt</SelectItem>
            <SelectItem value='pending'>Chờ duyệt</SelectItem>
            <SelectItem value='completed'>Hoàn thành</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className='flex-1 overflow-y-auto px-3 py-0'>
        <div className='space-y-1.5 pb-3'>
          {loading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <ScheduleCardSkeleton key={i} />
            ))
          ) : schedules.length === 0 ? (
            // Empty state
            <div className='flex flex-col items-center justify-center py-8 text-center'>
              <Truck className='text-muted-foreground mb-2 h-10 w-10' />
              <p className='text-muted-foreground text-xs'>
                Không có lịch giao hàng nào
              </p>
              <Button
                variant='outline'
                size='sm'
                className='mt-2 h-7 text-xs'
                onClick={onRefresh}
              >
                Tải lại
              </Button>
            </div>
          ) : (
            // Schedule list
            schedules.map((schedule) => {
              const isSelected = schedule.id === selectedScheduleId;
              const status = schedule.status || 'pending';
              const hasProducts = (schedule.orderDetails?.length || 0) > 0;

              return (
                <button
                  key={schedule.id}
                  onClick={() => onSelectSchedule(schedule.id)}
                  className={cn(
                    'hover:border-primary/50 hover:bg-accent/50 w-full cursor-pointer rounded-md border p-2.5 text-left transition-all',
                    isSelected && 'border-primary bg-accent ring-primary ring-1'
                  )}
                >
                  <div className='flex items-start justify-between gap-1.5'>
                    <div className='min-w-0 flex-1'>
                      {/* Header */}
                      <div className='mb-1 flex items-center gap-1.5'>
                        <span className='text-muted-foreground font-mono text-[10px]'>
                          #{schedule.id.slice(0, 11).toUpperCase()}
                        </span>
                        <Badge
                          variant={statusConfig[status]?.variant || 'outline'}
                          className='px-1.5 py-0 text-[10px]'
                        >
                          {statusConfig[status]?.label || status}
                        </Badge>
                      </div>

                      {/* Customer Name */}
                      {schedule.consignee?.organizationName && (
                        <p className='truncate text-sm leading-tight font-medium'>
                          {schedule.consignee.organizationName}
                        </p>
                      )}

                      {/* Description */}
                      {schedule.description && (
                        <p className='text-muted-foreground mb-1 line-clamp-1 text-xs'>
                          {schedule.description}
                        </p>
                      )}

                      {/* Meta info */}
                      <div className='text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px]'>
                        {schedule.deliveryDate && (
                          <span className='flex items-center gap-0.5'>
                            <Calendar className='h-2.5 w-2.5' />
                            {formatDate(schedule.deliveryDate)}
                          </span>
                        )}
                        {hasProducts && (
                          <span className='flex items-center gap-0.5'>
                            {schedule.orderDetails?.length} SP
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight
                      className={cn(
                        'text-muted-foreground h-4 w-4 flex-shrink-0 transition-transform',
                        isSelected && 'text-primary rotate-90'
                      )}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </CardContent>

      {/* Footer with pagination */}
      {!loading && schedules.length > 0 && (
        <div className='border-t px-3 py-2'>
          <div className='flex items-center justify-between'>
            <p className='text-muted-foreground text-[10px]'>
              Hiển thị {schedules.length} lịch
            </p>
            {(hasNextPage || page > 1) && (
              <Pagination className='m-0'>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href='#'
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) {
                          onPageChange(page - 1);
                        }
                      }}
                      className={cn(
                        page === 1 && 'pointer-events-none opacity-50'
                      )}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
                    let pageNum: number;
                    if (pageCount <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= pageCount - 2) {
                      pageNum = pageCount - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href='#'
                          onClick={(e) => {
                            e.preventDefault();
                            onPageChange(pageNum);
                          }}
                          isActive={pageNum === page}
                          className='h-7 w-7 text-[10px]'
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href='#'
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < pageCount) {
                          onPageChange(page + 1);
                        }
                      }}
                      className={cn(
                        page >= pageCount && 'pointer-events-none opacity-50'
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

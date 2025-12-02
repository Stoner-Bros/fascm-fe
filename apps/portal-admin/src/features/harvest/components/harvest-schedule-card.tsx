'use client';

import type { HarvestSchedule } from '@/types/harvest-schedule';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IconArrowRight } from '@tabler/icons-react';

interface HarvestScheduleCardProps {
  schedule: HarvestSchedule;
}

export function HarvestScheduleCard({ schedule }: HarvestScheduleCardProps) {
  // Chuẩn hóa status về lowercase và default pending
  const normalizeStatus = (status?: string | null): string => {
    if (!status || status.trim() === '') return 'pending';
    return status.toLowerCase().trim();
  };

  const getStatusLabel = (status?: string | null) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case 'pending':
        return 'Chờ duyệt đơn';
      case 'rejected':
        return 'Đã từ chối đơn';
      case 'approved':
        return 'Đã duyệt đơn';
      case 'preparing':
        return 'Chuẩn đi lấy';
      case 'delivering':
        return 'Đang đi lấy';
      case 'delivered':
        return 'Đã lấy';
      case 'completed':
        return 'Đã hoàn thành';
      case 'canceled':
        return 'Đã hủy đơn';
      default:
        return normalized || 'Chờ duyệt đơn';
    }
  };

  const getStatusBadgeVariant = (status?: string | null) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case 'pending':
        return 'secondary';
      case 'approved':
        return 'default';
      case 'preparing':
        return 'default';
      case 'delivering':
        return 'default';
      case 'delivered':
        return 'default';
      case 'completed':
        return 'default';
      case 'rejected':
      case 'canceled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status?: string | null) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'approved':
        return 'text-green-600 dark:text-green-400';
      case 'preparing':
        return 'text-blue-600 dark:text-blue-400';
      case 'delivering':
        return 'text-purple-600 dark:text-purple-400';
      case 'delivered':
        return 'text-indigo-600 dark:text-indigo-400';
      case 'completed':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'rejected':
        return 'text-red-600 dark:text-red-400';
      case 'canceled':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  const formatDate = (date?: string | Date | null) => {
    if (!date) return 'Chưa có ngày';
    try {
      return format(new Date(date), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return 'Ngày không hợp lệ';
    }
  };

  return (
    <Card className='transition-shadow hover:shadow-lg'>
      <CardHeader>
        <div className='flex items-start justify-between'>
          <div className='space-y-1'>
            <CardTitle className='text-lg'>ID: {schedule.id}</CardTitle>
            <CardDescription>
              {schedule.description || 'Không có mô tả'}
            </CardDescription>
          </div>
          <Badge
            variant={getStatusBadgeVariant(schedule.status)}
            className={`font-semibold ${getStatusColor(schedule.status)}`}
          >
            {getStatusLabel(schedule.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2 text-sm'>
          <div>
            <span className='text-muted-foreground'>Ngày thu hoạch: </span>
            <span className='font-medium'>
              {formatDate(schedule.harvestDate)}
            </span>
          </div>
          {schedule.supplierId && (
            <div>
              <span className='text-muted-foreground'>Supplier Garden: </span>
              <span className='font-medium'>
                {schedule.supplierId?.gardenName}
              </span>
            </div>
          )}
          {schedule.createdAt && (
            <div>
              <span className='text-muted-foreground'>Ngày tạo: </span>
              <span className='font-medium'>
                {formatDate(schedule.createdAt)}
              </span>
            </div>
          )}
        </div>
        <Link href={`/dashboard/harvest/${schedule.id}`}>
          <Button variant='outline' className='w-full'>
            Xem chi tiết
            <IconArrowRight className='ml-2 h-4 w-4' />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

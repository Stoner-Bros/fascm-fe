'use client';

import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { fetchHarvestSchedules } from '@/services/harvest-schedule.service';
import type {
  HarvestSchedule,
  HarvestScheduleStatus
} from '@/types/harvest-schedule';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function getStatusBadge(status?: HarvestScheduleStatus | null) {
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

export default function OrderPurchasePage() {
  const [schedules, setSchedules] = useState<HarvestSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const loadSchedules = async (pageNum: number) => {
    setLoading(true);
    try {
      const response = await fetchHarvestSchedules({
        page: pageNum,
        limit,
        sort: 'desc'
      });
      setSchedules(response.data);
      setHasMore(response.hasNextPage ?? false);
    } catch (error) {
      console.error('Failed to load harvest schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules(page);
  }, [page]);

  const handlePreviousPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (hasMore) setPage(page + 1);
  };

  return (
    <PageContainer>
      <div className='mx-auto w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Lịch thu hoạch</h1>
            <p className='text-muted-foreground mt-1'>
              Quản lý các lịch thu hoạch từ nhà cung cấp
            </p>
          </div>
        </div>

        <div className='bg-card rounded-lg border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã lịch</TableHead>
                <TableHead>Nhà cung cấp</TableHead>
                <TableHead>Ngày thu hoạch</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className='text-right'>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className='py-8 text-center'>
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : schedules.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className='text-muted-foreground py-8 text-center'
                  >
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className='font-medium'>
                      {schedule.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-col'>
                        <span className='font-medium'>
                          {schedule.supplier?.gardenName || '-'}
                        </span>
                        {schedule.supplier?.address && (
                          <span className='text-muted-foreground text-sm'>
                            {schedule.supplier.address}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {schedule.harvestDate
                        ? new Date(schedule.harvestDate).toLocaleDateString(
                            'vi-VN',
                            {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            }
                          )
                        : '-'}
                    </TableCell>
                    <TableCell>{schedule.address || '-'}</TableCell>
                    <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                    <TableCell className='text-right'>
                      <Button asChild size='sm' variant='outline'>
                        <Link href={`/dashboard/harvest/${schedule.id}`}>
                          Chi tiết
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className='flex items-center justify-between'>
          <p className='text-muted-foreground text-sm'>
            Trang {page} {hasMore ? '- có thêm dữ liệu' : '- hết dữ liệu'}
          </p>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handlePreviousPage}
              disabled={page === 1 || loading}
            >
              Trang trước
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={handleNextPage}
              disabled={!hasMore || loading}
            >
              Trang sau
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

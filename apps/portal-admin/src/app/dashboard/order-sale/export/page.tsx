'use client';

import PageContainer from '@/components/layout/page-container';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useExportTickets } from '@/features/order-sale/export/hooks';
import { Calendar, FileOutput, Plus, RefreshCw, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ExportTicketsPage() {
  const {
    tickets,
    loadingFetch,
    loadingDelete,
    hasNextPage,
    loadETickets,
    deleteETicket
  } = useExportTickets();

  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <PageContainer>
      <div className='mx-auto w-full space-y-6'>
        {/* Header */}
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Phiếu xuất kho</h1>
            <p className='text-muted-foreground mt-1'>
              Quản lý các phiếu xuất hàng từ kho
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              onClick={loadETickets}
              disabled={loadingFetch}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loadingFetch ? 'animate-spin' : ''}`}
              />
              Tải lại
            </Button>
            {/* <Link href='/dashboard/order-sale/export/create'>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                Tạo phiếu xuất
              </Button>
            </Link> */}
          </div>
        </div>

        {/* Stats cards */}
        <div className='grid gap-4 md:grid-cols-3'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Tổng phiếu</CardTitle>
              <FileOutput className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{tickets.length}</div>
              <p className='text-muted-foreground text-xs'>
                Số phiếu xuất kho hiện có
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Hôm nay</CardTitle>
              <Calendar className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {
                  tickets.filter((t) => {
                    const today = new Date();
                    const ticketDate = new Date(t.createdAt);
                    return (
                      ticketDate.getDate() === today.getDate() &&
                      ticketDate.getMonth() === today.getMonth() &&
                      ticketDate.getFullYear() === today.getFullYear()
                    );
                  }).length
                }
              </div>
              <p className='text-muted-foreground text-xs'>
                Phiếu tạo trong ngày
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Tuần này</CardTitle>
              <Calendar className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {
                  tickets.filter((t) => {
                    const today = new Date();
                    const ticketDate = new Date(t.createdAt);
                    const weekAgo = new Date(today);
                    weekAgo.setDate(today.getDate() - 7);
                    return ticketDate >= weekAgo;
                  }).length
                }
              </div>
              <p className='text-muted-foreground text-xs'>
                Phiếu tạo trong 7 ngày
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách phiếu xuất kho</CardTitle>
            <CardDescription>
              Hiển thị tất cả phiếu xuất hàng từ kho
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='rounded-lg border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã phiếu</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Cập nhật</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className='text-right'>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingFetch ? (
                    // Loading state
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className='h-4 w-24' />
                        </TableCell>
                        <TableCell>
                          <Skeleton className='h-4 w-32' />
                        </TableCell>
                        <TableCell>
                          <Skeleton className='h-4 w-32' />
                        </TableCell>
                        <TableCell>
                          <Skeleton className='h-5 w-20' />
                        </TableCell>
                        <TableCell className='text-right'>
                          <Skeleton className='ml-auto h-8 w-8' />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : tickets.length === 0 ? (
                    // Empty state
                    <TableRow>
                      <TableCell colSpan={5} className='py-12 text-center'>
                        <div className='flex flex-col items-center gap-2'>
                          <FileOutput className='text-muted-foreground h-10 w-10' />
                          <p className='text-muted-foreground'>
                            Chưa có phiếu xuất kho nào
                          </p>
                          <Link href='/dashboard/order-sale/export/create'>
                            <Button
                              variant='outline'
                              size='sm'
                              className='mt-2'
                            >
                              <Plus className='mr-2 h-4 w-4' />
                              Tạo phiếu đầu tiên
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    // Data rows
                    tickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className='font-mono text-sm'>
                          {ticket.id.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Calendar className='text-muted-foreground h-4 w-4' />
                            <span>{formatDate(ticket.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className='text-muted-foreground'>
                            {formatDate(ticket.updatedAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant='default'>Đã tạo</Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => deleteETicket(ticket.id)}
                            disabled={loadingDelete}
                          >
                            <Trash2 className='text-destructive h-4 w-4' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination info */}
            {!loadingFetch && tickets.length > 0 && (
              <div className='text-muted-foreground mt-4 flex items-center justify-between text-sm'>
                <span>Hiển thị {tickets.length} phiếu</span>
                {hasNextPage && (
                  <span className='text-primary'>Còn thêm dữ liệu...</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

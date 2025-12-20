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
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { ExportTable } from '@/features/order-sale/export/components';
import { useExportTickets } from '@/features/order-sale/export/hooks';
import { Calendar, FileOutput, Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function ExportTicketsPage() {
  const {
    tickets,
    loadingFetch,
    loadingDelete,
    hasNextPage,
    page,
    setPage,
    limit,
    pageCount,
    loadETickets,
    deleteETicket
  } = useExportTickets();

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
            {loadingFetch ? (
              <DataTableSkeleton columnCount={5} rowCount={10} />
            ) : tickets.length === 0 ? (
              <div className='text-muted-foreground rounded-md border p-6 text-center text-sm'>
                <div className='flex flex-col items-center gap-2'>
                  <FileOutput className='h-10 w-10' />
                  <p>Chưa có phiếu xuất kho nào</p>
                  <Link href='/dashboard/order-sale/export/create'>
                    <Button variant='outline' size='sm' className='mt-2'>
                      <Plus className='mr-2 h-4 w-4' />
                      Tạo phiếu đầu tiên
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <ExportTable
                loading={loadingFetch}
                tickets={tickets}
                page={page ?? 1}
                limit={limit ?? 10}
                pageCount={pageCount}
                onPageChange={setPage}
                onDeleteTicket={deleteETicket}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

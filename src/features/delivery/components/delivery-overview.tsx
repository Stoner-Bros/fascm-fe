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
import {
  IconActivity,
  IconArrowRight,
  IconBuilding,
  IconClock,
  IconHome,
  IconTruck
} from '@tabler/icons-react';
import Link from 'next/link';

export function DeliveryOverview() {
  const deliveryStats = {
    inbound: {
      total: 15,
      inTransit: 8,
      completed: 5,
      delayed: 2
    },
    outbound: {
      total: 22,
      inTransit: 12,
      completed: 8,
      delayed: 2
    }
  };

  return (
    <div className='w-full space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-3xl font-bold tracking-tight'>
            <IconTruck className='h-8 w-8 text-blue-600' />
            Quản lý Vận chuyển
          </h1>
          <p className='text-muted-foreground'>
            Tổng quan và quản lý các đợt vận chuyển nhập kho và xuất kho
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tổng Inbound</CardTitle>
            <IconHome className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {deliveryStats.inbound.total}
            </div>
            <p className='text-muted-foreground text-xs'>
              vận chuyển vườn → kho
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tổng Outbound</CardTitle>
            <IconBuilding className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {deliveryStats.outbound.total}
            </div>
            <p className='text-muted-foreground text-xs'>
              vận chuyển kho → phân phối
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Đang vận chuyển
            </CardTitle>
            <IconActivity className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {deliveryStats.inbound.inTransit +
                deliveryStats.outbound.inTransit}
            </div>
            <p className='text-muted-foreground text-xs'>
              tổng cộng trên đường
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Chậm trễ</CardTitle>
            <IconClock className='h-4 w-4 text-red-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {deliveryStats.inbound.delayed + deliveryStats.outbound.delayed}
            </div>
            <p className='text-muted-foreground text-xs'>cần xử lý gấp</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Cards */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Inbound Delivery */}
        <Card className='cursor-pointer transition-shadow hover:shadow-lg'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='rounded-lg bg-green-100 p-2'>
                  <IconHome className='h-6 w-6 text-green-600' />
                </div>
                <div>
                  <CardTitle className='text-xl'>Nhập kho (Inbound)</CardTitle>
                  <CardDescription>Vận chuyển từ vườn về kho</CardDescription>
                </div>
              </div>
              <Badge
                variant='outline'
                className='border-green-200 bg-green-50 text-green-700'
              >
                {deliveryStats.inbound.inTransit} đang chuyển
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-3 gap-4 text-center'>
              <div>
                <div className='text-lg font-bold text-green-600'>
                  {deliveryStats.inbound.completed}
                </div>
                <div className='text-muted-foreground text-xs'>Hoàn thành</div>
              </div>
              <div>
                <div className='text-lg font-bold text-blue-600'>
                  {deliveryStats.inbound.inTransit}
                </div>
                <div className='text-muted-foreground text-xs'>Đang chuyển</div>
              </div>
              <div>
                <div className='text-lg font-bold text-red-600'>
                  {deliveryStats.inbound.delayed}
                </div>
                <div className='text-muted-foreground text-xs'>Chậm trễ</div>
              </div>
            </div>
            <div className='pt-2'>
              <Link href='/dashboard/delivery/inbound'>
                <Button className='w-full'>
                  Quản lý Inbound
                  <IconArrowRight className='ml-2 h-4 w-4' />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Outbound Delivery */}
        <Card className='cursor-pointer transition-shadow hover:shadow-lg'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='rounded-lg bg-blue-100 p-2'>
                  <IconBuilding className='h-6 w-6 text-blue-600' />
                </div>
                <div>
                  <CardTitle className='text-xl'>Xuất kho (Outbound)</CardTitle>
                  <CardDescription>
                    Vận chuyển từ kho ra phân phối
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant='outline'
                className='border-blue-200 bg-blue-50 text-blue-700'
              >
                {deliveryStats.outbound.inTransit} đang chuyển
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-3 gap-4 text-center'>
              <div>
                <div className='text-lg font-bold text-green-600'>
                  {deliveryStats.outbound.completed}
                </div>
                <div className='text-muted-foreground text-xs'>Hoàn thành</div>
              </div>
              <div>
                <div className='text-lg font-bold text-blue-600'>
                  {deliveryStats.outbound.inTransit}
                </div>
                <div className='text-muted-foreground text-xs'>Đang chuyển</div>
              </div>
              <div>
                <div className='text-lg font-bold text-red-600'>
                  {deliveryStats.outbound.delayed}
                </div>
                <div className='text-muted-foreground text-xs'>Chậm trễ</div>
              </div>
            </div>
            <div className='pt-2'>
              <Link href='/dashboard/delivery/outbound'>
                <Button className='w-full' variant='outline'>
                  Quản lý Outbound
                  <IconArrowRight className='ml-2 h-4 w-4' />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <CardDescription>Các sự kiện và cập nhật mới nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center gap-3 rounded-lg border-l-4 border-green-500 bg-green-50 p-3'>
              <IconHome className='h-5 w-5 text-green-600' />
              <div className='flex-1'>
                <p className='font-medium'>Inbound IN-2024-001 đã hoàn thành</p>
                <p className='text-muted-foreground text-sm'>
                  500kg rau lá tươi từ Vườn Organic A đã được nhập kho thành
                  công
                </p>
              </div>
              <span className='text-muted-foreground text-xs'>
                2 phút trước
              </span>
            </div>

            <div className='flex items-center gap-3 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3'>
              <IconBuilding className='h-5 w-5 text-blue-600' />
              <div className='flex-1'>
                <p className='font-medium'>
                  Outbound OUT-2024-015 đang vận chuyển
                </p>
                <p className='text-muted-foreground text-sm'>
                  800kg hoa quả đông lạnh đang trên đường đến Siêu thị BigC
                </p>
              </div>
              <span className='text-muted-foreground text-xs'>
                15 phút trước
              </span>
            </div>

            <div className='flex items-center gap-3 rounded-lg border-l-4 border-red-500 bg-red-50 p-3'>
              <IconClock className='h-5 w-5 text-red-600' />
              <div className='flex-1'>
                <p className='font-medium'>
                  Cảnh báo: Inbound IN-2024-003 chậm trễ
                </p>
                <p className='text-muted-foreground text-sm'>
                  Đợt vận chuyển từ Vườn B đã trễ hơn 2 giờ so với dự kiến
                </p>
              </div>
              <span className='text-muted-foreground text-xs'>1 giờ trước</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

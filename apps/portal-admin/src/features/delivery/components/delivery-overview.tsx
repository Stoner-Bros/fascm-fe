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
import { useTranslations } from 'next-intl';

export function DeliveryOverview() {
  const t = useTranslations('Delivery');
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
            {t('title')}
          </h1>
          <p className='text-muted-foreground'>{t('description')}</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('stats.totalInbound')}
            </CardTitle>
            <IconHome className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {deliveryStats.inbound.total}
            </div>
            <p className='text-muted-foreground text-xs'>
              {t('stats.farmToWarehouse')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('stats.totalOutbound')}
            </CardTitle>
            <IconBuilding className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {deliveryStats.outbound.total}
            </div>
            <p className='text-muted-foreground text-xs'>
              {t('stats.warehouseToDistribution')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('stats.inTransit')}
            </CardTitle>
            <IconActivity className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>
              {deliveryStats.inbound.inTransit +
                deliveryStats.outbound.inTransit}
            </div>
            <p className='text-muted-foreground text-xs'>
              {t('stats.totalOnRoad')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('stats.delayed')}
            </CardTitle>
            <IconClock className='h-4 w-4 text-red-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-red-600'>
              {deliveryStats.inbound.delayed + deliveryStats.outbound.delayed}
            </div>
            <p className='text-muted-foreground text-xs'>
              {t('stats.needsUrgentAction')}
            </p>
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
                  <CardTitle className='text-xl'>
                    {t('inbound.title')}
                  </CardTitle>
                  <CardDescription>{t('inbound.subtitle')}</CardDescription>
                </div>
              </div>
              <Badge
                variant='outline'
                className='border-green-200 bg-green-50 text-green-700'
              >
                {deliveryStats.inbound.inTransit} {t('inbound.inTransitBadge')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-3 gap-4 text-center'>
              <div>
                <div className='text-lg font-bold text-green-600'>
                  {deliveryStats.inbound.completed}
                </div>
                <div className='text-muted-foreground text-xs'>
                  {t('status.completed')}
                </div>
              </div>
              <div>
                <div className='text-lg font-bold text-blue-600'>
                  {deliveryStats.inbound.inTransit}
                </div>
                <div className='text-muted-foreground text-xs'>
                  {t('status.inTransit')}
                </div>
              </div>
              <div>
                <div className='text-lg font-bold text-red-600'>
                  {deliveryStats.inbound.delayed}
                </div>
                <div className='text-muted-foreground text-xs'>
                  {t('status.delayed')}
                </div>
              </div>
            </div>
            <div className='pt-2'>
              <Link href='/dashboard/delivery/inbound'>
                <Button className='w-full'>
                  {t('inbound.manage')}
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
                  <CardTitle className='text-xl'>
                    {t('outbound.title')}
                  </CardTitle>
                  <CardDescription>{t('outbound.subtitle')}</CardDescription>
                </div>
              </div>
              <Badge
                variant='outline'
                className='border-blue-200 bg-blue-50 text-blue-700'
              >
                {deliveryStats.outbound.inTransit}{' '}
                {t('outbound.inTransitBadge')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-3 gap-4 text-center'>
              <div>
                <div className='text-lg font-bold text-green-600'>
                  {deliveryStats.outbound.completed}
                </div>
                <div className='text-muted-foreground text-xs'>
                  {t('status.completed')}
                </div>
              </div>
              <div>
                <div className='text-lg font-bold text-blue-600'>
                  {deliveryStats.outbound.inTransit}
                </div>
                <div className='text-muted-foreground text-xs'>
                  {t('status.inTransit')}
                </div>
              </div>
              <div>
                <div className='text-lg font-bold text-red-600'>
                  {deliveryStats.outbound.delayed}
                </div>
                <div className='text-muted-foreground text-xs'>
                  {t('status.delayed')}
                </div>
              </div>
            </div>
            <div className='pt-2'>
              <Link href='/dashboard/delivery/outbound'>
                <Button className='w-full' variant='outline'>
                  {t('outbound.manage')}
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
          <CardTitle>{t('recentActivities.title')}</CardTitle>
          <CardDescription>{t('recentActivities.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center gap-3 rounded-lg border-l-4 border-green-500 bg-green-50 p-3'>
              <IconHome className='h-5 w-5 text-green-600' />
              <div className='flex-1'>
                <p className='font-medium'>{t('recentActivities.activity1')}</p>
                <p className='text-muted-foreground text-sm'>
                  {t('recentActivities.activity1Details')}
                </p>
              </div>
              <span className='text-muted-foreground text-xs'>
                {t('recentActivities.timeAgo.minutes', { count: 2 })}
              </span>
            </div>

            <div className='flex items-center gap-3 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3'>
              <IconBuilding className='h-5 w-5 text-blue-600' />
              <div className='flex-1'>
                <p className='font-medium'>{t('recentActivities.activity2')}</p>
                <p className='text-muted-foreground text-sm'>
                  {t('recentActivities.activity2Details')}
                </p>
              </div>
              <span className='text-muted-foreground text-xs'>
                {t('recentActivities.timeAgo.minutes', { count: 15 })}
              </span>
            </div>

            <div className='flex items-center gap-3 rounded-lg border-l-4 border-red-500 bg-red-50 p-3'>
              <IconClock className='h-5 w-5 text-red-600' />
              <div className='flex-1'>
                <p className='font-medium'>{t('recentActivities.activity3')}</p>
                <p className='text-muted-foreground text-sm'>
                  {t('recentActivities.activity3Details')}
                </p>
              </div>
              <span className='text-muted-foreground text-xs'>
                {t('recentActivities.timeAgo.hour')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

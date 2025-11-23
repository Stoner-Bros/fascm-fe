import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  IconCheck,
  IconClock,
  IconPackage,
  IconTrendingUp,
  IconTruck
} from '@tabler/icons-react';
import Link from 'next/link';

export default function SupplierDashboardFeature() {
  return (
    <PageContainer>
      <div className='flex w-full flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Hi, Welcome back 👋
          </h2>
          <div className='flex items-center space-x-2'>
            <Link href='/supplier/harvest-batches/new'>
              <Button>
                <IconPackage className='mr-2 h-4 w-4' />
                New Harvest Batch
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Total Batches</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                45
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp className='h-3 w-3' />
                  +12.5%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Trending up this month <IconTrendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                Total harvest batches created
              </div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Pending Pickup</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                8
              </CardTitle>
              <CardAction>
                <Badge variant='outline' className='bg-yellow-50'>
                  <IconClock className='h-3 w-3' />
                  Pending
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Awaiting pickup <IconClock className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                Batches ready for collection
              </div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>In Transit</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                12
              </CardTitle>
              <CardAction>
                <Badge variant='outline' className='bg-blue-50'>
                  <IconTruck className='h-3 w-3' />
                  Active
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Currently in delivery <IconTruck className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                Batches being transported
              </div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Completed</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                25
              </CardTitle>
              <CardAction>
                <Badge variant='outline' className='bg-green-50'>
                  <IconCheck className='h-3 w-3' />
                  Done
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Successfully delivered <IconCheck className='size-4' />
              </div>
              <div className='text-muted-foreground'>
                Batches delivered this month
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <Card className='col-span-4'>
            <CardHeader>
              <CardTitle>Recent Harvest Batches</CardTitle>
              <CardDescription>
                Your latest harvest batch submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {[
                  {
                    id: 'HB-001',
                    product: 'Organic Tomatoes',
                    quantity: '500 kg',
                    status: 'Pending Pickup',
                    date: '2025-10-19'
                  },
                  {
                    id: 'HB-002',
                    product: 'Fresh Carrots',
                    quantity: '300 kg',
                    status: 'In Transit',
                    date: '2025-10-18'
                  },
                  {
                    id: 'HB-003',
                    product: 'Green Lettuce',
                    quantity: '200 kg',
                    status: 'Delivered',
                    date: '2025-10-17'
                  }
                ].map((batch) => (
                  <div
                    key={batch.id}
                    className='flex items-center justify-between rounded-lg border p-4'
                  >
                    <div className='space-y-1'>
                      <p className='text-sm font-medium'>{batch.id}</p>
                      <p className='text-muted-foreground text-sm'>
                        {batch.product}
                      </p>
                      <p className='text-muted-foreground text-xs'>
                        {batch.date}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-medium'>{batch.quantity}</p>
                      <Badge
                        variant={
                          batch.status === 'Delivered'
                            ? 'default'
                            : batch.status === 'In Transit'
                              ? 'secondary'
                              : 'outline'
                        }
                        className='mt-1'
                      >
                        {batch.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Link href='/supplier/harvest-batches' className='w-full'>
                <Button variant='outline' className='w-full'>
                  View All Batches
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className='col-span-4 md:col-span-3'>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used actions</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              <Link href='/supplier/harvest-batches/new'>
                <Button variant='outline' className='w-full justify-start'>
                  <IconPackage className='mr-2 h-4 w-4' />
                  Create New Batch
                </Button>
              </Link>
              <Link href='/supplier/harvest-batches?status=pending'>
                <Button variant='outline' className='w-full justify-start'>
                  <IconClock className='mr-2 h-4 w-4' />
                  View Pending Pickups
                </Button>
              </Link>
              <Link href='/supplier/profile'>
                <Button variant='outline' className='w-full justify-start'>
                  <IconTruck className='mr-2 h-4 w-4' />
                  View Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import {
  IconTrendingUp,
  IconPackage,
  IconShoppingCart,
  IconClock,
  IconCheck,
  IconTruck,
  IconCoin
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ConsigneeDashboardFeature() {
  return (
    <PageContainer>
      <div className='flex w-full flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            Hi, Welcome back 👋
          </h2>
          <div className='flex items-center space-x-2'>
            <Link href='/consignee/products'>
              <Button variant='outline'>
                <IconPackage className='mr-2 h-4 w-4' />
                Browse Products
              </Button>
            </Link>
            <Link href='/consignee/orders/new'>
              <Button>
                <IconShoppingCart className='mr-2 h-4 w-4' />
                New Order
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Total Orders</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                128
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp className='h-3 w-3' />
                  +8.2%
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Growing this month <IconTrendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>Total orders placed</div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Pending Orders</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                12
              </CardTitle>
              <CardAction>
                <Badge
                  variant='outline'
                  className='bg-yellow-50 dark:bg-yellow-600'
                >
                  <IconClock className='h-3 w-3' />
                  Pending
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Awaiting confirmation <IconClock className='size-4' />
              </div>
              <div className='text-muted-foreground'>Orders in processing</div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>In Delivery</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                8
              </CardTitle>
              <CardAction>
                <Badge
                  variant='outline'
                  className='bg-blue-50 dark:bg-blue-600'
                >
                  <IconTruck className='h-3 w-3' />
                  Transit
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Currently shipping <IconTruck className='size-4' />
              </div>
              <div className='text-muted-foreground'>Orders en route</div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>This Month Spending</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                $45,230
              </CardTitle>
              <CardAction>
                <Badge
                  variant='outline'
                  className='bg-green-50 dark:bg-green-600'
                >
                  <IconCoin className='h-3 w-3' />
                  Budget
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                Total expenditure <IconCoin className='size-4' />
              </div>
              <div className='text-muted-foreground'>Current month total</div>
            </CardFooter>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <Card className='col-span-4'>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your latest order submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {[
                  {
                    id: 'ORD-001',
                    items: 'Organic Tomatoes, Fresh Carrots',
                    quantity: '800 kg',
                    status: 'Pending',
                    date: '2025-10-19',
                    amount: '$2,000'
                  },
                  {
                    id: 'ORD-002',
                    items: 'Green Lettuce, Cucumbers',
                    quantity: '500 kg',
                    status: 'In Delivery',
                    date: '2025-10-18',
                    amount: '$1,250'
                  },
                  {
                    id: 'ORD-003',
                    items: 'Bell Peppers, Onions',
                    quantity: '600 kg',
                    status: 'Delivered',
                    date: '2025-10-17',
                    amount: '$1,500'
                  }
                ].map((order) => (
                  <div
                    key={order.id}
                    className='flex items-center justify-between rounded-lg border p-4'
                  >
                    <div className='space-y-1'>
                      <p className='text-sm font-medium'>{order.id}</p>
                      <p className='text-muted-foreground text-sm'>
                        {order.items}
                      </p>
                      <p className='text-muted-foreground text-xs'>
                        {order.date}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-medium'>{order.amount}</p>
                      <p className='text-muted-foreground text-xs'>
                        {order.quantity}
                      </p>
                      <Badge
                        variant={
                          order.status === 'Delivered'
                            ? 'default'
                            : order.status === 'In Delivery'
                              ? 'secondary'
                              : 'outline'
                        }
                        className='mt-1'
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Link href='/consignee/orders' className='w-full'>
                <Button variant='outline' className='w-full'>
                  View All Orders
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
              <Link href='/consignee/products'>
                <Button variant='outline' className='w-full justify-start'>
                  <IconPackage className='mr-2 h-4 w-4' />
                  Browse Products
                </Button>
              </Link>
              <Link href='/consignee/orders/new'>
                <Button variant='outline' className='w-full justify-start'>
                  <IconShoppingCart className='mr-2 h-4 w-4' />
                  Create New Order
                </Button>
              </Link>
              <Link href='/consignee/deliveries'>
                <Button variant='outline' className='w-full justify-start'>
                  <IconTruck className='mr-2 h-4 w-4' />
                  Track Deliveries
                </Button>
              </Link>
              <Link href='/consignee/traceability'>
                <Button variant='outline' className='w-full justify-start'>
                  <IconCheck className='mr-2 h-4 w-4' />
                  View Traceability
                </Button>
              </Link>
              <Link href='/consignee/payments'>
                <Button variant='outline' className='w-full justify-start'>
                  <IconCoin className='mr-2 h-4 w-4' />
                  Manage Payments
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

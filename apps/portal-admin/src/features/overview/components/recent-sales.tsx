'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { getConsigneeStatistics } from '@/services/statistics.service';
import { ConsigneeStatisticsDto } from '@/types/statistics';
import { useEffect, useState } from 'react';

export function RecentSales() {
  const [data, setData] = useState<ConsigneeStatisticsDto['topConsignees']>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getConsigneeStatistics();
        setData(result.topConsignees || []);
      } catch (error) {
        console.error('Failed to fetch top consignees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card className='h-full'>
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center py-8'>
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Top Customers</CardTitle>
        <CardDescription>
          Top {data.length} customers by total order amount.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {data.map((item) => (
            <div key={item.consigneeId} className='flex items-center'>
              <Avatar className='h-9 w-9'>
                <AvatarImage src='' alt='Avatar' />
                <AvatarFallback>
                  {getInitials(item.consigneeName)}
                </AvatarFallback>
              </Avatar>
              <div className='ml-4 space-y-1'>
                <p className='text-sm leading-none font-medium'>
                  {item.consigneeName}
                </p>
                <p className='text-muted-foreground text-sm'>
                  {item.totalOrders} orders
                </p>
              </div>
              <div className='ml-auto font-medium'>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'VND'
                }).format(item.totalAmount)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function getInitials(name: string) {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

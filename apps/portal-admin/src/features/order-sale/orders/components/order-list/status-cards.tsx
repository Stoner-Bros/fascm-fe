'use client';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { IconCircleCheck } from '@tabler/icons-react';
import { Check, Clock, Truck } from 'lucide-react';
import type { StatusFilter } from '../../types/types';

type StatusCounts = {
  all: number;
  pending: number;
  rejected: number;
  approved: number;
  processing: number;
  completed: number;
  canceled: number;
};

type StatusCardsProps = {
  loading: boolean;
  statusCounts: StatusCounts;
  onSetStatusFilter: (filter: StatusFilter) => void;
  t: (key: string) => string;
};

export function StatusCards({
  loading,
  statusCounts,
  onSetStatusFilter,
  t
}: StatusCardsProps) {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-5'>
      <Card
        className='hover:border-primary cursor-pointer'
        onClick={() => onSetStatusFilter('ALL')}
      >
        <CardHeader>
          <CardDescription>{t('cards.totalOrders')}</CardDescription>
          <CardTitle className='text-3xl'>
            {loading ? (
              <div className='bg-muted h-8 w-16 animate-pulse rounded' />
            ) : (
              statusCounts.all
            )}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card
        className='hover:border-primary cursor-pointer'
        onClick={() => onSetStatusFilter('pending')}
      >
        <CardHeader>
          <CardDescription className='flex items-center gap-2'>
            <Clock className='h-4 w-4' />
            {t('cards.pending')}
          </CardDescription>
          <CardTitle className='text-3xl'>
            {loading ? (
              <div className='bg-muted h-8 w-16 animate-pulse rounded' />
            ) : (
              statusCounts.pending
            )}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card
        className='hover:border-primary cursor-pointer'
        onClick={() => onSetStatusFilter('approved')}
      >
        <CardHeader>
          <CardDescription className='flex items-center gap-2'>
            <Check className='h-4 w-4' />
            {t('cards.approved')}
          </CardDescription>
          <CardTitle className='text-3xl'>
            {loading ? (
              <div className='bg-muted h-8 w-16 animate-pulse rounded' />
            ) : (
              statusCounts.approved
            )}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card
        className='hover:border-primary cursor-pointer'
        onClick={() => onSetStatusFilter('processing')}
      >
        <CardHeader>
          <CardDescription className='flex items-center gap-2'>
            <Truck className='h-4 w-4' />
            {t('cards.processing')}
          </CardDescription>
          <CardTitle className='text-3xl'>
            {loading ? (
              <div className='bg-muted h-8 w-16 animate-pulse rounded' />
            ) : (
              statusCounts.processing
            )}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card
        className='hover:border-primary cursor-pointer'
        onClick={() => onSetStatusFilter('completed')}
      >
        <CardHeader>
          <CardDescription className='flex items-center gap-2'>
            <IconCircleCheck className='h-4 w-4' />
            {t('cards.completed')}
          </CardDescription>
          <CardTitle className='text-3xl'>
            {loading ? (
              <div className='bg-muted h-8 w-16 animate-pulse rounded' />
            ) : (
              statusCounts.completed
            )}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

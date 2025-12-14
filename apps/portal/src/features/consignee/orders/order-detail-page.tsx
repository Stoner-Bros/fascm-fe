'use client';

import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconPackage, IconTruck } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import {
  EmptyState,
  OrderHeader,
  OrderInfoCard,
  OrderItemsCard,
  OrderStatusStepper,
  PhasesList
} from './components/order-detail';
import {
  useOrderDetail,
  usePhaseActions
} from './hooks/order-detail/use-order-detail';

export default function OrderDetailPage() {
  const params = useParams();
  const t = useTranslations('Orders');
  const orderId = params?.id as string;

  const {
    orderSchedule,
    orderPhases,
    loading,
    phasesLoading,
    loadOrderPhases
  } = useOrderDetail(orderId);

  const { confirmDelivery, updatingPhaseId } = usePhaseActions(() => {
    loadOrderPhases();
  });

  if (loading) {
    return (
      <PageContainer>
        <div className='flex flex-1 flex-col items-center justify-center py-12'>
          <div className='border-primary mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
          <p className='text-muted-foreground'>{t('detail.loading')}</p>
        </div>
      </PageContainer>
    );
  }

  if (!orderSchedule) {
    return <EmptyState />;
  }

  const totalAmount =
    orderSchedule.orderDetails?.reduce(
      (sum, detail) => sum + (detail.amount || 0),
      0
    ) || 0;

  const totalQuantity =
    orderSchedule.orderDetails?.reduce(
      (sum, detail) => sum + (detail.quantity || 0),
      0
    ) || 0;

  return (
    <PageContainer>
      <div className='w-full flex-1 space-y-6'>
        <OrderHeader orderSchedule={orderSchedule} />

        <OrderStatusStepper orderSchedule={orderSchedule} />

        {/* Main Tabs */}
        <Tabs defaultValue='overview' className='w-full'>
          <TabsList className='gap-1'>
            <TabsTrigger
              value='overview'
              className='hover:border-primary flex cursor-pointer items-center gap-2 hover:bg-transparent'
            >
              <IconPackage className='h-4 w-4' />
              {t('detail.tabs.overview')}
            </TabsTrigger>
            <TabsTrigger
              value='phases'
              className='hover:border-primary flex cursor-pointer items-center gap-2 hover:bg-transparent'
            >
              <IconTruck className='h-4 w-4' />
              {t('detail.tabs.deliveryPhases')}
              {orderPhases.length > 0 && (
                <Badge variant='secondary' className='ml-1'>
                  {orderPhases.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value='overview' className='mt-6'>
            <div className='grid grid-cols-1 gap-6'>
              <OrderInfoCard
                orderSchedule={orderSchedule}
                totalQuantity={totalQuantity}
              />
              <OrderItemsCard
                orderSchedule={orderSchedule}
                totalAmount={totalAmount}
              />
            </div>
          </TabsContent>

          {/* Delivery Phases Tab */}
          <TabsContent value='phases' className='mt-6'>
            <PhasesList
              phases={orderPhases}
              orderSchedule={orderSchedule}
              loading={phasesLoading}
              onConfirmDelivery={confirmDelivery}
              isConfirming={!!updatingPhaseId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}

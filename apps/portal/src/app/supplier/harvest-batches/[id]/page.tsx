'use client';

import PageContainer from '@/components/layout/page-container';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import {
  IconArrowLeft,
  IconCalendar,
  IconCheck,
  IconEdit,
  IconMapPin,
  IconPackage,
  IconX
} from '@tabler/icons-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// Mock data - in real app, fetch based on ID
const mockBatchData = {
  id: 'HB-001',
  product: 'Organic Tomatoes',
  quantity: '500',
  unit: 'kg',
  harvestDate: '2025-10-19',
  expectedPickupDate: '2025-10-22',
  actualPickupDate: null,
  location: 'Warehouse A',
  pricePerUnit: '2.50',
  totalPrice: '1,250.00',
  quality: 'Premium',
  status: 'Pending Pickup',
  notes: 'Organic certified. Handle with care, keep refrigerated.',
  createdAt: '2025-10-19 08:30:00',
  updatedAt: '2025-10-19 08:30:00',
  timeline: [
    {
      date: '2025-10-19 08:30:00',
      status: 'Created',
      description: 'Harvest batch created and submitted'
    },
    {
      date: '2025-10-19 10:15:00',
      status: 'Confirmed',
      description: 'Batch confirmed by system'
    }
  ]
};

export default function HarvestBatchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const batchId = params.id;

  // In real app, fetch data based on batchId
  const batch = mockBatchData;

  const handleCancelBatch = () => {
    // TODO: Implement API call to cancel batch
    toast({
      title: 'Batch Cancelled',
      description: `Harvest batch ${batchId} has been cancelled.`
    });
    router.push('/supplier/harvest-batches');
  };

  const handleConfirmPickup = () => {
    // TODO: Implement API call to confirm pickup
    toast({
      title: 'Pickup Confirmed',
      description: 'You have confirmed that the batch has been picked up.'
    });
    router.push('/supplier/harvest-batches');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending Pickup':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button variant='ghost' size='icon' onClick={() => router.back()}>
              <IconArrowLeft className='h-5 w-5' />
            </Button>
            <div>
              <h2 className='text-3xl font-bold tracking-tight'>
                Harvest Batch Details
              </h2>
              <p className='text-muted-foreground'>Batch ID: {batch.id}</p>
            </div>
          </div>
          <div className='flex gap-2'>
            {batch.status === 'Pending Pickup' && (
              <>
                <Link href={`/supplier/harvest-batches/${batchId}/edit`}>
                  <Button variant='outline'>
                    <IconEdit className='mr-2 h-4 w-4' />
                    Edit
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant='destructive'>
                      <IconX className='mr-2 h-4 w-4' />
                      Cancel Batch
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Harvest Batch?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will cancel the harvest batch{' '}
                        <strong>{batch.id}</strong>. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>No, Keep It</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelBatch}>
                        Yes, Cancel Batch
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            {batch.status === 'In Transit' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>
                    <IconCheck className='mr-2 h-4 w-4' />
                    Confirm Pickup
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Pickup</AlertDialogTitle>
                    <AlertDialogDescription>
                      Please confirm that the delivery staff has picked up this
                      harvest batch.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmPickup}>
                      Confirm Pickup
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <Separator />

        <div className='grid gap-6 md:grid-cols-3'>
          <div className='space-y-6 md:col-span-2'>
            {/* Product Information */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconPackage className='h-5 w-5' />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-muted-foreground text-sm'>Product</p>
                    <p className='font-medium'>{batch.product}</p>
                  </div>
                  <div>
                    <p className='text-muted-foreground text-sm'>Quality</p>
                    <Badge variant='secondary'>{batch.quality}</Badge>
                  </div>
                  <div>
                    <p className='text-muted-foreground text-sm'>Quantity</p>
                    <p className='font-medium'>
                      {batch.quantity} {batch.unit}
                    </p>
                  </div>
                  <div>
                    <p className='text-muted-foreground text-sm'>
                      Price per Unit
                    </p>
                    <p className='font-medium'>${batch.pricePerUnit}</p>
                  </div>
                  <div>
                    <p className='text-muted-foreground text-sm'>Total Price</p>
                    <p className='text-primary text-lg font-bold'>
                      ${batch.totalPrice}
                    </p>
                  </div>
                </div>
                {batch.notes && (
                  <div className='border-t pt-4'>
                    <p className='text-muted-foreground mb-2 text-sm'>Notes</p>
                    <p className='text-sm'>{batch.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Harvest Details */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconCalendar className='h-5 w-5' />
                  Harvest Details
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-muted-foreground text-sm'>
                      Harvest Date
                    </p>
                    <p className='font-medium'>{batch.harvestDate}</p>
                  </div>
                  <div>
                    <p className='text-muted-foreground text-sm'>
                      Expected Pickup
                    </p>
                    <p className='font-medium'>{batch.expectedPickupDate}</p>
                  </div>
                  {batch.actualPickupDate && (
                    <div>
                      <p className='text-muted-foreground text-sm'>
                        Actual Pickup
                      </p>
                      <p className='font-medium'>{batch.actualPickupDate}</p>
                    </div>
                  )}
                  <div>
                    <p className='text-muted-foreground text-sm'>
                      Storage Location
                    </p>
                    <div className='flex items-center gap-1'>
                      <IconMapPin className='h-4 w-4' />
                      <p className='font-medium'>{batch.location}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
                <CardDescription>History of this harvest batch</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {batch.timeline.map((event, index) => (
                    <div key={index} className='flex gap-4'>
                      <div className='flex flex-col items-center'>
                        <div className='bg-primary flex h-8 w-8 items-center justify-center rounded-full'>
                          <IconCheck className='text-primary-foreground h-4 w-4' />
                        </div>
                        {index < batch.timeline.length - 1 && (
                          <div className='bg-border w-px flex-1' />
                        )}
                      </div>
                      <div className='flex-1 pb-4'>
                        <p className='font-medium'>{event.status}</p>
                        <p className='text-muted-foreground text-sm'>
                          {event.description}
                        </p>
                        <p className='text-muted-foreground mt-1 text-xs'>
                          {event.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  className={`w-full justify-center py-2 ${getStatusColor(batch.status)}`}
                >
                  {batch.status}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <Link href='/supplier/harvest-batches' className='block w-full'>
                  <Button variant='outline' className='w-full justify-start'>
                    <IconPackage className='mr-2 h-4 w-4' />
                    View All Batches
                  </Button>
                </Link>
                <Link
                  href='/supplier/harvest-batches/new'
                  className='block w-full'
                >
                  <Button variant='outline' className='w-full justify-start'>
                    <IconPackage className='mr-2 h-4 w-4' />
                    Create New Batch
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2 text-sm'>
                <div>
                  <p className='text-muted-foreground'>Created</p>
                  <p className='font-medium'>{batch.createdAt}</p>
                </div>
                <div>
                  <p className='text-muted-foreground'>Last Updated</p>
                  <p className='font-medium'>{batch.updatedAt}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

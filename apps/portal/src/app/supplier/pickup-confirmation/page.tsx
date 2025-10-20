'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  IconSearch,
  IconCheck,
  IconTruck,
  IconPackage,
  IconCalendar,
  IconMapPin,
  IconAlertCircle
} from '@tabler/icons-react';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import Link from 'next/link';

// Mock data for batches awaiting pickup confirmation
const mockPendingPickups = [
  {
    id: 'HB-002',
    product: 'Fresh Carrots',
    quantity: '300 kg',
    pickupDate: '2025-10-20',
    pickupTime: '10:30 AM',
    location: 'Warehouse B',
    driver: 'John Doe',
    vehicleNumber: 'ABC-123',
    status: 'In Transit'
  },
  {
    id: 'HB-006',
    product: 'Sweet Corn',
    quantity: '450 kg',
    pickupDate: '2025-10-20',
    pickupTime: '02:15 PM',
    location: 'Warehouse A',
    driver: 'Jane Smith',
    vehicleNumber: 'XYZ-789',
    status: 'In Transit'
  },
  {
    id: 'HB-007',
    product: 'Green Beans',
    quantity: '200 kg',
    pickupDate: '2025-10-19',
    pickupTime: '03:45 PM',
    location: 'Cold Storage 1',
    driver: 'Mike Johnson',
    vehicleNumber: 'DEF-456',
    status: 'In Transit'
  }
];

export default function PickupConfirmationPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [pickups, setPickups] = useState(mockPendingPickups);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);

  const handleConfirmPickup = (batch: any) => {
    setSelectedBatch(batch);
    setConfirmDialogOpen(true);
  };

  const confirmPickupAction = () => {
    if (selectedBatch) {
      // TODO: Implement API call to confirm pickup
      setPickups((prev) => prev.filter((p) => p.id !== selectedBatch.id));
      toast({
        title: 'Pickup Confirmed',
        description: `You have confirmed that batch ${selectedBatch.id} has been picked up by ${selectedBatch.driver}.`
      });
    }
    setConfirmDialogOpen(false);
    setSelectedBatch(null);
  };

  const filteredPickups = pickups.filter(
    (pickup) =>
      pickup.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pickup.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pickup.driver.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>
              Pickup Confirmation
            </h2>
            <p className='text-muted-foreground'>
              Confirm when delivery staff has picked up your harvest batches
            </p>
          </div>
        </div>

        {/* Alert Banner */}
        {pickups.length > 0 && (
          <Card className='border-yellow-200 bg-yellow-50'>
            <CardContent className='flex items-center gap-3 pt-6'>
              <IconAlertCircle className='h-5 w-5 text-yellow-600' />
              <div>
                <p className='font-medium text-yellow-900'>
                  {pickups.length} batch{pickups.length !== 1 ? 'es' : ''}{' '}
                  awaiting pickup confirmation
                </p>
                <p className='text-sm text-yellow-700'>
                  Please confirm once the delivery staff has picked up the
                  batches
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <Card>
            <CardHeader className='pb-3'>
              <CardDescription className='flex items-center gap-2'>
                <IconTruck className='h-4 w-4' />
                Awaiting Confirmation
              </CardDescription>
              <CardTitle className='text-3xl'>{pickups.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground text-xs'>
                Batches in transit requiring confirmation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardDescription className='flex items-center gap-2'>
                <IconCalendar className='h-4 w-4' />
                Today^s Pickups
              </CardDescription>
              <CardTitle className='text-3xl'>
                {pickups.filter((p) => p.pickupDate === '2025-10-20').length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground text-xs'>
                Batches picked up today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-3'>
              <CardDescription className='flex items-center gap-2'>
                <IconPackage className='h-4 w-4' />
                Total Quantity
              </CardDescription>
              <CardTitle className='text-3xl'>950</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground text-xs'>
                Kilograms awaiting confirmation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pickups List */}
        <Card>
          <CardHeader>
            <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
              <div>
                <CardTitle>Batches in Transit</CardTitle>
                <CardDescription>
                  Confirm pickup when delivery staff collects the batch
                </CardDescription>
              </div>
              <div className='relative flex-1 md:max-w-sm'>
                <IconSearch className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
                <Input
                  placeholder='Search by ID, product, or driver...'
                  className='pl-8'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPickups.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-12 text-center'>
                <IconCheck className='text-muted-foreground mb-4 h-12 w-12' />
                <h3 className='mb-2 text-lg font-semibold'>
                  {pickups.length === 0
                    ? 'No Pending Confirmations'
                    : 'No Results Found'}
                </h3>
                <p className='text-muted-foreground mb-4'>
                  {pickups.length === 0
                    ? 'All pickups have been confirmed. Great job!'
                    : 'Try adjusting your search query'}
                </p>
                <Link href='/supplier/harvest-batches'>
                  <Button variant='outline'>View All Batches</Button>
                </Link>
              </div>
            ) : (
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Pickup Date & Time</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead className='text-right'>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPickups.map((pickup) => (
                      <TableRow key={pickup.id}>
                        <TableCell className='font-medium'>
                          <Link
                            href={`/supplier/harvest-batches/${pickup.id}`}
                            className='text-primary hover:underline'
                          >
                            {pickup.id}
                          </Link>
                        </TableCell>
                        <TableCell>{pickup.product}</TableCell>
                        <TableCell>{pickup.quantity}</TableCell>
                        <TableCell>
                          <div className='flex flex-col'>
                            <span className='font-medium'>
                              {pickup.pickupDate}
                            </span>
                            <span className='text-muted-foreground text-xs'>
                              {pickup.pickupTime}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1'>
                            <IconMapPin className='text-muted-foreground h-3 w-3' />
                            {pickup.location}
                          </div>
                        </TableCell>
                        <TableCell>{pickup.driver}</TableCell>
                        <TableCell>
                          <Badge variant='outline'>
                            {pickup.vehicleNumber}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                          <Button
                            size='sm'
                            onClick={() => handleConfirmPickup(pickup)}
                          >
                            <IconCheck className='mr-2 h-4 w-4' />
                            Confirm
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Batch Pickup</AlertDialogTitle>
            <AlertDialogDescription>
              Please confirm that the delivery staff has picked up this harvest
              batch.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {selectedBatch && (
            <div className='space-y-3 py-4'>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Batch ID:</span>
                <span className='font-medium'>{selectedBatch.id}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Product:</span>
                <span className='font-medium'>{selectedBatch.product}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Quantity:</span>
                <span className='font-medium'>{selectedBatch.quantity}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Driver:</span>
                <span className='font-medium'>{selectedBatch.driver}</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Vehicle:</span>
                <span className='font-medium'>
                  {selectedBatch.vehicleNumber}
                </span>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPickupAction}>
              Confirm Pickup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

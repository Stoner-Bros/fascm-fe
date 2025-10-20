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
  IconPlus,
  IconSearch,
  IconEye,
  IconEdit,
  IconX,
  IconPackage,
  IconClock,
  IconTruck,
  IconCheck
} from '@tabler/icons-react';
import Link from 'next/link';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
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

// Mock data for harvest batches
const mockBatches = [
  {
    id: 'HB-001',
    product: 'Organic Tomatoes',
    quantity: '500 kg',
    harvestDate: '2025-10-19',
    status: 'Pending Pickup',
    location: 'Warehouse A',
    price: '$1,250'
  },
  {
    id: 'HB-002',
    product: 'Fresh Carrots',
    quantity: '300 kg',
    harvestDate: '2025-10-18',
    status: 'In Transit',
    location: 'Warehouse B',
    price: '$750'
  },
  {
    id: 'HB-003',
    product: 'Green Lettuce',
    quantity: '200 kg',
    harvestDate: '2025-10-17',
    status: 'Delivered',
    location: 'Warehouse A',
    price: '$400'
  },
  {
    id: 'HB-004',
    product: 'Cucumbers',
    quantity: '400 kg',
    harvestDate: '2025-10-16',
    status: 'Pending Pickup',
    location: 'Warehouse C',
    price: '$800'
  },
  {
    id: 'HB-005',
    product: 'Bell Peppers',
    quantity: '250 kg',
    harvestDate: '2025-10-15',
    status: 'Cancelled',
    location: 'Warehouse A',
    price: '$625'
  }
];

export default function HarvestBatchesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [batches, setBatches] = useState(mockBatches);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending Pickup':
        return <IconClock className='h-4 w-4' />;
      case 'In Transit':
        return <IconTruck className='h-4 w-4' />;
      case 'Delivered':
        return <IconCheck className='h-4 w-4' />;
      case 'Cancelled':
        return <IconX className='h-4 w-4' />;
      default:
        return <IconPackage className='h-4 w-4' />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Pending Pickup':
        return 'outline';
      case 'In Transit':
        return 'secondary';
      case 'Delivered':
        return 'default';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleCancelBatch = (batchId: string) => {
    setSelectedBatchId(batchId);
    setCancelDialogOpen(true);
  };

  const confirmCancelBatch = () => {
    if (selectedBatchId) {
      // TODO: Implement API call to cancel batch
      setBatches((prev) =>
        prev.map((batch) =>
          batch.id === selectedBatchId
            ? { ...batch, status: 'Cancelled' }
            : batch
        )
      );
      toast({
        title: 'Batch Cancelled',
        description: `Harvest batch ${selectedBatchId} has been cancelled.`
      });
    }
    setCancelDialogOpen(false);
    setSelectedBatchId(null);
  };

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      batch.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.product.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || batch.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: batches.length,
    'Pending Pickup': batches.filter((b) => b.status === 'Pending Pickup')
      .length,
    'In Transit': batches.filter((b) => b.status === 'In Transit').length,
    Delivered: batches.filter((b) => b.status === 'Delivered').length
  };

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>
              Harvest Batches
            </h2>
            <p className='text-muted-foreground'>
              Manage and track your harvest batches
            </p>
          </div>
          <Link href='/supplier/harvest-batches/new'>
            <Button>
              <IconPlus className='mr-2 h-4 w-4' />
              New Batch
            </Button>
          </Link>
        </div>

        {/* Status Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <Card
            className='hover:border-primary cursor-pointer'
            onClick={() => setStatusFilter('all')}
          >
            <CardHeader className='pb-3'>
              <CardDescription>Total Batches</CardDescription>
              <CardTitle className='text-3xl'>{statusCounts.all}</CardTitle>
            </CardHeader>
          </Card>
          <Card
            className='hover:border-primary cursor-pointer'
            onClick={() => setStatusFilter('Pending Pickup')}
          >
            <CardHeader className='pb-3'>
              <CardDescription className='flex items-center gap-2'>
                <IconClock className='h-4 w-4' />
                Pending Pickup
              </CardDescription>
              <CardTitle className='text-3xl'>
                {statusCounts['Pending Pickup']}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card
            className='hover:border-primary cursor-pointer'
            onClick={() => setStatusFilter('In Transit')}
          >
            <CardHeader className='pb-3'>
              <CardDescription className='flex items-center gap-2'>
                <IconTruck className='h-4 w-4' />
                In Transit
              </CardDescription>
              <CardTitle className='text-3xl'>
                {statusCounts['In Transit']}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card
            className='hover:border-primary cursor-pointer'
            onClick={() => setStatusFilter('Delivered')}
          >
            <CardHeader className='pb-3'>
              <CardDescription className='flex items-center gap-2'>
                <IconCheck className='h-4 w-4' />
                Delivered
              </CardDescription>
              <CardTitle className='text-3xl'>
                {statusCounts.Delivered}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
              <div className='flex flex-1 items-center space-x-2'>
                <div className='relative flex-1'>
                  <IconSearch className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
                  <Input
                    placeholder='Search by ID or product...'
                    className='pl-8'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder='Filter by status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Status</SelectItem>
                    <SelectItem value='Pending Pickup'>
                      Pending Pickup
                    </SelectItem>
                    <SelectItem value='In Transit'>In Transit</SelectItem>
                    <SelectItem value='Delivered'>Delivered</SelectItem>
                    <SelectItem value='Cancelled'>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Harvest Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBatches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className='text-center'>
                        No harvest batches found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBatches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className='font-medium'>
                          {batch.id}
                        </TableCell>
                        <TableCell>{batch.product}</TableCell>
                        <TableCell>{batch.quantity}</TableCell>
                        <TableCell>{batch.harvestDate}</TableCell>
                        <TableCell>{batch.location}</TableCell>
                        <TableCell>{batch.price}</TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusVariant(batch.status)}
                            className='flex w-fit items-center gap-1'
                          >
                            {getStatusIcon(batch.status)}
                            {batch.status}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='sm'>
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/supplier/harvest-batches/${batch.id}`}
                                  className='flex items-center'
                                >
                                  <IconEye className='mr-2 h-4 w-4' />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              {batch.status === 'Pending Pickup' && (
                                <>
                                  <DropdownMenuItem asChild>
                                    <Link
                                      href={`/supplier/harvest-batches/${batch.id}/edit`}
                                      className='flex items-center'
                                    >
                                      <IconEdit className='mr-2 h-4 w-4' />
                                      Edit
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleCancelBatch(batch.id)}
                                    className='text-destructive'
                                  >
                                    <IconX className='mr-2 h-4 w-4' />
                                    Cancel Batch
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Harvest Batch?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will cancel the harvest batch{' '}
              <strong>{selectedBatchId}</strong>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep It</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelBatch}>
              Yes, Cancel Batch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

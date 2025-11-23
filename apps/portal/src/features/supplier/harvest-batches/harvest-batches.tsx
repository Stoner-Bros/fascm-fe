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
import { useEffect, useMemo, useState } from 'react';
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
import {
  fetchHarvestSchedules,
  fetchHarvestTickets,
  fetchHarvestDetailsByHarvestTicketId,
  fetchSupplierById
} from '@/features/supplier';
import type { HarvestSchedule } from '@/features/supplier/types/harvest-schedule';
import type { HarvestDetail } from '@/features/supplier/types/harvest-detail';
import type { Supplier } from '@/features/supplier/types/supplier';

type HarvestBatchRow = {
  id: string; // HarvestScheduleId
  products: string; // product names from all details of tickets in this schedule
  harvestDate: string;
  location: string;
  status: string;
};

/* ===== helper: để ngoài component, không bị tạo lại mỗi render ===== */

const getStatusIcon = (status: string) => {
  const s = status?.toUpperCase();
  switch (s) {
    case 'PENDING':
      return <IconClock className='h-4 w-4' />;
    case 'IN_PROGRESS':
      return <IconTruck className='h-4 w-4' />;
    case 'COMPLETED':
      return <IconCheck className='h-4 w-4' />;
    case 'CANCELLED':
      return <IconX className='h-4 w-4' />;
    default:
      return <IconPackage className='h-4 w-4' />;
  }
};

const getStatusVariant = (status: string) => {
  const s = status?.toUpperCase();
  switch (s) {
    case 'PENDING':
      return 'outline';
    case 'IN_PROGRESS':
      return 'secondary';
    case 'COMPLETED':
      return 'default';
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusLabel = (status: string) => {
  const s = status?.toUpperCase();
  switch (s) {
    case 'PENDING':
      return 'Pending';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status || 'Unknown';
  }
};

export default function SupplierHarvestBatchesFeature() {
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  >('ALL');
  const [batches, setBatches] = useState<HarvestBatchRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  /* 
    CHỈ chạy 1 lần khi mount.
    Không để [toast] trong dependency để tránh vòng lặp.
  */
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      try {
        const schedulesRes = await fetchHarvestSchedules({
          page: 1,
          limit: 50
        });
        const schedules: HarvestSchedule[] = schedulesRes.data ?? [];

        const supplierCache = new Map<string, Supplier>();

        const rows: HarvestBatchRow[] = await Promise.all(
          schedules.map(async (schedule) => {
            const scheduleId = schedule.id;

            // ===== Location (Supplier) – cached =====
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const supplierRef = (schedule as any)?.supplierId;
            const supplierKey =
              supplierRef?.id !== undefined ? supplierRef.id : supplierRef;

            let location = '-';
            if (supplierKey) {
              let supplier = supplierCache.get(String(supplierKey));
              if (!supplier) {
                try {
                  supplier = await fetchSupplierById(String(supplierKey));
                  supplierCache.set(String(supplierKey), supplier);
                } catch {
                  // ignore supplier errors
                }
              }
              if (supplier) {
                location = supplier.gardenName || supplier.address || '-';
              }
            }

            // ===== Tickets & Details of this schedule =====
            const ticketsRes = await fetchHarvestTickets({
              page: 1,
              limit: 20,
              harvestScheduleId: scheduleId
            });

            const tickets =
              ticketsRes.data?.filter((ticket) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const ticketScheduleId =
                  (ticket as any)?.harvestScheduleId?.id ??
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (ticket as any)?.harvestScheduleId ??
                  '';
                return String(ticketScheduleId) === String(scheduleId);
              }) ?? [];

            const detailResponses = await Promise.all(
              tickets.map(async (ticket) => {
                try {
                  const details =
                    (await fetchHarvestDetailsByHarvestTicketId(ticket.id)) ??
                    [];
                  return details;
                } catch (error) {
                  console.error(
                    `Failed to fetch details for ticket ${ticket.id}`,
                    error
                  );
                  return [] as HarvestDetail[];
                }
              })
            );

            const details = detailResponses.flat();

            const productNames = new Set<string>();
            for (const detail of details) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const productName =
                (detail as any)?.product?.name ||
                (detail as any)?.productName ||
                (detail as any)?.product?.id;
              if (productName) productNames.add(String(productName));
            }

            const products =
              Array.from(productNames).join(', ') || 'No products';

            const harvestDate = schedule.harvestDate
              ? new Date(
                  schedule.harvestDate as unknown as string
                ).toLocaleString()
              : '-';

            return {
              id: scheduleId,
              products,
              harvestDate,
              location,
              status: schedule.status ?? 'PENDING'
            };
          })
        );

        if (cancelled) return;
        setBatches(rows);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load harvest batches', err);
        toast({
          title: 'Error',
          description: 'Failed to load harvest batches',
          variant: 'destructive'
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <--- chỉ mount 1 lần

  const handleCancelBatch = (batchId: string) => {
    setSelectedBatchId(batchId);
    setCancelDialogOpen(true);
  };

  const confirmCancelBatch = () => {
    if (selectedBatchId) {
      setBatches((prev) =>
        prev.map((batch) =>
          batch.id === selectedBatchId
            ? { ...batch, status: 'CANCELLED' }
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

  /* ======= derived state dùng useMemo cho nhẹ ======= */

  const filteredBatches = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return batches.filter((batch) => {
      const matchesSearch =
        batch.id.toLowerCase().includes(q) ||
        batch.products.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === 'ALL' || batch.status.toUpperCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [batches, searchQuery, statusFilter]);

  const statusCounts = useMemo(
    () => ({
      all: batches.length,
      PENDING: batches.filter((b) => b.status.toUpperCase() === 'PENDING')
        .length,
      IN_PROGRESS: batches.filter(
        (b) => b.status.toUpperCase() === 'IN_PROGRESS'
      ).length,
      COMPLETED: batches.filter((b) => b.status.toUpperCase() === 'COMPLETED')
        .length
    }),
    [batches]
  );

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
            onClick={() => setStatusFilter('ALL')}
          >
            <CardHeader className='pb-3'>
              <CardDescription>Total Batches</CardDescription>
              <CardTitle className='text-3xl'>{statusCounts.all}</CardTitle>
            </CardHeader>
          </Card>
          <Card
            className='hover:border-primary cursor-pointer'
            onClick={() => setStatusFilter('PENDING')}
          >
            <CardHeader className='pb-3'>
              <CardDescription className='flex items-center gap-2'>
                <IconClock className='h-4 w-4' />
                Pending
              </CardDescription>
              <CardTitle className='text-3xl'>{statusCounts.PENDING}</CardTitle>
            </CardHeader>
          </Card>
          <Card
            className='hover:border-primary cursor-pointer'
            onClick={() => setStatusFilter('IN_PROGRESS')}
          >
            <CardHeader className='pb-3'>
              <CardDescription className='flex items-center gap-2'>
                <IconTruck className='h-4 w-4' />
                In Progress
              </CardDescription>
              <CardTitle className='text-3xl'>
                {statusCounts.IN_PROGRESS}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card
            className='hover:border-primary cursor-pointer'
            onClick={() => setStatusFilter('COMPLETED')}
          >
            <CardHeader className='pb-3'>
              <CardDescription className='flex items-center gap-2'>
                <IconCheck className='h-4 w-4' />
                Completed
              </CardDescription>
              <CardTitle className='text-3xl'>
                {statusCounts.COMPLETED}
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
                    placeholder='Search by Schedule ID or product...'
                    className='pl-8'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(v) =>
                    setStatusFilter(
                      (v.toUpperCase() as
                        | 'ALL'
                        | 'PENDING'
                        | 'IN_PROGRESS'
                        | 'COMPLETED'
                        | 'CANCELLED') || 'ALL'
                    )
                  }
                >
                  <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder='Filter by status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ALL'>All Status</SelectItem>
                    <SelectItem value='PENDING'>Pending</SelectItem>
                    <SelectItem value='IN_PROGRESS'>In Progress</SelectItem>
                    <SelectItem value='COMPLETED'>Completed</SelectItem>
                    <SelectItem value='CANCELLED'>Cancelled</SelectItem>
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
                    <TableHead>Schedule / Batch ID</TableHead>
                    <TableHead>Product(s)</TableHead>
                    <TableHead>Harvest Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBatches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className='text-center'>
                        {loading
                          ? 'Loading harvest batches...'
                          : 'No harvest batches found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBatches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className='font-medium'>
                          {batch.id}
                        </TableCell>
                        <TableCell>{batch.products}</TableCell>
                        <TableCell>{batch.harvestDate}</TableCell>
                        <TableCell>{batch.location}</TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusVariant(batch.status)}
                            className='flex w-fit items-center gap-1'
                          >
                            {getStatusIcon(batch.status)}
                            {getStatusLabel(batch.status)}
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
                              {batch.status.toUpperCase() === 'PENDING' && (
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

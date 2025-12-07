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
  IconCheck,
  IconInfoCircle
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
import { useToast } from '@/hooks/use-toast';
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
  fetchHarvestDetailsByHarvestTicketId
} from '@/features/supplier';
import { fetchSupplier } from '@/services/supplier.service';
import type { HarvestSchedule } from '@/types/harvest-schedule';
import type { HarvestDetail } from '@/types/harvest-detail';
import type { Supplier } from '@/types/supplier';

type HarvestBatchRow = {
  id: string; // HarvestScheduleId
  products: string; // product names from all details of tickets in this schedule
  harvestDate: string;
  location: string;
  status: string;
  reason?: string; // Lý do từ chối (nếu có)
};

const normalizeStatus = (status?: string | null): string => {
  if (!status || status.trim() === '') return 'pending';
  return status.toLowerCase().trim();
};

const getStatusIcon = (status: string) => {
  const s = normalizeStatus(status);
  switch (s) {
    case 'pending':
      return <IconClock className='h-4 w-4' />;
    case 'approved':
      return <IconCheck className='h-4 w-4' />;
    case 'preparing':
      return <IconTruck className='h-4 w-4' />;
    case 'delivering':
      return <IconTruck className='h-4 w-4' />;
    case 'delivered':
      return <IconPackage className='h-4 w-4' />;
    case 'completed':
      return <IconCheck className='h-4 w-4' />;
    case 'rejected':
      return <IconX className='h-4 w-4' />;
    case 'canceled':
      return <IconX className='h-4 w-4' />;
    default:
      return <IconPackage className='h-4 w-4' />;
  }
};

const getStatusVariant = (status: string) => {
  const s = normalizeStatus(status);
  switch (s) {
    case 'pending':
      return 'outline';
    case 'approved':
      return 'default';
    case 'preparing':
      return 'default';
    case 'delivering':
      return 'default';
    case 'delivered':
      return 'default';
    case 'completed':
      return 'default';
    case 'rejected':
    case 'canceled':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusLabel = (status: string) => {
  const s = normalizeStatus(status);
  switch (s) {
    case 'pending':
      return 'Chờ duyệt đơn';
    case 'rejected':
      return 'Đã từ chối đơn';
    case 'approved':
      return 'Đã duyệt đơn';
    case 'preparing':
      return 'Chuẩn đi lấy';
    case 'delivering':
      return 'Đang đi lấy';
    case 'delivered':
      return 'Đã lấy';
    case 'completed':
      return 'Đã hoàn thành';
    case 'canceled':
      return 'Đã hủy đơn';
    default:
      return status || 'Unknown';
  }
};

export default function SupplierHarvestBatchesFeature() {
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    | 'ALL'
    | 'pending'
    | 'rejected'
    | 'approved'
    | 'preparing'
    | 'delivering'
    | 'delivered'
    | 'completed'
    | 'canceled'
  >('ALL');
  const [batches, setBatches] = useState<HarvestBatchRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);

  /* 
    CHỈ fetch 1 lần duy nhất khi mount - GIỮ LẠI API CALLS ĐỂ LẤY PRODUCTS
  */
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Fetch supplier info (mine) - chỉ fetch 1 lần
        let supplierInfo: Supplier | null = null;
        let location = '-';
        try {
          supplierInfo = await fetchSupplier();
          location = supplierInfo?.gardenName || supplierInfo?.address || '-';
        } catch (err) {
          console.error('Failed to fetch supplier info', err);
        }

        if (cancelled) return;

        // 2. Fetch schedules
        const schedulesRes = await fetchHarvestSchedules({
          page: 1,
          limit: 50
        });
        const schedules: HarvestSchedule[] = schedulesRes.data ?? [];

        if (cancelled) return;

        // 3. Fetch tất cả harvest tickets một lần (không filter theo scheduleId)
        const allTicketsRes = await fetchHarvestTickets({
          page: 1,
          limit: 200 // Fetch nhiều tickets để cover tất cả schedules
        });
        const allTickets = allTicketsRes.data ?? [];

        if (cancelled) return;

        // 4. Group tickets theo scheduleId
        const ticketsByScheduleId = new Map<string, typeof allTickets>();
        for (const ticket of allTickets) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ticketScheduleId =
            (ticket as any)?.harvestScheduleId?.id ??
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (ticket as any)?.harvestScheduleId ??
            '';
          if (ticketScheduleId) {
            const scheduleIdStr = String(ticketScheduleId);
            if (!ticketsByScheduleId.has(scheduleIdStr)) {
              ticketsByScheduleId.set(scheduleIdStr, []);
            }
            ticketsByScheduleId.get(scheduleIdStr)!.push(ticket);
          }
        }

        if (cancelled) return;

        // 5. Process từng schedule để lấy đầy đủ thông tin
        const rows: HarvestBatchRow[] = await Promise.all(
          schedules.map(async (schedule) => {
            const scheduleId = schedule.id;

            // ===== Tickets của schedule này (từ cache) =====
            const tickets = ticketsByScheduleId.get(String(scheduleId)) ?? [];

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

            // Extract product names từ details
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
              status: schedule.status ?? 'PENDING',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              reason: (schedule as any)?.reason
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

    // CHỈ LOAD 1 LẦN DUY NHẤT - KHÔNG CÓ POLLING/INTERVAL
    loadData();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Không có dependencies - chỉ chạy 1 lần khi mount

  const handleCancelBatch = (batchId: string) => {
    setSelectedBatchId(batchId);
    setCancelDialogOpen(true);
  };

  const confirmCancelBatch = () => {
    if (selectedBatchId) {
      setBatches((prev) =>
        prev.map((batch) =>
          batch.id === selectedBatchId
            ? { ...batch, status: 'canceled' }
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
        statusFilter === 'ALL' ||
        normalizeStatus(batch.status) === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [batches, searchQuery, statusFilter]);

  const statusCounts = useMemo(
    () => ({
      all: batches.length,
      pending: batches.filter((b) => normalizeStatus(b.status) === 'pending')
        .length,
      rejected: batches.filter((b) => normalizeStatus(b.status) === 'rejected')
        .length,
      approved: batches.filter((b) => normalizeStatus(b.status) === 'approved')
        .length,
      preparing: batches.filter(
        (b) => normalizeStatus(b.status) === 'preparing'
      ).length,
      delivering: batches.filter(
        (b) => normalizeStatus(b.status) === 'delivering'
      ).length,
      delivered: batches.filter(
        (b) => normalizeStatus(b.status) === 'delivered'
      ).length,
      completed: batches.filter(
        (b) => normalizeStatus(b.status) === 'completed'
      ).length,
      canceled: batches.filter((b) => normalizeStatus(b.status) === 'canceled')
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
            onClick={() => setStatusFilter('pending')}
          >
            <CardHeader className='pb-3'>
              <CardDescription className='flex items-center gap-2'>
                <IconClock className='h-4 w-4' />
                Chờ duyệt đơn
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
            onClick={() => setStatusFilter('approved')}
          >
            <CardHeader className='pb-3'>
              <CardDescription className='flex items-center gap-2'>
                <IconCheck className='h-4 w-4' />
                Đã duyệt đơn
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
            onClick={() => setStatusFilter('completed')}
          >
            <CardHeader className='pb-3'>
              <CardDescription className='flex items-center gap-2'>
                <IconCheck className='h-4 w-4' />
                Đã hoàn thành
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
                      (v as
                        | 'ALL'
                        | 'pending'
                        | 'rejected'
                        | 'approved'
                        | 'preparing'
                        | 'delivering'
                        | 'delivered'
                        | 'completed'
                        | 'canceled') || 'ALL'
                    )
                  }
                >
                  <SelectTrigger className='w-[180px]'>
                    <SelectValue placeholder='Filter by status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ALL'>Tất cả trạng thái</SelectItem>
                    <SelectItem value='pending'>Chờ duyệt đơn</SelectItem>
                    <SelectItem value='rejected'>Đã từ chối đơn</SelectItem>
                    <SelectItem value='approved'>Đã duyệt đơn</SelectItem>
                    <SelectItem value='preparing'>Chuẩn đi lấy</SelectItem>
                    <SelectItem value='delivering'>Đang đi lấy</SelectItem>
                    <SelectItem value='delivered'>Đã lấy</SelectItem>
                    <SelectItem value='completed'>Đã hoàn thành</SelectItem>
                    <SelectItem value='canceled'>Đã hủy đơn</SelectItem>
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
                    <TableHead>Schedule</TableHead>
                    <TableHead>Product(s)</TableHead>
                    <TableHead>Harvest Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className='text-center'>
                        <div className='flex flex-col items-center justify-center py-12'>
                          <div className='border-primary mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
                          <p className='text-muted-foreground'>
                            Loading harvest batches...
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredBatches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className='text-center'>
                        No harvest batches found
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
                              {normalizeStatus(batch.status) === 'pending' && (
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
                              {normalizeStatus(batch.status) === 'rejected' && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    // Sử dụng reason từ dữ liệu đã load
                                    const reason =
                                      batch.reason ||
                                      'Không có lý do được cung cấp.';

                                    toast({
                                      title: 'Lý do từ chối',
                                      description: reason,
                                      variant: 'default'
                                    });
                                  }}
                                >
                                  <IconInfoCircle className='mr-2 h-4 w-4' />
                                  Xem lý do từ chối
                                </DropdownMenuItem>
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

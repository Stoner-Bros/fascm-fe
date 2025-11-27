'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  IconArchive,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTicket
} from '@tabler/icons-react';
import {
  createBatch,
  fetchBatches,
  updateBatch
} from '@/services/batch.service';
import {
  createImportTicket,
  fetchImportTickets
} from '@/services/import-ticket.service';
import { fetchInboundBatches } from '@/services/inbound-batch.service';
import { fetchOrderDetails } from '@/services/order-detail.service';
import type { Batch } from '@/types/batch';
import type { ImportTicket } from '@/types/import-ticket';
import type { InboundBatch } from '@/types/inbound-batch';
import type { OrderDetail } from '@/types/order-detail';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/date-time-picker';

const BATCH_CAPACITY_KG = 20;

const defaultImportTicketForm = {
  inboundBatchId: '',
  realityQuantity: 0,
  importDate: new Date().toISOString(),
  areaId: ''
};

export function BatchManagement() {
  const { toast } = useToast();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [importTickets, setImportTickets] = useState<ImportTicket[]>([]);
  const [inboundBatches, setInboundBatches] = useState<InboundBatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImportTicketDialogOpen, setIsImportTicketDialogOpen] =
    useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false);
  const [filters, setFilters] = useState({ search: '' });
  const [importTicketForm, setImportTicketForm] = useState(
    defaultImportTicketForm
  );
  const [assignForm, setAssignForm] = useState({ orderDetailId: '' });
  const [selectedBatchForAssignment, setSelectedBatchForAssignment] =
    useState<Batch | null>(null);

  const loadBatches = async () => {
    setIsLoading(true);
    try {
      const res = await fetchBatches({
        page: 1,
        limit: 50,
        search: filters.search || undefined
      });
      setBatches(res.data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể tải danh sách batch',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadImportTickets = async () => {
    try {
      const res = await fetchImportTickets({ page: 1, limit: 100 });
      setImportTickets(res.data);
    } catch (error) {
      console.error('Unable to load import tickets', error);
    }
  };

  const loadInboundBatches = async () => {
    try {
      const res = await fetchInboundBatches({ page: 1, limit: 100 });
      setInboundBatches(res.data);
    } catch (error) {
      console.error('Unable to load inbound batches', error);
    }
  };

  const loadOrderDetails = async () => {
    setIsLoadingOrderDetails(true);
    try {
      const res = await fetchOrderDetails({ page: 1, limit: 100 });
      setOrderDetails(res.data);
    } catch (error) {
      console.error('Unable to load order details', error);
    } finally {
      setIsLoadingOrderDetails(false);
    }
  };

  useEffect(() => {
    loadBatches();
    loadImportTickets();
    loadInboundBatches();
    loadOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetImportTicketForm = () => {
    setImportTicketForm(defaultImportTicketForm);
  };

  const resetAssignForm = () => {
    setAssignForm({ orderDetailId: '' });
    setSelectedBatchForAssignment(null);
  };

  const handleOpenAssignDialog = (batch: Batch) => {
    setSelectedBatchForAssignment(batch);
    setAssignForm({ orderDetailId: '' });
    setIsAssignDialogOpen(true);
  };

  const handleAssignOrderDetail = async () => {
    if (!selectedBatchForAssignment) return;
    if (!assignForm.orderDetailId) {
      toast({
        variant: 'destructive',
        title: 'Vui lòng chọn Order Detail'
      });
      return;
    }

    const detail = orderDetails.find(
      (item) => item.id === assignForm.orderDetailId
    );
    if (!detail) {
      toast({
        variant: 'destructive',
        title: 'Order Detail không hợp lệ'
      });
      return;
    }

    const detailProductId = detail.product?.id;
    if (
      detailProductId &&
      detailProductId !== selectedBatchForAssignment.product?.id
    ) {
      toast({
        variant: 'destructive',
        title: 'Lỗi xác thực',
        description: 'Product của Order Detail không khớp với batch này.'
      });
      return;
    }

    const remaining =
      orderDetailStats[detail.id]?.remainingQuantity ??
      Number(detail.quantity) ??
      0;
    const batchQuantity = Number(selectedBatchForAssignment.quantity) || 0;
    if (detail.unit?.toLowerCase() === 'kg' && remaining < batchQuantity) {
      toast({
        variant: 'destructive',
        title: 'Không đủ số lượng',
        description: `Order Detail chỉ còn ${remaining} ${detail.unit}.`
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const updatedBatch = await updateBatch(selectedBatchForAssignment.id, {
        orderDetail: { id: assignForm.orderDetailId }
      });
      setBatches((prev) =>
        prev.map((batch) =>
          batch.id === updatedBatch.id ? updatedBatch : batch
        )
      );
      await loadBatches();
      await loadOrderDetails();
      toast({
        title: 'Đã gắn Order Detail',
        description: `Batch ${updatedBatch.batchCode} đã được cập nhật`
      });
      setIsAssignDialogOpen(false);
      resetAssignForm();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể cập nhật batch',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateImportTicket = async () => {
    if (!importTicketForm.inboundBatchId) {
      toast({
        variant: 'destructive',
        title: 'Vui lòng chọn Inbound Batch'
      });
      return;
    }

    if (
      !importTicketForm.realityQuantity ||
      importTicketForm.realityQuantity <= 0
    ) {
      toast({
        variant: 'destructive',
        title: 'Vui lòng nhập số lượng thực tế lớn hơn 0'
      });
      return;
    }

    if (!importTicketForm.importDate) {
      toast({
        variant: 'destructive',
        title: 'Vui lòng chọn ngày nhập kho'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        realityQuantity: Number(importTicketForm.realityQuantity),
        importDate: importTicketForm.importDate,
        inboundBatch: { id: importTicketForm.inboundBatchId },
        ...(importTicketForm.areaId
          ? { area: { id: importTicketForm.areaId } }
          : {})
      };

      const newTicket = await createImportTicket(payload);
      setImportTickets((prev) => [newTicket, ...prev]);

      // Auto-create batches: realityQuantity / 20 batches, each 20kg
      const numberOfBatches = Math.floor(
        importTicketForm.realityQuantity / BATCH_CAPACITY_KG
      );
      const selectedInboundBatch = inboundBatches.find(
        (b) => b.id === importTicketForm.inboundBatchId
      );

      if (numberOfBatches > 0 && selectedInboundBatch?.product) {
        const baseBatchCode =
          selectedInboundBatch?.batchCode ||
          selectedInboundBatch?.id ||
          newTicket.id ||
          'BATCH';
        const batchPayloads = Array.from({ length: numberOfBatches }).map(
          (_, index) => ({
            batchCode: `${baseBatchCode}-${String(index + 1).padStart(2, '0')}`,
            quantity: BATCH_CAPACITY_KG,
            unit: 'kg',
            importTicket: { id: newTicket.id },
            product: { id: selectedInboundBatch.product.id },
            ...(importTicketForm.areaId
              ? { area: { id: importTicketForm.areaId } }
              : {})
            // orderDetail is intentionally omitted (null)
          })
        );

        await Promise.all(batchPayloads.map((payload) => createBatch(payload)));
      }

      toast({
        title: 'Đã tạo import ticket',
        description: `Ticket ${newTicket.id} đã được tạo và ${numberOfBatches} batch đã được tạo tự động`
      });

      resetImportTicketForm();
      setIsImportTicketDialogOpen(false);
      await loadBatches();
      await loadImportTickets();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Không thể tạo import ticket',
        description: error instanceof Error ? error.message : undefined
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const importTicketUsage = useMemo(() => {
    return batches.reduce<Record<string, number>>((acc, batch) => {
      const id = batch.importTicket?.id;
      if (id) {
        acc[id] = (acc[id] ?? 0) + 1;
      }
      return acc;
    }, {});
  }, [batches]);

  const orderDetailStats = useMemo(() => {
    const assignedQuantity = batches.reduce<Record<string, number>>(
      (acc, batch) => {
        const id = batch.orderDetail?.id;
        if (id) {
          acc[id] = (acc[id] ?? 0) + (Number(batch.quantity) || 0);
        }
        return acc;
      },
      {}
    );

    return orderDetails.reduce<Record<string, { remainingQuantity: number }>>(
      (acc, detail) => {
        const total = Number(detail.quantity) || 0;
        const used = assignedQuantity[detail.id] ?? 0;
        acc[detail.id] = {
          remainingQuantity: Math.max(total - used, 0)
        };
        return acc;
      },
      {}
    );
  }, [batches, orderDetails]);

  // Filter out inbound batches that already have import tickets
  const availableInboundBatches = useMemo(() => {
    const usedInboundBatchIds = new Set(
      importTickets
        .map((ticket) => ticket.inboundBatch?.id)
        .filter((id): id is string => Boolean(id))
    );
    return inboundBatches.filter((batch) => !usedInboundBatchIds.has(batch.id));
  }, [inboundBatches, importTickets]);

  const filteredBatches = useMemo(() => {
    // Chỉ lấy những batch có batchCode
    const batchesWithCode = batches.filter(
      (batch) => batch.batchCode && batch.batchCode.trim() !== ''
    );

    if (!filters.search) return batchesWithCode;
    const keyword = filters.search.toLowerCase();
    return batchesWithCode.filter(
      (batch) =>
        batch.id.toLowerCase().includes(keyword) ||
        batch.batchCode.toLowerCase().includes(keyword) ||
        batch.product?.id?.toLowerCase().includes(keyword)
    );
  }, [batches, filters.search]);

  const assignableOrderDetails = useMemo(() => {
    if (!selectedBatchForAssignment) {
      return orderDetails.filter((detail) => {
        const stats = orderDetailStats[detail.id];
        return (stats?.remainingQuantity ?? Number(detail.quantity) ?? 0) > 0;
      });
    }
    const batchProductId = selectedBatchForAssignment.product?.id;
    return orderDetails.filter((detail) => {
      const stats = orderDetailStats[detail.id];
      const remaining =
        stats?.remainingQuantity ?? Number(detail.quantity) ?? 0;
      if (remaining <= 0) return false;
      if (batchProductId) {
        return detail.product?.id === batchProductId;
      }
      return true;
    });
  }, [orderDetails, orderDetailStats, selectedBatchForAssignment]);

  const assignedBatches = useMemo(
    () => filteredBatches.filter((batch) => Boolean(batch.orderDetail?.id)),
    [filteredBatches]
  );

  const unassignedBatches = useMemo(
    () => filteredBatches.filter((batch) => !batch.orderDetail?.id),
    [filteredBatches]
  );

  const selectedInboundBatch = useMemo(
    () =>
      inboundBatches.find(
        (batch) => batch.id === importTicketForm.inboundBatchId
      ),
    [inboundBatches, importTicketForm.inboundBatchId]
  );

  return (
    <div className='w-full space-y-6'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-3xl font-bold tracking-tight'>
            <IconArchive className='h-8 w-8 text-emerald-600' />
            Batch Management
          </h1>
          <p className='text-muted-foreground'>
            Quản lý import tickets và batches trong kho.
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button variant='outline' onClick={loadBatches}>
            <IconRefresh className='mr-2 h-4 w-4' />
            Làm mới
          </Button>
          <Dialog
            open={isImportTicketDialogOpen}
            onOpenChange={(open) => {
              if (!open) resetImportTicketForm();
              setIsImportTicketDialogOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <IconTicket className='mr-2 h-4 w-4' />
                Tạo Import Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[90vh] max-w-xl overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>Tạo Import Ticket</DialogTitle>
                <DialogDescription>
                  Tạo import ticket và tự động tạo batches (mỗi batch 20kg).
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4 py-4'>
                <div className='space-y-2'>
                  <Label htmlFor='inboundBatch'>Inbound Batch *</Label>
                  <Select
                    value={importTicketForm.inboundBatchId}
                    onValueChange={(value) =>
                      setImportTicketForm((prev) => ({
                        ...prev,
                        inboundBatchId: value
                      }))
                    }
                    disabled={availableInboundBatches.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          availableInboundBatches.length === 0
                            ? 'Không còn inbound batch khả dụng'
                            : 'Chọn inbound batch'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableInboundBatches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.id} •{' '}
                          {batch.product?.name || batch.product?.id || '—'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableInboundBatches.length === 0 && (
                    <p className='text-muted-foreground text-xs'>
                      Tất cả inbound batches đã được sử dụng để tạo import
                      ticket.
                    </p>
                  )}
                </div>
                {selectedInboundBatch && (
                  <div className='rounded-md border border-dashed p-3 text-sm'>
                    <p className='font-semibold'>
                      Batch ID: {selectedInboundBatch.id}
                    </p>
                    <p>
                      Sản phẩm:{' '}
                      {selectedInboundBatch.product?.name ||
                        selectedInboundBatch.product?.id ||
                        '—'}
                    </p>
                    <p>
                      Số lượng: {selectedInboundBatch.quantity}{' '}
                      {selectedInboundBatch.unit}
                    </p>
                  </div>
                )}
                <div className='space-y-2'>
                  <Label htmlFor='realityQuantity'>
                    Số lượng thực tế (kg) *
                  </Label>
                  <Input
                    id='realityQuantity'
                    type='number'
                    min={0}
                    step={0.01}
                    value={importTicketForm.realityQuantity}
                    onChange={(e) =>
                      setImportTicketForm((prev) => ({
                        ...prev,
                        realityQuantity: Number(e.target.value)
                      }))
                    }
                    placeholder='Nhập số lượng thực tế'
                  />
                  {importTicketForm.realityQuantity > 0 && (
                    <p className='text-muted-foreground text-xs'>
                      Sẽ tạo{' '}
                      {Math.floor(
                        importTicketForm.realityQuantity / BATCH_CAPACITY_KG
                      )}{' '}
                      batch (mỗi batch 20kg)
                    </p>
                  )}
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='areaId'>Area ID (tùy chọn)</Label>
                  <Input
                    id='areaId'
                    value={importTicketForm.areaId}
                    onChange={(e) =>
                      setImportTicketForm((prev) => ({
                        ...prev,
                        areaId: e.target.value
                      }))
                    }
                    placeholder='Nhập Area ID'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='importDate'>Ngày nhập kho *</Label>
                  <DateTimePicker
                    value={importTicketForm.importDate}
                    onChange={(value: string) =>
                      setImportTicketForm((prev) => ({
                        ...prev,
                        importDate: value
                      }))
                    }
                  />
                </div>
              </div>
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  onClick={() => setIsImportTicketDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleCreateImportTicket}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Tạo Import Ticket'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          <CardTitle>Bộ lọc</CardTitle>
          <div className='flex flex-1 gap-2'>
            <div className='relative flex-1'>
              <IconSearch className='text-muted-foreground absolute top-3 left-3 h-4 w-4' />
              <Input
                placeholder='Tìm theo batch code, product ID...'
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className='pl-10'
              />
            </div>
            <Button variant='outline' onClick={loadBatches}>
              Tìm kiếm
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Batch đã gắn Order Detail</CardTitle>
          <CardDescription>
            Các batch đã được phân bổ cho đơn hàng.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='w-full overflow-x-auto rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Import Ticket</TableHead>
                  <TableHead>Order Detail</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Khu vực</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center'>
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : assignedBatches.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className='text-muted-foreground text-center text-sm'
                    >
                      Chưa có batch nào được gắn Order Detail
                    </TableCell>
                  </TableRow>
                ) : (
                  assignedBatches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className='font-medium'>{batch.id}</TableCell>
                      <TableCell>{batch.importTicket?.id ?? '—'}</TableCell>
                      <TableCell>{batch.orderDetail?.id ?? '—'}</TableCell>
                      <TableCell>{batch.product?.id ?? '—'}</TableCell>
                      <TableCell>{batch.area?.id ?? '—'}</TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {batch.createdAt
                          ? new Date(batch.createdAt).toLocaleString('vi-VN')
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Batch chưa gắn Order Detail</CardTitle>
          <CardDescription>
            Batch còn trống để tiếp tục phân bổ cho đơn hàng khác.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='w-full overflow-x-auto rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Import Ticket</TableHead>
                  <TableHead>Order Detail</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Khu vực</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className='text-center'>
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : unassignedBatches.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className='text-muted-foreground text-center text-sm'
                    >
                      Không có batch trống
                    </TableCell>
                  </TableRow>
                ) : (
                  unassignedBatches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className='font-medium'>{batch.id}</TableCell>
                      <TableCell>{batch.importTicket?.id ?? '—'}</TableCell>
                      <TableCell>{batch.orderDetail?.id ?? '—'}</TableCell>
                      <TableCell>{batch.product?.id ?? '—'}</TableCell>
                      <TableCell>{batch.area?.id ?? '—'}</TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {batch.createdAt
                          ? new Date(batch.createdAt).toLocaleString('vi-VN')
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => handleOpenAssignDialog(batch)}
                        >
                          Gắn Order Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isAssignDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetAssignForm();
          }
          setIsAssignDialogOpen(open);
        }}
      >
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Gắn Order Detail cho batch</DialogTitle>
            <DialogDescription>
              Chọn Order Detail còn số lượng để gắn vào batch chưa có Order
              Detail.
            </DialogDescription>
          </DialogHeader>
          {selectedBatchForAssignment ? (
            <div className='space-y-4'>
              <div className='rounded-md border p-3 text-sm'>
                <p>
                  <span className='font-medium'>Batch:</span>{' '}
                  {selectedBatchForAssignment.batchCode}
                </p>
                <p>
                  <span className='font-medium'>Số lượng:</span>{' '}
                  {selectedBatchForAssignment.quantity}{' '}
                  {selectedBatchForAssignment.unit}
                </p>
                <p>
                  <span className='font-medium'>Product:</span>{' '}
                  {selectedBatchForAssignment.product?.id ?? '—'}
                </p>
              </div>
              <div className='space-y-2'>
                <Label>Order Detail</Label>
                <Select
                  value={assignForm.orderDetailId}
                  onValueChange={(value) =>
                    setAssignForm({ orderDetailId: value })
                  }
                  disabled={assignableOrderDetails.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        assignableOrderDetails.length === 0
                          ? 'Không còn Order Detail phù hợp'
                          : 'Chọn Order Detail'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {assignableOrderDetails.map((detail) => {
                      const stats = orderDetailStats[detail.id];
                      const remainingLabel =
                        stats?.remainingQuantity !== undefined
                          ? ` • còn ${stats.remainingQuantity} ${detail.unit ?? ''}`
                          : '';
                      return (
                        <SelectItem key={detail.id} value={detail.id}>
                          {detail.id} •{' '}
                          {detail.product?.name ||
                            detail.product?.id ||
                            'Không có sản phẩm'}
                          {remainingLabel}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}
          <div className='flex justify-end gap-2 pt-2'>
            <Button
              variant='outline'
              onClick={() => {
                setIsAssignDialogOpen(false);
                resetAssignForm();
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleAssignOrderDetail} disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : 'Gắn Order Detail'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

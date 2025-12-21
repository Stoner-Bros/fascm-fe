'use client';

import PageContainer from '@/components/layout/page-container';
import { Modal } from '@/components/modal';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import QualityDetection from '@/features/warehouse/components/quality-detection';
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Hash,
  Info,
  Loader2,
  MapPin,
  Package,
  Plus,
  Search,
  Warehouse
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useArea, useImport, useInboundBatch } from '../hooks/use-import';
import { ImportTable } from './import-table';
import { PermissionGuard } from '@/components/permissions';
import { Permission } from '@/constants/permissions';

export default function ImportList() {
  const {
    state,
    dispatch,
    createITicket,
    deleteITicket,
    page,
    setPage,
    limit,
    pageCount,
    setSearchQuery
  } = useImport();
  const { inboundBatches } = useInboundBatch();
  const { areas } = useArea();

  const [formData, setFormData] = useState({
    inboundBatchId: '',
    areaId: '',
    realityQuantity: 0,
    expiredAt: null as string | null
  });

  const handleCreate = async () => {
    if (
      !formData.inboundBatchId ||
      !formData.areaId ||
      !formData.realityQuantity
    ) {
      return;
    }

    const payload: any = {
      inboundBatch: { id: formData.inboundBatchId },
      area: { id: formData.areaId },
      realityQuantity: formData.realityQuantity
    };

    if (formData.expiredAt) {
      payload.expiredAt = new Date(formData.expiredAt).toISOString();
    }

    await createITicket(payload);
    setFormData({
      inboundBatchId: '',
      areaId: '',
      realityQuantity: 0,
      expiredAt: null
    });
  };

  const handleDeleteTicket = (ticketId: string) => {
    dispatch({ type: 'OPEN_DELETE_DIALOG', payload: ticketId });
  };

  const confirmDeleteTicket = async () => {
    if (state.selectedTicketId) {
      await deleteITicket(state.selectedTicketId);
    }
  };

  const handleCloseDialog = () => {
    dispatch({ type: 'CLOSE_DELETE_DIALOG' });
  };

  const filteredTickets = useMemo(() => {
    const q = state.searchQuery.toLowerCase();
    return state.importTickets.filter((ticket) => {
      const matchesSearch =
        ticket.id.toLowerCase().includes(q) ||
        ticket.batchCode.toLowerCase().includes(q) ||
        ticket.productName.toLowerCase().includes(q) ||
        ticket.areaName.toLowerCase().includes(q);
      return matchesSearch;
    });
  }, [state.importTickets, state.searchQuery]);

  // Filter batches that don't have an import ticket yet
  const availableBatches = useMemo(() => {
    return inboundBatches.filter((batch) => !batch.importTicket);
  }, [inboundBatches]);

  const selectedBatch = availableBatches.find(
    (b) => b.id === formData.inboundBatchId
  );

  return (
    <PageContainer scrollable={true}>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>
              Phiếu nhập kho
            </h2>
            <p className='text-muted-foreground'>
              Quản lý các phiếu nhập hàng vào kho
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <PermissionGuard permission={Permission.MANAGE_PURCHASE_IMPORT}>
              <Button
                variant='outline'
                onClick={() => dispatch({ type: 'OPEN_QUALITY_CHECK' })}
              >
                <CheckCircle2 className='mr-2 h-4 w-4' />
                Kiểm định chất lượng
              </Button>
            </PermissionGuard>
            <PermissionGuard permission={Permission.MANAGE_PURCHASE_IMPORT}>
              <Button onClick={() => dispatch({ type: 'OPEN_CREATE_DIALOG' })}>
                <Plus className='mr-2 h-4 w-4' />
                Tạo phiếu nhập
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {/* Status Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <Card className='hover:border-primary cursor-pointer'>
            <CardHeader>
              <CardDescription>Tổng phiếu nhập</CardDescription>
              <CardTitle className='text-3xl'>
                {state.loading ? (
                  <div className='bg-muted h-8 w-16 animate-pulse rounded' />
                ) : (
                  state.importTickets.length
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className='hover:border-primary cursor-pointer'>
            <CardHeader>
              <CardDescription className='flex items-center gap-2'>
                <Package className='h-4 w-4' />
                Sản phẩm
              </CardDescription>
              <CardTitle className='text-3xl'>
                {state.loading ? (
                  <div className='bg-muted h-8 w-16 animate-pulse rounded' />
                ) : (
                  new Set(state.importTickets.map((t) => t.productName)).size
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className='hover:border-primary cursor-pointer'>
            <CardHeader>
              <CardDescription className='flex items-center gap-2'>
                <MapPin className='h-4 w-4' />
                Khu vực
              </CardDescription>
              <CardTitle className='text-3xl'>
                {state.loading ? (
                  <div className='bg-muted h-8 w-16 animate-pulse rounded' />
                ) : (
                  new Set(state.importTickets.map((t) => t.areaName)).size
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
                  <Search className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
                  <Input
                    placeholder='Tìm kiếm theo mã phiếu, lô hàng, sản phẩm...'
                    className='pl-8'
                    value={state.searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {state.loading ? (
              <DataTableSkeleton columnCount={9} rowCount={10} />
            ) : filteredTickets.length === 0 ? (
              <div className='text-muted-foreground rounded-md border p-6 text-center text-sm'>
                Không có dữ liệu
              </div>
            ) : (
              <ImportTable
                loading={state.loading}
                tickets={filteredTickets}
                page={page ?? 1}
                limit={limit ?? 10}
                pageCount={pageCount}
                onPageChange={setPage}
                onDeleteTicket={handleDeleteTicket}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quality Check Modal */}
      <Modal
        title='Kiểm định chất lượng nhập kho'
        description='Kiểm tra và xác nhận chất lượng hàng hóa trước khi nhập kho'
        isOpen={state.isQualityCheckOpen}
        onClose={() => dispatch({ type: 'CLOSE_QUALITY_CHECK' })}
        className='h-[98vh] lg:max-w-6xl'
      >
        <QualityDetection />
      </Modal>

      {/* Create Modal */}
      <Modal
        title='Tạo phiếu nhập kho'
        description='Nhập thông tin để tạo phiếu nhập hàng vào kho'
        isOpen={state.isCreateDialogOpen}
        onClose={() => {
          dispatch({ type: 'CLOSE_CREATE_DIALOG' });
          setFormData({
            inboundBatchId: '',
            areaId: '',
            realityQuantity: 0,
            expiredAt: null
          });
        }}
        footer={
          <div className='flex w-full items-center justify-between'>
            <div className='text-muted-foreground flex items-center gap-2 text-sm'>
              <Info className='h-4 w-4' />
              <span>Các trường có dấu * là bắt buộc</span>
            </div>
            <div className='flex gap-3'>
              <Button
                variant='outline'
                onClick={() => {
                  dispatch({ type: 'CLOSE_CREATE_DIALOG' });
                  setFormData({
                    inboundBatchId: '',
                    areaId: '',
                    realityQuantity: 0,
                    expiredAt: null
                  });
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleCreate}
                disabled={
                  !formData.inboundBatchId ||
                  !formData.areaId ||
                  !formData.realityQuantity ||
                  state.loading
                }
                className='min-w-[140px]'
              >
                {state.loading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Plus className='mr-2 h-4 w-4' />
                    Tạo phiếu nhập
                  </>
                )}
              </Button>
            </div>
          </div>
        }
      >
        <div className='space-y-6'>
          {/* Section 1: Batch Selection */}
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <div className='bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full'>
                <ClipboardList className='h-4 w-4' />
              </div>
              <div>
                <h3 className='font-semibold'>Chọn lô hàng</h3>
                <p className='text-muted-foreground text-sm'>
                  Chọn lô hàng cần nhập kho
                </p>
              </div>
            </div>

            <div className='rounded-lg border p-4'>
              <Label
                htmlFor='inboundBatch'
                className='mb-2 flex items-center gap-2'
              >
                <Package className='text-muted-foreground h-4 w-4' />
                Lô hàng <span className='text-destructive'>*</span>
              </Label>
              <Select
                value={formData.inboundBatchId}
                onValueChange={(value) =>
                  setFormData({ ...formData, inboundBatchId: value })
                }
              >
                <SelectTrigger id='inboundBatch' className='h-11'>
                  <SelectValue placeholder='Chọn lô hàng cần nhập...' />
                </SelectTrigger>
                <SelectContent>
                  {availableBatches.length === 0 ? (
                    <div className='text-muted-foreground p-4 text-center text-sm'>
                      Không có lô hàng nào chưa nhập kho
                    </div>
                  ) : (
                    availableBatches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        <div className='flex items-center gap-2'>
                          <Badge
                            variant='outline'
                            className='font-mono text-xs'
                          >
                            {batch.batchCode}
                          </Badge>
                          <span>
                            {batch.harvestInvoiceDetail.product?.name}
                          </span>
                          <span className='text-muted-foreground'>
                            ({batch.quantity} {batch.unit})
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              {/* Batch Info Card */}
              {selectedBatch && (
                <div className='mt-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950'>
                  <div className='mb-3 flex items-center gap-2'>
                    <CheckCircle2 className='h-5 w-5 text-green-600' />
                    <h4 className='font-semibold text-green-800 dark:text-green-200'>
                      Thông tin lô hàng đã chọn
                    </h4>
                  </div>
                  <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                    <div className='flex items-center gap-3 rounded-md bg-white p-3 dark:bg-green-900/30'>
                      <Package className='h-5 w-5 text-green-600' />
                      <div>
                        <p className='text-muted-foreground text-xs'>
                          Sản phẩm
                        </p>
                        <p className='font-medium'>
                          {selectedBatch.harvestInvoiceDetail.product?.name}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-3 rounded-md bg-white p-3 dark:bg-green-900/30'>
                      <Hash className='h-5 w-5 text-green-600' />
                      <div>
                        <p className='text-muted-foreground text-xs'>
                          Số lượng
                        </p>
                        <p className='font-medium'>
                          {selectedBatch.quantity} {selectedBatch.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Storage Area */}
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <div className='bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full'>
                <Warehouse className='h-4 w-4' />
              </div>
              <div>
                <h3 className='font-semibold'>Khu vực lưu trữ</h3>
                <p className='text-muted-foreground text-sm'>
                  Chọn khu vực để lưu trữ hàng hóa
                </p>
              </div>
            </div>

            <div className='rounded-lg border p-4'>
              <Label htmlFor='area' className='mb-2 flex items-center gap-2'>
                <MapPin className='text-muted-foreground h-4 w-4' />
                Khu vực <span className='text-destructive'>*</span>
              </Label>
              <Select
                value={formData.areaId}
                onValueChange={(value) =>
                  setFormData({ ...formData, areaId: value })
                }
              >
                <SelectTrigger id='area' className='h-11'>
                  <SelectValue placeholder='Chọn khu vực lưu trữ...' />
                </SelectTrigger>
                <SelectContent>
                  {areas.length === 0 ? (
                    <div className='text-muted-foreground p-4 text-center text-sm'>
                      Không có khu vực nào
                    </div>
                  ) : (
                    areas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        <div className='flex items-center gap-2'>
                          <MapPin className='text-muted-foreground h-4 w-4' />
                          <span>{area.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Section 3: Quantity & Expiry */}
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <div className='bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full'>
                <Hash className='h-4 w-4' />
              </div>
              <div>
                <h3 className='font-semibold'>Thông tin nhập kho</h3>
                <p className='text-muted-foreground text-sm'>
                  Nhập số lượng thực tế và ngày hết hạn
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='rounded-lg border p-4'>
                <Label
                  htmlFor='realityQuantity'
                  className='mb-2 flex items-center gap-2'
                >
                  <Hash className='text-muted-foreground h-4 w-4' />
                  Số lượng thực tế <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='realityQuantity'
                  type='number'
                  min={0}
                  step='1'
                  value={formData.realityQuantity || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      realityQuantity: parseFloat(e.target.value) || 0
                    })
                  }
                  placeholder='Nhập số lượng'
                  className='h-11'
                />
                {selectedBatch && formData.realityQuantity > 0 && (
                  <div className='mt-2'>
                    {formData.realityQuantity === selectedBatch.quantity ? (
                      <Badge className='bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'>
                        Khớp với số lượng lô hàng
                      </Badge>
                    ) : formData.realityQuantity < selectedBatch.quantity ? (
                      <Badge className='bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'>
                        Thiếu{' '}
                        {(
                          selectedBatch.quantity - formData.realityQuantity
                        ).toFixed(2)}{' '}
                        {selectedBatch.unit}
                      </Badge>
                    ) : (
                      <Badge className='bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'>
                        Dư{' '}
                        {(
                          formData.realityQuantity - selectedBatch.quantity
                        ).toFixed(2)}{' '}
                        {selectedBatch.unit}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className='rounded-lg border p-4'>
                <Label
                  htmlFor='expiredAt'
                  className='mb-2 flex items-center gap-2'
                >
                  <Calendar className='text-muted-foreground h-4 w-4' />
                  Ngày hết hạn <span className='text-destructive'>*</span>
                </Label>
                <DateTimePicker
                  value={formData.expiredAt ?? undefined}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      expiredAt: value || null
                    })
                  }
                  placeholder='Chọn ngày hết hạn...'
                  className='h-11'
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={state.deleteDialogOpen}
        onOpenChange={handleCloseDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phiếu nhập kho này? Hành động này không
              thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTicket}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}

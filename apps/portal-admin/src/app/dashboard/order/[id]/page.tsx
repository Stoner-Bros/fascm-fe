'use client';

import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  createOrderPhase,
  fetchOrderPhasesBySchedule,
  updateOrderPhaseStatus
} from '@/services/order-phase.service';
import {
  fetchOrderScheduleById,
  updateOrderScheduleStatus
} from '@/services/order-schedule.service';
import type {
  CreateOrderInvoiceDetailDto,
  OrderPhase,
  OrderSchedule,
  OrderScheduleStatus
} from '@/types/order';
import { Check } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function getStatusBadge(status?: OrderScheduleStatus | null) {
  switch (status) {
    case 'pending':
      return <Badge className='bg-yellow-500'>Chờ duyệt</Badge>;
    case 'approved':
      return <Badge className='bg-green-500'>Đã duyệt</Badge>;
    case 'rejected':
      return <Badge className='bg-red-500'>Từ chối</Badge>;
    case 'processing':
      return <Badge className='bg-blue-500'>Đang xử lý</Badge>;
    case 'completed':
      return <Badge className='bg-gray-500'>Hoàn thành</Badge>;
    case 'canceled':
      return <Badge className='bg-gray-400'>Đã hủy</Badge>;
    default:
      return <Badge variant='outline'>-</Badge>;
  }
}

function getPhaseStatusBadge(status?: string | null) {
  switch (status) {
    case 'preparing':
      return <Badge className='bg-yellow-500'>Chuẩn bị</Badge>;
    case 'delivering':
      return <Badge className='bg-blue-500'>Đang giao</Badge>;
    case 'delivered':
      return <Badge className='bg-purple-500'>Đã giao</Badge>;
    case 'completed':
      return <Badge className='bg-green-500'>Hoàn thành</Badge>;
    case 'canceled':
      return <Badge className='bg-gray-400'>Đã hủy</Badge>;
    default:
      return <Badge variant='outline'>-</Badge>;
  }
}

export default function OrderScheduleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const scheduleId = params.id as string;

  const [schedule, setSchedule] = useState<OrderSchedule | null>(null);
  const [phases, setPhases] = useState<OrderPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updatingPhaseId, setUpdatingPhaseId] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showPhaseDialog, setShowPhaseDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [phaseData, setPhaseData] = useState({
    description: '',
    taxRate: 5,
    phaseNumber: 1,
    invoiceDetails: [] as CreateOrderInvoiceDetailDto[]
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [scheduleData, phasesData] = await Promise.all([
        fetchOrderScheduleById(scheduleId),
        fetchOrderPhasesBySchedule({
          orderScheduleId: scheduleId,
          limit: 50
        })
      ]);
      setSchedule(scheduleData);
      setPhases(phasesData.data);

      // Initialize phase invoice details from schedule
      if (scheduleData.orderDetails && scheduleData.orderDetails.length > 0) {
        setPhaseData((prev) => ({
          ...prev,
          invoiceDetails: scheduleData.orderDetails!.map((detail) => ({
            product: { id: detail.product!.id },
            quantity: 0,
            unitPrice: detail.unitPrice || 0,
            unit: detail.unit || ''
          }))
        }));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [scheduleId]);

  const handleApprove = async () => {
    if (!schedule) return;
    setUpdating(true);
    try {
      await updateOrderScheduleStatus(schedule.id, 'approved');
      toast({
        title: 'Thành công',
        description: 'Đã duyệt lịch giao hàng'
      });
      await loadData();
    } catch (error) {
      toast({
        title: 'Có lỗi xảy ra khi duyệt lịch giao hàng',
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!schedule || !rejectReason.trim()) {
      toast({
        title: 'Vui lòng nhập lý do từ chối',
        variant: 'destructive'
      });
      return;
    }
    setUpdating(true);
    try {
      await updateOrderScheduleStatus(schedule.id, 'rejected', rejectReason);
      setShowRejectDialog(false);
      setRejectReason('');
      toast({
        title: 'Thành công',
        description: 'Đã từ chối lịch giao hàng'
      });
      await loadData();
    } catch (error) {
      toast({
        title: 'Có lỗi xảy ra khi từ chối lịch giao hàng',
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCreatePhase = async () => {
    if (!schedule) return;

    // Validate invoice details
    const validDetails = phaseData.invoiceDetails.filter(
      (d) => d.quantity && d.quantity > 0
    );
    if (validDetails.length === 0) {
      toast({
        title: 'Vui lòng nhập số lượng cho ít nhất một sản phẩm',
        variant: 'destructive'
      });
      return;
    }

    // Calculate total amount with tax
    const subtotal = validDetails.reduce((sum, detail) => {
      return sum + detail.quantity! * (detail.unitPrice || 0);
    }, 0);
    const totalAmount = subtotal * (1 + phaseData.taxRate / 100);

    setUpdating(true);
    try {
      await createOrderPhase({
        description: phaseData.description || `Đợt ${phaseData.phaseNumber}`,
        phaseNumber: phaseData.phaseNumber,
        orderSchedule: { id: schedule.id },
        orderInvoice: {
          totalAmount,
          taxRate: phaseData.taxRate
        },
        orderInvoiceDetails: validDetails
      });

      setShowPhaseDialog(false);
      // Reset phase data
      setPhaseData({
        description: '',
        taxRate: 5,
        phaseNumber: phases.length + 2,
        invoiceDetails: schedule.orderDetails!.map((detail) => ({
          product: { id: detail.product!.id },
          quantity: 0,
          unitPrice: detail.unitPrice || 0,
          unit: detail.unit || ''
        }))
      });
      toast({
        title: 'Thành công',
        description: 'Đã tạo đợt giao hàng'
      });
      await loadData();
    } catch (error: any) {
      toast({
        title: error.details?.message || 'Có lỗi xảy ra',
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  };

  const updatePhaseDetailQuantity = (productId: string, quantity: number) => {
    setPhaseData((prev) => ({
      ...prev,
      invoiceDetails: prev.invoiceDetails.map((detail) =>
        detail.product.id === productId ? { ...detail, quantity } : detail
      )
    }));
  };

  const handleConfirmDelivery = async (phaseId: string) => {
    setUpdatingPhaseId(phaseId);
    try {
      await updateOrderPhaseStatus(phaseId, { status: 'completed' });
      toast({
        title: 'Thành công',
        description: 'Đã xác nhận giao hàng'
      });
      await loadData();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái đợt giao hàng',
        variant: 'destructive'
      });
    } finally {
      setUpdatingPhaseId(null);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className='mx-auto flex w-full justify-center py-40'>
          <p>Đang tải...</p>
        </div>
      </PageContainer>
    );
  }

  if (!schedule) {
    return (
      <PageContainer>
        <div className='mx-auto flex w-full justify-center py-40'>
          <p>Không tìm thấy lịch giao hàng</p>
        </div>
      </PageContainer>
    );
  }

  // Calculate totals for schedule
  const scheduleTotals = schedule.orderDetails?.reduce(
    (acc, detail) => {
      const productId = detail.product?.id || '';
      if (!acc[productId]) {
        acc[productId] = {
          name: detail.product?.name || '',
          total: 0,
          used: 0
        };
      }
      acc[productId].total += detail.quantity || 0;
      return acc;
    },
    {} as Record<string, { name: string; total: number; used: number }>
  );

  // Calculate used quantities from phases
  phases.forEach((phase) => {
    phase.orderInvoiceDetails?.forEach((detail) => {
      const productId = detail.product?.id || '';
      if (scheduleTotals && scheduleTotals[productId]) {
        scheduleTotals[productId].used += detail.quantity || 0;
      }
    });
  });

  // Check if there's any remaining quantity to create new phase
  const hasRemainingQuantity = scheduleTotals
    ? Object.values(scheduleTotals).some((totals) => totals.total > totals.used)
    : false;

  return (
    <PageContainer>
      <div className='mx-auto w-full space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button variant='outline' size='icon' onClick={() => router.back()}>
              ←
            </Button>
            <div>
              <h1 className='text-3xl font-bold'>Chi tiết lịch giao hàng</h1>
              <p className='text-muted-foreground mt-1'>
                Mã: {schedule.id.slice(0, 8)}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {schedule.status === 'pending' && (
              <>
                <Button
                  variant='destructive'
                  onClick={() => setShowRejectDialog(true)}
                  disabled={updating}
                >
                  Từ chối
                </Button>
                <Button onClick={handleApprove} disabled={updating}>
                  Duyệt
                </Button>
              </>
            )}
            {(schedule.status === 'approved' ||
              schedule.status === 'processing') &&
              hasRemainingQuantity && (
                <Button onClick={() => setShowPhaseDialog(true)}>
                  Tạo đợt giao hàng
                </Button>
              )}
            {schedule.status === 'processing' && !hasRemainingQuantity && (
              <Button
                onClick={() => {
                  updateOrderScheduleStatus(schedule.id, 'completed');
                  window.location.reload();
                }}
              >
                <Check className='mr-2 h-4 w-4' />
                Đánh dấu hoàn thành
              </Button>
            )}
          </div>
        </div>

        {/* General Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin chung</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label className='text-muted-foreground'>Trạng thái</Label>
                <div className='mt-1'>{getStatusBadge(schedule.status)}</div>
              </div>
              <div>
                <Label className='text-muted-foreground'>Ngày giao hàng</Label>
                <p className='mt-1'>
                  {schedule.deliveryDate
                    ? new Date(schedule.deliveryDate).toLocaleDateString(
                        'vi-VN',
                        {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }
                      )
                    : '-'}
                </p>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label className='text-muted-foreground'>Khách hàng</Label>
                <p className='mt-1'>
                  {schedule.consignee?.organizationName || '-'}
                </p>
              </div>
              <div>
                <Label className='text-muted-foreground'>
                  Địa chỉ giao hàng
                </Label>
                <p className='mt-1'>{schedule.address || '-'}</p>
              </div>
            </div>
            {schedule.description && (
              <div>
                <Label className='text-muted-foreground'>Mô tả</Label>
                <p className='mt-1'>{schedule.description}</p>
              </div>
            )}
            {schedule.reason && (
              <div>
                <Label className='text-muted-foreground'>Lý do từ chối</Label>
                <p className='mt-1 text-red-600'>{schedule.reason}</p>
              </div>
            )}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label className='text-muted-foreground'>Ngày tạo</Label>
                <p className='mt-1'>
                  {new Date(schedule.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <Label className='text-muted-foreground'>
                  Cập nhật lần cuối
                </Label>
                <p className='mt-1'>
                  {new Date(schedule.updatedAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết đơn hàng</CardTitle>
            {scheduleTotals && (
              <p className='text-muted-foreground text-sm'>
                Tổng quan số lượng đã giao / tổng số lượng
              </p>
            )}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Đơn vị</TableHead>
                  <TableHead>Đơn giá</TableHead>
                  <TableHead>Thành tiền</TableHead>
                  {scheduleTotals && <TableHead>Đã giao</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.orderDetails && schedule.orderDetails.length > 0 ? (
                  schedule.orderDetails.map((detail) => {
                    const productId = detail.product?.id || '';
                    const totals = scheduleTotals?.[productId];
                    const quantity = detail.quantity || 0;
                    const unitPrice = detail.unitPrice || 0;
                    const amount = quantity * unitPrice;

                    return (
                      <TableRow key={detail.id}>
                        <TableCell>{detail.product?.name || '-'}</TableCell>
                        <TableCell>{quantity}</TableCell>
                        <TableCell>{detail.unit || '-'}</TableCell>
                        <TableCell>
                          {unitPrice.toLocaleString('vi-VN')} đ
                        </TableCell>
                        <TableCell>
                          {amount.toLocaleString('vi-VN')} đ
                        </TableCell>
                        {scheduleTotals && (
                          <TableCell>
                            <span
                              className={
                                totals && totals.used >= totals.total
                                  ? 'text-green-600'
                                  : 'text-orange-600'
                              }
                            >
                              {totals?.used || 0} / {totals?.total || 0}
                            </span>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={scheduleTotals ? 6 : 5}
                      className='text-center'
                    >
                      Không có chi tiết đơn hàng
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Phases List */}
        {phases.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Các đợt giao hàng</CardTitle>
              <p className='text-muted-foreground text-sm'>
                Danh sách các đợt giao hàng đã tạo
              </p>
            </CardHeader>
            <CardContent className='space-y-4'>
              {phases.map((phase) => (
                <Card key={phase.id}>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <div>
                        <CardTitle className='text-lg'>
                          Đợt {phase.phaseNumber}: {phase.description}
                        </CardTitle>
                        <p className='text-muted-foreground text-sm'>
                          Mã hóa đơn: {phase.orderInvoice?.invoiceNumber || '-'}
                        </p>
                      </div>
                      <div className='flex items-center gap-2'>
                        {getPhaseStatusBadge(phase.status)}
                        {phase.status === 'delivered' && (
                          <Button
                            size='sm'
                            onClick={() => handleConfirmDelivery(phase.id)}
                            disabled={updatingPhaseId === phase.id}
                          >
                            Xác nhận giao hàng
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sản phẩm</TableHead>
                          <TableHead>Số lượng</TableHead>
                          <TableHead>Đơn vị</TableHead>
                          <TableHead>Đơn giá</TableHead>
                          <TableHead>Thành tiền</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {phase.orderInvoiceDetails?.map((detail) => {
                          const quantity = detail.quantity || 0;
                          const unitPrice = detail.unitPrice || 0;
                          const amount = quantity * unitPrice;

                          return (
                            <TableRow key={detail.id}>
                              <TableCell>
                                {detail.product?.name || '-'}
                              </TableCell>
                              <TableCell>{quantity}</TableCell>
                              <TableCell>{detail.unit || '-'}</TableCell>
                              <TableCell>
                                {unitPrice.toLocaleString('vi-VN')} đ
                              </TableCell>
                              <TableCell>
                                {amount.toLocaleString('vi-VN')} đ
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {phase.orderInvoice?.taxRate != null && (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className='text-muted-foreground text-right text-sm'
                            >
                              Thuế ({phase.orderInvoice.taxRate}%):
                            </TableCell>
                            <TableCell className='text-muted-foreground text-sm'>
                              {(
                                (phase.orderInvoiceDetails?.reduce(
                                  (sum, d) =>
                                    sum +
                                    (d.quantity || 0) * (d.unitPrice || 0),
                                  0
                                ) || 0) *
                                (phase.orderInvoice.taxRate / 100)
                              ).toLocaleString('vi-VN')}{' '}
                              đ
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className='text-right font-semibold'
                          >
                            Tổng tiền:
                          </TableCell>
                          <TableCell className='font-semibold'>
                            {(
                              phase.orderInvoice?.totalPayment || 0
                            ).toLocaleString('vi-VN')}{' '}
                            đ
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Từ chối lịch giao hàng</DialogTitle>
              <DialogDescription>
                Vui lòng nhập lý do từ chối lịch giao hàng này
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='reason'>Lý do từ chối</Label>
                <Textarea
                  id='reason'
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder='Nhập lý do từ chối...'
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setShowRejectDialog(false)}
              >
                Hủy
              </Button>
              <Button
                variant='destructive'
                onClick={handleReject}
                disabled={updating || !rejectReason.trim()}
              >
                Xác nhận từ chối
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Phase Dialog */}
        <Dialog open={showPhaseDialog} onOpenChange={setShowPhaseDialog}>
          <DialogContent className='max-h-[80vh] max-w-3xl overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Tạo đợt giao hàng mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin cho đợt giao hàng mới
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='phaseNumber'>Số đợt</Label>
                <Input
                  id='phaseNumber'
                  type='number'
                  value={phaseData.phaseNumber}
                  onChange={(e) =>
                    setPhaseData((prev) => ({
                      ...prev,
                      phaseNumber: parseInt(e.target.value) || 1
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor='taxRate'>Mức thuế (%)</Label>
                <Input
                  id='taxRate'
                  type='number'
                  value={phaseData.taxRate}
                  onChange={(e) =>
                    setPhaseData((prev) => ({
                      ...prev,
                      taxRate: parseInt(e.target.value) || 1
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor='description'>Mô tả</Label>
                <Textarea
                  id='description'
                  value={phaseData.description}
                  onChange={(e) =>
                    setPhaseData((prev) => ({
                      ...prev,
                      description: e.target.value
                    }))
                  }
                  placeholder='Nhập mô tả...'
                  rows={3}
                />
              </div>
              <div>
                <Label>Chi tiết sản phẩm</Label>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead>Còn lại</TableHead>
                      <TableHead>Số lượng giao</TableHead>
                      <TableHead>Đơn vị</TableHead>
                      <TableHead>Đơn giá</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {phaseData.invoiceDetails.map((detail, index) => {
                      const product = schedule.orderDetails?.find(
                        (d) => d.product?.id === detail.product.id
                      );
                      const productId = detail.product.id;
                      const totals = scheduleTotals?.[productId];
                      const remaining = totals ? totals.total - totals.used : 0;

                      return (
                        <TableRow key={index}>
                          <TableCell>{product?.product?.name || '-'}</TableCell>
                          <TableCell>{remaining}</TableCell>
                          <TableCell>
                            <Input
                              type='number'
                              min='0'
                              max={remaining}
                              value={detail.quantity || 0}
                              onChange={(e) =>
                                updatePhaseDetailQuantity(
                                  detail.product.id,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>{detail.unit}</TableCell>
                          <TableCell>
                            {(detail.unitPrice || 0).toLocaleString('vi-VN')} đ
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setShowPhaseDialog(false)}
              >
                Hủy
              </Button>
              <Button onClick={handleCreatePhase} disabled={updating}>
                Tạo đợt giao hàng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}

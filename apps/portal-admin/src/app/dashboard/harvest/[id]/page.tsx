'use client';

import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
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
  createHarvestPhase,
  fetchHarvestPhasesBySchedule,
  updateHarvestPhaseStatus
} from '@/services/harvest-phase.service';
import {
  fetchHarvestScheduleById,
  updateHarvestScheduleStatus
} from '@/services/harvest-schedule.service';
import type {
  CreateHarvestInvoiceDetailDto,
  HarvestPhase
} from '@/types/harvest-phase';
import type {
  HarvestSchedule,
  HarvestScheduleStatus
} from '@/types/harvest-schedule';
import {
  ArrowLeft,
  Check,
  CheckCircle,
  Package,
  Plus,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function getStatusBadge(status?: HarvestScheduleStatus | null) {
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

export default function HarvestScheduleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const scheduleId = params.id as string;

  const [schedule, setSchedule] = useState<HarvestSchedule | null>(null);
  const [phases, setPhases] = useState<HarvestPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updatingPhaseId, setUpdatingPhaseId] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showPhaseDialog, setShowPhaseDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [phaseData, setPhaseData] = useState({
    description: '',
    phaseNumber: 1,
    taxRate: 5,
    invoiceDetails: [] as CreateHarvestInvoiceDetailDto[]
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [scheduleData, phasesData] = await Promise.all([
        fetchHarvestScheduleById(scheduleId),
        fetchHarvestPhasesBySchedule({
          harvestScheduleId: scheduleId,
          limit: 50
        })
      ]);
      setSchedule(scheduleData);
      setPhases(phasesData.data);

      // Initialize phase invoice details from schedule
      if (
        scheduleData.harvestDetails &&
        scheduleData.harvestDetails.length > 0
      ) {
        setPhaseData((prev) => ({
          ...prev,
          invoiceDetails: scheduleData.harvestDetails!.map((detail) => ({
            product: { id: detail.product!.id },
            quantity: 0,
            unitPrice: detail.unitPrice || 0,
            unit: detail.unit || ''
          }))
        }));
      }
    } catch (error) {
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
      await updateHarvestScheduleStatus(schedule.id, 'approved');
      await loadData();
    } catch (error) {
      toast({
        title: 'Có lỗi xảy ra khi duyệt lịch thu hoạch',
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
      await updateHarvestScheduleStatus(schedule.id, 'rejected', rejectReason);
      setShowRejectDialog(false);
      setRejectReason('');
      await loadData();
    } catch (error) {
      toast({
        title: 'Có lỗi xảy ra khi từ chối lịch thu hoạch',
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
      await createHarvestPhase({
        description: phaseData.description || `Đợt ${phaseData.phaseNumber}`,
        phaseNumber: phaseData.phaseNumber,
        harvestSchedule: { id: schedule.id },
        harvestInvoice: {
          totalAmount,
          taxRate: phaseData.taxRate
        },
        harvestInvoiceDetails: validDetails
      });

      setShowPhaseDialog(false);
      // Reset phase data
      setPhaseData({
        description: '',
        phaseNumber: phases.length + 2,
        taxRate: 5,
        invoiceDetails: schedule.harvestDetails!.map((detail) => ({
          product: { id: detail.product!.id },
          quantity: 0,
          unitPrice: detail.unitPrice || 0,
          unit: detail.unit || ''
        }))
      });
      await loadData();
    } catch (error: any) {
      toast({
        title: error.details.message,
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
      await updateHarvestPhaseStatus(phaseId, { status: 'completed' });
      toast({
        title: 'Thành công',
        description: 'Đã xác nhận nhận hàng'
      });
      await loadData();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái đợt thu hoạch',
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
          <p>Không tìm thấy lịch thu hoạch</p>
        </div>
      </PageContainer>
    );
  }

  // Calculate totals for schedule
  const scheduleTotals = schedule.harvestDetails?.reduce(
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
    phase.harvestInvoiceDetails?.forEach((detail) => {
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
            <Button variant='ghost' size='icon' asChild>
              <Link href='/dashboard/harvest'>
                <ArrowLeft className='h-5 w-5' />
              </Link>
            </Button>
            <div>
              <h1 className='text-3xl font-bold'>Chi tiết lịch thu hoạch</h1>
              <p className='text-muted-foreground'>Mã: {schedule.id}</p>
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
                  <XCircle className='mr-2 h-4 w-4' />
                  Từ chối
                </Button>
                <Button onClick={handleApprove} disabled={updating}>
                  <CheckCircle className='mr-2 h-4 w-4' />
                  Duyệt
                </Button>
              </>
            )}
            {schedule.status === 'approved' && hasRemainingQuantity && (
              <Button onClick={() => setShowPhaseDialog(true)}>
                <Plus className='mr-2 h-4 w-4' />
                Tạo đợt thu hoạch
              </Button>
            )}
            {schedule.status === 'processing' && !hasRemainingQuantity && (
              <Button
                onClick={() =>
                  updateHarvestScheduleStatus(schedule.id, 'completed')
                }
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
                <Label className='text-muted-foreground'>Ngày thu hoạch</Label>
                <p className='mt-1'>
                  {schedule.harvestDate
                    ? new Date(schedule.harvestDate).toLocaleString('vi-VN')
                    : '-'}
                </p>
              </div>
              <div>
                <Label className='text-muted-foreground'>Nhà cung cấp</Label>
                <p className='mt-1 font-medium'>
                  {schedule.supplier?.gardenName || '-'}
                </p>
              </div>
              <div>
                <Label className='text-muted-foreground'>Địa chỉ</Label>
                <p className='mt-1'>{schedule.address || '-'}</p>
              </div>
              {schedule.description && (
                <div className='col-span-2'>
                  <Label className='text-muted-foreground'>Mô tả</Label>
                  <p className='mt-1'>{schedule.description}</p>
                </div>
              )}
              {schedule.reason && (
                <div className='col-span-2'>
                  <Label className='text-muted-foreground'>Lý do từ chối</Label>
                  <p className='mt-1 text-red-600'>{schedule.reason}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Harvest Details */}
        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm thu hoạch</CardTitle>
            <CardDescription>
              Danh sách sản phẩm và số lượng dự kiến
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead className='text-right'>Số lượng</TableHead>
                  <TableHead className='text-right'>Đơn vị</TableHead>
                  <TableHead className='text-right'>Đơn giá</TableHead>
                  <TableHead className='text-right'>Thành tiền</TableHead>
                  {schedule.status === 'approved' && (
                    <TableHead className='text-right'>Đã phân đợt</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.harvestDetails?.map((detail) => {
                  const productTotals =
                    scheduleTotals?.[detail.product?.id || ''];
                  return (
                    <TableRow key={detail.id}>
                      <TableCell className='font-medium'>
                        {detail.product?.name || '-'}
                      </TableCell>
                      <TableCell className='text-right'>
                        {detail.quantity || 0}
                      </TableCell>
                      <TableCell className='text-right'>
                        {detail.unit || '-'}
                      </TableCell>
                      <TableCell className='text-right'>
                        {(detail.unitPrice || 0).toLocaleString('vi-VN')} đ
                      </TableCell>
                      <TableCell className='text-right'>
                        {(
                          (detail.quantity || 0) * (detail.unitPrice || 0)
                        ).toLocaleString('vi-VN')}{' '}
                        đ
                      </TableCell>
                      {schedule.status === 'approved' && productTotals && (
                        <TableCell className='text-right'>
                          <span
                            className={
                              productTotals.used > productTotals.total
                                ? 'text-red-600'
                                : ''
                            }
                          >
                            {productTotals.used} / {productTotals.total}
                          </span>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Phases List */}
        {phases.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Các đợt thu hoạch</CardTitle>
              <CardDescription>
                Đã tạo {phases.length} đợt thu hoạch
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {phases.map((phase) => (
                <div key={phase.id} className='rounded-lg border p-4'>
                  <div className='mb-3 flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <Package className='text-muted-foreground h-5 w-5' />
                      <div>
                        <p className='font-semibold'>Đợt {phase.phaseNumber}</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge>{phase.status || 'pending'}</Badge>
                      {phase.status === 'delivered' && (
                        <Button
                          size='sm'
                          onClick={() => handleConfirmDelivery(phase.id)}
                          disabled={updatingPhaseId === phase.id}
                        >
                          <CheckCircle className='mr-1 h-3 w-3' />
                          Đã nhận
                        </Button>
                      )}
                    </div>
                  </div>

                  <Separator className='my-3' />

                  <div className='space-y-2'>
                    {phase.harvestInvoiceDetails?.map((detail) => (
                      <div
                        key={detail.id}
                        className='flex justify-between text-sm'
                      >
                        <span>{detail.product?.name}</span>
                        <span className='font-medium'>
                          {detail.quantity} {detail.unit} ×{' '}
                          {(detail.unitPrice || 0).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    ))}
                    <Separator className='my-2' />
                    {phase.harvestInvoice?.taxRate && (
                      <div className='flex justify-between text-sm'>
                        <span>Thuế ({phase.harvestInvoice.taxRate}%)</span>
                        <span>
                          {(
                            (phase.harvestInvoiceDetails?.reduce(
                              (sum, d) =>
                                sum + (d.quantity || 0) * (d.unitPrice || 0),
                              0
                            ) || 0) *
                            (phase.harvestInvoice.taxRate / 100)
                          ).toLocaleString('vi-VN')}{' '}
                          đ
                        </span>
                      </div>
                    )}
                    <Separator className='my-2' />
                    <div className='flex justify-between font-semibold'>
                      <span>Tổng cộng</span>
                      <span>
                        {(
                          phase.harvestInvoice?.totalPayment || 0
                        ).toLocaleString('vi-VN')}{' '}
                        đ
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Từ chối lịch thu hoạch</DialogTitle>
              <DialogDescription>
                Vui lòng nhập lý do từ chối lịch thu hoạch này
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='reason'>Lý do từ chối *</Label>
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
                disabled={updating}
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
              <DialogTitle>Tạo đợt thu hoạch</DialogTitle>
              <DialogDescription>
                Nhập thông tin cho đợt thu hoạch mới
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='phaseNumber'>Số đợt</Label>
                  <Input
                    id='phaseNumber'
                    type='number'
                    value={phaseData.phaseNumber}
                    onChange={(e) =>
                      setPhaseData({
                        ...phaseData,
                        phaseNumber: parseInt(e.target.value) || 1
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='taxRate'>Mức thuế</Label>
                  <Input
                    id='taxRate'
                    type='number'
                    value={phaseData.taxRate}
                    onChange={(e) =>
                      setPhaseData({
                        ...phaseData,
                        taxRate: parseInt(e.target.value) || 1
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor='description'>Mô tả đợt</Label>
                <Textarea
                  id='description'
                  value={phaseData.description}
                  onChange={(e) =>
                    setPhaseData({ ...phaseData, description: e.target.value })
                  }
                  placeholder='Nhập mô tả cho đợt thu hoạch...'
                  rows={3}
                />
              </div>

              <Separator />

              <div>
                <Label className='text-base'>Chi tiết sản phẩm</Label>
                <p className='text-muted-foreground mb-3 text-sm'>
                  Nhập số lượng cho từng sản phẩm trong đợt này
                </p>
                <div className='space-y-3'>
                  {phaseData.invoiceDetails.map((detail) => {
                    const product = schedule.harvestDetails?.find(
                      (d) => d.product?.id === detail.product.id
                    );
                    const productTotals = scheduleTotals?.[detail.product.id];
                    const remaining = productTotals
                      ? productTotals.total - productTotals.used
                      : 0;

                    return (
                      <div
                        key={detail.product.id}
                        className='rounded-lg border p-3'
                      >
                        <div className='mb-2 flex items-center justify-between'>
                          <span className='font-medium'>
                            {product?.product?.name}
                          </span>
                          <span className='text-muted-foreground text-sm'>
                            Còn lại: {remaining} {detail.unit}
                          </span>
                        </div>
                        <div className='grid grid-cols-3 gap-2'>
                          <div>
                            <Label className='text-xs'>Số lượng</Label>
                            <Input
                              type='number'
                              min={0}
                              max={remaining}
                              value={detail.quantity || 0}
                              onChange={(e) =>
                                updatePhaseDetailQuantity(
                                  detail.product.id,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label className='text-xs'>Đơn giá</Label>
                            <Input
                              type='number'
                              value={detail.unitPrice || 0}
                              disabled
                            />
                          </div>
                          <div>
                            <Label className='text-xs'>Thành tiền</Label>
                            <Input
                              value={(
                                (detail.quantity || 0) * (detail.unitPrice || 0)
                              ).toLocaleString('vi-VN')}
                              disabled
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className='bg-muted mt-4 rounded-lg p-3'>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span>Tạm tính:</span>
                      <span>
                        {phaseData.invoiceDetails
                          .reduce(
                            (sum, d) =>
                              sum + (d.quantity || 0) * (d.unitPrice || 0),
                            0
                          )
                          .toLocaleString('vi-VN')}{' '}
                        đ
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span>Thuế ({phaseData.taxRate}%):</span>
                      <span>
                        {(
                          phaseData.invoiceDetails.reduce(
                            (sum, d) =>
                              sum + (d.quantity || 0) * (d.unitPrice || 0),
                            0
                          ) *
                          (phaseData.taxRate / 100)
                        ).toLocaleString('vi-VN')}{' '}
                        đ
                      </span>
                    </div>
                    <Separator />
                    <div className='flex items-center justify-between'>
                      <span className='font-semibold'>Tổng tiền đợt này:</span>
                      <span className='text-lg font-bold'>
                        {(
                          phaseData.invoiceDetails.reduce(
                            (sum, d) =>
                              sum + (d.quantity || 0) * (d.unitPrice || 0),
                            0
                          ) *
                          (1 + phaseData.taxRate / 100)
                        ).toLocaleString('vi-VN')}{' '}
                        đ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setShowPhaseDialog(false)}
                disabled={updating}
              >
                Hủy
              </Button>

              {/* Kiểm tra còn có thể tạo đợt mới hiện nút */}
              <Button onClick={handleCreatePhase} disabled={updating}>
                Tạo đợt thu hoạch
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}

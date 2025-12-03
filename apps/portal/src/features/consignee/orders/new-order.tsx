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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { IconLoader2, IconPlus, IconTrash } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product } from '@/types/product';
import {
  CreateOrderRequest,
  CreateOrderDetailRequest
} from '../../../types/order';
import { createOrder } from '@/services/order.service';
import { fetchProducts } from '@/services/product.service';
import { createOrderDetail } from '@/services/order-detail.service';
import { createOrderSchedule } from '@/services/order-schedule.service';
import { fetchMyConsignee } from '@/services/consignee.service';
import type { Consignee } from '@/types/consignee';
import dynamic from 'next/dynamic';
const AddressPickerMap = dynamic(
  () => import('@/components/map/osrm-map').then((m) => m.AddressPickerMap),
  { ssr: false }
);
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Textarea } from '@/components/ui/textarea';

type OrderLine = {
  productId?: string;
  quantity: number;
  unit?: string;
  unitPrice?: number;
};

export default function ConsigneeNewOrderFeature() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lines, setLines] = useState<OrderLine[]>([{ quantity: 0 }]);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const didFetchRef = useRef(false);
  const didPrefillRef = useRef(false);
  const [scheduleDescription, setScheduleDescription] = useState('');
  const SCHEDULE_STATUS = 'pending';
  const [scheduleDateTime, setScheduleDateTime] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  });
  const [consignee, setConsignee] = useState<Consignee | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [contact, setContact] = useState<string>('');
  const [deliveryPos, setDeliveryPos] = useState<
    { lat: number; lng: number } | undefined
  >(undefined);
  const [showMap, setShowMap] = useState<boolean>(false);

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    fetchProducts({ page: 1, limit: 50 })
      .then((res) => {
        const data = Array.isArray(res?.data) ? res.data : [];
        const mapped: Product[] = data.map((p: any) => ({
          id: p.id,
          name: p.name ?? undefined,
          image: p.image ?? null,
          pricePerKg:
            typeof p.pricePerKg === 'number'
              ? p.pricePerKg
              : Number(p.pricePerKg) || null
        }));
        setProducts(mapped);
      })
      .catch((err) => {
        if (err?.status === 401) {
          router.push('/auth/sign-in');
          return;
        }
        toast({
          title: 'Lỗi tải sản phẩm',
          description: 'Không thể tải danh sách sản phẩm'
        });
      });
    fetchMyConsignee()
      .then((c) => {
        setConsignee(c ?? null);
        setDeliveryAddress(String(c?.address ?? ''));
        setContact(String(c?.contact ?? ''));
      })
      .catch(() => {})
      .finally(() => {});
  }, [router, toast]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const pids = params.getAll('product');
    if (pids.length === 0) return;
    if (didPrefillRef.current) return;
    const linesPrefill = pids
      .map((pid) => {
        const selected = products.find((p) => p.id === pid);
        if (!selected) return null;
        return {
          productId: pid,
          quantity: 1,
          unit: 'kg',
          unitPrice: Number(selected.pricePerKg ?? 0)
        } as OrderLine;
      })
      .filter(Boolean) as OrderLine[];
    if (linesPrefill.length === 0) return;
    setLines(linesPrefill);
    didPrefillRef.current = true;
  }, [searchParams, products]);

  const findProduct = (id: string) => products.find((p) => p.id === id);
  const addLine = () => {
    setLines((prev) => [...prev, { quantity: 0 }]);
  };

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const setProductForLine = (index: number, productId: string) => {
    setLines((prev) => {
      const next = [...prev];
      const selected = products.find((p) => p.id === productId);
      next[index] = {
        ...next[index],
        productId,
        unitPrice: Number(selected?.pricePerKg ?? 0)
      };
      return next;
    });
  };

  const setQtyForLine = (index: number, quantity: number) => {
    setLines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], quantity };
      return next;
    });
  };

  const setUnitForLine = (index: number, unit: string) => {
    setLines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], unit };
      return next;
    });
  };

  const normalizeUnit = (u?: string) => (u ?? '').toLowerCase().trim();
  const computeMassKg = (line: OrderLine) => {
    const u = normalizeUnit(line.unit);
    const q = Number.isFinite(line.quantity) ? line.quantity : 0;
    if (u.includes('kg')) return q;
    if (u.includes('tấn') || u.includes('ton') || u === 't') return q * 1000;
    return 0;
  };
  const computeVolumeLiters = (line: OrderLine) => {
    const u = normalizeUnit(line.unit);
    const q = Number.isFinite(line.quantity) ? line.quantity : 0;
    if (u === 'l' || u.includes('lit')) return q;
    if (u === 'ml') return q / 1000;
    if (u.includes('m3')) return q * 1000;
    if (u.includes('kg')) return q;
    if (u.includes('tấn') || u.includes('ton') || u === 't') return q * 1000;
    return 0;
  };

  const lineError = (line: OrderLine) => {
    if (!line.productId) return 'Chọn sản phẩm';
    if (line.quantity <= 0) return 'Số lượng phải > 0';
    return null;
  };

  const submitOrder = async () => {
    const errors = lines.map(lineError).filter(Boolean);
    if (errors.length > 0) {
      toast({
        title: 'Kiểm tra lại các dòng đặt hàng',
        description: 'Có dòng chưa hợp lệ, vui lòng chỉnh sửa.'
      });
      return;
    }
    setSubmitting(true);
    try {
      const totalAmount = lines.reduce(
        (acc, l) =>
          acc +
          (Number.isFinite(l.quantity) ? l.quantity : 0) * (l.unitPrice ?? 0),
        0
      );
      const taxRate = 5;
      const vatAmount = totalAmount * (taxRate / 100);
      const toInt = (n: number) => Math.round(n);
      const totalMass = lines.reduce((acc, l) => acc + computeMassKg(l), 0);
      const totalVolume = lines.reduce(
        (acc, l) => acc + computeVolumeLiters(l),
        0
      );
      // Không cập nhật consignee; chỉ set address trong schedule
      const schedule = await createOrderSchedule({
        description: scheduleDescription,
        status: SCHEDULE_STATUS,
        orderDate: new Date(scheduleDateTime).toISOString(),
        address: deliveryAddress || null,
        consignee: consignee?.id ? { id: consignee.id } : undefined
      });

      const orderPayload: CreateOrderRequest = {
        totalAmount: toInt(totalAmount),
        taxRate,
        vatAmount: toInt(vatAmount),
        totalPayment: toInt(totalAmount + vatAmount),
        totalVolume,
        totalMass,
        orderDate: new Date().toISOString(),
        orderUrl: '',
        orderSchedule: { id: schedule.id }
      };
      const order = await createOrder(orderPayload);
      for (const l of lines) {
        const qty = Number.isFinite(l.quantity) ? l.quantity : 0;
        const base = qty * (l.unitPrice ?? 0);
        const gross = base * (1 + taxRate / 100);
        const detailPayload: CreateOrderDetailRequest = {
          order: { id: order.id },
          product: l.productId ? { id: l.productId } : null,
          quantity: qty,
          unitPrice: l.unitPrice ?? 0,
          unit: l.unit ?? '',
          amount: toInt(gross),
          taxRate: taxRate
        };
        await createOrderDetail(detailPayload);
      }
      toast({
        title: 'Tạo đơn hàng thành công',
        description: `${lines.length} dòng đã được lưu.`
      });
      router.push(`/consignee/orders`);
    } catch (err: any) {
      if (err?.status === 401) {
        router.push('/auth/sign-in');
        return;
      }
      const message =
        typeof err?.message === 'string'
          ? err.message
          : 'Vui lòng thử lại sau.';
      toast({
        title: 'Lỗi khi tạo đơn hàng',
        description: message
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <div className='mx-auto w-full max-w-7xl space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>Tạo đơn hàng</h2>
            <p className='text-muted-foreground'>
              Điền thông tin để tạo đơn đặt hàng mới
            </p>
          </div>
        </div>

        {/* Order Schedule Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin lịch đặt hàng</CardTitle>
            <CardDescription>
              Chọn ngày giờ và ghi chú cho đơn hàng của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='schedule-datetime'>
                  Ngày & Giờ nhận hàng{' '}
                  <span className='text-destructive'>*</span>
                </Label>
                <DateTimePicker
                  value={scheduleDateTime}
                  onChange={(value) => setScheduleDateTime(value)}
                  placeholder='Chọn ngày và giờ'
                />
                <p className='text-muted-foreground text-xs'>
                  Chọn thời gian mong muốn nhận hàng
                </p>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='schedule-description'>
                  Mô tả lịch đặt hàng
                </Label>
                <Textarea
                  id='schedule-description'
                  value={scheduleDescription}
                  onChange={(e) => setScheduleDescription(e.target.value)}
                  placeholder='Nhập mô tả hoặc ghi chú cho đơn hàng...'
                  rows={3}
                  className='resize-none'
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin giao hàng</CardTitle>
            <CardDescription>
              Địa chỉ và thông tin liên hệ nhận hàng
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label>Tên tổ chức</Label>
                <Input
                  value={String(consignee?.organizationName ?? '')}
                  disabled
                  readOnly
                  className='bg-muted'
                />
              </div>
              <div className='space-y-2'>
                <Label>Người đại diện</Label>
                <Input
                  value={String(consignee?.representativeName ?? '')}
                  disabled
                  readOnly
                  className='bg-muted'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='delivery-address'>
                Địa chỉ giao hàng <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='delivery-address'
                type='text'
                placeholder='Nhập địa chỉ giao hàng chi tiết'
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            </div>

            <div className='space-y-3'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setShowMap((v) => !v)}
              >
                {showMap ? 'Đóng bản đồ' : 'Chọn vị trí trên bản đồ'}
              </Button>
              {showMap && (
                <div className='rounded-lg border p-2'>
                  <AddressPickerMap
                    value={{
                      position: deliveryPos,
                      address: deliveryAddress
                    }}
                    onChange={(v) => {
                      setDeliveryAddress(v.address);
                      setDeliveryPos(v.position);
                    }}
                  />
                </div>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='contact'>Số điện thoại liên hệ</Label>
              <Input
                id='contact'
                type='text'
                placeholder='Nhập số điện thoại liên hệ'
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Selection */}
        <Card>
          <CardHeader>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <CardTitle>Danh sách sản phẩm đặt mua</CardTitle>
                <CardDescription>
                  Chọn sản phẩm và số lượng cần đặt
                </CardDescription>
              </div>
              <Button onClick={addLine} size='sm'>
                <IconPlus className='mr-2 h-4 w-4' /> Thêm sản phẩm
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {lines.length === 0 ? (
              <div className='text-muted-foreground flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12'>
                <p className='mb-4 text-lg'>Chưa có sản phẩm nào</p>
                <Button onClick={addLine} variant='outline'>
                  <IconPlus className='mr-2 h-4 w-4' /> Thêm sản phẩm đầu tiên
                </Button>
              </div>
            ) : (
              <div className='space-y-4'>
                {lines.map((line, idx) => {
                  const err = lineError(line);
                  const selectedProduct = line.productId
                    ? findProduct(line.productId)
                    : undefined;
                  return (
                    <Card key={idx} className={err ? 'border-destructive' : ''}>
                      <CardContent className='pt-6'>
                        <div className='flex flex-col gap-4 sm:flex-row sm:items-start'>
                          {/* Product Image & Select */}
                          <div className='flex-1 space-y-2'>
                            <Label>
                              Sản phẩm{' '}
                              <span className='text-destructive'>*</span>
                            </Label>
                            <div className='flex items-center gap-3'>
                              {selectedProduct?.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={selectedProduct.image}
                                  alt={selectedProduct?.name ?? 'Product'}
                                  className='h-14 w-14 rounded-md border object-cover'
                                />
                              ) : (
                                <div className='bg-muted flex h-14 w-14 items-center justify-center rounded-md border text-xs'>
                                  Ảnh
                                </div>
                              )}
                              <Select
                                value={line.productId ?? ''}
                                onValueChange={(val) =>
                                  setProductForLine(idx, val)
                                }
                              >
                                <SelectTrigger className='flex-1'>
                                  <SelectValue placeholder='Chọn sản phẩm' />
                                </SelectTrigger>
                                <SelectContent>
                                  {(products ?? []).map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Unit */}
                          <div className='w-full space-y-2 sm:w-32'>
                            <Label>Đơn vị</Label>
                            <Input
                              type='text'
                              value={line.unit ?? ''}
                              onChange={(e) =>
                                setUnitForLine(idx, e.target.value)
                              }
                              placeholder='Kg, Tấn...'
                            />
                          </div>

                          {/* Quantity */}
                          <div className='w-full space-y-2 sm:w-32'>
                            <Label>
                              Số lượng{' '}
                              <span className='text-destructive'>*</span>
                            </Label>
                            <Input
                              type='number'
                              min={0}
                              value={
                                Number.isFinite(line.quantity)
                                  ? line.quantity
                                  : 0
                              }
                              onChange={(e) =>
                                setQtyForLine(idx, Number(e.target.value))
                              }
                              placeholder='0'
                            />
                          </div>

                          {/* Unit Price */}
                          <div className='w-full space-y-2 sm:w-36'>
                            <Label>Đơn giá</Label>
                            <Input
                              type='text'
                              value={
                                Number.isFinite(line.unitPrice ?? 0)
                                  ? new Intl.NumberFormat('vi-VN').format(
                                      line.unitPrice ?? 0
                                    )
                                  : '0'
                              }
                              readOnly
                              disabled
                              className='bg-muted'
                            />
                          </div>

                          {/* Delete Button */}
                          <div className='flex items-end'>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => removeLine(idx)}
                              className='text-destructive hover:bg-destructive hover:text-destructive-foreground'
                            >
                              <IconTrash className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                        {err && (
                          <p className='text-destructive mt-2 text-sm'>{err}</p>
                        )}
                        {selectedProduct && line.quantity > 0 && (
                          <div className='bg-muted mt-4 rounded-md p-3'>
                            <p className='text-sm font-medium'>
                              Tổng:{' '}
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(line.quantity * (line.unitPrice ?? 0))}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Summary */}
        {lines.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tổng quan đơn hàng</CardTitle>
              <CardDescription>
                Xem lại thông tin trước khi gửi đơn hàng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                  <div className='bg-card rounded-lg border p-4'>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Số sản phẩm
                    </p>
                    <p className='mt-2 text-2xl font-bold'>{lines.length}</p>
                  </div>
                  <div className='bg-card rounded-lg border p-4'>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Tổng số lượng
                    </p>
                    <p className='mt-2 text-2xl font-bold'>
                      {lines.reduce(
                        (acc, l) =>
                          acc + (Number.isFinite(l.quantity) ? l.quantity : 0),
                        0
                      )}
                    </p>
                  </div>
                  <div className='bg-card rounded-lg border p-4'>
                    <p className='text-muted-foreground text-sm font-medium'>
                      Tổng khối lượng
                    </p>
                    <p className='mt-2 text-2xl font-bold'>
                      {lines
                        .reduce((acc, l) => acc + computeMassKg(l), 0)
                        .toFixed(2)}{' '}
                      kg
                    </p>
                  </div>
                </div>

                <div className='bg-muted rounded-lg p-4'>
                  <div className='space-y-3'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Tạm tính</span>
                      <span className='font-medium'>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(
                          lines.reduce(
                            (acc, l) =>
                              acc +
                              (Number.isFinite(l.quantity) ? l.quantity : 0) *
                                (l.unitPrice ?? 0),
                            0
                          )
                        )}
                      </span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>VAT (5%)</span>
                      <span className='font-medium'>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(
                          lines.reduce(
                            (acc, l) =>
                              acc +
                              (Number.isFinite(l.quantity) ? l.quantity : 0) *
                                (l.unitPrice ?? 0),
                            0
                          ) * 0.05
                        )}
                      </span>
                    </div>
                    <div className='border-t pt-3'>
                      <div className='flex justify-between'>
                        <span className='text-lg font-semibold'>
                          Tổng thanh toán
                        </span>
                        <span className='text-primary text-xl font-bold'>
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(
                            lines.reduce(
                              (acc, l) =>
                                acc +
                                (Number.isFinite(l.quantity) ? l.quantity : 0) *
                                  (l.unitPrice ?? 0),
                              0
                            ) * 1.05
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end'>
          <Button
            type='button'
            variant='outline'
            onClick={() => router.push('/consignee/orders')}
            disabled={submitting}
          >
            Hủy bỏ
          </Button>
          {lines.length > 0 && (
            <Button
              type='button'
              variant='outline'
              onClick={() => setLines([{ quantity: 0 }])}
              disabled={submitting}
              className='text-destructive hover:text-destructive'
            >
              Xóa tất cả
            </Button>
          )}
          <Button
            type='button'
            onClick={submitOrder}
            disabled={submitting || lines.length === 0}
            size='lg'
            className='sm:min-w-[200px]'
          >
            {submitting && (
              <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
            )}
            {submitting ? 'Đang xử lý...' : 'Gửi đơn hàng'}
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}

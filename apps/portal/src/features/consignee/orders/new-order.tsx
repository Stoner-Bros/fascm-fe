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
import { useToast } from '@/components/ui/use-toast';
import { IconLoader2, IconPlus, IconTrash } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product } from '../types/product';
import { CreateOrderRequest, CreateOrderDetailRequest } from '../types/order';
import { createOrder } from '@/services/order.service';
import { fetchProducts } from '@/services/product.service';
import { createOrderDetail } from '@/services/order-detail.service';
import { createOrderSchedule } from '@/services/order-schedule.service';
import {
  fetchMyConsignee,
  updateConsignee
} from '@/services/consignee.service';
import type { Consignee } from '@/features/consignee/types/consignee';
import { AddressPickerMap } from '@/components/map/osrm-map';

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
  const SCHEDULE_STATUS = 'IN_PROGRESS';
  const [scheduleDate, setScheduleDate] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [scheduleHour, setScheduleHour] = useState<number>(() => {
    const d = new Date();
    return d.getHours();
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
  }, [router]);

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

  const setUnitPriceForLine = (index: number, unitPrice: number) => {
    setLines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], unitPrice };
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
      if (consignee?.id) {
        const payload: Record<string, any> = {};
        if (deliveryAddress && deliveryAddress !== (consignee.address ?? '')) {
          payload.address = deliveryAddress;
        }
        if (contact && contact !== (consignee.contact ?? '')) {
          payload.contact = contact;
        }
        if (Object.keys(payload).length > 0) {
          await updateConsignee(consignee.id, payload);
          setConsignee({ ...consignee, ...(payload as any) });
        }
      }
      const schedule = await createOrderSchedule({
        description: scheduleDescription,
        status: SCHEDULE_STATUS,
        orderDate: new Date(
          `${scheduleDate}T${String(scheduleHour).padStart(2, '0')}:00`
        ).toISOString(),
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
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>Tạo đơn hàng</h2>
            <p className='text-muted-foreground'>Đặt mua nhiều dòng sản phẩm</p>
          </div>
        </div>

        {/* Order lines form */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin lịch đặt hàng</CardTitle>
            <CardDescription>
              Nhập thông tin để tạo Order Schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
              <div className='space-y-2'>
                <Label>Mô tả</Label>
                <Input
                  type='text'
                  value={scheduleDescription}
                  onChange={(e) => setScheduleDescription(e.target.value)}
                  placeholder='Mô tả lịch đặt hàng'
                />
              </div>
              <div className='space-y-2'>
                <Label>Ngày lịch</Label>
                <Input
                  type='date'
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <Label>Giờ (24 giờ)</Label>
                <Select
                  value={String(scheduleHour)}
                  onValueChange={(v) => setScheduleHour(Number(v))}
                >
                  <SelectTrigger className='w-[140px]'>
                    <SelectValue placeholder='Chọn giờ' />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }).map((_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {String(i).padStart(2, '0')} giờ
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className='mt-4 rounded-md border p-4'>
              <div className='mb-2 font-medium'>
                Thông tin địa chỉ giao hàng
              </div>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <div>
                  <Label>Tổ chức</Label>
                  <Input
                    value={String(consignee?.organizationName ?? '')}
                    disabled
                    readOnly
                  />
                </div>
                <div>
                  <Label>Đại diện</Label>
                  <Input
                    value={String(consignee?.representativeName ?? '')}
                    disabled
                    readOnly
                  />
                </div>
                <div>
                  <Label>Địa chỉ giao</Label>
                  <Input
                    type='text'
                    placeholder='Nhập địa chỉ giao hàng'
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>
                <div className='sm:col-span-2'>
                  <div className='mb-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setShowMap((v) => !v)}
                    >
                      {showMap ? 'Đóng bản đồ' : 'Chỉnh sửa trên bản đồ'}
                    </Button>
                  </div>
                  {showMap && (
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
                  )}
                </div>
                <div>
                  <Label>Contact</Label>
                  <Input
                    type='text'
                    placeholder='Nhập thông tin liên hệ'
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Danh sách sản phẩm đặt mua</CardTitle>
              <Button onClick={addLine}>
                <IconPlus className='mr-2 h-4 w-4' /> Thêm dòng
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Order Qty</TableHead>
                    <TableHead className='text-right'>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className='text-center'>
                        Chưa có dòng nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    lines.map((line, idx) => {
                      const err = lineError(line);
                      const selectedProduct = line.productId
                        ? findProduct(line.productId)
                        : undefined;
                      return (
                        <TableRow key={idx}>
                          <TableCell>
                            <div className='flex items-center gap-3'>
                              {selectedProduct?.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={selectedProduct.image}
                                  alt={selectedProduct?.name ?? 'Product'}
                                  className='h-10 w-10 rounded object-cover'
                                />
                              ) : (
                                <div className='bg-muted h-10 w-10 rounded' />
                              )}
                              <Select
                                value={line.productId ?? ''}
                                onValueChange={(val) =>
                                  setProductForLine(idx, val)
                                }
                              >
                                <SelectTrigger className='w-[220px]'>
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
                          </TableCell>
                          <TableCell>
                            <Input
                              type='text'
                              value={line.unit ?? ''}
                              onChange={(e) =>
                                setUnitForLine(idx, e.target.value)
                              }
                              className='w-[120px]'
                              placeholder='vd:Kg,Tấn'
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type='number'
                              min={0}
                              value={
                                Number.isFinite(line.unitPrice ?? 0)
                                  ? (line.unitPrice ?? 0)
                                  : 0
                              }
                              readOnly
                              disabled
                              className='w-[140px]'
                            />
                          </TableCell>
                          <TableCell>
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
                              className='w-[140px]'
                            />
                            {err && (
                              <p className='text-destructive mt-1 text-xs'>
                                {err}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className='text-right'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => removeLine(idx)}
                            >
                              <IconTrash className='h-4 w-4' />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Summary card */}
            <Card className='mt-4'>
              <CardHeader>
                <CardTitle>Tổng quan đơn hàng</CardTitle>
                <CardDescription>
                  Thống kê nhanh số lượng và chi phí dự kiến
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                  <div className='rounded-md border p-4'>
                    <p className='text-muted-foreground text-sm'>Số dòng</p>
                    <p className='text-xl font-semibold'>{lines.length}</p>
                  </div>
                  <div className='rounded-md border p-4'>
                    <p className='text-muted-foreground text-sm'>
                      Tổng số lượng
                    </p>
                    <p className='text-xl font-semibold'>
                      {lines.reduce(
                        (acc, l) =>
                          acc + (Number.isFinite(l.quantity) ? l.quantity : 0),
                        0
                      )}
                    </p>
                  </div>
                  <div className='rounded-md border p-4'>
                    <p className='text-muted-foreground text-sm'>
                      Chi phí dự kiến
                    </p>
                    <p className='text-xl font-semibold'>
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
                    </p>
                  </div>
                </div>
                <div className='mt-4 space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Thuế suất</span>
                    <span>5%</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>VAT</span>
                    <span>
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
                  <div className='flex justify-between font-medium'>
                    <span>Tổng cộng</span>
                    <span>
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
              </CardContent>
            </Card>

            <div className='mt-4 flex items-center justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => setLines([{ quantity: 0 }])}
              >
                Xóa tất cả dòng
              </Button>
              <Button onClick={submitOrder} disabled={submitting}>
                {submitting && (
                  <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                )}
                Gửi đơn hàng
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

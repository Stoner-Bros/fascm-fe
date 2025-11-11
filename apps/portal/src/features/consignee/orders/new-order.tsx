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
import { IconInfoCircle, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

type SupplierOption = {
  id: string;
  name: string;
  pricePerUnit?: number; // VND per unit (tham khảo)
};

type Product = {
  id: string;
  name: string;
  stock: number;
  unit: string;
  imageUrl: string;
  suppliers: SupplierOption[];
};

const mockProducts: Product[] = [
  {
    id: 'PROD-001',
    name: 'Tomatoes',
    stock: 500,
    unit: 'kg',
    imageUrl:
      'https://images.unsplash.com/photo-1546093713-0f792f6f9fcd?q=80&w=400&auto=format&fit=crop',
    suppliers: [
      { id: 'SUP-001', name: 'FreshCo Farm', pricePerUnit: 23000 },
      { id: 'SUP-002', name: 'Vega Fields', pricePerUnit: 24000 },
      { id: 'SUP-003', name: 'SunRise Co', pricePerUnit: 22500 }
    ]
  },
  {
    id: 'PROD-002',
    name: 'Bananas',
    stock: 450,
    unit: 'kg',
    imageUrl:
      'https://images.unsplash.com/photo-1574226516831-e1dff420e43e?q=80&w=400&auto=format&fit=crop',
    suppliers: [
      { id: 'SUP-004', name: 'Sunrise Orchard', pricePerUnit: 18000 },
      { id: 'SUP-005', name: 'Tropicana Grove', pricePerUnit: 18500 }
    ]
  },
  {
    id: 'PROD-003',
    name: 'Green Lettuce',
    stock: 200,
    unit: 'kg',
    imageUrl:
      'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=400&auto=format&fit=crop',
    suppliers: [
      { id: 'SUP-006', name: 'GreenLeaf Growers', pricePerUnit: 27000 },
      { id: 'SUP-007', name: 'Leafy Farm', pricePerUnit: 26500 }
    ]
  },
  {
    id: 'PROD-004',
    name: 'Cucumbers',
    stock: 400,
    unit: 'kg',
    imageUrl:
      'https://images.unsplash.com/photo-1511690652776-0d4c84b3e2b0?q=80&w=400&auto=format&fit=crop',
    suppliers: [
      { id: 'SUP-008', name: 'RiverSide Fields', pricePerUnit: 20000 }
    ]
  },
  {
    id: 'PROD-005',
    name: 'Bell Peppers',
    stock: 250,
    unit: 'kg',
    imageUrl:
      'https://images.unsplash.com/photo-1511690743696-35b0f0c38b59?q=80&w=400&auto=format&fit=crop',
    suppliers: [
      { id: 'SUP-009', name: 'ColorFarm', pricePerUnit: 32000 },
      { id: 'SUP-010', name: 'Rainbow Crops', pricePerUnit: 31500 }
    ]
  },
  {
    id: 'PROD-006',
    name: 'Onions',
    stock: 600,
    unit: 'kg',
    imageUrl:
      'https://images.unsplash.com/photo-1551218370-330a0de78f36?q=80&w=400&auto=format&fit=crop',
    suppliers: [
      { id: 'SUP-011', name: 'GoldenRoot', pricePerUnit: 15000 },
      { id: 'SUP-012', name: 'Rooty Farm', pricePerUnit: 15500 }
    ]
  }
];

type OrderLine = {
  productId?: string;
  productName?: string;
  stock?: number;
  unit?: string;
  imageUrl?: string;
  supplierId?: string;
  supplierName?: string;
  pricePerUnit?: number;
  qty: number;
  notes: string;
};

export default function ConsigneeNewOrderFeature() {
  const { toast } = useToast();
  const [lines, setLines] = useState<OrderLine[]>([{ qty: 0, notes: '' }]);

  const findProduct = (id: string) => mockProducts.find((p) => p.id === id);
  const findSupplier = (productId?: string, supplierId?: string) => {
    if (!productId || !supplierId) return undefined;
    const product = findProduct(productId);
    return product?.suppliers.find((s) => s.id === supplierId);
  };

  const addLine = () => {
    setLines((prev) => [...prev, { qty: 0, notes: '' }]);
  };

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const setProductForLine = (index: number, productId: string) => {
    const product = findProduct(productId);
    setLines((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        productId,
        productName: product?.name,
        stock: product?.stock,
        unit: product?.unit,
        imageUrl: product?.imageUrl,
        // reset supplier when product changes
        supplierId: undefined,
        supplierName: undefined,
        pricePerUnit: undefined
      };
      return next;
    });
  };

  const setSupplierForLine = (index: number, supplierId: string) => {
    setLines((prev) => {
      const next = [...prev];
      const line = next[index];
      const supplier = findSupplier(line.productId, supplierId);
      next[index] = {
        ...line,
        supplierId,
        supplierName: supplier?.name,
        pricePerUnit: supplier?.pricePerUnit
      };
      return next;
    });
  };

  const setQtyForLine = (index: number, qty: number) => {
    setLines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], qty };
      return next;
    });
  };

  const setNotesForLine = (index: number, notes: string) => {
    setLines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], notes };
      return next;
    });
  };

  const lineError = (line: OrderLine) => {
    if (!line.productId) return 'Chọn sản phẩm';
    const product = line.productId ? findProduct(line.productId) : undefined;
    if (product && product.suppliers.length > 0 && !line.supplierId) {
      return 'Chọn nhà cung cấp';
    }
    if (line.qty <= 0) return 'Số lượng phải > 0';
    if (line.stock != null && line.qty > line.stock) return 'Vượt tồn kho';
    return null;
  };

  const submitOrder = () => {
    const errors = lines.map(lineError).filter(Boolean);
    if (errors.length > 0) {
      toast({
        title: 'Kiểm tra lại các dòng đặt hàng',
        description: 'Có dòng chưa hợp lệ, vui lòng chỉnh sửa.'
      });
      return;
    }
    // TODO: call API to create order
    toast({
      title: 'Tạo đơn hàng thành công',
      description: `${lines.length} dòng đã được lưu (mock).`
    });
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
                    <TableHead>Supplier</TableHead>
                    <TableHead>Price (tham khảo)</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>UoM</TableHead>
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
                              {line.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={line.imageUrl}
                                  alt={line.productName ?? 'Product'}
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
                                  {mockProducts.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={line.supplierId ?? ''}
                              onValueChange={(val) =>
                                setSupplierForLine(idx, val)
                              }
                            >
                              <SelectTrigger
                                className='w-[220px]'
                                disabled={
                                  !selectedProduct ||
                                  (selectedProduct?.suppliers?.length ?? 0) ===
                                    0
                                }
                              >
                                <SelectValue placeholder='Chọn nhà cung cấp' />
                              </SelectTrigger>
                              <SelectContent>
                                {(selectedProduct?.suppliers ?? []).map((s) => (
                                  <SelectItem key={s.id} value={s.id}>
                                    {s.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {typeof line.pricePerUnit === 'number'
                              ? new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND'
                                }).format(line.pricePerUnit) +
                                ` / ${line.unit ?? ''}`
                              : '-'}
                          </TableCell>
                          <TableCell className='font-medium'>
                            {line.stock ?? '-'}
                          </TableCell>
                          <TableCell>{line.unit ?? '-'}</TableCell>
                          <TableCell>
                            <Input
                              type='number'
                              min={0}
                              value={Number.isFinite(line.qty) ? line.qty : 0}
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
                        (acc, l) => acc + (Number.isFinite(l.qty) ? l.qty : 0),
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
                            (Number.isFinite(l.qty) ? l.qty : 0) *
                              (l.pricePerUnit ?? 0),
                          0
                        )
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className='mt-4 flex items-center justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => setLines([{ qty: 0, notes: '' }])}
              >
                Xóa tất cả dòng
              </Button>
              <Button onClick={submitOrder}>Gửi đơn hàng</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  IconPackage,
  IconCalendar,
  IconAlertTriangle,
  IconEye,
  IconEdit,
  IconExternalLink
} from '@tabler/icons-react';
import { format, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Product, Batch } from '@/types/inventory';

interface AreaProductsTableProps {
  areaName: string;
  products: Product[];
  batches: Batch[];
  onViewProduct?: (product: Product) => void;
  onEditBatch?: (batch: Batch) => void;
  onNavigateToInventory?: () => void;
}

interface ProductWithBatches extends Product {
  batches: Batch[];
}

export function AreaProductsTable({
  areaName,
  products,
  batches,
  onViewProduct,
  onEditBatch,
  onNavigateToInventory
}: AreaProductsTableProps) {
  // Kết hợp sản phẩm với các lô hàng tương ứng
  const productsWithBatches: ProductWithBatches[] = products.map((product) => ({
    ...product,
    batches: batches.filter((batch) => batch.productId === product.id)
  }));

  const getExpiryStatus = (expiryDate: string) => {
    const daysUntilExpiry = differenceInDays(new Date(expiryDate), new Date());

    if (daysUntilExpiry < 0) {
      return {
        status: 'expired',
        label: 'Đã hết hạn',
        variant: 'destructive' as const
      };
    } else if (daysUntilExpiry <= 7) {
      return {
        status: 'expiring-soon',
        label: 'Sắp hết hạn',
        variant: 'destructive' as const
      };
    } else if (daysUntilExpiry <= 30) {
      return {
        status: 'warning',
        label: 'Cần chú ý',
        variant: 'secondary' as const
      };
    } else {
      return { status: 'good', label: 'Tốt', variant: 'default' as const };
    }
  };

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'A':
        return (
          <Badge variant='default' className='bg-green-100 text-green-800'>
            Loại A
          </Badge>
        );
      case 'B':
        return <Badge variant='secondary'>Loại B</Badge>;
      case 'C':
        return <Badge variant='outline'>Loại C</Badge>;
      default:
        return <Badge variant='outline'>{quality}</Badge>;
    }
  };

  if (productsWithBatches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IconPackage className='h-5 w-5' />
            Sản phẩm trong {areaName}
          </CardTitle>
          <CardDescription>
            Danh sách sản phẩm và thông tin lô hàng trong khu vực được chọn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-muted-foreground py-8 text-center'>
            <IconPackage className='mx-auto mb-4 h-12 w-12 opacity-50' />
            <p>Không có sản phẩm nào trong khu vực này</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <IconPackage className='h-5 w-5' />
              Sản phẩm trong {areaName}
            </CardTitle>
            <CardDescription>
              Danh sách sản phẩm và thông tin lô hàng trong khu vực được chọn
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Mã lô</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Ngày nhập</TableHead>
                <TableHead>Ngày hết hạn</TableHead>
                <TableHead>Chất lượng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsWithBatches.map((product) =>
                product.batches.length > 0 ? (
                  product.batches.map((batch, batchIndex) => {
                    const expiryStatus = getExpiryStatus(batch.expiryDate);

                    return (
                      <TableRow key={`${product.id}-${batch.id}`}>
                        {batchIndex === 0 && (
                          <TableCell
                            rowSpan={product.batches.length}
                            className='align-top font-medium'
                          >
                            <div>
                              <div className='font-semibold'>
                                {product.name}
                              </div>
                              <div className='text-muted-foreground text-sm'>
                                SKU: {product.sku}
                              </div>
                              <div className='text-muted-foreground text-sm'>
                                Tồn kho: {product.currentStock} {product.unit}
                              </div>
                            </div>
                          </TableCell>
                        )}
                        <TableCell>
                          <div className='font-mono text-sm'>
                            {batch.batchNumber}
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            {batch.origin}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className='font-semibold'>
                              {batch.remainingQuantity.toLocaleString()}
                            </span>
                            <span className='text-muted-foreground'>
                              /{batch.quantity.toLocaleString()}
                            </span>
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            {batch.unit}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1'>
                            <IconCalendar className='h-3 w-3' />
                            <span className='text-sm'>
                              {format(
                                new Date(batch.receivedDate),
                                'dd/MM/yyyy',
                                { locale: vi }
                              )}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1'>
                            <IconCalendar className='h-3 w-3' />
                            <span className='text-sm'>
                              {format(
                                new Date(batch.expiryDate),
                                'dd/MM/yyyy',
                                { locale: vi }
                              )}
                            </span>
                          </div>
                          <div className='text-muted-foreground text-xs'>
                            (
                            {differenceInDays(
                              new Date(batch.expiryDate),
                              new Date()
                            )}{' '}
                            ngày)
                          </div>
                        </TableCell>
                        <TableCell>{getQualityBadge(batch.quality)}</TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Badge variant={expiryStatus.variant}>
                              {expiryStatus.label}
                            </Badge>
                            {expiryStatus.status === 'expired' ||
                            expiryStatus.status === 'expiring-soon' ? (
                              <IconAlertTriangle className='h-4 w-4 text-red-500' />
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-1'>
                            {batchIndex === 0 && (
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => onViewProduct?.(product)}
                              >
                                <IconEye className='h-4 w-4' />
                              </Button>
                            )}
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => onEditBatch?.(batch)}
                            >
                              <IconEdit className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow key={product.id}>
                    <TableCell className='font-medium'>
                      <div>
                        <div className='font-semibold'>{product.name}</div>
                        <div className='text-muted-foreground text-sm'>
                          SKU: {product.sku}
                        </div>
                        <div className='text-muted-foreground text-sm'>
                          Tồn kho: {product.currentStock} {product.unit}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      colSpan={6}
                      className='text-muted-foreground text-center'
                    >
                      Không có lô hàng nào
                    </TableCell>
                    <TableCell>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => onViewProduct?.(product)}
                      >
                        <IconEye className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

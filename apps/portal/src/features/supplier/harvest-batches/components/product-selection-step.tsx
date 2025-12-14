'use client';

import Image from 'next/image';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { IconPackage, IconTrash, IconCheck } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/services/product.service';
import type { HarvestDetail } from '../types';
import { formatCurrency } from '../hooks/use-create-harvest-schedule';

type ProductSelectionStepProps = {
  products: Product[];
  harvestDetails: HarvestDetail[];
  selectedProducts: Set<string>;
  onToggleProduct: (product: Product) => void;
  onUpdateHarvestDetail: (
    productId: string,
    field: keyof HarvestDetail,
    value: unknown
  ) => void;
  calculateTotal: () => number;
  t: (key: string) => string;
};

export function ProductSelectionStep({
  products,
  harvestDetails,
  selectedProducts,
  onToggleProduct,
  onUpdateHarvestDetail,
  calculateTotal,
  t
}: ProductSelectionStepProps) {
  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <IconPackage className='h-5 w-5' />
            {t('new.products.title')}
          </CardTitle>
          <CardDescription>
            {t('new.products.description')}
            {selectedProducts.size > 0 && (
              <Badge variant='secondary' className='ml-2'>
                {t('new.products.selected')}: {selectedProducts.size}
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <IconPackage className='text-muted-foreground mb-4 h-12 w-12' />
              <p className='text-muted-foreground'>{t('new.products.empty')}</p>
            </div>
          ) : (
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {products.map((product) => {
                const isSelected = selectedProducts.has(product.id);
                return (
                  <Card
                    key={product.id}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      isSelected && 'ring-primary ring-2'
                    )}
                    onClick={() => onToggleProduct(product)}
                  >
                    <CardContent className='p-4'>
                      <div className='flex items-start gap-3'>
                        {product.image ? (
                          <div className='relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md'>
                            <Image
                              src={product.image}
                              alt={product.name || 'Product'}
                              fill
                              className='object-cover'
                            />
                          </div>
                        ) : (
                          <div className='bg-muted flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md'>
                            <IconPackage className='text-muted-foreground h-6 w-6' />
                          </div>
                        )}
                        <div className='min-w-0 flex-1'>
                          <h4 className='line-clamp-2 font-semibold'>
                            {product.name}
                          </h4>
                          <p className='text-muted-foreground mt-1 text-sm'>
                            {product.description ||
                              t('new.products.noDescription')}
                          </p>
                        </div>
                        {isSelected && (
                          <IconCheck className='text-primary h-5 w-5 flex-shrink-0' />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {harvestDetails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('new.products.enterDetails')}</CardTitle>
            <CardDescription>
              {t('new.products.enterDetailsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {harvestDetails.map((detail) => {
                const product = products.find((p) => p.id === detail.productId);
                if (!product) return null;

                const lineTotal =
                  (detail.quantity || 0) * (detail.expectedUnitPrice || 0);

                return (
                  <div
                    key={detail.productId}
                    className='bg-muted/50 flex flex-col gap-4 rounded-lg p-4 sm:flex-row sm:items-center'
                  >
                    <div className='flex flex-1 items-center gap-3'>
                      {product.image ? (
                        <div className='relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md'>
                          <Image
                            src={product.image}
                            alt={product.name || 'Product'}
                            fill
                            className='object-cover'
                          />
                        </div>
                      ) : (
                        <div className='bg-muted flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md'>
                          <IconPackage className='text-muted-foreground h-5 w-5' />
                        </div>
                      )}
                      <div className='min-w-0 flex-1'>
                        <h4 className='line-clamp-1 font-medium'>
                          {product.name}
                        </h4>
                      </div>
                    </div>

                    <div className='flex flex-wrap items-center gap-3'>
                      <div className='flex items-center gap-2'>
                        <Label className='text-sm'>
                          {t('new.products.quantity')}:
                        </Label>
                        <Input
                          type='number'
                          min='1'
                          step='1'
                          value={detail.quantity ?? ''}
                          onChange={(e) =>
                            onUpdateHarvestDetail(
                              detail.productId,
                              'quantity',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className='w-24'
                        />
                      </div>

                      <div className='flex items-center gap-2'>
                        <Select
                          value={detail.unit || 'kg'}
                          onValueChange={(value) =>
                            onUpdateHarvestDetail(
                              detail.productId,
                              'unit',
                              value
                            )
                          }
                        >
                          <SelectTrigger className='w-20'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='kg'>Kg</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='flex items-center gap-2'>
                        <Label className='text-sm'>
                          {t('new.products.unitPrice')}:
                        </Label>
                        <div className='relative'>
                          <Input
                            type='number'
                            min='0'
                            value={detail.expectedUnitPrice ?? ''}
                            onChange={(e) =>
                              onUpdateHarvestDetail(
                                detail.productId,
                                'expectedUnitPrice',
                                parseInt(e.target.value) || 0
                              )
                            }
                            className='w-32 pr-12'
                          />
                          <span className='text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm'>
                            VND
                          </span>
                        </div>
                      </div>

                      <div className='text-primary min-w-[100px] text-right font-semibold'>
                        {formatCurrency(lineTotal)}
                      </div>

                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => onToggleProduct(product)}
                        className='text-destructive hover:text-destructive'
                      >
                        <IconTrash className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator className='my-6' />

            <div className='flex items-center justify-between'>
              <span className='text-lg font-semibold'>
                {t('new.products.total')}:
              </span>
              <span className='text-primary text-2xl font-bold'>
                {formatCurrency(calculateTotal())}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

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
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { deleteProduct, fetchProductById } from '@/services/product.service';
import { deletePrice, type Price } from '@/services/price.service';
import type { Product } from '@/types/product';
import {
  IconArrowLeft,
  IconEdit,
  IconLeaf,
  IconPlus,
  IconTrash
} from '@tabler/icons-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PriceDialog } from './_components/price-dialog';
import { useTranslations } from 'next-intl';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;
  const { toast } = useToast();
  const t = useTranslations('Product');

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [priceDialogOpen, setPriceDialogOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<Price | undefined>(
    undefined
  );

  useEffect(() => {
    async function loadProduct() {
      // Skip loading for 'new' route
      if (productId === 'new') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchProductById(productId);
        setProduct(data);
        setError(null);
      } catch (err: any) {
        setError(err?.message ?? t('toast.loadError'));
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const handleDelete = async () => {
    if (!confirm(t('confirm.delete'))) {
      return;
    }

    try {
      await deleteProduct(productId);
      toast({
        title: t('toast.success'),
        description: t('toast.deleteSuccess')
      });
      router.push('/dashboard/product');
    } catch (err: any) {
      toast({
        title: t('toast.error'),
        description: err?.message ?? t('toast.deleteError'),
        variant: 'destructive'
      });
    }
  };

  const handleDeletePrice = async (priceId: string) => {
    if (!confirm(t('priceDialog.confirmDelete'))) {
      return;
    }

    try {
      await deletePrice(priceId);
      toast({
        title: t('toast.success'),
        description: t('priceDialog.toast.deleteSuccess')
      });
      // Reload product to get updated prices
      const data = await fetchProductById(productId);
      setProduct(data);
    } catch (err: any) {
      toast({
        title: t('toast.error'),
        description: err?.message ?? t('priceDialog.toast.deleteError'),
        variant: 'destructive'
      });
    }
  };

  const handleAddPrice = () => {
    setEditingPrice(undefined);
    setPriceDialogOpen(true);
  };

  const handleEditPrice = (price: Price) => {
    setEditingPrice(price);
    setPriceDialogOpen(true);
  };

  const handlePriceSuccess = async () => {
    // Reload product to get updated prices
    const data = await fetchProductById(productId);
    setProduct(data);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className='w-full space-y-6'>
          <Skeleton className='h-12 w-full' />
          <Skeleton className='h-96 w-full' />
        </div>
      </PageContainer>
    );
  }

  if (error || !product) {
    return (
      <PageContainer>
        <div className='w-full space-y-6'>
          <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'>
            <p className='font-medium'>
              {t('toast.error')}: {error || t('detail.notFound')}
            </p>
          </div>
          <Link href='/dashboard/product'>
            <Button variant='outline'>
              <IconArrowLeft className='mr-2 h-4 w-4' />
              {t('detail.back')}
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button variant='ghost' size='icon' onClick={() => router.back()}>
              <IconArrowLeft className='h-5 w-5' />
            </Button>
            <div>
              <h2 className='text-3xl font-bold tracking-tight'>
                {t('detail.title')}
              </h2>
              <p className='text-muted-foreground'>
                {t('detail.idLabel')}: {product.id}
              </p>
            </div>
          </div>
          <div className='flex gap-2'>
            <Link href={`/dashboard/product/${productId}/edit`}>
              <Button>
                <IconEdit className='mr-2 h-4 w-4' />
                {t('detail.edit')}
              </Button>
            </Link>
            <Button variant='destructive' onClick={handleDelete}>
              <IconTrash className='mr-2 h-4 w-4' />
              {t('detail.delete')}
            </Button>
          </div>
        </div>

        <Separator />

        <div className='grid gap-6 md:grid-cols-3'>
          <div className='space-y-6 md:col-span-2'>
            {/* Product Image */}
            <Card>
              <CardContent className='p-0'>
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name || t('common.product')}
                    className='aspect-video w-full object-cover'
                  />
                ) : (
                  <div className='bg-muted flex aspect-video items-center justify-center'>
                    <IconLeaf className='text-muted-foreground h-24 w-24' />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Information */}
            <Card>
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div>
                    <CardTitle className='text-2xl'>
                      {product.name || t('common.unnamedProduct')}
                    </CardTitle>
                    <CardDescription>
                      {product.category?.name || t('common.noCategory')}
                    </CardDescription>
                  </div>
                  {product.status && (
                    <Badge
                      variant={
                        product.status === 'active' ? 'default' : 'secondary'
                      }
                    >
                      {product.status}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                {product.description && (
                  <>
                    <div>
                      <h3 className='mb-2 font-semibold'>
                        {t('detail.description.title')}
                      </h3>
                      <p className='text-muted-foreground text-sm'>
                        {product.description}
                      </p>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Price Tiers */}
                <div>
                  <div className='mb-3 flex items-center justify-between'>
                    <h3 className='font-semibold'>{t('detail.price.title')}</h3>
                    <Button size='sm' onClick={handleAddPrice}>
                      <IconPlus className='mr-2 h-3 w-3' />
                      {t('detail.price.add')}
                    </Button>
                  </div>
                  {product.price && product.price.length > 0 ? (
                    <div className='space-y-2'>
                      {product.price.map((priceItem) => (
                        <div
                          key={priceItem.id}
                          className='flex items-center justify-between rounded-lg border p-3'
                        >
                          <div className='flex-1'>
                            <div className='flex items-baseline gap-2'>
                              <span className='text-primary text-lg font-bold'>
                                {priceItem.price?.toLocaleString('vi-VN')} ₫/kg
                              </span>
                              <span className='text-muted-foreground text-sm'>
                                for {priceItem.quantity}{' '}
                                {priceItem.unit || 'units'} purchased
                              </span>
                            </div>
                          </div>
                          <div className='flex gap-2'>
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() =>
                                handleEditPrice(priceItem as Price)
                              }
                            >
                              <IconEdit className='h-4 w-4' />
                            </Button>
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() => handleDeletePrice(priceItem.id)}
                            >
                              <IconTrash className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className='text-muted-foreground text-sm'>
                      {t('detail.price.noTiers')}
                    </p>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className='mb-3 font-semibold'>
                    {t('detail.meta.title')}
                  </h3>
                  <div className='grid grid-cols-2 gap-3'>
                    <div>
                      <p className='text-muted-foreground text-xs'>
                        {t('detail.meta.created')}
                      </p>
                      <p className='text-sm font-medium'>
                        {new Date(product.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className='text-muted-foreground text-xs'>
                        {t('detail.meta.updated')}
                      </p>
                      <p className='text-sm font-medium'>
                        {new Date(product.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Category Info */}
            {product.category && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('detail.categoryInfo.title')}</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div>
                    <p className='text-sm font-medium'>
                      {product.category.name || t('common.unnamedCategory')}
                    </p>
                    {product.category.description && (
                      <p className='text-muted-foreground mt-1 text-xs'>
                        {product.category.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('detail.sidebar.quickActions')}</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <Link
                  href={`/dashboard/product/${productId}/edit`}
                  className='block w-full'
                >
                  <Button className='w-full justify-start'>
                    <IconEdit className='mr-2 h-4 w-4' />
                    {t('detail.edit')}
                  </Button>
                </Link>
                <Button
                  variant='destructive'
                  className='w-full justify-start'
                  onClick={handleDelete}
                >
                  <IconTrash className='mr-2 h-4 w-4' />
                  {t('detail.delete')}
                </Button>
                <Link href='/dashboard/product' className='block w-full'>
                  <Button variant='outline' className='w-full justify-start'>
                    <IconArrowLeft className='mr-2 h-4 w-4' />
                    {t('detail.back')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        <PriceDialog
          open={priceDialogOpen}
          onOpenChange={setPriceDialogOpen}
          productId={productId}
          price={editingPrice}
          onSuccess={handlePriceSuccess}
        />
      </div>
    </PageContainer>
  );
}

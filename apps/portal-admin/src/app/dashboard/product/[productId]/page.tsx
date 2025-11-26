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
import type { Product } from '@/types/product';
import {
  IconArrowLeft,
  IconDroplet,
  IconEdit,
  IconLeaf,
  IconTemperature,
  IconTrash
} from '@tabler/icons-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(err?.message ?? 'Failed to load product');
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
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await deleteProduct(productId);
      toast({
        title: 'Success',
        description: 'Product deleted successfully'
      });
      router.push('/dashboard/product');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message ?? 'Failed to delete product',
        variant: 'destructive'
      });
    }
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
            <p className='font-medium'>Error: {error || 'Product not found'}</p>
          </div>
          <Link href='/dashboard/product'>
            <Button variant='outline'>
              <IconArrowLeft className='mr-2 h-4 w-4' />
              Back to Products
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
                Product Details
              </h2>
              <p className='text-muted-foreground'>Product ID: {product.id}</p>
            </div>
          </div>
          <div className='flex gap-2'>
            <Link href={`/dashboard/product/${productId}/edit`}>
              <Button>
                <IconEdit className='mr-2 h-4 w-4' />
                Edit Product
              </Button>
            </Link>
            <Button variant='destructive' onClick={handleDelete}>
              <IconTrash className='mr-2 h-4 w-4' />
              Delete
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
                    alt={product.name || 'Product'}
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
                      {product.name || 'Unnamed Product'}
                    </CardTitle>
                    <CardDescription>
                      {product.categoryId?.name || 'No category'}
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
                      <h3 className='mb-2 font-semibold'>Description</h3>
                      <p className='text-muted-foreground text-sm'>
                        {product.description}
                      </p>
                    </div>
                    <Separator />
                  </>
                )}

                <div>
                  <h3 className='mb-3 font-semibold'>Storage Conditions</h3>
                  <div className='space-y-3'>
                    {(product.minStorageTemperature ||
                      product.maxStorageTemperature) && (
                      <div className='flex items-start gap-3 rounded-lg border p-3'>
                        <IconTemperature className='text-primary mt-0.5 h-5 w-5' />
                        <div>
                          <p className='text-muted-foreground text-xs'>
                            Temperature Range
                          </p>
                          <p className='text-sm font-medium'>
                            {product.minStorageTemperature || '?'} -{' '}
                            {product.maxStorageTemperature || '?'}
                          </p>
                        </div>
                      </div>
                    )}
                    {(product.minStorageHumidity ||
                      product.maxStorageHumidity) && (
                      <div className='flex items-start gap-3 rounded-lg border p-3'>
                        <IconDroplet className='text-primary mt-0.5 h-5 w-5' />
                        <div>
                          <p className='text-muted-foreground text-xs'>
                            Humidity Range
                          </p>
                          <p className='text-sm font-medium'>
                            {product.minStorageHumidity || '?'} -{' '}
                            {product.maxStorageHumidity || '?'}
                          </p>
                        </div>
                      </div>
                    )}
                    {!product.minStorageTemperature &&
                      !product.maxStorageTemperature &&
                      !product.minStorageHumidity &&
                      !product.maxStorageHumidity && (
                        <p className='text-muted-foreground text-sm'>
                          No storage conditions specified
                        </p>
                      )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className='mb-3 font-semibold'>Product Information</h3>
                  <div className='grid grid-cols-2 gap-3'>
                    <div>
                      <p className='text-muted-foreground text-xs'>Created</p>
                      <p className='text-sm font-medium'>
                        {new Date(product.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className='text-muted-foreground text-xs'>
                        Last Updated
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
            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {product.pricePerKg ? (
                    <>
                      <div>
                        <p className='text-primary text-4xl font-bold'>
                          ${product.pricePerKg.toFixed(2)}
                        </p>
                        <p className='text-muted-foreground text-sm'>per kg</p>
                      </div>
                    </>
                  ) : (
                    <p className='text-muted-foreground text-sm'>
                      No price set
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Category Info */}
            {product.categoryId && (
              <Card>
                <CardHeader>
                  <CardTitle>Category Information</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div>
                    <p className='text-sm font-medium'>
                      {product.categoryId.name || 'Unnamed Category'}
                    </p>
                    {product.categoryId.description && (
                      <p className='text-muted-foreground mt-1 text-xs'>
                        {product.categoryId.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <Link
                  href={`/dashboard/product/${productId}/edit`}
                  className='block w-full'
                >
                  <Button className='w-full justify-start'>
                    <IconEdit className='mr-2 h-4 w-4' />
                    Edit Product
                  </Button>
                </Link>
                <Button
                  variant='destructive'
                  className='w-full justify-start'
                  onClick={handleDelete}
                >
                  <IconTrash className='mr-2 h-4 w-4' />
                  Delete Product
                </Button>
                <Link href='/dashboard/product' className='block w-full'>
                  <Button variant='outline' className='w-full justify-start'>
                    <IconArrowLeft className='mr-2 h-4 w-4' />
                    Back to Products
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

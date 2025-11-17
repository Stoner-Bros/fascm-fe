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
import { Separator } from '@/components/ui/separator';
import {
  IconArrowLeft,
  IconEye,
  IconPackage,
  IconShoppingCart,
  IconTruck
} from '@tabler/icons-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/features/consignee/types/product';
import { OrderService } from '@/features/consignee/services/order-service';
import { fetchProductById } from '@/services/product.service';
export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchProductById(productId)
      .then((p) => {
        if (!mounted) return;
        setProduct(p ?? null);
        console.log(p);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message ?? 'Failed to load product');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [productId]);

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
              <p className='text-muted-foreground'>Product ID: {productId}</p>
            </div>
          </div>
          <Link href={`/consignee/orders/new?product=${productId}`}>
            <Button>
              <IconShoppingCart className='mr-2 h-4 w-4' />
              Add to Order
            </Button>
          </Link>
        </div>

        <Separator />

        {loading ? (
          <div className='text-muted-foreground'>Loading product…</div>
        ) : error ? (
          <div className='text-destructive'>{error}</div>
        ) : !product ? (
          <div className='text-muted-foreground'>Product not found</div>
        ) : (
          <div className='grid gap-6 md:grid-cols-3'>
            <div className='space-y-6 md:col-span-2'>
              <Card>
                <CardContent className='p-0'>
                  <div className='bg-muted flex aspect-video items-center justify-center'>
                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image}
                        alt={product.name ?? 'Product image'}
                        className='h-full w-[600px] object-cover'
                      />
                    ) : (
                      <IconPackage className='text-muted-foreground h-24 w-24' />
                    )}
                  </div>
                  <div className='mt-4 mr-4 flex justify-end'>
                    <Badge className='h-8 px-2 text-sm text-white'>
                      Status: {product.status ?? 'N/A'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='text-2xl'>{product.name}</CardTitle>
                  <CardDescription>
                    {product.description ?? '—'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    <div className='space-y-2'>
                      <p className='text-muted-foreground text-sm'>Khoảng ẩm</p>
                      <Badge variant='secondary'>
                        {product.storageHumidityRange ?? '—'}
                      </Badge>
                    </div>
                    <div className='space-y-2'>
                      <p className='text-muted-foreground text-sm'>
                        Khoảng nhiệt
                      </p>
                      <Badge variant='secondary'>
                        {product.storageTemperatureRange ?? '—'}
                      </Badge>
                    </div>
                  </div>
                  <div className='mt-4 flex items-center justify-between'>
                    <span className='text-sm'>Giá</span>
                    <span className='text-xl font-semibold'>
                      {OrderService.formatCurrency(
                        Number(product.pricePerKg ?? 0)
                      )}
                      /kg
                    </span>
                  </div>
                  <div className='mt-2 flex justify-end'>
                    <p className='text-muted-foreground text-sm'>
                      Updated{' '}
                      {new Date(
                        product.updatedAt ?? new Date()
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                  <Link
                    href={`/consignee/orders/new?product=${productId}`}
                    className='block w-full'
                  >
                    <Button className='w-full justify-start'>
                      <IconShoppingCart className='mr-2 h-4 w-4' />
                      Create Order
                    </Button>
                  </Link>
                  <Link
                    href={`/consignee/traceability?product=${productId}`}
                    className='block w-full'
                  >
                    <Button variant='outline' className='w-full justify-start'>
                      <IconTruck className='mr-2 h-4 w-4' />
                      View Traceability
                    </Button>
                  </Link>
                  <Link href='/consignee/products' className='block w-full'>
                    <Button variant='outline' className='w-full justify-start'>
                      <IconEye className='mr-2 h-4 w-4' />
                      Back to Browse
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

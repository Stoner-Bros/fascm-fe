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
import {
  IconArrowLeft,
  IconCertificate,
  IconLeaf,
  IconMapPin,
  IconShoppingCart,
  IconTruck
} from '@tabler/icons-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// Mock data - in real app, fetch based on ID
const mockProductData = {
  id: 'PROD-001',
  name: 'Organic Tomatoes',
  category: 'Vegetables',
  supplier: {
    name: 'Green Valley Farm',
    location: '123 Farm Road, Rural Area',
    rating: 4.8,
    certifications: ['Organic Certified', 'GAP Certified']
  },
  price: 2.5,
  unit: 'kg',
  stock: 500,
  quality: 'Premium',
  organic: true,
  description:
    'Fresh, vine-ripened organic tomatoes grown using sustainable farming practices. These tomatoes are hand-picked at peak ripeness to ensure maximum flavor and nutritional value. Perfect for salads, cooking, or eating fresh.',
  specifications: {
    variety: 'Roma',
    size: 'Medium to Large',
    color: 'Deep Red',
    shelfLife: '5-7 days',
    harvestSeason: 'Summer',
    storageTemp: '12-15°C'
  },
  nutritionalInfo: {
    calories: '18 per 100g',
    vitamins: 'Rich in Vitamin C, Vitamin K',
    minerals: 'Potassium, Folate',
    fiber: '1.2g per 100g'
  },
  recentHarvests: [
    { date: '2025-10-19', quantity: '500 kg', batchId: 'HB-001' },
    { date: '2025-10-15', quantity: '450 kg', batchId: 'HB-089' },
    { date: '2025-10-12', quantity: '520 kg', batchId: 'HB-078' }
  ]
};

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;

  const product = mockProductData;

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
          <Link href={`/consignee/orders/new?product=${productId}`}>
            <Button>
              <IconShoppingCart className='mr-2 h-4 w-4' />
              Add to Order
            </Button>
          </Link>
        </div>

        <Separator />

        <div className='grid gap-6 md:grid-cols-3'>
          <div className='space-y-6 md:col-span-2'>
            {/* Product Image */}
            <Card>
              <CardContent className='p-0'>
                <div className='bg-muted flex aspect-video items-center justify-center'>
                  <IconLeaf className='text-muted-foreground h-24 w-24' />
                </div>
              </CardContent>
            </Card>

            {/* Product Information */}
            <Card>
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div>
                    <CardTitle className='text-2xl'>{product.name}</CardTitle>
                    <CardDescription>{product.category}</CardDescription>
                  </div>
                  {product.organic && (
                    <Badge className='bg-green-100'>
                      <IconLeaf className='mr-1 h-3 w-3' />
                      Organic
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <h3 className='mb-2 font-semibold'>Description</h3>
                  <p className='text-muted-foreground text-sm'>
                    {product.description}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className='mb-3 font-semibold'>Specifications</h3>
                  <div className='grid grid-cols-2 gap-3'>
                    {Object.entries(product.specifications).map(
                      ([key, value]) => (
                        <div key={key}>
                          <p className='text-muted-foreground text-xs capitalize'>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className='text-sm font-medium'>{value}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className='mb-3 font-semibold'>
                    Nutritional Information
                  </h3>
                  <div className='grid grid-cols-2 gap-3'>
                    {Object.entries(product.nutritionalInfo).map(
                      ([key, value]) => (
                        <div key={key}>
                          <p className='text-muted-foreground text-xs capitalize'>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className='text-sm font-medium'>{value}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Harvests */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Harvests</CardTitle>
                <CardDescription>
                  Latest harvest batches available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {product.recentHarvests.map((harvest, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between rounded-lg border p-3'
                    >
                      <div>
                        <p className='text-sm font-medium'>{harvest.batchId}</p>
                        <p className='text-muted-foreground text-xs'>
                          {harvest.date}
                        </p>
                      </div>
                      <p className='text-sm font-medium'>{harvest.quantity}</p>
                    </div>
                  ))}
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
                  <div>
                    <p className='text-primary text-4xl font-bold'>
                      ${product.price}
                    </p>
                    <p className='text-muted-foreground text-sm'>
                      per {product.unit}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className='text-muted-foreground text-sm'>
                      Stock Available
                    </p>
                    <p className='text-xl font-semibold'>
                      {product.stock} {product.unit}
                    </p>
                  </div>
                  <div>
                    <p className='text-muted-foreground text-sm'>
                      Quality Grade
                    </p>
                    <Badge variant='secondary' className='mt-1'>
                      {product.quality}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supplier Info */}
            <Card>
              <CardHeader>
                <CardTitle>Supplier Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div>
                  <p className='text-sm font-medium'>{product.supplier.name}</p>
                  <div className='text-muted-foreground mt-1 flex items-center gap-1 text-xs'>
                    <IconMapPin className='h-3 w-3' />
                    {product.supplier.location}
                  </div>
                </div>
                <Separator />
                <div>
                  <p className='text-muted-foreground mb-2 text-sm'>
                    Certifications
                  </p>
                  <div className='flex flex-col gap-2'>
                    {product.supplier.certifications.map((cert, index) => (
                      <div
                        key={index}
                        className='flex items-center gap-2 text-xs'
                      >
                        <IconCertificate className='text-primary h-4 w-4' />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
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

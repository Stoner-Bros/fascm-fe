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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  IconSearch,
  IconPlus,
  IconEye,
  IconLeaf,
  IconFilter,
  IconEdit
} from '@tabler/icons-react';
import { useState } from 'react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

// Mock product data
const mockProducts = [
  {
    id: 'PROD-001',
    name: 'Organic Tomatoes',
    category: 'Vegetables',
    supplier: 'Green Valley Farm',
    price: 2.5,
    unit: 'kg',
    stock: 500,
    quality: 'Premium',
    organic: true,
    image: '/placeholder-product.jpg'
  },
  {
    id: 'PROD-002',
    name: 'Fresh Carrots',
    category: 'Vegetables',
    supplier: 'Sunny Fields',
    price: 1.8,
    unit: 'kg',
    stock: 300,
    quality: 'Grade A',
    organic: true,
    image: '/placeholder-product.jpg'
  },
  {
    id: 'PROD-003',
    name: 'Green Lettuce',
    category: 'Leafy Greens',
    supplier: 'Fresh Greens Co',
    price: 1.5,
    unit: 'kg',
    stock: 200,
    quality: 'Premium',
    organic: false,
    image: '/placeholder-product.jpg'
  },
  {
    id: 'PROD-004',
    name: 'Cucumbers',
    category: 'Vegetables',
    supplier: 'Green Valley Farm',
    price: 2.0,
    unit: 'kg',
    stock: 400,
    quality: 'Grade A',
    organic: true,
    image: '/placeholder-product.jpg'
  },
  {
    id: 'PROD-005',
    name: 'Bell Peppers',
    category: 'Vegetables',
    supplier: 'Rainbow Farms',
    price: 3.5,
    unit: 'kg',
    stock: 250,
    quality: 'Premium',
    organic: true,
    image: '/placeholder-product.jpg'
  },
  {
    id: 'PROD-006',
    name: 'Onions',
    category: 'Vegetables',
    supplier: 'Valley Produce',
    price: 1.2,
    unit: 'kg',
    stock: 600,
    quality: 'Standard',
    organic: false,
    image: '/placeholder-product.jpg'
  }
];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10]);
  const [organicOnly, setOrganicOnly] = useState(false);

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || product.category === categoryFilter;
    const matchesPrice =
      product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesOrganic = !organicOnly || product.organic;
    return matchesSearch && matchesCategory && matchesPrice && matchesOrganic;
  });

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>Products</h2>
            <p className='text-muted-foreground'>
              Manage and browse all products
            </p>
          </div>
          <Link href='/dashboard/product/new'>
            <Button>
              <IconPlus className='mr-2 h-4 w-4' />
              Add New
            </Button>
          </Link>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-4'>
          {/* Filters Sidebar */}
          <Card className='lg:col-span-1'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconFilter className='h-5 w-5' />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-2'>
                <Label>Category</Label>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Categories</SelectItem>
                    <SelectItem value='Vegetables'>Vegetables</SelectItem>
                    <SelectItem value='Leafy Greens'>Leafy Greens</SelectItem>
                    <SelectItem value='Fruits'>Fruits</SelectItem>
                    <SelectItem value='Herbs'>Herbs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label>
                  Price Range: ${priceRange[0]} - ${priceRange[1]} / kg
                </Label>
                <Slider
                  min={0}
                  max={10}
                  step={0.5}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className='mt-2'
                />
              </div>

              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='organic'
                  checked={organicOnly}
                  onChange={(e) => setOrganicOnly(e.target.checked)}
                  className='h-4 w-4'
                />
                <Label htmlFor='organic' className='cursor-pointer'>
                  Organic Only
                </Label>
              </div>

              <Button
                variant='outline'
                className='w-full'
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setPriceRange([0, 10]);
                  setOrganicOnly(false);
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <div className='space-y-4 lg:col-span-3'>
            <Card>
              <CardHeader>
                <div className='relative'>
                  <IconSearch className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
                  <Input
                    placeholder='Search products by name or supplier...'
                    className='pl-8'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
            </Card>

            <div className='text-muted-foreground mb-4 text-sm'>
              Showing {filteredProducts.length} products
            </div>

            {filteredProducts.length === 0 ? (
              <Card>
                <CardContent className='flex flex-col items-center justify-center py-12'>
                  <IconSearch className='text-muted-foreground mb-4 h-12 w-12' />
                  <h3 className='mb-2 text-lg font-semibold'>
                    No Products Found
                  </h3>
                  <p className='text-muted-foreground mb-4'>
                    Try adjusting your search or filters
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
                {filteredProducts.map((product) => (
                  <Card key={product.id} className='overflow-hidden'>
                    <div className='bg-muted flex aspect-video items-center justify-center'>
                      <IconLeaf className='text-muted-foreground h-12 w-12' />
                    </div>
                    <CardHeader>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <CardTitle className='text-lg'>
                            {product.name}
                          </CardTitle>
                          <CardDescription>{product.supplier}</CardDescription>
                        </div>
                        {product.organic && (
                          <Badge variant='secondary' className='bg-green-100'>
                            <IconLeaf className='mr-1 h-3 w-3' />
                            Organic
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-primary text-2xl font-bold'>
                            ${product.price}
                          </p>
                          <p className='text-muted-foreground text-xs'>
                            per {product.unit}
                          </p>
                        </div>
                        <div className='text-right'>
                          <Badge variant='outline'>{product.quality}</Badge>
                          <p className='text-muted-foreground mt-1 text-xs'>
                            {product.stock} {product.unit} available
                          </p>
                        </div>
                      </div>

                      <div className='flex gap-2'>
                        <Link
                          href={`/dashboard/product/${product.id}`}
                          className='flex-1'
                        >
                          <Button variant='outline' className='w-full'>
                            <IconEye className='mr-2 h-4 w-4' />
                            View Details
                          </Button>
                        </Link>
                        <Link href={`/dashboard/product/${product.id}`}>
                          <Button>
                            <IconEdit className='h-4 w-4' />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

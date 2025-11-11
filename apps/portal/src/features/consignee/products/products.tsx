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
  IconShoppingCart,
  IconEye,
  IconPackage,
  IconFilter,
  IconX
} from '@tabler/icons-react';
import { useState } from 'react';
import Link from 'next/link';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
// Mock fresh product data (no organic field)
const mockProducts = [
  {
    id: 'PROD-001',
    name: 'Tomatoes',
    category: 'Vegetables',
    supplier: 'Green Valley Farm',
    price: 2.5,
    unit: 'kg',
    stock: 500,
    quality: 'Grade A',
    image: '/placeholder-product.jpg'
  },
  {
    id: 'PROD-002',
    name: 'Bananas',
    category: 'Fruits',
    supplier: 'Sunny Fields',
    price: 1.6,
    unit: 'kg',
    stock: 450,
    quality: 'Grade A',
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
    quality: 'Grade A',
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
    quality: 'Grade A',
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
    quality: 'Grade A',
    image: '/placeholder-product.jpg'
  }
];

export default function ConsigneeProductsFeature() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 10]);

  const categories = [
    'Banana',
    'Tomato',
    'Vegetables',
    'Leafy Greens',
    'Fruits',
    'Herbs'
  ];

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes('all') ||
      selectedCategories.some((cat) => {
        const c = cat.toLowerCase();
        if (c === 'banana' || c === 'tomato') {
          return product.name.toLowerCase().includes(c);
        }
        return product.category === cat;
      });
    const matchesPrice =
      product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const addCategory = (cat: string) => {
    if (cat === 'all') {
      setSelectedCategories(['all']);
      return;
    }
    setSelectedCategories((prev) => {
      const next = prev.filter((c) => c !== 'all');
      if (!next.includes(cat)) next.push(cat);
      return [...next];
    });
  };

  const removeCategory = (cat: string) => {
    setSelectedCategories((prev) => prev.filter((c) => c !== cat));
  };

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>
              Browse Fresh Products
            </h2>
            <p className='text-muted-foreground'>
              Search and discover fresh agricultural products
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-4'>
          {/* Filters Sidebar */}
          <Card className='lg:col-span-1'>
            <CardHeader>
              <div className='relative'>
                <IconSearch className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
                <Input
                  placeholder='Search products by name'
                  className='pl-8'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconFilter className='h-5 w-5' />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-2'>
                <Label>Category</Label>
                <div className='space-y-2'>
                  <div>
                    <select
                      className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring inline-flex h-9 w-full items-center justify-between rounded-md border px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value) addCategory(value);
                        e.currentTarget.selectedIndex = 0;
                      }}
                    >
                      <option value=''>All Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedCategories.length > 0 && (
                    <div className='flex flex-wrap gap-2'>
                      {selectedCategories.map((cat) => (
                        <Badge
                          key={cat}
                          variant='secondary'
                          className='flex items-center gap-1'
                        >
                          {cat}
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-4 w-4 p-0'
                            onClick={() => removeCategory(cat)}
                            aria-label={`Remove ${cat}`}
                          >
                            <IconX className='h-3 w-3' />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
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

              <div className='text-muted-foreground mb-4 text-sm'>
                Showing {filteredProducts.length} products
              </div>
              <Button
                variant='outline'
                className='w-full'
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategories([]);
                  setPriceRange([0, 10]);
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <div className='space-y-4 lg:col-span-3'>
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
                      <IconPackage className='text-muted-foreground h-12 w-12' />
                    </div>
                    <CardHeader>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <CardTitle className='text-lg'>
                            {product.name}
                          </CardTitle>
                          <CardDescription>{product.supplier}</CardDescription>
                        </div>
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
                          href={`/consignee/products/${product.id}`}
                          className='flex-1'
                        >
                          <Button variant='outline' className='w-full'>
                            <IconEye className='mr-2 h-4 w-4' />
                            View Details
                          </Button>
                        </Link>
                        <Link
                          href={`/consignee/orders/new?product=${product.id}`}
                        >
                          <Button>
                            <IconShoppingCart className='h-4 w-4' />
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

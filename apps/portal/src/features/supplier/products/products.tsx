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
  IconEye,
  IconPackage,
  IconFilter,
  IconX
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Product } from '../../../types/product';
import { fetchProducts } from '@/services/product.service';
import { Category, fetchCategories } from '@/services/category.service';
import { getApiBase } from '@/lib/client';

export default function SupplierProductsFeature() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    console.log('[UI] Using API base', getApiBase());

    Promise.all([
      fetchProducts({ page: 1, limit: 12 }),
      fetchCategories({ page: 1, limit: 50 })
    ])
      .then(([productsRes, categoriesRes]) => {
        if (!mounted) return;
        setProducts(productsRes.data ?? []);
        setCategories(categoriesRes.data ?? []);
        console.log('[UI] Received products', {
          count: productsRes.data?.length ?? 0,
          hasNextPage: productsRes.hasNextPage
        });
        console.log('[UI] Received categories', {
          count: categoriesRes.data?.length ?? 0,
          hasNextPage: categoriesRes.hasNextPage
        });
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message ?? 'Failed to load data');
        console.error('[UI] Failed to load data', err);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
        console.log('[UI] Finished loading data');
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchProducts({
      page: 1,
      limit: 12,
      categoryIds: selectedCategoryIds
    })
      .then((res) => {
        if (!mounted) return;
        setProducts(res.data ?? []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message ?? 'Failed to load products');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedCategoryIds]);

  // Get category names for filtering - use englishName or vietnameseName
  const getCategoryName = (category: Category) => {
    return category.englishName || category.vietnameseName || 'Unknown';
  };

  const categoryOptions = categories.map((c) => ({
    id: c.id,
    name: getCategoryName(c)
  }));

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      (product.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description ?? '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const onSelectCategory = (id: string) => {
    if (!id) return;
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev : [...prev, id]
    );
  };

  const removeSelectedCategory = (id: string) => {
    setSelectedCategoryIds((prev) => prev.filter((c) => c !== id));
  };

  return (
    <PageContainer>
      <div className='w-full space-y-6 px-4'>
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
          <div className='mt-4 lg:col-span-1'>
            <Card className='sticky top-6 max-h-[400px] overflow-y-auto lg:col-span-1'>
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
                          onSelectCategory(value);
                        }}
                      >
                        <option value=''>All Category</option>
                        {categoryOptions.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedCategoryIds.length > 0 && (
                      <div className='flex flex-wrap gap-2'>
                        {selectedCategoryIds.map((id) => {
                          const cat = categoryOptions.find((c) => c.id === id);
                          return (
                            <Badge
                              key={id}
                              variant='secondary'
                              className='flex items-center gap-1'
                            >
                              {cat?.name ?? id}
                              <Button
                                variant='ghost'
                                size='icon'
                                className='h-4 w-4 p-0'
                                onClick={() => removeSelectedCategory(id)}
                                aria-label={`Remove ${cat?.name ?? id}`}
                              >
                                <IconX className='h-3 w-3' />
                              </Button>
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className='text-muted-foreground mb-4 text-sm'>
                  {loading
                    ? 'Loading products…'
                    : `Showing ${filteredProducts.length} products`}
                </div>
                <Button
                  variant='outline'
                  className='w-full'
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategoryIds([]);
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className='space-y-4 lg:col-span-3'>
            {error && (
              <Card>
                <CardContent className='py-4 text-sm text-red-600'>
                  {error}
                </CardContent>
              </Card>
            )}

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
                  <Card
                    key={product.id}
                    className='flex h-full flex-col overflow-hidden'
                  >
                    <div className='bg-muted flex aspect-video items-center justify-center'>
                      {product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.image}
                          alt={product.name ?? 'Product image'}
                          className='h-[200px] w-[250px] object-cover'
                        />
                      ) : (
                        <IconPackage className='text-muted-foreground h-[200px] w-[200px]' />
                      )}
                    </div>
                    <CardHeader className='min-h-[80px]'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <CardTitle className='text-lg'>
                            {product.name}
                          </CardTitle>
                          <CardDescription className='max-h-16 overflow-hidden break-words whitespace-pre-wrap'>
                            {product.description ?? '—'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className='flex h-full flex-col space-y-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-muted-foreground text-sm'>
                            Status: {product.status ?? 'N/A'}
                          </p>
                        </div>
                        <div className='text-right'>
                          <p className='text-muted-foreground mt-1 text-xs'>
                            Updated{' '}
                            {new Date(
                              product.updatedAt ?? new Date()
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className='mt-auto flex gap-2'>
                        <Link
                          href={`/consignee/products/${product.id}`}
                          className='flex-1'
                        >
                          <Button variant='outline' className='w-full'>
                            <IconEye className='mr-2 h-4 w-4' />
                            View Details
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

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { fetchCategories } from '@/services/category.service';
import { deleteProduct, fetchProducts } from '@/services/product.service';
import type { Category, Product } from '@/types/product';
import {
  IconEdit,
  IconEye,
  IconFilter,
  IconLeaf,
  IconSearch,
  IconTrash
} from '@tabler/icons-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { CreateProductDialog } from './_components/create-product-dialog';
import { useTranslations } from 'next-intl';

export default function ProductsPage() {
  const t = useTranslations('Product');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const { toast } = useToast();

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetchCategories({ page: 1, limit: 100 });
        setCategories(response.data);
      } catch (err: any) {
        // Error loading categories
      }
    }
    loadCategories();
  }, []);

  // Load products
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetchProducts({
        page,
        limit: 12,
        categoryId: categoryFilter !== 'all' ? categoryFilter : undefined
      });
      setProducts(response.data);
      setHasNextPage(response.hasNextPage);
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? t('toast.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, categoryFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirm.delete'))) {
      return;
    }

    try {
      await deleteProduct(id);
      toast({
        title: t('toast.success'),
        description: t('toast.deleteSuccess')
      });
      // Reload products
      setProducts(products.filter((p) => p.id !== id));
    } catch (err: any) {
      toast({
        title: t('toast.error'),
        description: err?.message ?? t('toast.deleteError'),
        variant: 'destructive'
      });
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>
              {t('list.title')}
            </h2>
            <p className='text-muted-foreground'>{t('list.subtitle')}</p>
          </div>
          <CreateProductDialog onSuccess={loadProducts} />
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-4'>
          {/* Filters Sidebar */}
          <Card className='lg:col-span-1'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconFilter className='h-5 w-5' />
                {t('list.filters.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-2'>
                <Label>{t('list.filters.categoryLabel')}</Label>
                <Select
                  value={categoryFilter === '' ? undefined : categoryFilter}
                  onValueChange={setCategoryFilter}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('list.filters.allCategories')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>
                      {t('list.filters.allCategories')}
                    </SelectItem>
                    {categories
                      .filter(
                        (category) =>
                          category.id && category.id.trim().length > 0
                      )
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name || t('common.unnamedCategory')}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant='outline'
                className='w-full'
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setPage(1);
                }}
              >
                {t('list.filters.clear')}
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
                    placeholder={t('list.searchPlaceholder')}
                    className='pl-8'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </CardHeader>
            </Card>

            {loading ? (
              <div className='space-y-4'>
                <Skeleton className='h-12 w-full' />
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className='overflow-hidden'>
                      <Skeleton className='aspect-video w-full' />
                      <CardHeader>
                        <Skeleton className='h-6 w-3/4' />
                        <Skeleton className='h-4 w-1/2' />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className='h-20 w-full' />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : error ? (
              <Card>
                <CardContent className='flex flex-col items-center justify-center py-12'>
                  <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'>
                    <p className='font-medium'>Error: {error}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className='text-muted-foreground mb-4 text-sm'>
                  {t('list.showing')} {filteredProducts.length}
                </div>

                {filteredProducts.length === 0 ? (
                  <Card>
                    <CardContent className='flex flex-col items-center justify-center py-12'>
                      <IconSearch className='text-muted-foreground mb-4 h-12 w-12' />
                      <h3 className='mb-2 text-lg font-semibold'>
                        {t('list.empty.title')}
                      </h3>
                      <p className='text-muted-foreground mb-4'>
                        {t('list.empty.description')}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
                      {filteredProducts.map((product) => (
                        <Card key={product.id} className='overflow-hidden'>
                          {product.image ? (
                            <div className='bg-muted relative flex aspect-video items-center justify-center overflow-hidden'>
                              <Image
                                src={product.image}
                                alt={product.name || t('common.product')}
                                fill
                                className='object-cover'
                              />
                            </div>
                          ) : (
                            <div className='bg-muted flex aspect-video items-center justify-center'>
                              <IconLeaf className='text-muted-foreground h-12 w-12' />
                            </div>
                          )}
                          <CardHeader>
                            <div className='flex items-start justify-between'>
                              <div className='flex-1'>
                                <CardTitle className='text-lg'>
                                  {product.name || t('common.unnamedProduct')}
                                </CardTitle>
                                <CardDescription>
                                  {product.category?.name ||
                                    t('common.noCategory')}
                                </CardDescription>
                              </div>
                              {product.status && (
                                <Badge
                                  variant={
                                    product.status === 'active' ||
                                    product.status === 'Active'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                >
                                  {product.status === 'active' ||
                                  product.status === 'Active'
                                    ? t('list.card.status.active')
                                    : t('list.card.status.inactive')}
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className='space-y-4'>
                            <div className='space-y-2'>
                              {product.description && (
                                <p className='text-muted-foreground line-clamp-2 text-sm'>
                                  {product.description}
                                </p>
                              )}
                            </div>

                            <div className='flex gap-2'>
                              <Link
                                href={`/dashboard/product/${product.id}`}
                                className='flex-1'
                              >
                                <Button variant='outline' className='w-full'>
                                  <IconEye className='mr-2 h-4 w-4' />
                                  {t('common.view')}
                                </Button>
                              </Link>
                              <Link href={`/dashboard/product/${product.id}`}>
                                <Button variant='secondary'>
                                  <IconEdit className='h-4 w-4' />
                                </Button>
                              </Link>
                              <Button
                                variant='destructive'
                                onClick={() => handleDelete(product.id)}
                              >
                                <IconTrash className='h-4 w-4' />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Pagination */}
                    {(page > 1 || hasNextPage) && (
                      <div className='flex items-center justify-center gap-2 pt-4'>
                        <Button
                          variant='outline'
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1 || loading}
                        >
                          {t('pagination.previous')}
                        </Button>
                        <span className='text-muted-foreground text-sm'>
                          {t('pagination.page')} {page}
                        </span>
                        <Button
                          variant='outline'
                          onClick={() => setPage((p) => p + 1)}
                          disabled={!hasNextPage || loading}
                        >
                          {t('pagination.next')}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

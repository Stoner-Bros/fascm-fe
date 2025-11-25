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
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { deleteCategory, fetchCategories } from '@/services/category.service';
import type { Category } from '@/types/product';
import {
  IconEdit,
  IconEye,
  IconPlus,
  IconSearch,
  IconTag,
  IconTrash
} from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const { toast } = useToast();

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        const response = await fetchCategories({
          page,
          limit: 12
        });
        setCategories(response.data);
        setHasNextPage(response.hasNextPage);
        setError(null);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load categories');
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await deleteCategory(id);
      toast({
        title: 'Success',
        description: 'Category deleted successfully'
      });
      // Reload categories
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message ?? 'Failed to delete category',
        variant: 'destructive'
      });
    }
  };

  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <PageContainer>
      <div className='w-full space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold tracking-tight'>Categories</h2>
            <p className='text-muted-foreground'>Manage product categories</p>
          </div>
          <Link href='/dashboard/category/new'>
            <Button>
              <IconPlus className='mr-2 h-4 w-4' />
              Add New Category
            </Button>
          </Link>
        </div>

        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <div className='relative'>
                <IconSearch className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
                <Input
                  placeholder='Search categories by name or description...'
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
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Card key={i}>
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
                Showing {filteredCategories.length} categor
                {filteredCategories.length === 1 ? 'y' : 'ies'}
              </div>

              {filteredCategories.length === 0 ? (
                <Card>
                  <CardContent className='flex flex-col items-center justify-center py-12'>
                    <IconSearch className='text-muted-foreground mb-4 h-12 w-12' />
                    <h3 className='mb-2 text-lg font-semibold'>
                      No Categories Found
                    </h3>
                    <p className='text-muted-foreground mb-4'>
                      Try adjusting your search
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                    {filteredCategories.map((category) => (
                      <Card key={category.id} className='overflow-hidden'>
                        <CardHeader>
                          <div className='flex items-start justify-between'>
                            <div className='flex-1'>
                              <div className='flex items-center gap-2'>
                                <IconTag className='text-primary h-5 w-5' />
                                <CardTitle className='text-lg'>
                                  {category.name || 'Unnamed Category'}
                                </CardTitle>
                              </div>
                              {category.description && (
                                <CardDescription className='mt-2 line-clamp-2'>
                                  {category.description}
                                </CardDescription>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                          {category.createdAt && (
                            <div className='text-muted-foreground text-xs'>
                              Created:{' '}
                              {new Date(
                                category.createdAt
                              ).toLocaleDateString()}
                            </div>
                          )}

                          <div className='flex gap-2'>
                            <Link
                              href={`/dashboard/category/${category.id}`}
                              className='flex-1'
                            >
                              <Button variant='outline' className='w-full'>
                                <IconEye className='mr-2 h-4 w-4' />
                                View
                              </Button>
                            </Link>
                            <Link href={`/dashboard/category/${category.id}`}>
                              <Button variant='secondary'>
                                <IconEdit className='h-4 w-4' />
                              </Button>
                            </Link>
                            <Button
                              variant='destructive'
                              onClick={() => handleDelete(category.id)}
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
                        Previous
                      </Button>
                      <span className='text-muted-foreground text-sm'>
                        Page {page}
                      </span>
                      <Button
                        variant='outline'
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!hasNextPage || loading}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

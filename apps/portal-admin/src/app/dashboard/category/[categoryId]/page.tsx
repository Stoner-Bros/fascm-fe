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
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import {
  deleteCategory,
  fetchCategoryById,
  updateCategory
} from '@/services/category.service';
import type { Category } from '@/types/product';
import {
  IconArrowLeft,
  IconDeviceFloppy,
  IconTag,
  IconTrash
} from '@tabler/icons-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.categoryId as string;
  const { toast } = useToast();

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    englishName: '',
    vietnameseName: ''
  });

  useEffect(() => {
    async function loadCategory() {
      // Skip loading for 'new' route
      if (categoryId === 'new') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchCategoryById(categoryId);
        setCategory(data);
        setFormData({
          englishName: data.name || '',
          vietnameseName: data.description || ''
        });
        setError(null);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load category');
        console.error('Error loading category:', err);
      } finally {
        setLoading(false);
      }
    }

    if (categoryId) {
      loadCategory();
    }
  }, [categoryId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.englishName && !formData.vietnameseName) {
      toast({
        title: 'Validation Error',
        description: 'At least one name (English or Vietnamese) is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      const updated = await updateCategory(categoryId, {
        englishName: formData.englishName || null,
        vietnameseName: formData.vietnameseName || null
      });
      setCategory(updated);
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Category updated successfully'
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message ?? 'Failed to update category',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      toast({
        title: 'Success',
        description: 'Category deleted successfully'
      });
      router.push('/dashboard/category');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message ?? 'Failed to delete category',
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

  if (error || !category) {
    return (
      <PageContainer>
        <div className='w-full space-y-6'>
          <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'>
            <p className='font-medium'>
              Error: {error || 'Category not found'}
            </p>
          </div>
          <Link href='/dashboard/category'>
            <Button variant='outline'>
              <IconArrowLeft className='mr-2 h-4 w-4' />
              Back to Categories
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
                Category Details
              </h2>
              <p className='text-muted-foreground'>
                Category ID: {category.id}
              </p>
            </div>
          </div>
          <div className='flex gap-2'>
            {!isEditing ? (
              <>
                <Button onClick={() => setIsEditing(true)}>
                  <IconTag className='mr-2 h-4 w-4' />
                  Edit Category
                </Button>
                <Button variant='destructive' onClick={handleDelete}>
                  <IconTrash className='mr-2 h-4 w-4' />
                  Delete
                </Button>
              </>
            ) : (
              <Button variant='outline' onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {isEditing ? (
          <form onSubmit={handleUpdate}>
            <Card>
              <CardHeader>
                <CardTitle>Edit Category</CardTitle>
                <CardDescription>Update category information</CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid gap-6 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='englishName'>English Name</Label>
                    <Input
                      id='englishName'
                      placeholder='e.g., Vegetables'
                      value={formData.englishName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          englishName: e.target.value
                        })
                      }
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='vietnameseName'>Vietnamese Name</Label>
                    <Input
                      id='vietnameseName'
                      placeholder='e.g., Rau củ'
                      value={formData.vietnameseName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vietnameseName: e.target.value
                        })
                      }
                    />
                  </div>
                </div>

                <div className='flex justify-end gap-4'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button type='submit' disabled={saving}>
                    <IconDeviceFloppy className='mr-2 h-4 w-4' />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        ) : (
          <div className='grid gap-6 md:grid-cols-3'>
            <div className='space-y-6 md:col-span-2'>
              {/* Category Information */}
              <Card>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center gap-3'>
                      <IconTag className='text-primary h-8 w-8' />
                      <div>
                        <CardTitle className='text-2xl'>
                          {category.name || 'Unnamed Category'}
                        </CardTitle>
                        {category.description && (
                          <CardDescription className='mt-1'>
                            {category.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <h3 className='mb-3 font-semibold'>Names</h3>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='space-y-1'>
                        <p className='text-muted-foreground text-xs'>
                          English Name
                        </p>
                        <p className='text-sm font-medium'>
                          {category.name || 'Not set'}
                        </p>
                      </div>
                      <div className='space-y-1'>
                        <p className='text-muted-foreground text-xs'>
                          Vietnamese Name
                        </p>
                        <p className='text-sm font-medium'>
                          {category.description || 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className='mb-3 font-semibold'>Timestamps</h3>
                    <div className='grid grid-cols-2 gap-3'>
                      {category.createdAt && (
                        <div>
                          <p className='text-muted-foreground text-xs'>
                            Created
                          </p>
                          <p className='text-sm font-medium'>
                            {new Date(category.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {category.updatedAt && (
                        <div>
                          <p className='text-muted-foreground text-xs'>
                            Last Updated
                          </p>
                          <p className='text-sm font-medium'>
                            {new Date(category.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className='space-y-6'>
              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                  <Button
                    className='w-full justify-start'
                    onClick={() => setIsEditing(true)}
                  >
                    <IconTag className='mr-2 h-4 w-4' />
                    Edit Category
                  </Button>
                  <Button
                    variant='destructive'
                    className='w-full justify-start'
                    onClick={handleDelete}
                  >
                    <IconTrash className='mr-2 h-4 w-4' />
                    Delete Category
                  </Button>
                  <Link href='/dashboard/category' className='block w-full'>
                    <Button variant='outline' className='w-full justify-start'>
                      <IconArrowLeft className='mr-2 h-4 w-4' />
                      Back to Categories
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

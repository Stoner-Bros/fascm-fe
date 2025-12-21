'use client';

import { RouteGuard, PermissionGuard } from '@/components/permissions';
import { Permission } from '@/constants/permissions';
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
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('Category');

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: ''
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
          name: data.name || ''
        });
        setError(null);
      } catch (err: any) {
        setError(err?.message ?? t('toast.loadError'));
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

    if (!formData.name) {
      toast({
        title: t('toast.validationError'),
        description: t('detail.validation.nameRequired'),
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      const updated = await updateCategory(categoryId, {
        name: formData.name || null
      });
      setCategory(updated);
      setIsEditing(false);
      toast({
        title: t('toast.success'),
        description: t('toast.updateSuccess')
      });
    } catch (err: any) {
      toast({
        title: t('toast.error'),
        description: err?.message ?? t('toast.updateError'),
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('confirm.delete'))) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      toast({
        title: t('toast.success'),
        description: t('toast.deleteSuccess')
      });
      router.push('/dashboard/category');
    } catch (err: any) {
      toast({
        title: t('toast.error'),
        description: err?.message ?? t('toast.deleteError'),
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
              {t('toast.error')}: {error || t('detail.notFound')}
            </p>
          </div>
          <Link href='/dashboard/category'>
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
    <RouteGuard permission={Permission.VIEW_CATEGORY}>
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
                  {t('detail.idLabel')}: {category.id}
                </p>
              </div>
            </div>
            <div className='flex gap-2'>
              {!isEditing ? (
                <>
                  <PermissionGuard permission={Permission.UPDATE_CATEGORY}>
                    <Button onClick={() => setIsEditing(true)}>
                      <IconTag className='mr-2 h-4 w-4' />
                      {t('detail.edit')}
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard permission={Permission.DELETE_CATEGORY}>
                    <Button variant='destructive' onClick={handleDelete}>
                      <IconTrash className='mr-2 h-4 w-4' />
                      {t('detail.delete')}
                    </Button>
                  </PermissionGuard>
                </>
              ) : (
                <Button variant='outline' onClick={() => setIsEditing(false)}>
                  {t('detail.cancel')}
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {isEditing ? (
            <form onSubmit={handleUpdate}>
              <Card>
                <CardHeader>
                  <CardTitle>{t('detail.form.title')}</CardTitle>
                  <CardDescription>
                    {t('detail.form.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='name'>{t('detail.form.nameLabel')}</Label>
                    <Input
                      id='name'
                      placeholder={t('detail.form.namePlaceholder')}
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value
                        })
                      }
                      required
                    />
                  </div>

                  <div className='flex justify-end gap-4'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => setIsEditing(false)}
                    >
                      {t('detail.form.cancel')}
                    </Button>
                    <Button type='submit' disabled={saving}>
                      <IconDeviceFloppy className='mr-2 h-4 w-4' />
                      {saving ? t('detail.form.saving') : t('detail.form.save')}
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
                            {category.name || t('common.unnamed')}
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
                      <h3 className='mb-3 font-semibold'>
                        {t('detail.info.title')}
                      </h3>
                      <div className='space-y-1'>
                        <p className='text-muted-foreground text-xs'>
                          {t('detail.info.nameLabel')}
                        </p>
                        <p className='text-sm font-medium'>
                          {category.name || t('detail.info.notSet')}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className='mb-3 font-semibold'>
                        {t('detail.timestamps.title')}
                      </h3>
                      <div className='grid grid-cols-2 gap-3'>
                        {category.createdAt && (
                          <div>
                            <p className='text-muted-foreground text-xs'>
                              {t('detail.timestamps.created')}
                            </p>
                            <p className='text-sm font-medium'>
                              {new Date(
                                category.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {category.updatedAt && (
                          <div>
                            <p className='text-muted-foreground text-xs'>
                              {t('detail.timestamps.updated')}
                            </p>
                            <p className='text-sm font-medium'>
                              {new Date(
                                category.updatedAt
                              ).toLocaleDateString()}
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
                    <CardTitle>{t('detail.sidebar.quickActions')}</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-2'>
                    <PermissionGuard permission={Permission.UPDATE_CATEGORY}>
                      <Button
                        className='w-full justify-start'
                        onClick={() => setIsEditing(true)}
                      >
                        <IconTag className='mr-2 h-4 w-4' />
                        {t('detail.sidebar.edit')}
                      </Button>
                    </PermissionGuard>
                    <PermissionGuard permission={Permission.DELETE_CATEGORY}>
                      <Button
                        variant='destructive'
                        className='w-full justify-start'
                        onClick={handleDelete}
                      >
                        <IconTrash className='mr-2 h-4 w-4' />
                        {t('detail.sidebar.delete')}
                      </Button>
                    </PermissionGuard>
                    <Link href='/dashboard/category' className='block w-full'>
                      <Button
                        variant='outline'
                        className='w-full justify-start'
                      >
                        <IconArrowLeft className='mr-2 h-4 w-4' />
                        {t('detail.sidebar.back')}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </PageContainer>
    </RouteGuard>
  );
}

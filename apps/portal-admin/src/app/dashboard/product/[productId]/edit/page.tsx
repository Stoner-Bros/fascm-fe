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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { fetchCategories } from '@/services/category.service';
import { fetchProductById, updateProduct } from '@/services/product.service';
import { uploadFile } from '@/services/file.service';
import type { Category, Product } from '@/types/product';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FileUploader } from '@/components/file-uploader';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;
  const { toast } = useToast();
  const t = useTranslations('Product');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: ''
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [categoriesResponse, productData] = await Promise.all([
          fetchCategories({ page: 1, limit: 100 }),
          fetchProductById(productId)
        ]);

        setCategories(categoriesResponse.data);

        if (productData) {
          setFormData({
            name: productData.name || '',
            description: productData.description || '',
            categoryId: productData.category?.id || ''
          });
          setUploadedImageUrl(productData.image || '');
        }
      } catch (err: any) {
        toast({
          title: t('toast.error'),
          description: err?.message ?? t('toast.loadError'),
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [productId]);

  const handleImageUpload = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      setUploading(true);
      const uploadedFile = await uploadFile(files[0]);
      const imageUrl = uploadedFile.path;
      setUploadedImageUrl(imageUrl);
      toast({
        title: t('toast.success'),
        description: t('toast.uploadSuccess')
      });
    } catch (err: any) {
      toast({
        title: t('toast.error'),
        description: err?.message ?? t('toast.uploadError'),
        variant: 'destructive'
      });
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast({
        title: t('toast.validationError'),
        description: t('edit.validation.nameRequired'),
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      await updateProduct(productId, {
        name: formData.name,
        description: formData.description || null,
        image: uploadedImageUrl || null,
        category: formData.categoryId ? { id: formData.categoryId } : null
      });

      toast({
        title: t('toast.success'),
        description: t('toast.updateSuccess')
      });

      router.push(`/dashboard/product/${productId}`);
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
                {t('edit.title')}
              </h2>
              <p className='text-muted-foreground'>{t('edit.subtitle')}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>{t('edit.card.title')}</CardTitle>
              <CardDescription>{t('edit.card.description')}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Basic Information */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>
                  {t('edit.form.basicTitle')}
                </h3>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='name'>
                      {t('edit.form.nameLabel')}{' '}
                      <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='name'
                      placeholder={t('edit.form.namePlaceholder')}
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='category'>
                      {t('edit.form.categoryLabel')}
                    </Label>
                    <Select
                      value={
                        formData.categoryId === ''
                          ? undefined
                          : formData.categoryId
                      }
                      onValueChange={(value) =>
                        setFormData({ ...formData, categoryId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('edit.form.categoryPlaceholder')}
                        />
                      </SelectTrigger>
                      <SelectContent>
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
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='description'>
                    {t('edit.form.descriptionLabel')}
                  </Label>
                  <Textarea
                    id='description'
                    placeholder={t('edit.form.descriptionPlaceholder')}
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Product Image */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>
                  {t('edit.image.title')}
                </h3>
                <div className='space-y-2'>
                  {uploadedImageUrl ? (
                    <div className='space-y-4'>
                      <div className='relative aspect-video w-full overflow-hidden rounded-lg border'>
                        <Image
                          src={uploadedImageUrl}
                          alt={t('edit.image.previewAlt')}
                          fill
                          className='object-cover'
                        />
                      </div>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => setUploadedImageUrl('')}
                      >
                        {t('edit.image.change')}
                      </Button>
                    </div>
                  ) : (
                    <FileUploader
                      value={imageFiles}
                      onValueChange={setImageFiles}
                      onUpload={handleImageUpload}
                      maxFiles={1}
                      maxSize={1024 * 1024 * 5}
                      accept={{ 'image/*': [] }}
                      disabled={uploading}
                    />
                  )}
                </div>
              </div>

              <div className='flex justify-end gap-4'>
                <Link href={`/dashboard/product/${productId}`}>
                  <Button type='button' variant='outline'>
                    {t('common.cancel')}
                  </Button>
                </Link>
                <Button type='submit' disabled={saving || uploading}>
                  <IconDeviceFloppy className='mr-2 h-4 w-4' />
                  {saving ? t('edit.form.saving') : t('edit.form.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </PageContainer>
  );
}

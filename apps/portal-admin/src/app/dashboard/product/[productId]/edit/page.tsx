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
import { uploadFile, getFileUrlFromPath } from '@/services/file.service';
import type { Category, Product } from '@/types/product';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FileUploader } from '@/components/file-uploader';
import Image from 'next/image';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricePerKg: '',
    categoryId: '',
    minStorageHumidity: '',
    maxStorageHumidity: '',
    minStorageTemperature: '',
    maxStorageTemperature: ''
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
            pricePerKg: productData.pricePerKg?.toString() || '',
            categoryId: productData.categoryId?.id || '',
            minStorageHumidity: productData.minStorageHumidity || '',
            maxStorageHumidity: productData.maxStorageHumidity || '',
            minStorageTemperature: productData.minStorageTemperature || '',
            maxStorageTemperature: productData.maxStorageTemperature || ''
          });
          setUploadedImageUrl(productData.image || '');
        }
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err?.message ?? 'Failed to load data',
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
      const imageUrl = getFileUrlFromPath(uploadedFile.path);
      setUploadedImageUrl(imageUrl);
      toast({
        title: 'Success',
        description: 'Image uploaded successfully'
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message ?? 'Failed to upload image',
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
        title: 'Validation Error',
        description: 'Product name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      await updateProduct(productId, {
        name: formData.name,
        description: formData.description || null,
        pricePerKg: formData.pricePerKg
          ? parseFloat(formData.pricePerKg)
          : null,
        image: uploadedImageUrl || null,
        categoryId: formData.categoryId ? { id: formData.categoryId } : null,
        minStorageHumidity: formData.minStorageHumidity || null,
        maxStorageHumidity: formData.maxStorageHumidity || null,
        minStorageTemperature: formData.minStorageTemperature || null,
        maxStorageTemperature: formData.maxStorageTemperature || null
      });

      toast({
        title: 'Success',
        description: 'Product updated successfully'
      });

      router.push(`/dashboard/product/${productId}`);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message ?? 'Failed to update product',
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
                Edit Product
              </h2>
              <p className='text-muted-foreground'>
                Update product information
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>Edit the details of the product</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Basic Information */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Basic Information</h3>
                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='name'>
                      Product Name <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='name'
                      placeholder='e.g., Organic Tomatoes'
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='category'>Category</Label>
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
                        <SelectValue placeholder='Select a category' />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter(
                            (category) =>
                              category.id && category.id.trim().length > 0
                          )
                          .map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name || 'Unnamed Category'}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='pricePerKg'>Price per Kg ($)</Label>
                    <Input
                      id='pricePerKg'
                      type='number'
                      step='0.01'
                      min='0'
                      placeholder='e.g., 2.50'
                      value={formData.pricePerKg}
                      onChange={(e) =>
                        setFormData({ ...formData, pricePerKg: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='description'>Description</Label>
                  <Textarea
                    id='description'
                    placeholder='Enter product description...'
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Storage Conditions */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Storage Conditions</h3>
                <div className='space-y-4'>
                  {/* Temperature Range */}
                  <div className='space-y-2'>
                    <Label>Temperature Range (°C)</Label>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label
                          htmlFor='minStorageTemperature'
                          className='text-muted-foreground text-xs font-normal'
                        >
                          Minimum
                        </Label>
                        <Input
                          id='minStorageTemperature'
                          type='number'
                          step='0.1'
                          placeholder='e.g., 12'
                          value={formData.minStorageTemperature}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              minStorageTemperature: e.target.value
                            })
                          }
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label
                          htmlFor='maxStorageTemperature'
                          className='text-muted-foreground text-xs font-normal'
                        >
                          Maximum
                        </Label>
                        <Input
                          id='maxStorageTemperature'
                          type='number'
                          step='0.1'
                          placeholder='e.g., 15'
                          value={formData.maxStorageTemperature}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maxStorageTemperature: e.target.value
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Humidity Range */}
                  <div className='space-y-2'>
                    <Label>Humidity Range (%)</Label>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label
                          htmlFor='minStorageHumidity'
                          className='text-muted-foreground text-xs font-normal'
                        >
                          Minimum
                        </Label>
                        <Input
                          id='minStorageHumidity'
                          type='number'
                          step='0.1'
                          min='0'
                          max='100'
                          placeholder='e.g., 60'
                          value={formData.minStorageHumidity}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              minStorageHumidity: e.target.value
                            })
                          }
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label
                          htmlFor='maxStorageHumidity'
                          className='text-muted-foreground text-xs font-normal'
                        >
                          Maximum
                        </Label>
                        <Input
                          id='maxStorageHumidity'
                          type='number'
                          step='0.1'
                          min='0'
                          max='100'
                          placeholder='e.g., 70'
                          value={formData.maxStorageHumidity}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maxStorageHumidity: e.target.value
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Image */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Product Image</h3>
                <div className='space-y-2'>
                  {uploadedImageUrl ? (
                    <div className='space-y-4'>
                      <div className='relative aspect-video w-full overflow-hidden rounded-lg border'>
                        <Image
                          src={uploadedImageUrl}
                          alt='Product preview'
                          fill
                          className='object-cover'
                        />
                      </div>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => setUploadedImageUrl('')}
                      >
                        Change Image
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
                    Cancel
                  </Button>
                </Link>
                <Button type='submit' disabled={saving || uploading}>
                  <IconDeviceFloppy className='mr-2 h-4 w-4' />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </PageContainer>
  );
}

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
import { useToast } from '@/components/ui/use-toast';
import { fetchCategories } from '@/services/category.service';
import { createProduct } from '@/services/product.service';
import type { Category } from '@/types/product';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricePerKg: '',
    image: '',
    categoryId: '',
    status: 'active',
    storageTemperatureRange: '',
    storageHumidityRange: ''
  });

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetchCategories({ page: 1, limit: 100 });
        setCategories(response.data);
      } catch (err: any) {
        toast({
          title: 'Error',
          description: 'Failed to load categories',
          variant: 'destructive'
        });
      }
    }
    loadCategories();
  }, []);

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
      setLoading(true);
      await createProduct({
        name: formData.name,
        description: formData.description || null,
        pricePerKg: formData.pricePerKg
          ? parseFloat(formData.pricePerKg)
          : null,
        image: formData.image || null,
        categoryId: formData.categoryId ? { id: formData.categoryId } : null,
        status: formData.status || null,
        storageTemperatureRange: formData.storageTemperatureRange || null,
        storageHumidityRange: formData.storageHumidityRange || null
      });

      toast({
        title: 'Success',
        description: 'Product created successfully'
      });

      router.push('/dashboard/product');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message ?? 'Failed to create product',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

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
                Create New Product
              </h2>
              <p className='text-muted-foreground'>
                Add a new product to your inventory
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>
                Enter the details of the new product
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid gap-6 md:grid-cols-2'>
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
                  <Label htmlFor='pricePerKg'>Price per Kg</Label>
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
                  <Label htmlFor='status'>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='active'>Active</SelectItem>
                      <SelectItem value='inactive'>Inactive</SelectItem>
                      <SelectItem value='draft'>Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='storageTemperatureRange'>
                    Storage Temperature Range
                  </Label>
                  <Input
                    id='storageTemperatureRange'
                    placeholder='e.g., 12-15°C'
                    value={formData.storageTemperatureRange}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        storageTemperatureRange: e.target.value
                      })
                    }
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='storageHumidityRange'>
                    Storage Humidity Range
                  </Label>
                  <Input
                    id='storageHumidityRange'
                    placeholder='e.g., 60-70%'
                    value={formData.storageHumidityRange}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        storageHumidityRange: e.target.value
                      })
                    }
                  />
                </div>

                <div className='space-y-2 md:col-span-2'>
                  <Label htmlFor='image'>Image URL</Label>
                  <Input
                    id='image'
                    type='url'
                    placeholder='https://example.com/image.jpg'
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                  />
                </div>

                <div className='space-y-2 md:col-span-2'>
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

              <div className='flex justify-end gap-4'>
                <Link href='/dashboard/product'>
                  <Button type='button' variant='outline'>
                    Cancel
                  </Button>
                </Link>
                <Button type='submit' disabled={loading}>
                  <IconDeviceFloppy className='mr-2 h-4 w-4' />
                  {loading ? 'Creating...' : 'Create Product'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </PageContainer>
  );
}

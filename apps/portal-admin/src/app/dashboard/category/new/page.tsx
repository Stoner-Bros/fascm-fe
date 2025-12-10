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
import { useToast } from '@/components/ui/use-toast';
import { createCategory } from '@/services/category.service';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewCategoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    englishName: '',
    vietnameseName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
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
      setLoading(true);
      await createCategory({
        name: formData.englishName
      });

      toast({
        title: 'Success',
        description: 'Category created successfully'
      });

      router.push('/dashboard/category');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message ?? 'Failed to create category',
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
                Create New Category
              </h2>
              <p className='text-muted-foreground'>
                Add a new category for products
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Category Information</CardTitle>
              <CardDescription>
                Enter the details of the new category
              </CardDescription>
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
                      setFormData({ ...formData, englishName: e.target.value })
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
                <Link href='/dashboard/category'>
                  <Button type='button' variant='outline'>
                    Cancel
                  </Button>
                </Link>
                <Button type='submit' disabled={loading}>
                  <IconDeviceFloppy className='mr-2 h-4 w-4' />
                  {loading ? 'Creating...' : 'Create Category'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </PageContainer>
  );
}

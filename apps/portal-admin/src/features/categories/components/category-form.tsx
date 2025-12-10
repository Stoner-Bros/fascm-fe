'use client';

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
import {
  createCategory,
  updateCategory,
  type CreateCategoryDto,
  type UpdateCategoryDto
} from '@/services/category.service';
import type { Category } from '@/types/product';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CategoryFormProps {
  category?: Category;
  mode: 'create' | 'edit';
}

export function CategoryForm({ category, mode }: CategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: category?.name || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast({
        title: 'Validation Error',
        description: 'Category name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      const data: CreateCategoryDto | UpdateCategoryDto = {
        name: formData.name || null
      };

      if (mode === 'create') {
        await createCategory(data);
        toast({
          title: 'Success',
          description: 'Category created successfully'
        });
      } else if (category) {
        await updateCategory(category.id, data);
        toast({
          title: 'Success',
          description: 'Category updated successfully'
        });
      }

      router.push('/dashboard/category');
    } catch (err: any) {
      toast({
        title: 'Error',
        description:
          err?.message ??
          `Failed to ${mode === 'create' ? 'create' : 'update'} category`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Category Information</CardTitle>
          <CardDescription>
            {mode === 'create'
              ? 'Enter the details of the new category'
              : 'Update category information'}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Category Name</Label>
            <Input
              id='name'
              placeholder='e.g., Vegetables'
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className='flex justify-end gap-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              <IconDeviceFloppy className='mr-2 h-4 w-4' />
              {loading
                ? mode === 'create'
                  ? 'Creating...'
                  : 'Saving...'
                : mode === 'create'
                  ? 'Create Category'
                  : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

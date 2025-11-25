'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { deleteCategory } from '@/services/category.service';
import type { Category } from '@/types/product';
import { IconEdit, IconEye, IconTag, IconTrash } from '@tabler/icons-react';
import Link from 'next/link';

interface CategoryListingProps {
  categories: Category[];
  onDelete?: (id: string) => void;
}

export function CategoryListing({
  categories,
  onDelete
}: CategoryListingProps) {
  const { toast } = useToast();

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
      onDelete?.(id);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message ?? 'Failed to delete category',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {categories.map((category) => (
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
                Created: {new Date(category.createdAt).toLocaleDateString()}
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
  );
}

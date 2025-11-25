'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Category } from '@/types/product';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Tag, Text } from 'lucide-react';
import { CellAction } from './cell-action';

export const columns: ColumnDef<Category>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<Category, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ cell }) => {
      const name = cell.getValue<Category['name']>();
      return (
        <div className='flex items-center gap-2'>
          <Tag className='text-primary h-4 w-4' />
          <span className='font-medium'>{name || 'Unnamed Category'}</span>
        </div>
      );
    },
    meta: {
      label: 'Name',
      placeholder: 'Search categories...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: ({ column }: { column: Column<Category, unknown> }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ cell }) => {
      const description = cell.getValue<Category['description']>();
      return (
        <div className='line-clamp-2 max-w-md'>
          {description || 'No description'}
        </div>
      );
    }
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }: { column: Column<Category, unknown> }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<Category['createdAt']>();
      return date ? new Date(date).toLocaleDateString() : '-';
    }
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }: { column: Column<Category, unknown> }) => (
      <DataTableColumnHeader column={column} title='Updated At' />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<Category['updatedAt']>();
      return date ? new Date(date).toLocaleDateString() : '-';
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];

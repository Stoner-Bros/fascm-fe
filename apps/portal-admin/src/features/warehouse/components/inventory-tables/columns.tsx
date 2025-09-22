'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import {
  CheckCircle2,
  Package,
  XCircle,
  AlertTriangle,
  MapPin,
  Calendar,
  Award,
  Building
} from 'lucide-react';
import { InventoryItem } from '.';
import { CellAction } from './cell-action';

// Category options for filtering
export const CATEGORY_OPTIONS = [
  { label: 'Rau củ quả', value: 'Rau củ quả' },
  { label: 'Trái cây', value: 'Trái cây' },
  { label: 'Hạt giống', value: 'Hạt giống' }
];

// Status options for filtering
export const STATUS_OPTIONS = [
  { label: 'In Stock', value: 'In Stock' },
  { label: 'Low Stock', value: 'Low Stock' },
  { label: 'Out of Stock', value: 'Out of Stock' }
];

// Quality options for filtering
export const QUALITY_OPTIONS = [
  { label: 'Loại A', value: 'A' },
  { label: 'Loại B', value: 'B' },
  { label: 'Loại C', value: 'C' }
];

export const columns: ColumnDef<InventoryItem>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<InventoryItem, unknown> }) => (
      <DataTableColumnHeader column={column} title='Tên sản phẩm' />
    ),
    cell: ({ cell }) => (
      <div className='font-medium'>
        {cell.getValue<InventoryItem['name']>()}
      </div>
    ),
    meta: {
      label: 'Tên sản phẩm',
      placeholder: 'Tìm kiếm sản phẩm...',
      variant: 'text',
      icon: Package
    },
    enableColumnFilter: true
  },
  {
    id: 'sku',
    accessorKey: 'sku',
    header: ({ column }: { column: Column<InventoryItem, unknown> }) => (
      <DataTableColumnHeader column={column} title='Mã SKU' />
    ),
    cell: ({ cell }) => (
      <div className='font-mono text-sm'>
        {cell.getValue<InventoryItem['sku']>()}
      </div>
    )
  },
  {
    id: 'category',
    accessorKey: 'category',
    header: ({ column }: { column: Column<InventoryItem, unknown> }) => (
      <DataTableColumnHeader column={column} title='Loại sản phẩm' />
    ),
    cell: ({ cell }) => {
      const category = cell.getValue<InventoryItem['category']>();
      return <Badge variant='outline'>{category}</Badge>;
    },
    meta: {
      label: 'Loại sản phẩm',
      placeholder: 'Lọc theo loại',
      variant: 'select',
      options: CATEGORY_OPTIONS
    },
    enableColumnFilter: true
  },
  {
    id: 'quantity',
    accessorKey: 'quantity',
    header: ({ column }: { column: Column<InventoryItem, unknown> }) => (
      <DataTableColumnHeader column={column} title='Số lượng' />
    ),
    cell: ({ row }) => {
      const quantity = row.getValue<number>('quantity');
      const unit = row.original.unit || 'kg';
      return (
        <div className='text-right'>
          {quantity} {unit}
        </div>
      );
    }
  },
  {
    id: 'origin',
    accessorKey: 'origin',
    header: ({ column }: { column: Column<InventoryItem, unknown> }) => (
      <DataTableColumnHeader column={column} title='Xuất xứ' />
    ),
    cell: ({ cell }) => {
      const origin = cell.getValue<InventoryItem['origin']>();
      return origin ? (
        <div className='flex items-center'>
          <MapPin className='text-muted-foreground mr-1 h-3 w-3' />
          <span className='text-sm'>{origin}</span>
        </div>
      ) : (
        <span className='text-muted-foreground'>-</span>
      );
    }
  },
  {
    id: 'quality',
    accessorKey: 'quality',
    header: ({ column }: { column: Column<InventoryItem, unknown> }) => (
      <DataTableColumnHeader column={column} title='Chất lượng' />
    ),
    cell: ({ cell }) => {
      const quality = cell.getValue<InventoryItem['quality']>();
      if (!quality) return <span className='text-muted-foreground'>-</span>;

      const qualityColors = {
        A: 'bg-green-500',
        B: 'bg-yellow-500',
        C: 'bg-orange-500'
      };

      return (
        <Badge className={qualityColors[quality]}>
          <Award className='mr-1 h-3 w-3' />
          Loại {quality}
        </Badge>
      );
    },
    meta: {
      label: 'Chất lượng',
      placeholder: 'Lọc theo chất lượng',
      variant: 'select',
      options: QUALITY_OPTIONS
    },
    enableColumnFilter: true
  },
  {
    id: 'expiryDate',
    accessorKey: 'expiryDate',
    header: ({ column }: { column: Column<InventoryItem, unknown> }) => (
      <DataTableColumnHeader column={column} title='Hạn sử dụng' />
    ),
    cell: ({ cell }) => {
      const expiryDate = cell.getValue<InventoryItem['expiryDate']>();
      if (!expiryDate) return <span className='text-muted-foreground'>-</span>;

      const date = new Date(expiryDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil(
        (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      let badgeColor = 'bg-green-500';
      if (daysUntilExpiry <= 7) badgeColor = 'bg-red-500';
      else if (daysUntilExpiry <= 14) badgeColor = 'bg-yellow-500';

      return (
        <div className='flex items-center'>
          <Calendar className='text-muted-foreground mr-1 h-3 w-3' />
          <span className='text-sm'>{date.toLocaleDateString('vi-VN')}</span>
          {daysUntilExpiry <= 14 && (
            <Badge className={`ml-2 ${badgeColor}`}>
              {daysUntilExpiry > 0 ? `${daysUntilExpiry} ngày` : 'Hết hạn'}
            </Badge>
          )}
        </div>
      );
    }
  },
  {
    id: 'supplier',
    accessorKey: 'supplier',
    header: ({ column }: { column: Column<InventoryItem, unknown> }) => (
      <DataTableColumnHeader column={column} title='Nhà cung cấp' />
    ),
    cell: ({ cell }) => {
      const supplier = cell.getValue<InventoryItem['supplier']>();
      return supplier ? (
        <div className='flex items-center'>
          <Building className='text-muted-foreground mr-1 h-3 w-3' />
          <span className='text-sm'>{supplier}</span>
        </div>
      ) : (
        <span className='text-muted-foreground'>-</span>
      );
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<InventoryItem, unknown> }) => (
      <DataTableColumnHeader column={column} title='Trạng thái' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<InventoryItem['status']>();

      return (
        <div className='flex items-center'>
          {status === 'In Stock' && (
            <Badge className='bg-green-500'>
              <CheckCircle2 className='mr-1 h-3 w-3' />
              Còn hàng
            </Badge>
          )}
          {status === 'Low Stock' && (
            <Badge className='bg-yellow-500'>
              <AlertTriangle className='mr-1 h-3 w-3' />
              Sắp hết
            </Badge>
          )}
          {status === 'Out of Stock' && (
            <Badge className='bg-red-500'>
              <XCircle className='mr-1 h-3 w-3' />
              Hết hàng
            </Badge>
          )}
        </div>
      );
    },
    meta: {
      label: 'Trạng thái',
      placeholder: 'Lọc theo trạng thái',
      variant: 'select',
      options: STATUS_OPTIONS
    },
    enableColumnFilter: true
  },
  {
    id: 'lastUpdated',
    accessorKey: 'lastUpdated',
    header: ({ column }: { column: Column<InventoryItem, unknown> }) => (
      <DataTableColumnHeader column={column} title='Cập nhật lần cuối' />
    ),
    cell: ({ cell }) => {
      const date = new Date(cell.getValue<string>());
      return (
        <div className='text-muted-foreground text-sm'>
          {date.toLocaleDateString('vi-VN')}
        </div>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];

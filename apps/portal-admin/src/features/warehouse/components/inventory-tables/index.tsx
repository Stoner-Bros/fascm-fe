'use client';

// TODO: Uncomment when backend data is ready
// import { DataTable } from '@/components/ui/table/data-table';
// import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';

// import {
//   useReactTable,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   getFacetedRowModel,
//   getFacetedUniqueValues,
//   getFacetedMinMaxValues,
//   type ColumnFiltersState,
//   type SortingState,
//   type VisibilityState,
//   type PaginationState
// } from '@tanstack/react-table';
// import { ColumnDef } from '@tanstack/react-table';
// import { parseAsInteger, useQueryState } from 'nuqs';
// import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { IconHistory } from '@tabler/icons-react';
import Link from 'next/link';

// Define the InventoryItem type
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit?: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastUpdated: string;
  origin?: string; // Xuất xứ
  expiryDate?: string; // Ngày hết hạn
  quality?: 'A' | 'B' | 'C'; // Cấp độ chất lượng
  supplier?: string; // Nhà cung cấp
}

// TODO: Uncomment when backend data is ready
// interface InventoryTableParams<TData, TValue> {
//   data: TData[];
//   totalItems: number;
//   columns: ColumnDef<TData, TValue>[];
// }

// export function InventoryTable<TData, TValue>({
//   data,
//   totalItems,
//   columns
// }: InventoryTableParams<TData, TValue>) {
//   const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));
//   const [sorting, setSorting] = useState<SortingState>([]);
//   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
//   const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
//   const [rowSelection, setRowSelection] = useState({});
//   const [pagination, setPagination] = useState<PaginationState>({
//     pageIndex: 0,
//     pageSize: pageSize,
//   });

//   const table = useReactTable({
//     data,
//     columns,
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setColumnFilters,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getFacetedRowModel: getFacetedRowModel(),
//     getFacetedUniqueValues: getFacetedUniqueValues(),
//     getFacetedMinMaxValues: getFacetedMinMaxValues(),
//     onColumnVisibilityChange: setColumnVisibility,
//     onRowSelectionChange: setRowSelection,
//     onPaginationChange: setPagination,
//     state: {
//       sorting,
//       columnFilters,
//       columnVisibility,
//       rowSelection,
//       pagination,
//     },
//     enableRowSelection: true,
//     manualPagination: false,
//     manualSorting: false,
//     manualFiltering: false,
//   });

//   return (
//     <DataTable table={table}>
//       <DataTableToolbar table={table} />
//     </DataTable>
//   );
// }

// Temporary simple component for demo purposes
export function InventoryTable({ data }: { data?: InventoryItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className='rounded-lg border p-4'>
        <p className='text-muted-foreground text-center'>
          Không có dữ liệu để hiển thị.
        </p>
      </div>
    );
  }

  return (
    <div className='overflow-hidden rounded-lg border'>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-muted/50'>
            <tr>
              <th className='px-4 py-3 text-left text-sm font-medium'>
                Tên sản phẩm
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium'>SKU</th>
              <th className='px-4 py-3 text-left text-sm font-medium'>
                Danh mục
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium'>
                Số lượng
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium'>
                Trạng thái
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium'>
                Xuất xứ
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium'>
                Hạn sử dụng
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium'>
                Chất lượng
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium'>
                Nhà cung cấp
              </th>
              <th className='px-4 py-3 text-left text-sm font-medium'>
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={item.id}
                className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
              >
                <td className='px-4 py-3 text-sm font-medium'>{item.name}</td>
                <td className='text-muted-foreground px-4 py-3 text-sm'>
                  {item.sku}
                </td>
                <td className='px-4 py-3 text-sm'>{item.category}</td>
                <td className='px-4 py-3 text-sm'>
                  {item.quantity} {item.unit}
                </td>
                <td className='px-4 py-3 text-sm'>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      item.status === 'In Stock'
                        ? 'bg-green-100 text-green-800'
                        : item.status === 'Low Stock'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.status === 'In Stock'
                      ? 'Còn hàng'
                      : item.status === 'Low Stock'
                        ? 'Sắp hết'
                        : 'Hết hàng'}
                  </span>
                </td>
                <td className='px-4 py-3 text-sm'>{item.origin}</td>
                <td className='px-4 py-3 text-sm'>
                  {item.expiryDate
                    ? new Date(item.expiryDate).toLocaleDateString('vi-VN')
                    : 'N/A'}
                </td>
                <td className='px-4 py-3 text-sm'>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      item.quality === 'A'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {item.quality}
                  </span>
                </td>
                <td className='px-4 py-3 text-sm'>{item.supplier}</td>
                <td className='px-4 py-3 text-sm'>
                  <Link href='/dashboard/warehouse/inventory/history'>
                    <Button variant='outline' size='sm'>
                      <IconHistory className='mr-1 h-3 w-3' />
                      Lịch sử
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  IconFilter,
  IconX,
  IconCalendar,
  IconSearch,
  IconRefresh
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { InventoryFilter } from '@/types/inventory';

interface InventoryFiltersProps {
  onFiltersChange: (filters: InventoryFilter) => void;
  onSearch: (query: string) => void;
}

export function InventoryFilters({
  onFiltersChange,
  onSearch
}: InventoryFiltersProps) {
  const [filters, setFilters] = useState<InventoryFilter>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expiryDateFrom, setExpiryDateFrom] = useState<Date>();
  const [expiryDateTo, setExpiryDateTo] = useState<Date>();

  // Mock data - trong thực tế sẽ fetch từ API
  const warehouses = [
    { id: 'WH001', name: 'Kho Hà Nội' },
    { id: 'WH002', name: 'Kho TP.HCM' },
    { id: 'WH003', name: 'Kho Đà Nẵng' }
  ];

  const areas = [
    { id: 'A001', name: 'Khu vực A - Sản phẩm khô', warehouseId: 'WH001' },
    { id: 'A002', name: 'Khu vực B - Rau củ quả', warehouseId: 'WH001' },
    { id: 'A003', name: 'Khu vực C - Trái cây', warehouseId: 'WH001' },
    { id: 'B001', name: 'Khu vực A - Sản phẩm tươi', warehouseId: 'WH002' },
    { id: 'B002', name: 'Khu vực B - Hạt giống', warehouseId: 'WH002' }
  ];

  const categories = [
    { id: 'CAT001', name: 'Rau củ quả' },
    { id: 'CAT002', name: 'Trái cây' },
    { id: 'CAT003', name: 'Hạt giống' },
    { id: 'CAT004', name: 'Sản phẩm khô' }
  ];

  const suppliers = [
    { id: 'SUP001', name: 'Nông trại Xanh Đà Lạt' },
    { id: 'SUP002', name: 'HTX Nông sản Tiền Giang' },
    { id: 'SUP003', name: 'Công ty TNHH Nông sản Việt' }
  ];

  const handleFilterChange = (key: keyof InventoryFilter, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value === 'all' ? '' : value
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateFilterChange = () => {
    const newFilters = {
      ...filters,
      expiryDateFrom: expiryDateFrom?.toISOString(),
      expiryDateTo: expiryDateTo?.toISOString()
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setExpiryDateFrom(undefined);
    setExpiryDateTo(undefined);
    onFiltersChange({});
    onSearch('');
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter((value) => value && value !== '')
      .length;
  };

  const filteredAreas = areas.filter(
    (area) => !filters.warehouseId || area.warehouseId === filters.warehouseId
  );

  return (
    <div className='space-y-4'>
      {/* Search Bar */}
      <div className='flex gap-2'>
        <div className='relative flex-1'>
          <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
          <Input
            placeholder='Tìm kiếm sản phẩm, SKU, lô hàng...'
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className='pl-10'
          />
        </div>
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant='outline' className='relative'>
              <IconFilter className='mr-2 h-4 w-4' />
              Bộ lọc
              {getActiveFiltersCount() > 0 && (
                <Badge
                  variant='secondary'
                  className='ml-2 h-5 w-5 rounded-full p-0 text-xs'
                >
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-80' align='end'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h4 className='font-medium'>Bộ lọc nâng cao</h4>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={clearFilters}
                  className='h-8 px-2'
                >
                  <IconRefresh className='h-4 w-4' />
                </Button>
              </div>
              <Separator />

              {/* Warehouse Filter */}
              <div className='space-y-2'>
                <Label>Kho</Label>
                <Select
                  value={filters.warehouseId || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('warehouseId', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn kho' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Tất cả kho</SelectItem>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Area Filter */}
              <div className='space-y-2'>
                <Label>Khu vực</Label>
                <Select
                  value={filters.areaId || 'all'}
                  onValueChange={(value) => handleFilterChange('areaId', value)}
                  disabled={!filters.warehouseId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn khu vực' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Tất cả khu vực</SelectItem>
                    {filteredAreas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className='space-y-2'>
                <Label>Danh mục</Label>
                <Select
                  value={filters.categoryId || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('categoryId', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn danh mục' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Tất cả danh mục</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Supplier Filter */}
              <div className='space-y-2'>
                <Label>Nhà cung cấp</Label>
                <Select
                  value={filters.supplierId || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('supplierId', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn nhà cung cấp' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Tất cả nhà cung cấp</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stock Level Filter */}
              <div className='space-y-2'>
                <Label>Mức tồn kho</Label>
                <Select
                  value={filters.stockLevel || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('stockLevel', value as any)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn mức tồn kho' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Tất cả</SelectItem>
                    <SelectItem value='low'>Sắp hết hàng</SelectItem>
                    <SelectItem value='normal'>Bình thường</SelectItem>
                    <SelectItem value='high'>Dư thừa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quality Filter */}
              <div className='space-y-2'>
                <Label>Chất lượng</Label>
                <Select
                  value={filters.quality || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('quality', value as any)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Chọn chất lượng' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>Tất cả</SelectItem>
                    <SelectItem value='A'>Loại A</SelectItem>
                    <SelectItem value='B'>Loại B</SelectItem>
                    <SelectItem value='C'>Loại C</SelectItem>
                    <SelectItem value='D'>Loại D</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Expiry Date Filter */}
              <div className='space-y-2'>
                <Label>Ngày hết hạn</Label>
                <div className='flex gap-2'>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className={cn(
                          'flex-1 justify-start text-left font-normal',
                          !expiryDateFrom && 'text-muted-foreground'
                        )}
                      >
                        <IconCalendar className='mr-2 h-4 w-4' />
                        {expiryDateFrom
                          ? format(expiryDateFrom, 'dd/MM/yyyy', { locale: vi })
                          : 'Từ ngày'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0'>
                      <Calendar
                        mode='single'
                        selected={expiryDateFrom}
                        onSelect={(date) => {
                          setExpiryDateFrom(date);
                          if (date) handleDateFilterChange();
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className={cn(
                          'flex-1 justify-start text-left font-normal',
                          !expiryDateTo && 'text-muted-foreground'
                        )}
                      >
                        <IconCalendar className='mr-2 h-4 w-4' />
                        {expiryDateTo
                          ? format(expiryDateTo, 'dd/MM/yyyy', { locale: vi })
                          : 'Đến ngày'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0'>
                      <Calendar
                        mode='single'
                        selected={expiryDateTo}
                        onSelect={(date) => {
                          setExpiryDateTo(date);
                          if (date) handleDateFilterChange();
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <div className='flex flex-wrap gap-2'>
          {filters.warehouseId && (
            <Badge variant='secondary' className='gap-1'>
              Kho: {warehouses.find((w) => w.id === filters.warehouseId)?.name}
              <IconX
                className='h-3 w-3 cursor-pointer'
                onClick={() => handleFilterChange('warehouseId', undefined)}
              />
            </Badge>
          )}
          {filters.areaId && (
            <Badge variant='secondary' className='gap-1'>
              Khu vực: {areas.find((a) => a.id === filters.areaId)?.name}
              <IconX
                className='h-3 w-3 cursor-pointer'
                onClick={() => handleFilterChange('areaId', undefined)}
              />
            </Badge>
          )}
          {filters.categoryId && (
            <Badge variant='secondary' className='gap-1'>
              Danh mục:{' '}
              {categories.find((c) => c.id === filters.categoryId)?.name}
              <IconX
                className='h-3 w-3 cursor-pointer'
                onClick={() => handleFilterChange('categoryId', undefined)}
              />
            </Badge>
          )}
          {filters.stockLevel && (
            <Badge variant='secondary' className='gap-1'>
              Tồn kho:{' '}
              {filters.stockLevel === 'low'
                ? 'Sắp hết'
                : filters.stockLevel === 'high'
                  ? 'Dư thừa'
                  : 'Bình thường'}
              <IconX
                className='h-3 w-3 cursor-pointer'
                onClick={() => handleFilterChange('stockLevel', undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

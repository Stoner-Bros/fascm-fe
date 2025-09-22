'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  IconPackage,
  IconAlertTriangle,
  IconTemperature,
  IconDroplet,
  IconSearch,
  IconFilter,
  IconPlus,
  IconMinus,
  IconEye,
  IconEdit,
  IconTrendingUp,
  IconTrendingDown,
  IconCalendar,
  IconCurrency,
  IconBarcode
} from '@tabler/icons-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  totalValue: number;
  expiryDate: string;
  batchNumber: string;
  supplier: string;
  location: string;
  lastUpdated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
}

interface WarehouseInventoryDetailProps {}

export function WarehouseInventoryDetail({}: WarehouseInventoryDetailProps) {
  const params = useParams();
  const warehouseId = params?.id as string;

  // Mock warehouse data
  const warehouse = {
    id: 'WH001',
    name: 'Kho Trung tâm Hà Nội',
    location: 'Hà Nội',
    capacity: 85,
    areas: [
      {
        id: 'A1',
        name: 'Khu vực A1 - Rau củ',
        temperature: 4.2,
        humidity: 65,
        capacity: 90
      },
      {
        id: 'A2',
        name: 'Khu vực A2 - Trái cây',
        temperature: 7.2,
        humidity: 70,
        capacity: 75
      },
      {
        id: 'A3',
        name: 'Khu vực A3 - Ngũ cốc',
        temperature: 18.5,
        humidity: 45,
        capacity: 95
      }
    ]
  };

  // Mock products data - wrapped in useMemo to prevent re-creation on every render
  const mockProducts: Product[] = useMemo(
    () => [
      {
        id: 'P001',
        name: 'Cà chua cherry',
        category: 'Rau củ',
        sku: 'VEG-TOM-001',
        unit: 'kg',
        currentStock: 150,
        minStock: 50,
        maxStock: 300,
        unitPrice: 45000,
        totalValue: 6750000,
        expiryDate: '2024-02-15',
        batchNumber: 'B20240201',
        supplier: 'Nông trại Đà Lạt',
        location: 'A1-R01-S03',
        lastUpdated: '2024-01-28',
        status: 'in_stock'
      },
      {
        id: 'P002',
        name: 'Xà lách xoăn',
        category: 'Rau củ',
        sku: 'VEG-LET-002',
        unit: 'kg',
        currentStock: 25,
        minStock: 30,
        maxStock: 100,
        unitPrice: 35000,
        totalValue: 875000,
        expiryDate: '2024-02-05',
        batchNumber: 'B20240125',
        supplier: 'Trang trại Organic',
        location: 'A1-R02-S01',
        lastUpdated: '2024-01-27',
        status: 'low_stock'
      },
      {
        id: 'P003',
        name: 'Táo Fuji',
        category: 'Trái cây',
        sku: 'FRU-APP-003',
        unit: 'kg',
        currentStock: 0,
        minStock: 20,
        maxStock: 150,
        unitPrice: 65000,
        totalValue: 0,
        expiryDate: '2024-02-20',
        batchNumber: 'B20240120',
        supplier: 'Vườn táo Ninh Thuận',
        location: 'A2-R01-S02',
        lastUpdated: '2024-01-26',
        status: 'out_of_stock'
      },
      {
        id: 'P004',
        name: 'Cam sành',
        category: 'Trái cây',
        sku: 'FRU-ORA-004',
        unit: 'kg',
        currentStock: 80,
        minStock: 25,
        maxStock: 200,
        unitPrice: 25000,
        totalValue: 2000000,
        expiryDate: '2024-01-30',
        batchNumber: 'B20240115',
        supplier: 'Vườn cam Hòa Bình',
        location: 'A2-R02-S01',
        lastUpdated: '2024-01-25',
        status: 'expired'
      },
      {
        id: 'P005',
        name: 'Gạo ST25',
        category: 'Ngũ cốc',
        sku: 'GRA-RIC-005',
        unit: 'kg',
        currentStock: 500,
        minStock: 100,
        maxStock: 1000,
        unitPrice: 28000,
        totalValue: 14000000,
        expiryDate: '2024-12-31',
        batchNumber: 'B20240101',
        supplier: 'Hợp tác xã An Giang',
        location: 'A3-R01-S01',
        lastUpdated: '2024-01-20',
        status: 'in_stock'
      },
      {
        id: 'P006',
        name: 'Đậu xanh',
        category: 'Ngũ cốc',
        sku: 'GRA-BEA-006',
        unit: 'kg',
        currentStock: 45,
        minStock: 50,
        maxStock: 200,
        unitPrice: 32000,
        totalValue: 1440000,
        expiryDate: '2024-06-30',
        batchNumber: 'B20240110',
        supplier: 'Nông trại Đồng Tháp',
        location: 'A3-R02-S02',
        lastUpdated: '2024-01-18',
        status: 'low_stock'
      }
    ],
    []
  );

  // State for filtering and searching
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedArea, setSelectedArea] = useState('all');

  // Calculate statistics
  const stats = useMemo(() => {
    const totalProducts = mockProducts.length;
    const totalValue = mockProducts.reduce(
      (sum, product) => sum + product.totalValue,
      0
    );
    const inStock = mockProducts.filter((p) => p.status === 'in_stock').length;
    const lowStock = mockProducts.filter(
      (p) => p.status === 'low_stock'
    ).length;
    const outOfStock = mockProducts.filter(
      (p) => p.status === 'out_of_stock'
    ).length;
    const expired = mockProducts.filter((p) => p.status === 'expired').length;
    const expiringSoon = mockProducts.filter((p) => {
      const expiryDate = new Date(p.expiryDate);
      const today = new Date();
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays > 0;
    }).length;

    return {
      totalProducts,
      totalValue,
      inStock,
      lowStock,
      outOfStock,
      expired,
      expiringSoon
    };
  }, [mockProducts]);

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.supplier.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;
      const matchesStatus =
        selectedStatus === 'all' || product.status === selectedStatus;
      const matchesArea =
        selectedArea === 'all' || product.location.startsWith(selectedArea);

      return matchesSearch && matchesCategory && matchesStatus && matchesArea;
    });
  }, [
    mockProducts,
    searchTerm,
    selectedCategory,
    selectedStatus,
    selectedArea
  ]);

  // Get unique categories and areas
  const categories = Array.from(new Set(mockProducts.map((p) => p.category)));
  const areas = Array.from(
    new Set(mockProducts.map((p) => p.location.split('-')[0]))
  );

  const getStatusBadge = (status: Product['status']) => {
    switch (status) {
      case 'in_stock':
        return (
          <Badge variant='default' className='bg-green-500'>
            Còn hàng
          </Badge>
        );
      case 'low_stock':
        return (
          <Badge
            variant='outline'
            className='border-yellow-500 text-yellow-600'
          >
            Sắp hết
          </Badge>
        );
      case 'out_of_stock':
        return <Badge variant='destructive'>Hết hàng</Badge>;
      case 'expired':
        return (
          <Badge variant='destructive' className='bg-red-600'>
            Hết hạn
          </Badge>
        );
      default:
        return <Badge variant='secondary'>Không xác định</Badge>;
    }
  };

  const getStockLevel = (current: number, min: number, max: number) => {
    const percentage = (current / max) * 100;
    return Math.min(percentage, 100);
  };

  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Header */}
        <div className='flex items-start justify-between'>
          <div>
            <Heading
              title={`Chi tiết tồn kho - ${warehouse.name}`}
              description={`Quản lý chi tiết sản phẩm tồn kho tại ${warehouse.location}`}
            />
            <div className='text-muted-foreground mt-2 flex items-center space-x-4 text-sm'>
              <span>ID: {warehouse.id}</span>
              <span>•</span>
              <span>Công suất: {warehouse.capacity}%</span>
              <span>•</span>
              <span>{warehouse.areas.length} khu vực</span>
            </div>
          </div>
          <div className='flex space-x-2'>
            <Link
              href='/dashboard/warehouse/export'
              className={cn(buttonVariants({ variant: 'outline' }))}
            >
              <IconMinus className='mr-2 h-4 w-4' />
              Xuất kho
            </Link>
            <Link
              href='/dashboard/warehouse/import'
              className={cn(buttonVariants({ variant: 'default' }))}
            >
              <IconPlus className='mr-2 h-4 w-4' />
              Nhập kho
            </Link>
          </div>
        </div>
        <Separator />

        {/* Statistics Cards */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Tổng sản phẩm
              </CardTitle>
              <IconPackage className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stats.totalProducts}</div>
              <p className='text-muted-foreground text-xs'>
                <IconTrendingUp className='mr-1 inline h-3 w-3' />
                {stats.inStock} còn hàng
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Cảnh báo</CardTitle>
              <IconAlertTriangle className='h-4 w-4 text-yellow-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-yellow-600'>
                {stats.lowStock + stats.outOfStock + stats.expired}
              </div>
              <p className='text-muted-foreground text-xs'>
                {stats.lowStock} sắp hết • {stats.outOfStock} hết hàng •{' '}
                {stats.expired} hết hạn
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Sắp hết hạn</CardTitle>
              <IconCalendar className='h-4 w-4 text-red-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                {stats.expiringSoon}
              </div>
              <p className='text-muted-foreground text-xs'>Trong 7 ngày tới</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách sản phẩm</CardTitle>
            <CardDescription>
              Quản lý chi tiết từng sản phẩm trong kho
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Search and Filters */}
            <div className='flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4'>
              <div className='flex-1'>
                <div className='relative'>
                  <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                  <Input
                    placeholder='Tìm kiếm theo tên, SKU, nhà cung cấp...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className='w-full md:w-48'>
                  <SelectValue placeholder='Danh mục' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Tất cả danh mục</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className='w-full md:w-48'>
                  <SelectValue placeholder='Trạng thái' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Tất cả trạng thái</SelectItem>
                  <SelectItem value='in_stock'>Còn hàng</SelectItem>
                  <SelectItem value='low_stock'>Sắp hết</SelectItem>
                  <SelectItem value='out_of_stock'>Hết hàng</SelectItem>
                  <SelectItem value='expired'>Hết hạn</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger className='w-full md:w-32'>
                  <SelectValue placeholder='Khu vực' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Tất cả</SelectItem>
                  {areas.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Products Table */}
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Tồn kho</TableHead>
                    <TableHead>Hạn sử dụng</TableHead>
                    <TableHead>Vị trí</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className='font-medium'>{product.name}</div>
                          <div className='text-muted-foreground text-sm'>
                            {product.supplier}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center space-x-1'>
                          <IconBarcode className='h-3 w-3' />
                          <span className='font-mono text-sm'>
                            {product.sku}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          <div className='flex items-center space-x-2'>
                            <span className='font-medium'>
                              {product.currentStock} {product.unit}
                            </span>
                          </div>
                          <Progress
                            value={getStockLevel(
                              product.currentStock,
                              product.minStock,
                              product.maxStock
                            )}
                            className='h-1 w-16'
                          />
                          <div className='text-muted-foreground text-xs'>
                            Min: {product.minStock} • Max: {product.maxStock}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className='text-sm'>{product.expiryDate}</div>
                          <div className='text-muted-foreground text-xs'>
                            Lô: {product.batchNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant='outline' className='font-mono text-xs'>
                          {product.location}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell>
                        <div className='flex space-x-1'>
                          <Button variant='ghost' size='sm'>
                            <IconEye className='h-3 w-3' />
                          </Button>
                          <Button variant='ghost' size='sm'>
                            <IconEdit className='h-3 w-3' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredProducts.length === 0 && (
              <div className='py-8 text-center'>
                <IconPackage className='text-muted-foreground mx-auto h-12 w-12' />
                <h3 className='mt-4 text-lg font-semibold'>
                  Không tìm thấy sản phẩm
                </h3>
                <p className='text-muted-foreground'>
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

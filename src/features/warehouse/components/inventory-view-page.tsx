'use client';
import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import {
  IconPackage,
  IconAlertTriangle,
  IconBarcode,
  IconClockHour4,
  IconBuilding,
  IconMapPin,
  IconChartBar,
  IconList
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { WarehouseAreaSelector } from './warehouse-area-selector';
import { AreaProductsTable } from './area-products-table';
import {
  InventoryFilter,
  Product,
  Batch,
  Warehouse,
  Supplier
} from '@/types/inventory';

interface InventoryViewPageProps {}

export default function InventoryViewPage({}: InventoryViewPageProps) {
  const [filters, setFilters] = useState<InventoryFilter>({
    warehouseId: '',
    areaId: '',
    status: 'all'
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'inventory' | 'reports'>(
    'inventory'
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Mock data - trong thực tế sẽ fetch từ API
  const inventoryStats = {
    totalProducts: 1247,
    lowStock: 23,
    expiringSoon: 15,
    outOfStock: 8,
    totalWarehouses: 5,
    totalAreas: 18
  };

  // Mock data cho warehouses
  const mockWarehouses: Warehouse[] = [
    {
      id: 'wh-001',
      name: 'Kho Trung tâm Hà Nội',
      location: '123 Đường ABC, Quận Đống Đa, Hà Nội',
      address: '123 Đường ABC, Quận Đống Đa, Hà Nội',
      manager: 'Nguyễn Văn A',
      phone: '024-1234-5678',
      email: 'manager.hanoi@company.com',
      status: 'active',
      totalCapacity: 1500,
      currentCapacity: 1230,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      areas: [
        {
          id: 'area-001',
          warehouseId: 'wh-001',
          name: 'Khu vực A1 - Sản phẩm khô',
          type: 'dry',
          capacity: 1000,
          currentStock: 750,
          temperature: 25,
          humidity: 40,
          status: 'normal',
          description: 'Khu vực lưu trữ sản phẩm khô, không cần bảo quản lạnh',
          sensors: [],
          products: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'area-002',
          warehouseId: 'wh-001',
          name: 'Khu vực A2 - Sản phẩm tươi sống',
          type: 'fresh',
          capacity: 500,
          currentStock: 480,
          temperature: 4,
          humidity: 85,
          status: 'normal',
          description: 'Khu vực bảo quản lạnh cho sản phẩm tươi sống',
          sensors: [],
          products: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]
    },
    {
      id: 'wh-002',
      name: 'Kho Chi nhánh Hồ Chí Minh',
      location: '456 Đường XYZ, Quận 1, TP.HCM',
      address: '456 Đường XYZ, Quận 1, TP.HCM',
      manager: 'Trần Thị B',
      phone: '028-9876-5432',
      email: 'manager.hcm@company.com',
      status: 'active',
      totalCapacity: 800,
      currentCapacity: 600,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      areas: [
        {
          id: 'area-003',
          warehouseId: 'wh-002',
          name: 'Khu vực B1 - Đông lạnh',
          type: 'frozen',
          capacity: 800,
          currentStock: 600,
          temperature: -18,
          humidity: 90,
          status: 'normal',
          description: 'Khu vực đông lạnh cho thực phẩm đông lạnh',
          sensors: [],
          products: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]
    }
  ];

  // Mock data cho batches với updated product IDs
  const mockBatches: Batch[] = [
    {
      id: 'batch-001',
      batchNumber: 'LOT001-2024',
      productId: 'prod-001', // Cà chua
      areaId: 'area-001',
      quantity: 1000,
      remainingQuantity: 750,
      unit: 'kg',
      manufacturingDate: '2024-01-15',
      expiryDate: '2024-12-15',
      receivedDate: '2024-01-20',
      origin: 'Việt Nam',
      quality: 'A',
      status: 'active',
      supplier: {
        id: 'sup-001',
        name: 'Công ty TNHH ABC',
        contactPerson: 'Nguyễn Văn C',
        phone: '0123456789',
        email: 'contact@abc.com',
        address: '123 Đường ABC, Hà Nội',
        rating: 4.5,
        isActive: true,
        certifications: ['ISO 9001', 'HACCP', 'VietGAP']
      },
      notes: 'Lô hàng chất lượng cao, bảo quản tốt',
      createdAt: '2024-01-20T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z'
    },
    {
      id: 'batch-002',
      batchNumber: 'LOT002-2024',
      productId: 'prod-001', // Cà chua
      areaId: 'area-001',
      quantity: 500,
      remainingQuantity: 200,
      unit: 'kg',
      manufacturingDate: '2024-02-01',
      expiryDate: '2024-12-31',
      receivedDate: '2024-02-05',
      origin: 'Thái Lan',
      quality: 'B',
      status: 'active',
      supplier: {
        id: 'sup-002',
        name: 'Công ty XYZ',
        contactPerson: 'Lê Thị D',
        phone: '0987654321',
        email: 'info@xyz.com',
        address: '456 Đường XYZ, TP.HCM',
        rating: 4.2,
        isActive: true,
        certifications: ['ISO 9001', 'GlobalGAP']
      },
      createdAt: '2024-02-05T00:00:00Z',
      updatedAt: '2024-02-05T00:00:00Z'
    },
    {
      id: 'batch-003',
      batchNumber: 'LOT003-2024',
      productId: 'prod-002', // Cà rốt
      areaId: 'area-001',
      quantity: 800,
      remainingQuantity: 600,
      unit: 'kg',
      manufacturingDate: '2024-01-10',
      expiryDate: '2024-11-30',
      receivedDate: '2024-01-15',
      origin: 'Việt Nam',
      quality: 'A',
      status: 'active',
      supplier: {
        id: 'sup-003',
        name: 'Hợp tác xã Nông sản Đồng bằng',
        contactPerson: 'Phạm Văn E',
        phone: '0369852147',
        email: 'htx@dongbang.com',
        address: '789 Đường DEF, Cần Thơ',
        rating: 4.8,
        isActive: true,
        certifications: ['VietGAP', 'Organic Certificate', 'Fair Trade']
      },
      notes: 'Cà rốt tươi ngon từ đồng bằng sông Cửu Long',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    {
      id: 'batch-004',
      batchNumber: 'LOT004-2024',
      productId: 'prod-003', // Thịt bò đông lạnh
      areaId: 'area-003',
      quantity: 200,
      remainingQuantity: 150,
      unit: 'kg',
      manufacturingDate: '2024-02-10',
      expiryDate: '2025-02-10',
      receivedDate: '2024-02-12',
      origin: 'Australia',
      quality: 'A',
      status: 'active',
      supplier: {
        id: 'sup-002',
        name: 'Công ty XYZ',
        contactPerson: 'Lê Thị D',
        phone: '0987654321',
        email: 'info@xyz.com',
        address: '456 Đường XYZ, TP.HCM',
        rating: 4.2,
        isActive: true,
        certifications: ['ISO 9001', 'GlobalGAP']
      },
      notes: 'Thịt bò đông lạnh chất lượng cao từ Australia',
      createdAt: '2024-02-12T00:00:00Z',
      updatedAt: '2024-02-12T00:00:00Z'
    }
  ];

  // Mock categories data
  const mockCategories = {
    food: {
      id: 'cat-001',
      name: 'Thực phẩm',
      description: 'Các sản phẩm thực phẩm nông sản',
      storageType: 'dry' as const,
      shelfLife: 365
    },
    beverage: {
      id: 'cat-002',
      name: 'Đồ uống',
      description: 'Các sản phẩm đồ uống',
      storageType: 'dry' as const,
      shelfLife: 180
    }
  };

  // Mock suppliers data
  const mockSuppliers: Supplier[] = [
    {
      id: 'sup-001',
      name: 'Công ty TNHH ABC',
      contactPerson: 'Nguyễn Văn C',
      phone: '0123456789',
      email: 'contact@abc.com',
      address: '123 Đường ABC, Hà Nội',
      rating: 4.5,
      isActive: true,
      certifications: ['ISO 9001', 'HACCP', 'VietGAP']
    },
    {
      id: 'sup-002',
      name: 'Công ty XYZ',
      contactPerson: 'Lê Thị D',
      phone: '0987654321',
      email: 'info@xyz.com',
      address: '456 Đường XYZ, TP.HCM',
      rating: 4.2,
      isActive: true,
      certifications: ['ISO 9001', 'GlobalGAP']
    },
    {
      id: 'sup-003',
      name: 'Hợp tác xã Nông sản Đồng bằng',
      contactPerson: 'Phạm Văn E',
      phone: '0369852147',
      email: 'htx@dongbang.com',
      address: '789 Đường DEF, Cần Thơ',
      rating: 4.8,
      isActive: true,
      certifications: ['VietGAP', 'Organic Certificate', 'Fair Trade']
    }
  ];

  // Mock products data với area assignment
  const mockProducts: Product[] = [
    {
      id: 'prod-001',
      name: 'Cà chua',
      sku: 'TOMATO-001',
      category: mockCategories.food,
      description: 'Cà chua tươi chất lượng cao',
      unit: 'kg',
      minStockLevel: 100,
      maxStockLevel: 2000,
      currentStock: 950,
      reservedStock: 50,
      availableStock: 900,
      batches: [],
      supplier: mockSuppliers[0],
      areaId: 'area-001', // Assign to area A1
      storageRequirements: {
        minTemperature: 15,
        maxTemperature: 30,
        minHumidity: 30,
        maxHumidity: 60,
        specialRequirements: [
          'Tránh ẩm ướt',
          'Thoáng mát',
          'Tránh ánh sáng trực tiếp'
        ]
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prod-002',
      name: 'Cà rốt',
      sku: 'CARROT-001',
      category: mockCategories.food,
      description: 'Cà rốt tươi ngon',
      unit: 'kg',
      minStockLevel: 50,
      maxStockLevel: 1000,
      currentStock: 300,
      reservedStock: 20,
      availableStock: 280,
      batches: [],
      supplier: mockSuppliers[2],
      areaId: 'area-001', // Assign to area A1
      storageRequirements: {
        minTemperature: 18,
        maxTemperature: 25,
        minHumidity: 40,
        maxHumidity: 60,
        specialRequirements: ['Tránh ẩm ướt', 'Bảo quản nơi khô ráo']
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prod-003',
      name: 'Thịt bò đông lạnh',
      sku: 'BEEF-FROZEN-001',
      category: mockCategories.food,
      description: 'Thịt bò đông lạnh chất lượng cao',
      unit: 'kg',
      minStockLevel: 20,
      maxStockLevel: 500,
      currentStock: 150,
      reservedStock: 10,
      availableStock: 140,
      batches: [],
      supplier: mockSuppliers[1],
      areaId: 'area-003', // Assign to area B1 (frozen)
      storageRequirements: {
        minTemperature: -20,
        maxTemperature: -15,
        minHumidity: 80,
        maxHumidity: 95,
        specialRequirements: ['Bảo quản đông lạnh', 'Không được rã đông']
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  const handleWarehouseChange = (warehouseId: string) => {
    setSelectedWarehouse(warehouseId);
    setFilters((prev) => ({ ...prev, warehouseId: warehouseId }));
  };

  const handleAreaChange = (areaId: string) => {
    setSelectedArea(areaId);
    setFilters((prev) => ({ ...prev, areaId: areaId }));
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  // Get products for selected area
  const getProductsForArea = (areaId: string) => {
    return mockProducts.filter((product) => product.areaId === areaId);
  };

  // Get selected area name
  const getSelectedAreaName = () => {
    if (!selectedArea) return '';

    const warehouse = mockWarehouses.find((w) => w.id === selectedWarehouse);
    if (!warehouse) return '';

    const area = warehouse.areas.find((a) => a.id === selectedArea);
    return area ? area.name : '';
  };

  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* Header với các thao tác nhanh */}
        <div className='flex items-start justify-between'>
          <Heading
            title='Quản lý tồn kho'
            description='Theo dõi và quản lý tồn kho nông sản trong kho'
          />
          <div className='flex gap-2'>
            <Button variant='outline' size='sm'>
              <IconBarcode className='mr-2 h-4 w-4' /> Quét mã vạch
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className='bg-muted flex w-fit space-x-1 rounded-lg p-1'>
          <Button
            variant={activeTab === 'inventory' ? 'default' : 'ghost'}
            size='sm'
            onClick={() => setActiveTab('inventory')}
            className='flex items-center gap-2'
          >
            <IconList className='h-4 w-4' />
            Danh sách tồn kho
          </Button>
        </div>

        <Separator />

        {/* Thống kê nhanh */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Tổng sản phẩm
              </CardTitle>
              <IconPackage className='text-muted-foreground h-4 w-4' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {isClient
                  ? inventoryStats.totalProducts.toLocaleString()
                  : inventoryStats.totalProducts}
              </div>
              <p className='text-muted-foreground text-xs'>Đang quản lý</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Sắp hết hàng
              </CardTitle>
              <IconAlertTriangle className='h-4 w-4 text-yellow-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-yellow-600'>
                {inventoryStats.lowStock}
              </div>
              <p className='text-muted-foreground text-xs'>Cần bổ sung</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Sắp hết hạn</CardTitle>
              <IconClockHour4 className='h-4 w-4 text-red-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                {inventoryStats.expiringSoon}
              </div>
              <p className='text-muted-foreground text-xs'>Trong 2 ngày</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Hết hàng</CardTitle>
              <IconAlertTriangle className='h-4 w-4 text-red-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                {inventoryStats.outOfStock}
              </div>
              <p className='text-muted-foreground text-xs'>Cần nhập ngay</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Tổng kho</CardTitle>
              <IconBuilding className='h-4 w-4 text-blue-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {inventoryStats.totalWarehouses}
              </div>
              <p className='text-muted-foreground text-xs'>Đang hoạt động</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Khu vực</CardTitle>
              <IconMapPin className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {inventoryStats.totalAreas}
              </div>
              <p className='text-muted-foreground text-xs'>Tổng khu vực</p>
            </CardContent>
          </Card>
        </div>

        {/* Conditional rendering based on active tab */}
        {activeTab === 'inventory' ? (
          <>
            {/* Bảng danh sách inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Danh sách tồn kho</CardTitle>
                <CardDescription>
                  Quản lý chi tiết tồn kho theo từng sản phẩm, lô hàng và khu
                  vực lưu trữ
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Chọn kho và khu vực */}
                <WarehouseAreaSelector
                  warehouses={mockWarehouses}
                  selectedWarehouseId={selectedWarehouse}
                  selectedAreaId={selectedArea}
                  onWarehouseChange={handleWarehouseChange}
                  onAreaChange={handleAreaChange}
                />

                {/* Bộ lọc */}
                {/* <InventoryFilters
                  onFiltersChange={handleFiltersChange}
                  onSearch={handleSearch}
                /> */}

                {/* Chi tiết sản phẩm được chọn */}
                {/* {selectedProduct && (
                  <ProductDetailCard
                    product={selectedProduct}
                    batches={mockBatches.filter(b => b.productId === selectedProduct.id)}
                  />
                )} */}

                {/* Hiển thị sản phẩm theo khu vực thay vì quản lý lô hàng */}
                {selectedArea && (
                  <AreaProductsTable
                    areaName={getSelectedAreaName()}
                    products={getProductsForArea(selectedArea)}
                    batches={mockBatches}
                    onViewProduct={handleViewProduct}
                  />
                )}

                {/* <Suspense
                  fallback={
                    <DataTableSkeleton
                      columnCount={8}
                      rowCount={10}
                      filterCount={3}
                    />
                  }
                >
                  <InventoryListingPage filters={filters} searchQuery={searchQuery} />
                </Suspense> */}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Báo cáo và phân tích - Tạm thời ẩn */}
            <Card>
              <CardHeader>
                <CardTitle>Báo cáo tồn kho</CardTitle>
                <CardDescription>
                  Tính năng báo cáo đang được phát triển
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='text-muted-foreground py-8 text-center'>
                  <IconChartBar className='mx-auto mb-4 h-12 w-12 opacity-50' />
                  <p>Tính năng báo cáo sẽ sớm được cập nhật</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageContainer>
  );
}

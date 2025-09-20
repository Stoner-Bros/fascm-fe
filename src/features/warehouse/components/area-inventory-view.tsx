'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  IconPackage,
  IconArrowLeft,
  IconSettings,
  IconExternalLink
} from '@tabler/icons-react';
import { AreaProductsTable } from './area-products-table';
import { Product, Batch, Warehouse } from '@/types/inventory';

interface AreaInventoryViewProps {
  warehouseId: string;
  areaId: string;
}

export default function AreaInventoryView({
  warehouseId,
  areaId
}: AreaInventoryViewProps) {
  const router = useRouter();
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  // Mock data - trong thực tế sẽ fetch từ API
  const mockWarehouses: Warehouse[] = [
    {
      id: 'WH001',
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
          id: 'A1',
          warehouseId: 'WH001',
          name: 'Khu vực A1 - Sản phẩm khô',
          type: 'dry',
          capacity: 500,
          currentStock: 410,
          temperature: 25,
          humidity: 60,
          status: 'normal',
          sensors: [],
          products: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'A2',
          warehouseId: 'WH001',
          name: 'Khu vực A2 - Rau củ quả',
          type: 'fresh',
          capacity: 400,
          currentStock: 320,
          temperature: 4,
          humidity: 85,
          status: 'normal',
          sensors: [],
          products: [],
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ]
    }
  ];

  const mockProducts: Product[] = [
    {
      id: 'prod-001',
      name: 'Cà chua',
      sku: 'TOMATO-001',
      category: {
        id: 'cat-001',
        name: 'Thực phẩm',
        description: 'Các sản phẩm thực phẩm nông sản',
        storageType: 'khô ráo',
        shelfLife: 365
      },
      description: 'Cà chua tươi chất lượng cao',
      unit: 'kg',
      minStockLevel: 100,
      maxStockLevel: 2000,
      currentStock: 950,
      reservedStock: 50,
      availableStock: 900,
      batches: [],
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
      areaId: 'A1',
      storageRequirements: {
        minTemperature: 15,
        maxTemperature: 30,
        minHumidity: 30,
        maxHumidity: 60,
        specialRequirements: []
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prod-002',
      name: 'Cà rốt',
      sku: 'CARROT-001',
      category: {
        id: 'cat-001',
        name: 'Thực phẩm',
        description: 'Các sản phẩm thực phẩm nông sản',
        storageType: 'khô ráo',
        shelfLife: 365
      },
      description: 'Cà rốt tươi từ Đà Lạt',
      unit: 'kg',
      minStockLevel: 50,
      maxStockLevel: 1000,
      currentStock: 300,
      reservedStock: 20,
      availableStock: 280,
      batches: [],
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
      areaId: 'A1',
      storageRequirements: {
        minTemperature: 10,
        maxTemperature: 25,
        minHumidity: 40,
        maxHumidity: 70,
        specialRequirements: []
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ];

  const mockBatches: Batch[] = [
    {
      id: 'batch-001',
      batchNumber: 'LOT001-2024',
      productId: 'prod-001',
      areaId: 'A1',
      quantity: 750,
      remainingQuantity: 750,
      unit: 'kg',
      manufacturingDate: '2024-01-20',
      expiryDate: '2024-02-15',
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
      notes: 'Lô hàng chất lượng tốt',
      createdAt: '2024-01-20T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z'
    },
    {
      id: 'batch-002',
      batchNumber: 'LOT002-2024',
      productId: 'prod-001',
      areaId: 'A1',
      quantity: 500,
      remainingQuantity: 200,
      unit: 'kg',
      manufacturingDate: '2024-01-05',
      expiryDate: '2024-01-31',
      receivedDate: '2024-01-05',
      origin: 'Thái Lan',
      quality: 'B',
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
      notes: 'Lô hàng sắp hết hạn',
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-05T00:00:00Z'
    },
    {
      id: 'batch-003',
      batchNumber: 'LOT003-2024',
      productId: 'prod-002',
      areaId: 'A1',
      quantity: 600,
      remainingQuantity: 600,
      unit: 'kg',
      manufacturingDate: '2024-01-15',
      expiryDate: '2024-01-30',
      receivedDate: '2024-01-15',
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
      notes: 'Cà rốt tươi từ Đà Lạt',
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    }
  ];

  // Get warehouse and area info
  const warehouse = mockWarehouses.find((w) => w.id === warehouseId);
  const area = warehouse?.areas.find((a) => a.id === areaId);

  // Get products for this area
  const areaProducts = mockProducts.filter(
    (product) => product.areaId === areaId
  );

  const handleViewProduct = (product: Product) => {
    console.log('Viewing product:', product);
  };

  const handleEditBatch = (batch: Batch) => {
    console.log('Editing batch:', batch);
  };

  const handleNavigateToInventory = () => {
    router.push(`/dashboard/warehouse/inventory`);
  };

  return (
    <div className='container mx-auto space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => router.back()}
            className='flex items-center gap-2'
          >
            <IconArrowLeft className='h-4 w-4' />
            Quay lại
          </Button>
          <div>
            <h1 className='text-2xl font-bold'>
              Quản lý tồn kho - {area?.name || `Khu vực ${areaId}`}
            </h1>
            <p className='text-muted-foreground'>
              {warehouse?.name || `Kho ${warehouseId}`}
            </p>
          </div>
        </div>
      </div>

      {/* Area Info */}
      {area && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <IconSettings className='h-5 w-5' />
              Thông tin khu vực
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
              <div>
                <p className='text-sm font-medium'>Loại khu vực</p>
                <Badge variant='outline'>{area.type}</Badge>
              </div>
              <div>
                <p className='text-sm font-medium'>Sức chứa</p>
                <p className='text-lg font-semibold'>
                  {area.currentStock}/{area.capacity} kg
                </p>
              </div>
              <div>
                <p className='text-sm font-medium'>Nhiệt độ</p>
                <p className='text-lg font-semibold'>{area.temperature}°C</p>
              </div>
              <div>
                <p className='text-sm font-medium'>Độ ẩm</p>
                <p className='text-lg font-semibold'>{area.humidity}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <AreaProductsTable
        areaName={area?.name || `Khu vực ${areaId}`}
        products={areaProducts}
        batches={mockBatches}
        onViewProduct={handleViewProduct}
        onEditBatch={handleEditBatch}
        onNavigateToInventory={handleNavigateToInventory}
      />
    </div>
  );
}

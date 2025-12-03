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
import type { Product } from '@/types/product';
import type { Batch } from '@/types/batch';
import { fetchAreaById } from '@/services/area.service';
import { fetchWarehouseById } from '@/services/warehouse.service';

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
  const [areaName, setAreaName] = useState<string | null>(null);
  const [warehouseName, setWarehouseName] = useState<string | null>(null);
  const [areaCapacity, setAreaCapacity] = useState<{
    used: number;
    total: number;
  }>({
    used: 0,
    total: 0
  });
  const [areaEnv, setAreaEnv] = useState<{
    temperature?: number;
    humidity?: number;
  }>({});
  const [areaProducts, setAreaProducts] = useState<Product[]>([]);
  const [areaBatches, setAreaBatches] = useState<Batch[]>([]);

  useEffect(() => {
    const loadArea = async () => {
      try {
        const data = await fetchAreaById(areaId);
        setAreaName(data.name ?? null);
        setAreaCapacity({
          used:
            typeof data.availableCapacity === 'number' &&
            typeof data.capacity === 'number'
              ? Math.max(data.capacity - data.availableCapacity, 0)
              : 0,
          total: data.capacity ?? 0
        });
        // TODO: khi backend có API products/batches theo area, setAreaProducts / setAreaBatches tại đây
      } catch {
        setAreaName(null);
        setAreaCapacity({ used: 0, total: 0 });
      }
    };

    const loadWarehouse = async () => {
      try {
        const data = await fetchWarehouseById(warehouseId);
        setWarehouseName(data.name ?? null);
      } catch {
        setWarehouseName(null);
      }
    };

    void loadArea();
    void loadWarehouse();
  }, [areaId, warehouseId]);

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
              Quản lý tồn kho - {areaName || `Khu vực ${areaId}`}
            </h1>
            <p className='text-muted-foreground'>
              {warehouseName || `Kho ${warehouseId}`}
            </p>
          </div>
        </div>
      </div>

      {/* Area Info */}
      {areaName && (
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
                <Badge variant='outline'>—</Badge>
              </div>
              <div>
                <p className='text-sm font-medium'>Sức chứa</p>
                <p className='text-lg font-semibold'>
                  {areaCapacity.used.toFixed(0)}/{areaCapacity.total.toFixed(0)}{' '}
                  kg
                </p>
              </div>
              <div>
                <p className='text-sm font-medium'>Nhiệt độ</p>
                <p className='text-lg font-semibold'>
                  {areaEnv.temperature != null
                    ? `${areaEnv.temperature}°C`
                    : '—'}
                </p>
              </div>
              <div>
                <p className='text-sm font-medium'>Độ ẩm</p>
                <p className='text-lg font-semibold'>
                  {areaEnv.humidity != null ? `${areaEnv.humidity}%` : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <AreaProductsTable
        areaName={areaName || `Khu vực ${areaId}`}
        products={areaProducts}
        batches={areaBatches}
        onViewProduct={handleViewProduct}
        onEditBatch={handleEditBatch}
        onNavigateToInventory={handleNavigateToInventory}
      />
    </div>
  );
}

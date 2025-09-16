'use client';

import { InventoryTable, InventoryItem } from './inventory-tables';
import { columns } from './inventory-tables/columns';

type InventoryListingPage = {};

export default function InventoryListingPage({}: InventoryListingPage) {
  // Mock data for inventory items
  const mockInventoryData: InventoryItem[] = [
    {
      id: '1',
      name: 'Cà chua bi',
      sku: 'VEG-001',
      category: 'Rau củ quả',
      quantity: 150,
      unit: 'kg',
      status: 'In Stock',
      lastUpdated: '2024-01-15',
      origin: 'Đà Lạt, Lâm Đồng',
      expiryDate: '2024-02-15',
      quality: 'A',
      supplier: 'Nông trại Xanh Đà Lạt'
    },
    {
      id: '2',
      name: 'Xoài cát Hòa Lộc',
      sku: 'FRU-002',
      category: 'Trái cây',
      quantity: 25,
      unit: 'kg',
      status: 'Low Stock',
      lastUpdated: '2024-01-14',
      origin: 'Tiền Giang',
      expiryDate: '2024-01-25',
      quality: 'A',
      supplier: 'HTX Nông sản Tiền Giang'
    },
    {
      id: '3',
      name: 'Hạt giống dưa leo',
      sku: 'SED-003',
      category: 'Hạt giống',
      quantity: 0,
      unit: 'gói',
      status: 'Out of Stock',
      lastUpdated: '2024-01-13',
      origin: 'Nhật Bản',
      expiryDate: '2025-01-13',
      quality: 'A',
      supplier: 'Công ty Giống Việt'
    },
    {
      id: '4',
      name: 'Rau muống',
      sku: 'VEG-004',
      category: 'Rau củ quả',
      quantity: 200,
      unit: 'kg',
      status: 'In Stock',
      lastUpdated: '2024-01-15',
      origin: 'Cần Thơ',
      expiryDate: '2024-01-18',
      quality: 'B',
      supplier: 'Hợp tác xã Rau sạch Cần Thơ'
    },
    {
      id: '5',
      name: 'Thanh long ruột đỏ',
      sku: 'FRU-005',
      category: 'Trái cây',
      quantity: 80,
      unit: 'kg',
      status: 'In Stock',
      lastUpdated: '2024-01-14',
      origin: 'Bình Thuận',
      expiryDate: '2024-01-28',
      quality: 'A',
      supplier: 'Nông trại Thanh Long Bình Thuận'
    },
    {
      id: '6',
      name: 'Hạt giống cà chua',
      sku: 'SED-006',
      category: 'Hạt giống',
      quantity: 45,
      unit: 'gói',
      status: 'Low Stock',
      lastUpdated: '2024-01-12',
      origin: 'Hà Lan',
      expiryDate: '2025-06-12',
      quality: 'A',
      supplier: 'Công ty Giống Quốc tế'
    },
    {
      id: '7',
      name: 'Khoai tây Đà Lạt',
      sku: 'VEG-007',
      category: 'Rau củ quả',
      quantity: 120,
      unit: 'kg',
      status: 'In Stock',
      lastUpdated: '2024-01-15',
      origin: 'Đà Lạt, Lâm Đồng',
      expiryDate: '2024-03-15',
      quality: 'A',
      supplier: 'Hợp tác xã Khoai tây Đà Lạt'
    },
    {
      id: '8',
      name: 'Bưởi da xanh',
      sku: 'FRU-008',
      category: 'Trái cây',
      quantity: 60,
      unit: 'kg',
      status: 'In Stock',
      lastUpdated: '2024-01-13',
      origin: 'Bến Tre',
      expiryDate: '2024-02-13',
      quality: 'B',
      supplier: 'Vườn trái cây Bến Tre'
    },
    {
      id: '9',
      name: 'Hạt giống rau cải',
      sku: 'SED-009',
      category: 'Hạt giống',
      quantity: 15,
      unit: 'gói',
      status: 'Low Stock',
      lastUpdated: '2024-01-11',
      origin: 'Thái Lan',
      expiryDate: '2024-12-11',
      quality: 'B',
      supplier: 'Nhà phân phối Giống Á Châu'
    },
    {
      id: '10',
      name: 'Cà rốt baby',
      sku: 'VEG-010',
      category: 'Rau củ quả',
      quantity: 180,
      unit: 'kg',
      status: 'In Stock',
      lastUpdated: '2024-01-15',
      origin: 'Đà Lạt, Lâm Đồng',
      expiryDate: '2024-02-20',
      quality: 'A',
      supplier: 'Nông trại Organic Đà Lạt'
    }
  ];

  return (
    <div className='space-y-4'>
      <InventoryTable data={mockInventoryData} />
    </div>
  );
}

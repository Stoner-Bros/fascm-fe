export type HarvestBatchStatus =
  | 'pending' // Chờ duyệt
  | 'approved' // Đã duyệt
  | 'in_progress' // Đang thực hiện
  | 'picked_up' // Đã lấy hàng
  | 'confirmed' // Đã xác nhận (supplier xác nhận đã giao)
  | 'completed'; // Hoàn tất

export type ProductType =
  | 'vegetables' // Rau củ
  | 'fruits' // Trái cây
  | 'herbs' // Rau thơm
  | 'leafy_greens' // Rau lá
  | 'root_vegetables' // Củ quả
  | 'other'; // Khác

export type Unit =
  | 'kg' // Kilogram
  | 'ton' // Tấn
  | 'box'; // Thùng

export interface HarvestBatch {
  id: string;
  supplierId: string;
  supplierName: string;
  productType: ProductType;
  productName: string;
  quantity: number;
  unit: Unit;
  expectedPickupDate: Date;
  description?: string;
  images: string[];
  status: HarvestBatchStatus;
  createdAt: Date;
  updatedAt: Date;

  // Status tracking
  approvedAt?: Date;
  inProgressAt?: Date;
  pickedUpAt?: Date;
  confirmedAt?: Date;
  completedAt?: Date;

  // Staff information
  deliveryStaffId?: string;
  deliveryStaffName?: string;
  pickupTime?: Date;

  // Status history
  statusHistory: StatusHistoryItem[];
}

export interface StatusHistoryItem {
  status: HarvestBatchStatus;
  timestamp: Date;
  note?: string;
  staffId?: string;
  staffName?: string;
}

export interface CreateHarvestBatchData {
  productType: ProductType;
  productName: string;
  quantity: number;
  unit: Unit;
  expectedPickupDate: Date;
  description?: string;
  images?: File[];
}

export interface ConfirmDeliveryData {
  batchId: string;
  confirmed: boolean;
  note?: string;
}

// Mock data for development
export const mockHarvestBatches: HarvestBatch[] = [
  {
    id: 'HB001',
    supplierId: 'supplier-1',
    supplierName: 'Nông trại Xanh',
    productType: 'vegetables',
    productName: 'Cà chua',
    quantity: 500,
    unit: 'kg',
    expectedPickupDate: new Date('2024-02-01'),
    description: 'Cà chua cherry hữu cơ, không thuốc trừ sâu',
    images: [],
    status: 'pending',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    statusHistory: [
      {
        status: 'pending',
        timestamp: new Date('2024-01-20'),
        note: 'Đợt thu hoạch được tạo'
      }
    ]
  },
  {
    id: 'HB002',
    supplierId: 'supplier-1',
    supplierName: 'Nông trại Xanh',
    productType: 'leafy_greens',
    productName: 'Rau cải',
    quantity: 2,
    unit: 'ton',
    expectedPickupDate: new Date('2024-01-30'),
    description: 'Rau cải xanh tươi',
    images: [],
    status: 'picked_up',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-28'),
    approvedAt: new Date('2024-01-16'),
    inProgressAt: new Date('2024-01-26'),
    pickedUpAt: new Date('2024-01-28'),
    deliveryStaffId: 'staff-001',
    deliveryStaffName: 'Nguyễn Văn A',
    pickupTime: new Date('2024-01-28T08:30:00'),
    statusHistory: [
      {
        status: 'pending',
        timestamp: new Date('2024-01-15'),
        note: 'Đợt thu hoạch được tạo'
      },
      {
        status: 'approved',
        timestamp: new Date('2024-01-16'),
        note: 'Đã duyệt bởi quản lý',
        staffId: 'manager-001',
        staffName: 'Trần Thị B'
      },
      {
        status: 'in_progress',
        timestamp: new Date('2024-01-26'),
        note: 'Bắt đầu quá trình vận chuyển'
      },
      {
        status: 'picked_up',
        timestamp: new Date('2024-01-28T08:30:00'),
        note: 'Đã lấy hàng thành công',
        staffId: 'staff-001',
        staffName: 'Nguyễn Văn A'
      }
    ]
  },
  {
    id: 'HB003',
    supplierId: 'supplier-1',
    supplierName: 'Nông trại Xanh',
    productType: 'fruits',
    productName: 'Cam sành',
    quantity: 100,
    unit: 'box',
    expectedPickupDate: new Date('2024-01-25'),
    description: 'Cam sành ngọt, vỏ mỏng',
    images: [],
    status: 'completed',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-27'),
    approvedAt: new Date('2024-01-11'),
    inProgressAt: new Date('2024-01-24'),
    pickedUpAt: new Date('2024-01-25'),
    confirmedAt: new Date('2024-01-26'),
    completedAt: new Date('2024-01-27'),
    deliveryStaffId: 'staff-002',
    deliveryStaffName: 'Lê Văn C',
    pickupTime: new Date('2024-01-25T14:15:00'),
    statusHistory: [
      {
        status: 'pending',
        timestamp: new Date('2024-01-10'),
        note: 'Đợt thu hoạch được tạo'
      },
      {
        status: 'approved',
        timestamp: new Date('2024-01-11'),
        note: 'Đã duyệt bởi quản lý',
        staffId: 'manager-001',
        staffName: 'Trần Thị B'
      },
      {
        status: 'in_progress',
        timestamp: new Date('2024-01-24'),
        note: 'Bắt đầu quá trình vận chuyển'
      },
      {
        status: 'picked_up',
        timestamp: new Date('2024-01-25T14:15:00'),
        note: 'Đã lấy hàng thành công',
        staffId: 'staff-002',
        staffName: 'Lê Văn C'
      },
      {
        status: 'confirmed',
        timestamp: new Date('2024-01-26'),
        note: 'Nhà cung cấp xác nhận đã giao'
      },
      {
        status: 'completed',
        timestamp: new Date('2024-01-27'),
        note: 'Hoàn tất quá trình'
      }
    ]
  }
];

export const productTypeOptions = [
  { value: 'vegetables', label: 'Rau củ' },
  { value: 'fruits', label: 'Trái cây' },
  { value: 'herbs', label: 'Rau thơm' },
  { value: 'leafy_greens', label: 'Rau lá' },
  { value: 'root_vegetables', label: 'Củ quả' },
  { value: 'other', label: 'Khác' }
];

export const unitOptions = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'ton', label: 'Tấn' },
  { value: 'box', label: 'Thùng' }
];

export const statusLabels: Record<HarvestBatchStatus, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  in_progress: 'Đang thực hiện',
  picked_up: 'Đã lấy hàng',
  confirmed: 'Đã xác nhận',
  completed: 'Hoàn tất'
};

export const statusColors: Record<HarvestBatchStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-orange-100 text-orange-800',
  picked_up: 'bg-purple-100 text-purple-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800'
};

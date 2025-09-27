export type HarvestBatchStatus =
  | 'pending_pickup' // Chờ lấy hàng
  | 'picking_up' // Đang lấy
  | 'delivered' // Đã giao
  | 'completed'; // Hoàn tất

export type ProductType =
  | 'vegetables' // Rau củ
  | 'fruits' // Trái cây
  | 'herbs' // Rau thơm
  | 'leafy_greens' // Rau lá
  | 'root_vegetables' // Củ quả
  | 'other'; // Khác

export type QualityGrade =
  | 'premium' // Cao cấp
  | 'good' // Tốt
  | 'standard' // Tiêu chuẩn
  | 'below_standard'; // Dưới tiêu chuẩn

export type Unit =
  | 'kg' // Kilogram
  | 'box' // Thùng
  | 'bag' // Bao
  | 'piece'; // Cái

export interface HarvestBatch {
  id: string;
  supplierId: string;
  supplierName: string;
  productType: ProductType;
  productName: string;
  harvestDate: Date;
  quantity: number;
  unit: Unit;
  expectedQuality: QualityGrade;
  description?: string;
  images: string[];
  certificates: string[];
  status: HarvestBatchStatus;
  createdAt: Date;
  updatedAt: Date;

  // Tracking information
  pickupDate?: Date;
  deliveryDate?: Date;
  completionDate?: Date;

  // Payment information
  estimatedPrice?: number;
  finalPrice?: number;
  paymentConfirmed?: boolean;
  paymentProofs: string[];
}

export interface CreateHarvestBatchData {
  productType: ProductType;
  productName: string;
  harvestDate: Date;
  quantity: number;
  unit: Unit;
  expectedQuality: QualityGrade;
  description?: string;
  images?: File[];
  certificates?: File[];
}

export interface PaymentConfirmationData {
  batchId: string;
  paymentProofs: File[];
  notes?: string;
}

// Mock data for development
export const mockHarvestBatches: HarvestBatch[] = [
  {
    id: 'batch-001',
    supplierId: 'supplier-1',
    supplierName: 'Nông trại Xanh',
    productType: 'vegetables',
    productName: 'Cà chua',
    harvestDate: new Date('2024-01-15'),
    quantity: 500,
    unit: 'kg',
    expectedQuality: 'premium',
    description: 'Cà chua cherry hữu cơ, không thuốc trừ sâu',
    images: [],
    certificates: [],
    status: 'pending_pickup',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    estimatedPrice: 15000,
    paymentProofs: []
  },
  {
    id: 'batch-002',
    supplierId: 'supplier-1',
    supplierName: 'Nông trại Xanh',
    productType: 'leafy_greens',
    productName: 'Rau cải',
    harvestDate: new Date('2024-01-12'),
    quantity: 100,
    unit: 'box',
    expectedQuality: 'good',
    description: 'Rau cải xanh tươi',
    images: [],
    certificates: [],
    status: 'delivered',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-12'),
    pickupDate: new Date('2024-01-11'),
    deliveryDate: new Date('2024-01-12'),
    estimatedPrice: 12000,
    finalPrice: 12000,
    paymentProofs: []
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

export const qualityGradeOptions = [
  { value: 'premium', label: 'Cao cấp' },
  { value: 'good', label: 'Tốt' },
  { value: 'standard', label: 'Tiêu chuẩn' },
  { value: 'below_standard', label: 'Dưới tiêu chuẩn' }
];

export const unitOptions = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'box', label: 'Thùng' },
  { value: 'bag', label: 'Bao' },
  { value: 'piece', label: 'Cái' }
];

export const statusLabels: Record<HarvestBatchStatus, string> = {
  pending_pickup: 'Chờ lấy hàng',
  picking_up: 'Đang lấy',
  delivered: 'Đã giao',
  completed: 'Hoàn tất'
};

export const statusColors: Record<HarvestBatchStatus, string> = {
  pending_pickup: 'bg-yellow-100 text-yellow-800',
  picking_up: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800'
};

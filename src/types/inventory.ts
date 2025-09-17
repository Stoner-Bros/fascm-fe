// Inventory Management Types
export interface Warehouse {
  id: string;
  name: string;
  location: string;
  address: string;
  status: 'active' | 'inactive' | 'maintenance';
  manager: string;
  phone: string;
  email: string;
  totalCapacity: number;
  currentCapacity: number;
  areas: Area[];
  createdAt: string;
  updatedAt: string;
}

export interface Area {
  id: string;
  warehouseId: string;
  name: string;
  description?: string;
  temperature: number;
  humidity: number;
  capacity: number;
  currentStock: number;
  status: 'normal' | 'warning' | 'critical';
  sensors: Sensor[];
  products: Product[];
  createdAt: string;
  updatedAt: string;
}

export interface Sensor {
  id: string;
  areaId: string;
  type: 'temperature' | 'humidity' | 'pressure' | 'air_quality';
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  lastReading: string;
  calibrationDate?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  description?: string;
  unit: string;
  minStockLevel: number;
  maxStockLevel: number;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  batches: Batch[];
  supplier: Supplier;
  storageRequirements: StorageRequirements;
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  id: string;
  productId: string;
  areaId: string;
  batchNumber: string;
  quantity: number;
  remainingQuantity: number;
  unit: string;
  manufacturingDate: string;
  expiryDate: string;
  receivedDate: string;
  status: 'active' | 'expired' | 'recalled' | 'sold_out';
  quality: 'A' | 'B' | 'C' | 'D';
  origin: string;
  supplier: Supplier;
  purchasePrice: number;
  sellingPrice: number;
  notes?: string;
  qrCode?: string;
  barcode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  storageType: 'fresh' | 'frozen' | 'dry' | 'controlled';
  shelfLife: number; // in days
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  rating: number;
  isActive: boolean;
  certifications: string[];
}

export interface StorageRequirements {
  minTemperature: number;
  maxTemperature: number;
  minHumidity: number;
  maxHumidity: number;
  specialRequirements?: string[];
}

// Inventory Transaction Types
export interface InventoryTransaction {
  id: string;
  type: 'import' | 'export' | 'transfer' | 'adjustment' | 'return';
  warehouseId: string;
  areaId?: string;
  productId: string;
  batchId?: string;
  quantity: number;
  unit: string;
  reason: string;
  notes?: string;
  performedBy: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  transactionId: string;
  productId: string;
  batchId?: string;
  fromAreaId?: string;
  toAreaId?: string;
  quantity: number;
  movementType: 'in' | 'out' | 'transfer';
  timestamp: string;
}

// Inventory Alert Types
export interface InventoryAlert {
  id: string;
  type:
    | 'low_stock'
    | 'expiry_warning'
    | 'temperature_alert'
    | 'humidity_alert'
    | 'quality_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  warehouseId: string;
  areaId?: string;
  productId?: string;
  batchId?: string;
  message: string;
  isRead: boolean;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

// Inventory Report Types
export interface InventoryReport {
  id: string;
  type:
    | 'stock_level'
    | 'expiry_report'
    | 'movement_report'
    | 'valuation_report';
  warehouseId?: string;
  areaId?: string;
  dateFrom: string;
  dateTo: string;
  generatedBy: string;
  generatedAt: string;
  data: any; // Flexible data structure based on report type
}

// Filter and Search Types
export interface InventoryFilter {
  warehouseId?: string;
  areaId?: string;
  categoryId?: string;
  supplierId?: string;
  status?: string;
  expiryDateFrom?: string;
  expiryDateTo?: string;
  stockLevel?: 'low' | 'normal' | 'high';
  quality?: 'A' | 'B' | 'C' | 'D';
}

export interface InventorySearchParams {
  query?: string;
  filters?: InventoryFilter;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// API Response Types
export interface InventoryListResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface BatchListResponse {
  data: Batch[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

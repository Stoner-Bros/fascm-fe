export interface DateRangeQueryDto {
  startDate?: string;
  endDate?: string;
}

export interface PeriodQueryDto extends DateRangeQueryDto {
  period?: 'day' | 'week' | 'month' | 'year';
}

export interface OverviewStatisticsDto {
  totalRevenue: number;
  totalPurchaseCost: number;
  grossProfit: number;
  totalOrders: number;
  totalHarvestSchedules: number;
  totalDeliveries: number;
  totalDebtReceivable: number;
  totalDebtPayable: number;
}

export interface OrderStatisticsDto {
  totalOrders: number;
  ordersByStatus: { status: string; count: number }[];
  totalRevenue: number;
  averageOrderValue: number;
}

export interface HarvestStatisticsDto {
  totalHarvestSchedules: number;
  harvestSchedulesByStatus: { status: string; count: number }[];
  totalPurchaseAmount: number;
  totalQuantityHarvested: number;
}

export interface ProductStatisticsDto {
  totalProducts: number;
  productsByCategory: {
    categoryId: string;
    categoryName: string;
    count: number;
  }[];
  topSellingProducts: {
    productId: string;
    productName: string;
    totalQuantity: number;
    totalAmount: number;
  }[];
  topPurchasedProducts: {
    productId: string;
    productName: string;
    totalQuantity: number;
    totalAmount: number;
  }[];
}

export interface InventoryStatisticsDto {
  totalBatches: number;
  totalQuantityInStock: number;
  totalInventoryValue: number;
  batchesByProduct: {
    productId: string;
    productName: string;
    totalQuantity: number;
    totalValue: number;
  }[];
  batchesByArea: { areaId: string; areaName: string; totalQuantity: number }[];
  expiringSoonBatches: number;
}

export interface DeliveryStatisticsDto {
  totalDeliveries: number;
  deliveriesByStatus: { status: string; count: number }[];
  completedDeliveries: number;
  averageDeliveryTime: number;
}

export interface DebtStatisticsDto {
  totalDebtReceivable: number;
  totalDebtPayable: number;
  debtsByStatus: { status: string; count: number; totalAmount: number }[];
  overdueDebts: number;
  totalOverdueAmount: number;
}

export interface PaymentStatisticsDto {
  totalPaymentsReceived: number;
  totalPaymentsMade: number;
  paymentsByStatus: { status: string; count: number; totalAmount: number }[];
  paymentsByMethod: { method: string; count: number; totalAmount: number }[];
}

export interface RevenueTrendDto {
  period: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface SupplierStatisticsDto {
  totalSuppliers: number;
  topSuppliers: {
    supplierId: string;
    supplierName: string;
    totalAmount: number;
    totalOrders: number;
  }[];
}

export interface ConsigneeStatisticsDto {
  totalConsignees: number;
  topConsignees: {
    consigneeId: string;
    consigneeName: string;
    totalAmount: number;
    totalOrders: number;
  }[];
}

export interface WarehouseStatisticsDto {
  totalWarehouses: number;
  totalAreas: number;
  inventoryByWarehouse: {
    warehouseId: string;
    warehouseName: string;
    totalQuantity: number;
    totalValue: number;
  }[];
}

export interface TruckStatisticsDto {
  totalTrucks: number;
  trucksByStatus: { status: string; count: number }[];
  totalCapacity: number;
}

export interface DashboardSummaryDto {
  overview: OverviewStatisticsDto;
  recentOrdersCount: number;
  recentHarvestSchedulesCount: number;
  pendingDeliveriesCount: number;
  overdueDebtsCount: number;
  lowStockBatchesCount: number;
}

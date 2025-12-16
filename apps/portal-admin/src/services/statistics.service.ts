import { fetchJSON } from '@/lib/client';
import {
  DashboardSummaryDto,
  DateRangeQueryDto,
  HarvestStatisticsDto,
  OrderStatisticsDto,
  OverviewStatisticsDto,
  ProductStatisticsDto,
  RevenueTrendDto,
  PeriodQueryDto,
  InventoryStatisticsDto,
  DeliveryStatisticsDto,
  DebtStatisticsDto,
  PaymentStatisticsDto,
  SupplierStatisticsDto,
  ConsigneeStatisticsDto,
  WarehouseStatisticsDto,
  TruckStatisticsDto
} from '@/types/statistics';

function buildQuery(params?: Record<string, any>) {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export const getDashboardSummary = async () => {
  return fetchJSON<DashboardSummaryDto>('/statistics/dashboard');
};

export const getOverviewStatistics = async (query?: DateRangeQueryDto) => {
  return fetchJSON<OverviewStatisticsDto>(
    `/statistics/overview${buildQuery(query)}`
  );
};

export const getRevenueTrend = async (query?: PeriodQueryDto) => {
  return fetchJSON<RevenueTrendDto[]>(
    `/statistics/revenue-trend${buildQuery(query)}`
  );
};

export const getOrderStatistics = async (query?: DateRangeQueryDto) => {
  return fetchJSON<OrderStatisticsDto>(
    `/statistics/orders${buildQuery(query)}`
  );
};

export const getHarvestStatistics = async (query?: DateRangeQueryDto) => {
  return fetchJSON<HarvestStatisticsDto>(
    `/statistics/harvest${buildQuery(query)}`
  );
};

export const getProductStatistics = async (query?: DateRangeQueryDto) => {
  return fetchJSON<ProductStatisticsDto>(
    `/statistics/products${buildQuery(query)}`
  );
};

export const getInventoryStatistics = async () => {
  return fetchJSON<InventoryStatisticsDto>('/statistics/inventory');
};

export const getDeliveryStatistics = async (query?: DateRangeQueryDto) => {
  return fetchJSON<DeliveryStatisticsDto>(
    `/statistics/deliveries${buildQuery(query)}`
  );
};

export const getDebtStatistics = async () => {
  return fetchJSON<DebtStatisticsDto>('/statistics/debts');
};

export const getPaymentStatistics = async (query?: DateRangeQueryDto) => {
  return fetchJSON<PaymentStatisticsDto>(
    `/statistics/payments${buildQuery(query)}`
  );
};

export const getSupplierStatistics = async (query?: DateRangeQueryDto) => {
  return fetchJSON<SupplierStatisticsDto>(
    `/statistics/suppliers${buildQuery(query)}`
  );
};

export const getConsigneeStatistics = async (query?: DateRangeQueryDto) => {
  return fetchJSON<ConsigneeStatisticsDto>(
    `/statistics/consignees${buildQuery(query)}`
  );
};

export const getWarehouseStatistics = async () => {
  return fetchJSON<WarehouseStatisticsDto>('/statistics/warehouses');
};

export const getTruckStatistics = async () => {
  return fetchJSON<TruckStatisticsDto>('/statistics/trucks');
};

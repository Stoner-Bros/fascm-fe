// ============================================================================
// Core Delivery Types (aligned with backend API)
// ============================================================================

import { Consignee } from './consignee';
import { HarvestSchedule } from './harvest-schedule';

/**
 * IoT Device type for truck monitoring
 */
export interface IoTDevice {
  id: string;
  deviceId?: string | null;
  deviceType?: string | null;
  status?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Truck type (aligned with backend)
 */
export interface Truck {
  id: string;
  licensePlate?: string | null;
  model?: string | null;
  capacity?: number | null;
  status?: string | null;
  currentLocation?: string | null;
  licensePhoto?: string | null;
  iotDevice?: IoTDevice[] | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Order Schedule type (aligned with backend)
 */
export interface OrderSchedule {
  id: string;
  description?: string | null;
  status?: string | null;
  orderDate?: string | null;
  consignee?: Consignee | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Main Delivery type (aligned with backend API)
 */
export interface Delivery {
  id: string;
  startLat?: number | null;
  startLng?: number | null;
  endLat?: number | null;
  endLng?: number | null;
  startAddress?: string | null;
  endAddress?: string | null;
  status?: DeliveryStatusEnum | null;
  startTime?: string | null;
  endTime?: string | null;
  truck?: Truck | null;
  harvestSchedule?: HarvestSchedule | null;
  orderSchedule?: OrderSchedule | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for creating a new delivery
 */
export interface CreateDeliveryDto {
  startLat?: number | null;
  startLng?: number | null;
  endLat?: number | null;
  endLng?: number | null;
  startAddress?: string | null;
  endAddress?: string | null;
  status?: DeliveryStatusEnum | null;
  startTime?: string | null;
  endTime?: string | null;
  truck?: { id: string } | null;
  harvestSchedule?: { id: string } | null;
  orderSchedule?: { id: string } | null;
}

/**
 * DTO for updating a delivery
 */
export type UpdateDeliveryDto = Partial<CreateDeliveryDto>;

/**
 * DTO for querying deliveries with pagination and filters
 */
export interface FindAllDeliveriesDto {
  page?: number;
  limit?: number;
  orderScheduleId?: string;
  status?: DeliveryStatusEnum;
  sort?: 'asc' | 'desc';
}

// ============================================================================
// Real-time Delivery Tracking (WebSocket)
// ============================================================================
export type DeliveryStatusEnum =
  | 'scheduled'
  | 'rejected'
  | 'completed'
  | 'delivering'
  | 'delivered'
  | 'returning'
  | 'canceled';

/**
 * Payload for starting a delivery tracking session
 */
export interface DeliveryStartPayload {
  deliveryId: string;
  orderId?: string;
  startLat: number;
  startLng: number;
  startTime?: string;
  route?: [number, number][];
}

/**
 * Payload for updating delivery location
 */
export interface DeliveryUpdatePayload {
  deliveryId: string;
  lat: number;
  lng: number;
  speedKmh?: number;
  headingDeg?: number;
  timestamp?: string;
}

/**
 * Payload for ending a delivery
 */
export interface DeliveryEndPayload {
  deliveryId: string;
  endLat: number;
  endLng: number;
  endTime?: string;
}

// ============================================================================
// Legacy Types (for backward compatibility - consider migrating)
// ============================================================================

/**
 * @deprecated Use Truck type instead
 */
export interface TransportStaff {
  id: string;
  name: string;
  phone: string;
  role: 'driver' | 'assistant' | 'supervisor';
  licenseNumber?: string;
  experience: number;
}

/**
 * @deprecated Legacy truck monitoring type
 */
export interface TruckMonitoring {
  truckId: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    timestamp: string;
  };
  environment: {
    temperature: number;
    humidity: number;
    timestamp: string;
  };
  speed: number;
  fuel: number;
  isMoving: boolean;
  lastUpdate: string;
}

/**
 * @deprecated Legacy inbound delivery type
 */
export interface InboundDelivery {
  id: string;
  farmName: string;
  farmAddress: string;
  farmContact: string;
  warehouseId: string;
  warehouseName: string;
  warehouseAddress: string;
  truckId: string;
  truck: Truck;
  productType: string;
  quantity: number;
  unit: string;
  estimatedValue: number;
  departureTime: string;
  estimatedArrival: string;
  actualArrival?: string;
  status:
    | 'scheduled'
    | 'departed'
    | 'in_transit'
    | 'arrived'
    | 'completed'
    | 'cancelled'
    | 'delayed';
  monitoring?: TruckMonitoring;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * @deprecated Legacy order item type
 */
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  weight: number;
  volume: number;
  specialRequirements?: string;
}

/**
 * @deprecated Legacy order type
 */
export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  customerContact: string;
  customerType: 'supermarket' | 'restaurant' | 'distributor' | 'retailer';
  items: OrderItem[];
  totalWeight: number;
  totalVolume: number;
  totalValue: number;
  deliveryDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  specialHandling?: string;
  requiresSignature: boolean;
  status:
    | 'pending'
    | 'confirmed'
    | 'packed'
    | 'assigned'
    | 'in_transit'
    | 'delivered'
    | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * @deprecated Legacy outbound delivery type
 */
// export interface OutboundDelivery {
//   id: string;
//   warehouseId: string;
//   warehouseName: string;
//   warehouseAddress: string;
//   truckId: string;
//   truck: Truck;
//   orders: Order[];
//   totalWeight: number;
//   totalVolume: number;
//   totalValue: number;
//   departureTime: string;
//   estimatedArrival: string;
//   actualArrival?: string;
//   status:
//     | 'scheduled'
//     | 'loading'
//     | 'departed'
//     | 'in_transit'
//     | 'delivering'
//     | 'completed'
//     | 'returned'
//     | 'cancelled';
//   monitoring?: TruckMonitoring;
//   route: {
//     orderId: string;
//     customerName: string;
//     customerAddress: string;
//     estimatedArrival: string;
//     actualArrival?: string;
//     status: 'pending' | 'arrived' | 'delivered' | 'failed';
//   }[];
//   priorityLevel: 'low' | 'medium' | 'high' | 'urgent';
//   specialHandling?: string;
//   notes?: string;
//   createdAt: string;
//   updatedAt: string;
// }

/**
 * @deprecated Legacy validation type
 */
export interface WeightCapacityValidation {
  isValid: boolean;
  errors: {
    type: 'weight_exceeded' | 'volume_exceeded' | 'capacity_exceeded';
    message: string;
    currentValue: number;
    maxValue: number;
    unit: string;
  }[];
  warnings: {
    type: 'near_limit';
    message: string;
    percentage: number;
  }[];
}

/**
 * @deprecated Legacy fleet stats type
 */
export interface FleetStats {
  totalTrucks: number;
  availableTrucks: number;
  trucksInUse: number;
  trucksInMaintenance: number;
  averageCapacityUtilization: number;
  totalDeliveries: number;
  onTimeDeliveryRate: number;
}

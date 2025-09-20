// Truck and Transport Staff definitions
export interface TransportStaff {
  id: string;
  name: string;
  phone: string;
  role: 'driver' | 'assistant' | 'supervisor';
  licenseNumber?: string;
  experience: number; // years
}

export interface Truck {
  id: string;
  licenseNumber: string;
  model: string;
  capacity: number; // in kg
  maxWeight: number; // in kg
  volume: number; // in cubic meters
  fuelType: 'diesel' | 'electric' | 'hybrid';
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_service';
  gpsDevice: {
    deviceId: string;
    isActive: boolean;
    lastUpdate: string;
  };
  environmentSensors: {
    temperatureSensorId: string;
    humiditySensorId: string;
    isActive: boolean;
    lastUpdate: string;
  };
  transportStaff: TransportStaff[];
  maintenanceDate?: string;
  registrationExpiry: string;
}

// Order definitions for outbound deliveries
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  weight: number; // kg per item
  volume: number; // cubic meters per item
  specialRequirements?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  customerContact: string;
  customerType: 'supermarket' | 'restaurant' | 'distributor' | 'retailer';
  items: OrderItem[];
  totalWeight: number; // calculated from items
  totalVolume: number; // calculated from items
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

// Real-time monitoring data
export interface TruckMonitoring {
  truckId: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    timestamp: string;
  };
  environment: {
    temperature: number; // Celsius
    humidity: number; // percentage
    timestamp: string;
  };
  speed: number; // km/h
  fuel: number; // percentage or liters
  isMoving: boolean;
  lastUpdate: string;
}

// Updated delivery interfaces
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

export interface OutboundDelivery {
  id: string;
  warehouseId: string;
  warehouseName: string;
  warehouseAddress: string;
  truckId: string;
  truck: Truck;
  orders: Order[];
  totalWeight: number; // sum of all orders
  totalVolume: number; // sum of all orders
  totalValue: number; // sum of all orders
  departureTime: string;
  estimatedArrival: string;
  actualArrival?: string;
  status:
    | 'scheduled'
    | 'loading'
    | 'departed'
    | 'in_transit'
    | 'delivering'
    | 'completed'
    | 'returned'
    | 'cancelled';
  monitoring?: TruckMonitoring;
  route: {
    orderId: string;
    customerName: string;
    customerAddress: string;
    estimatedArrival: string;
    actualArrival?: string;
    status: 'pending' | 'arrived' | 'delivered' | 'failed';
  }[];
  priorityLevel: 'low' | 'medium' | 'high' | 'urgent';
  specialHandling?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Validation errors for weight/capacity
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

// Fleet management
export interface FleetStats {
  totalTrucks: number;
  availableTrucks: number;
  trucksInUse: number;
  trucksInMaintenance: number;
  averageCapacityUtilization: number;
  totalDeliveries: number;
  onTimeDeliveryRate: number;
}

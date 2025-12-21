import { RoleEnum } from './enums';

/**
 * Permission constants for fine-grained access control
 */
export enum Permission {
  // Dashboard & Overview
  VIEW_DASHBOARD = 'view:dashboard',
  VIEW_OVERVIEW = 'view:overview',

  // Category Management
  VIEW_CATEGORY = 'view:category',
  CREATE_CATEGORY = 'create:category',
  UPDATE_CATEGORY = 'update:category',
  DELETE_CATEGORY = 'delete:category',

  // Product Management
  VIEW_PRODUCT = 'view:product',
  CREATE_PRODUCT = 'create:product',
  UPDATE_PRODUCT = 'update:product',
  DELETE_PRODUCT = 'delete:product',

  // Purchase Order Management
  VIEW_PURCHASE_ORDER = 'view:purchase_order',
  CREATE_PURCHASE_ORDER = 'create:purchase_order',
  UPDATE_PURCHASE_ORDER = 'update:purchase_order',
  DELETE_PURCHASE_ORDER = 'delete:purchase_order',
  MANAGE_PURCHASE_PICKUP = 'manage:purchase_pickup',
  MANAGE_PURCHASE_IMPORT = 'manage:purchase_import',

  // Sale Order Management
  VIEW_SALE_ORDER = 'view:sale_order',
  CREATE_SALE_ORDER = 'create:sale_order',
  UPDATE_SALE_ORDER = 'update:sale_order',
  DELETE_SALE_ORDER = 'delete:sale_order',
  MANAGE_SALE_EXPORT = 'manage:sale_export',
  MANAGE_SALE_DELIVERY = 'manage:sale_delivery',

  // Warehouse Management
  VIEW_WAREHOUSE = 'view:warehouse',
  CREATE_WAREHOUSE = 'create:warehouse',
  UPDATE_WAREHOUSE = 'update:warehouse',
  DELETE_WAREHOUSE = 'delete:warehouse',
  MANAGE_WAREHOUSE_STOCK = 'manage:warehouse_stock',
  MANAGE_WAREHOUSE_INVENTORY = 'manage:warehouse_inventory',
  SCAN_BARCODE = 'scan:barcode',

  // Truck Management
  VIEW_TRUCK = 'view:truck',
  CREATE_TRUCK = 'create:truck',
  UPDATE_TRUCK = 'update:truck',
  DELETE_TRUCK = 'delete:truck',

  // IoT Device Management
  VIEW_IOT_DEVICE = 'view:iot_device',
  CREATE_IOT_DEVICE = 'create:iot_device',
  UPDATE_IOT_DEVICE = 'update:iot_device',
  DELETE_IOT_DEVICE = 'delete:iot_device',

  // Payment Management
  VIEW_PAYMENT = 'view:payment',
  CREATE_PAYMENT = 'create:payment',
  UPDATE_PAYMENT = 'update:payment',
  DELETE_PAYMENT = 'delete:payment',

  // Account Management
  VIEW_ACCOUNT = 'view:account',
  CREATE_ACCOUNT = 'create:account',
  UPDATE_ACCOUNT = 'update:account',
  DELETE_ACCOUNT = 'delete:account',
  VIEW_MANAGER = 'view:manager',
  VIEW_STAFF = 'view:staff',
  VIEW_DELIVERY_STAFF = 'view:delivery_staff',
  VIEW_SUPPLIER = 'view:supplier',
  VIEW_CONSIGNEE = 'view:consignee',
  MANAGE_MANAGER = 'manage:manager',
  MANAGE_STAFF = 'manage:staff',
  MANAGE_DELIVERY_STAFF = 'manage:delivery_staff',
  MANAGE_SUPPLIER = 'manage:supplier',
  MANAGE_CONSIGNEE = 'manage:consignee',

  // Profile Management
  VIEW_PROFILE = 'view:profile',
  UPDATE_PROFILE = 'update:profile',

  // Kanban (if needed)
  VIEW_KANBAN = 'view:kanban',
  MANAGE_KANBAN = 'manage:kanban'
}

/**
 * Role hierarchy levels (higher number = more permissions)
 */
export const ROLE_HIERARCHY: Record<string, number> = {
  [RoleEnum.ADMIN]: 100,
  [RoleEnum.MANAGER]: 80,
  [RoleEnum.STAFF]: 60,
  [RoleEnum.DELIVERY_STAFF]: 40,
  [RoleEnum.CONSIGNEE]: 20,
  [RoleEnum.SUPPLIER]: 20,
  [RoleEnum.USER]: 10
};

/**
 * Permission mapping for each role
 * Roles inherit permissions from lower hierarchy levels
 */
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  [RoleEnum.ADMIN]: [
    // Admin has all permissions
    ...Object.values(Permission)
  ],

  [RoleEnum.MANAGER]: [
    // Category
    Permission.VIEW_CATEGORY,
    Permission.CREATE_CATEGORY,
    Permission.UPDATE_CATEGORY,
    Permission.DELETE_CATEGORY,

    // Product
    Permission.VIEW_PRODUCT,
    Permission.CREATE_PRODUCT,
    Permission.UPDATE_PRODUCT,
    Permission.DELETE_PRODUCT,

    // Purchase Order
    Permission.VIEW_PURCHASE_ORDER,
    Permission.CREATE_PURCHASE_ORDER,
    Permission.UPDATE_PURCHASE_ORDER,
    Permission.MANAGE_PURCHASE_PICKUP,
    Permission.MANAGE_PURCHASE_IMPORT,

    // Sale Order
    Permission.VIEW_SALE_ORDER,
    Permission.CREATE_SALE_ORDER,
    Permission.UPDATE_SALE_ORDER,
    Permission.MANAGE_SALE_EXPORT,
    Permission.MANAGE_SALE_DELIVERY,

    // Warehouse
    Permission.VIEW_WAREHOUSE,
    Permission.CREATE_WAREHOUSE,
    Permission.UPDATE_WAREHOUSE,
    Permission.MANAGE_WAREHOUSE_STOCK,
    Permission.MANAGE_WAREHOUSE_INVENTORY,
    Permission.SCAN_BARCODE,

    // Truck
    Permission.VIEW_TRUCK,
    Permission.CREATE_TRUCK,
    Permission.UPDATE_TRUCK,
    Permission.DELETE_TRUCK,

    // IoT Device
    Permission.VIEW_IOT_DEVICE,
    Permission.CREATE_IOT_DEVICE,
    Permission.UPDATE_IOT_DEVICE,
    Permission.DELETE_IOT_DEVICE,

    // Payment
    Permission.VIEW_PAYMENT,
    Permission.CREATE_PAYMENT,
    Permission.UPDATE_PAYMENT,

    // Account (limited)
    Permission.VIEW_ACCOUNT,
    Permission.VIEW_STAFF,
    Permission.VIEW_DELIVERY_STAFF,
    Permission.MANAGE_STAFF,
    Permission.MANAGE_DELIVERY_STAFF,
    Permission.VIEW_SUPPLIER,
    Permission.VIEW_CONSIGNEE,

    // Profile
    Permission.VIEW_PROFILE,
    Permission.UPDATE_PROFILE,

    // Kanban
    Permission.VIEW_KANBAN,
    Permission.MANAGE_KANBAN
  ],

  [RoleEnum.STAFF]: [
    // Category
    Permission.VIEW_CATEGORY,

    // Product (view only - no create/update/delete)
    Permission.VIEW_PRODUCT,

    // Purchase Order
    Permission.VIEW_PURCHASE_ORDER,
    Permission.CREATE_PURCHASE_ORDER,
    Permission.UPDATE_PURCHASE_ORDER,
    Permission.MANAGE_PURCHASE_IMPORT,

    // Sale Order
    Permission.VIEW_SALE_ORDER,
    Permission.CREATE_SALE_ORDER,
    Permission.UPDATE_SALE_ORDER,
    Permission.MANAGE_SALE_EXPORT,

    // Warehouse
    Permission.VIEW_WAREHOUSE,
    Permission.MANAGE_WAREHOUSE_STOCK,
    Permission.MANAGE_WAREHOUSE_INVENTORY,
    Permission.SCAN_BARCODE,

    // Truck
    Permission.VIEW_TRUCK,

    // IoT Device
    Permission.VIEW_IOT_DEVICE,

    // Payment
    Permission.VIEW_PAYMENT,

    // Profile
    Permission.VIEW_PROFILE,
    Permission.UPDATE_PROFILE
  ],

  [RoleEnum.DELIVERY_STAFF]: [
    // Sale Order (delivery related)
    Permission.VIEW_SALE_ORDER,
    Permission.MANAGE_SALE_DELIVERY,
    Permission.MANAGE_PURCHASE_PICKUP,
    Permission.VIEW_PURCHASE_ORDER,

    // Profile
    Permission.VIEW_PROFILE,
    Permission.UPDATE_PROFILE
  ],

  [RoleEnum.CONSIGNEE]: [],
  [RoleEnum.SUPPLIER]: [],
  [RoleEnum.USER]: []
};

/**
 * Route permission mapping
 * Maps routes to required permissions
 */
export const ROUTE_PERMISSIONS: Record<string, Permission | Permission[]> = {
  '/dashboard/overview': Permission.VIEW_OVERVIEW,
  '/dashboard/category': Permission.VIEW_CATEGORY,
  '/dashboard/product': Permission.VIEW_PRODUCT,
  '/dashboard/order-purchase/order': Permission.VIEW_PURCHASE_ORDER,
  '/dashboard/order-purchase/pickup': Permission.MANAGE_PURCHASE_PICKUP,
  '/dashboard/order-purchase/import': Permission.MANAGE_PURCHASE_IMPORT,
  '/dashboard/order-sale/order': Permission.VIEW_SALE_ORDER,
  '/dashboard/order-sale/export': Permission.MANAGE_SALE_EXPORT,
  '/dashboard/order-sale/delivery': Permission.MANAGE_SALE_DELIVERY,
  '/dashboard/warehouse': Permission.VIEW_WAREHOUSE,
  '/dashboard/truck': Permission.VIEW_TRUCK,
  '/dashboard/iot-devices': Permission.VIEW_IOT_DEVICE,
  '/dashboard/payment': Permission.VIEW_PAYMENT,
  '/dashboard/account/managers': Permission.VIEW_MANAGER,
  '/dashboard/account/staffs': Permission.VIEW_STAFF,
  '/dashboard/account/delivery-staffs': Permission.VIEW_DELIVERY_STAFF,
  '/dashboard/account/suppliers': Permission.VIEW_SUPPLIER,
  '/dashboard/account/consignees': Permission.VIEW_CONSIGNEE,
  '/dashboard/profile': Permission.VIEW_PROFILE,
  '/dashboard/kanban': Permission.VIEW_KANBAN
};

/**
 * Helper function to get all permissions for a role
 */
export function getRolePermissions(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Helper function to check if a role has a specific permission
 */
export function roleHasPermission(
  role: string,
  permission: Permission
): boolean {
  const rolePerms = getRolePermissions(role);
  return rolePerms.includes(permission);
}

/**
 * Helper function to check if a role has any of the specified permissions
 */
export function roleHasAnyPermission(
  role: string,
  permissions: Permission[]
): boolean {
  return permissions.some((perm) => roleHasPermission(role, perm));
}

/**
 * Helper function to check if a role has all of the specified permissions
 */
export function roleHasAllPermissions(
  role: string,
  permissions: Permission[]
): boolean {
  return permissions.every((perm) => roleHasPermission(role, perm));
}

/**
 * Helper function to get required permission for a route
 */
export function getRoutePermission(
  route: string
): Permission | Permission[] | null {
  // Check exact match first
  if (ROUTE_PERMISSIONS[route]) {
    return ROUTE_PERMISSIONS[route];
  }

  // Check prefix match for nested routes
  const matchingRoute = Object.keys(ROUTE_PERMISSIONS).find((key) =>
    route.startsWith(key)
  );

  return matchingRoute ? ROUTE_PERMISSIONS[matchingRoute] : null;
}

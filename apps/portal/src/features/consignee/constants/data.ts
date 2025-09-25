import { NavItem } from '@/types';

// Navigation items cho Consignee Business Flow
export const consigneeNavItems: NavItem[] = [
  {
    title: 'Trang chủ',
    url: '/consignee/home',
    icon: 'home',
    isActive: false,
    shortcut: ['h', 'h'],
    items: []
  },
  {
    title: 'Đặt hàng',
    url: '/consignee/order',
    icon: 'shoppingCart',
    shortcut: ['o', 'o'],
    isActive: false,
    items: []
  },
  {
    title: 'Đơn hàng của tôi',
    url: '/consignee/my-orders',
    icon: 'package',
    shortcut: ['m', 'o'],
    isActive: false,
    items: []
  },
  {
    title: 'Xác nhận giao hàng',
    url: '/consignee/delivery-confirmation',
    icon: 'truck',
    shortcut: ['d', 'c'],
    isActive: false,
    items: []
  },
  {
    title: 'Thanh toán & Chứng từ',
    url: '/consignee/payment',
    icon: 'creditCard',
    shortcut: ['p', 'p'],
    isActive: false,
    items: []
  }
];

// Business rules cho đặt hàng
export const orderBusinessRules = {
  minimumQuantity: 10,
  minimumWeight: 1, // kg
  supportedUnits: ['kg', 'tấn', 'thùng', 'bao'],
  maxProductsPerOrder: 50,
  maximumWeight: 100 // kg,
};

// Trạng thái đơn hàng
export const orderStatuses = {
  PENDING: {
    label: 'Chờ xử lý',
    description: 'Đơn hàng đang chờ được xử lý'
  },
  PREPARING: {
    label: 'Đang chuẩn bị',
    description: 'Đơn hàng đang được chuẩn bị'
  },
  IN_TRANSIT: {
    label: 'Đang giao',
    description: 'Đơn hàng đang trên đường giao'
  },
  DELIVERED: {
    label: 'Đã giao',
    description: 'Đơn hàng đã được giao, chờ xác nhận từ consignee'
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    description: 'Đơn hàng đã được consignee xác nhận nhận hàng'
  },
  PAID: {
    label: 'Đã thanh toán',
    description: 'Đơn hàng đã được thanh toán'
  },
  CANCELLED: {
    label: 'Đã hủy',
    description: 'Đơn hàng đã bị hủy'
  }
};

// Phương thức thanh toán
export const paymentMethods = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản'
};

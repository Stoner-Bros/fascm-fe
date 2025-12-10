import { NavItem } from '@/types';

export const supplierNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/supplier/dashboard',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  {
    title: 'Products',
    url: '/supplier/products',
    icon: 'product',
    shortcut: ['h', 'b'],
    isActive: false,
    items: []
  },
  {
    title: 'Harvest Batches',
    url: '/supplier/harvest-batches',
    icon: 'product',
    shortcut: ['p', 'c'],
    isActive: false,
    items: []
  },
  // {
  //   title: 'Pickup Confirmation',
  //   url: '/supplier/pickup-confirmation',
  //   icon: 'truck',
  //   shortcut: ['p', 'c'],
  //   isActive: false,
  //   items: []
  // },
  {
    title: 'Profile',
    url: '/supplier/profile',
    icon: 'userPen',
    shortcut: ['p', 'r'],
    isActive: false,
    items: []
  }
];

export const consigneeNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/consignee/dashboard',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  {
    title: 'Products',
    url: '/consignee/products',
    icon: 'product',
    shortcut: ['p', 'r'],
    isActive: false,
    items: []
  },
  {
    title: 'Orders',
    url: '/consignee/orders',
    icon: 'shoppingCart',
    shortcut: ['o', 'r'],
    isActive: false,
    items: []
  },
  {
    title: 'Payments',
    url: '/consignee/payments',
    icon: 'creditCard',
    shortcut: ['p', 'y'],
    isActive: false,
    items: []
  },
  {
    title: 'Profile',
    url: '/consignee/profile',
    icon: 'userPen',
    shortcut: ['p', 'r'],
    isActive: false,
    items: []
  }
];

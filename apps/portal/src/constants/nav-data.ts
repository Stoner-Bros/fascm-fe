import { NavItem } from '@/types';

export const supplierNavItems: NavItem[] = [
  {
    title: 'dashboard',
    url: '/supplier/dashboard',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  {
    title: 'harvestBatches',
    url: '/supplier/harvest-batches',
    icon: 'product',
    shortcut: ['p', 'c'],
    isActive: false,
    items: []
  },
  {
    title: 'profile',
    url: '/supplier/profile',
    icon: 'userPen',
    shortcut: ['p', 'r'],
    isActive: false,
    items: []
  }
];

export const consigneeNavItems: NavItem[] = [
  {
    title: 'dashboard',
    url: '/consignee/dashboard',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  {
    title: 'orders',
    url: '/consignee/orders',
    icon: 'shoppingCart',
    shortcut: ['o', 'r'],
    isActive: false,
    items: []
  },
  {
    title: 'profile',
    url: '/consignee/profile',
    icon: 'userPen',
    shortcut: ['p', 'r'],
    isActive: false,
    items: []
  }
];

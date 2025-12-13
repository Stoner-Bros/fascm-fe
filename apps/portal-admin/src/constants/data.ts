import { NavItem } from '@/types';

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: []
  },
  {
    title: 'Category',
    url: '/dashboard/category',
    icon: 'tag',
    shortcut: ['c', 'c'],
    isActive: true,
    items: [
      {
        title: 'Product',
        url: '/dashboard/product',
        icon: 'product',
        shortcut: ['p', 'p']
      }
    ]
  },
  {
    title: 'Harvest',
    url: '/dashboard/harvest',
    icon: 'product',
    shortcut: ['h', 'h'],
    isActive: true,
    items: []
  },
  {
    title: 'Order Purchase',
    url: '',
    icon: 'product',
    shortcut: ['o', 'o'],
    isActive: true,
    items: [
      {
        title: 'Order',
        url: '/dashboard/order-purchase/order',
        shortcut: ['o', 'o']
      },
      {
        title: 'Import',
        url: '/dashboard/order-purchase/import',
        shortcut: ['o', 'i']
      },
      {
        title: 'Pickup',
        url: '/dashboard/order-purchase/pickup',
        shortcut: ['o', 'p']
      }
    ]
  },
  {
    title: 'Order Sale',
    url: '',
    icon: 'order',
    shortcut: ['o', 'o'],
    isActive: true,
    items: [
      {
        title: 'Order',
        url: '/dashboard/order-sale/order',
        shortcut: ['o', 'o']
      },
      {
        title: 'Export',
        url: '/dashboard/order-sale/export',
        shortcut: ['o', 'e']
      },
      {
        title: 'Delivery',
        url: '/dashboard/order-sale/delivery',
        shortcut: ['o', 'd']
      }
    ]
  },
  {
    title: 'Warehouse',
    url: '/dashboard/warehouse',
    icon: 'inventory',
    shortcut: ['w', 'w'],
    isActive: true,
    items: []
  },
  {
    title: 'Delivery',
    url: '/dashboard/delivery',
    icon: 'delivery',
    shortcut: ['d', 'l'],
    isActive: true,
    items: [
      {
        title: 'Tracking',
        url: '/dashboard/delivery/tracking',
        icon: 'delivery',
        shortcut: ['d', 'k']
      },
      {
        title: 'Realtime',
        url: '/dashboard/delivery/realtime',
        icon: 'delivery',
        shortcut: ['d', 'r']
      }
    ]
  },
  {
    title: 'Truck',
    url: '/dashboard/truck',
    icon: 'truck',
    shortcut: ['t', 't'],
    isActive: true,
    items: []
  },
  {
    title: 'IoT Device',
    url: '/dashboard/iot-devices',
    icon: 'iotDevice',
    shortcut: ['w', 'a'],
    isActive: true,
    items: []
  },
  {
    title: 'Account',
    url: '',
    icon: 'billing',
    isActive: true,
    items: [
      {
        title: 'Manager',
        url: '/dashboard/account/managers',
        icon: 'userPen',
        shortcut: ['a', 'm']
      },
      {
        title: 'Staff',
        url: '/dashboard/account/staffs',
        icon: 'employee',
        shortcut: ['a', 'f']
      },
      {
        title: 'Delivery Staff',
        url: '/dashboard/account/delivery-staffs',
        icon: 'delivery',
        shortcut: ['a', 'd']
      },
      {
        title: 'Supplier',
        url: '/dashboard/account/suppliers',
        icon: 'inventory',
        shortcut: ['a', 's']
      },
      {
        title: 'Consignee',
        url: '/dashboard/account/consignees',
        icon: 'user',
        shortcut: ['a', 'c']
      }
    ]
  }
  // {
  //   title: 'Kanban',
  //   url: '/dashboard/kanban',
  //   icon: 'kanban',
  //   shortcut: ['k', 'k'],
  //   isActive: false,
  //   items: [] // No child items
  // }
];

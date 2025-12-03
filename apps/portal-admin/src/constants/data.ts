import { NavItem } from '@/types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

//Info: The following data is used for the sidebar navigation and Cmd K bar.
export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard/overview',
    icon: 'dashboard',
    isActive: false,
    shortcut: ['d', 'd'],
    items: [] // Empty array as there are no child items for Dashboard
  },
  {
    title: 'Harvest',
    url: '/dashboard/harvest',
    icon: 'product',
    shortcut: ['h', 'h'],
    isActive: true,
    items: [] // No child items
  },
  {
    title: 'Order',
    url: '/dashboard/order',
    icon: 'order',
    shortcut: ['o', 'o'],
    isActive: true
  },
  {
    title: 'Warehouse',
    url: '/dashboard/warehouse',
    icon: 'inventory',
    shortcut: ['w', 'w'],
    isActive: true,
    items: [
      {
        title: 'Stock Management',
        url: '/dashboard/warehouse/stock',
        icon: 'warehouse',
        shortcut: ['w', 's']
      },
      {
        title: 'IoT Device',
        url: '/dashboard/warehouse/iot-devices',
        icon: 'iotDevice',
        shortcut: ['w', 'a']
      },
      {
        title: 'Import Ticket',
        url: '/dashboard/warehouse/batches',
        icon: 'inventory',
        shortcut: ['w', 'b']
      }
    ]
  },
  {
    title: 'Delivery',
    url: '/dashboard/delivery',
    icon: 'delivery',
    shortcut: ['d', 'l'],
    isActive: true,
    items: [
      {
        title: 'Inbound',
        url: '/dashboard/delivery/inbound',
        icon: 'warehouse',
        shortcut: ['d', 'i']
      },
      {
        title: 'Outbound',
        url: '/dashboard/delivery/outbound',
        icon: 'delivery',
        shortcut: ['d', 'o']
      },
      {
        title: 'Truck',
        url: '/dashboard/delivery/truck',
        icon: 'delivery',
        shortcut: ['d', 't']
      },
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
    title: 'Product',
    url: '/dashboard/product',
    icon: 'product',
    shortcut: ['p', 'p'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Category',
    url: '/dashboard/category',
    icon: 'tag',
    shortcut: ['c', 'c'],
    isActive: false,
    items: [] // No child items
  },
  {
    title: 'Account',
    url: '/dashboard/profile', // Navigate to profile page
    icon: 'billing',
    isActive: true,

    items: [
      {
        title: 'Profile',
        url: '/dashboard/profile',
        icon: 'userPen',
        shortcut: ['m', 'm']
      },
      {
        title: 'Managers Accounts',
        url: '/dashboard/account/managers',
        icon: 'userPen',
        shortcut: ['a', 'm']
      },
      {
        title: 'Consignees Accounts',
        url: '/dashboard/account/consignees',
        icon: 'user',
        shortcut: ['a', 'c']
      },
      {
        title: 'Suppliers Accounts',
        url: '/dashboard/account/suppliers',
        icon: 'inventory',
        shortcut: ['a', 's']
      },
      {
        title: 'Staff Accounts',
        url: '/dashboard/account/staffs',
        icon: 'employee',
        shortcut: ['a', 'f']
      },
      {
        title: 'Delivery Staff Accounts',
        url: '/dashboard/account/delivery-staffs',
        icon: 'delivery',
        shortcut: ['a', 'd']
      },
      {
        title: 'Login',
        shortcut: ['l', 'l'],
        url: '/',
        icon: 'login'
      }
    ]
  },
  {
    title: 'Kanban',
    url: '/dashboard/kanban',
    icon: 'kanban',
    shortcut: ['k', 'k'],
    isActive: false,
    items: [] // No child items
  }
];

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];

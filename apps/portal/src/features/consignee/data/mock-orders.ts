import { OrderDetail } from '../types/order';

export const mockOrders: Record<string, OrderDetail> = {
  // Pending Order
  'ORD-001': {
    id: 'ORD-001',
    orderNumber: 'ORD-001',
    status: 'pending',
    supplier: {
      id: 'SUP-001',
      name: 'Công ty TNHH Nông sản Đồng Tháp',
      email: 'contact@dongthapagri.com',
      phone: '0277 123 4567',
      address: '123 Đường Nguyễn Văn Linh, TP. Cao Lãnh, Đồng Tháp'
    },
    consignee: {
      id: 'CON-001',
      name: 'Siêu thị BigC Hà Nội',
      email: 'orders@bigc.vn',
      phone: '024 987 6543'
    },
    items: [
      {
        id: 'ITEM-001',
        product: 'Gạo ST25 Organic',
        quantity: 500,
        unit: 'kg',
        pricePerUnit: 45000,
        totalPrice: 22500000
      },
      {
        id: 'ITEM-002',
        product: 'Gạo Jasmine',
        quantity: 300,
        unit: 'kg',
        pricePerUnit: 35000,
        totalPrice: 10500000
      }
    ],
    deliveryAddress: '456 Đường Láng, Đống Đa, Hà Nội',
    deliveryDate: '2024-04-15',
    orderDate: '2024-04-01',
    totalAmount: 33000000,
    notes: 'Giao hàng trong giờ hành chính, liên hệ trước 30 phút',
    statusHistory: [
      {
        status: 'pending',
        timestamp: '2024-04-01T09:00:00Z',
        note: 'Đơn hàng đã được tạo và đang chờ xác nhận từ nhà cung cấp'
      }
    ]
  },

  // In Delivery Order
  'ORD-002': {
    id: 'ORD-002',
    orderNumber: 'ORD-002',
    status: 'indelivery',
    supplier: {
      id: 'SUP-002',
      name: 'Trang trại Rau sạch Đà Lạt',
      email: 'info@dalatsafeveggies.com',
      phone: '0263 555 7890',
      address: '789 Đường Trần Phú, TP. Đà Lạt, Lâm Đồng'
    },
    consignee: {
      id: 'CON-002',
      name: 'Chuỗi cửa hàng VinMart',
      email: 'procurement@vinmart.vn',
      phone: '028 123 9876'
    },
    items: [
      {
        id: 'ITEM-003',
        product: 'Cà chua cherry organic',
        quantity: 100,
        unit: 'kg',
        pricePerUnit: 80000,
        totalPrice: 8000000
      },
      {
        id: 'ITEM-004',
        product: 'Xà lách xoăn',
        quantity: 50,
        unit: 'kg',
        pricePerUnit: 60000,
        totalPrice: 3000000
      },
      {
        id: 'ITEM-005',
        product: 'Cải bó xôi baby',
        quantity: 75,
        unit: 'kg',
        pricePerUnit: 45000,
        totalPrice: 3375000
      }
    ],
    deliveryAddress: '321 Đường Nguyễn Thị Minh Khai, Quận 1, TP.HCM',
    deliveryDate: '2024-04-10',
    orderDate: '2024-04-05',
    totalAmount: 14375000,
    notes: 'Hàng tươi sống, cần bảo quản lạnh ngay khi nhận',
    trackingInfo: {
      currentLocation: 'Đang vận chuyển từ Đà Lạt đến TP.HCM',
      estimatedDelivery: '2024-04-10T14:00:00Z',
      deliveryProgress: 65
    },
    statusHistory: [
      {
        status: 'pending',
        timestamp: '2024-04-05T08:00:00Z',
        note: 'Đơn hàng được tạo'
      },
      {
        status: 'indelivery',
        timestamp: '2024-04-09T06:00:00Z',
        note: 'Hàng đã được xuất kho và bắt đầu vận chuyển'
      }
    ]
  },

  // Delivered Order
  'ORD-003': {
    id: 'ORD-003',
    orderNumber: 'ORD-003',
    status: 'delivered',
    supplier: {
      id: 'SUP-003',
      name: 'Công ty CP Thủy sản Cà Mau',
      email: 'sales@camaushrimp.com',
      phone: '0290 888 1234',
      address: '555 Đường Lý Thường Kiệt, TP. Cà Mau, Cà Mau'
    },
    consignee: {
      id: 'CON-003',
      name: 'Nhà hàng Hải sản Ngon',
      email: 'order@haisanngon.vn',
      phone: '024 777 5555'
    },
    items: [
      {
        id: 'ITEM-006',
        product: 'Tôm sú tươi size 20-30',
        quantity: 20,
        unit: 'kg',
        pricePerUnit: 450000,
        totalPrice: 9000000
      },
      {
        id: 'ITEM-007',
        product: 'Cua biển tươi',
        quantity: 15,
        unit: 'kg',
        pricePerUnit: 350000,
        totalPrice: 5250000
      }
    ],
    deliveryAddress: '888 Đường Bà Triệu, Hai Bà Trưng, Hà Nội',
    deliveryDate: '2024-04-03',
    orderDate: '2024-04-01',
    totalAmount: 14250000,
    notes: 'Giao hàng sáng sớm, bảo quản đá lạnh',
    trackingInfo: {
      currentLocation: 'Đã giao thành công',
      estimatedDelivery: '2024-04-03T07:00:00Z',
      deliveryProgress: 100
    },
    statusHistory: [
      {
        status: 'pending',
        timestamp: '2024-04-01T10:00:00Z',
        note: 'Đơn hàng được tạo'
      },
      {
        status: 'indelivery',
        timestamp: '2024-04-02T05:00:00Z',
        note: 'Hàng đã xuất kho và vận chuyển'
      },
      {
        status: 'delivered',
        timestamp: '2024-04-03T07:30:00Z',
        note: 'Đã giao hàng thành công, người nhận: Anh Minh - Quản lý nhà hàng'
      }
    ]
  },

  // Cancelled Order
  'ORD-004': {
    id: 'ORD-004',
    orderNumber: 'ORD-004',
    status: 'cancel',
    supplier: {
      id: 'SUP-004',
      name: 'Hợp tác xã Trái cây Tiền Giang',
      email: 'coop@tiengianfruit.com',
      phone: '0273 666 9999',
      address: '111 Đường Nguyễn Ái Quốc, TP. Mỹ Tho, Tiền Giang'
    },
    consignee: {
      id: 'CON-004',
      name: 'Cửa hàng trái cây nhập khẩu Fresh Mart',
      email: 'import@freshmart.vn',
      phone: '028 444 2222'
    },
    items: [
      {
        id: 'ITEM-008',
        product: 'Xoài cát Hòa Lộc',
        quantity: 200,
        unit: 'kg',
        pricePerUnit: 65000,
        totalPrice: 13000000
      },
      {
        id: 'ITEM-009',
        product: 'Bưởi da xanh',
        quantity: 100,
        unit: 'trái',
        pricePerUnit: 45000,
        totalPrice: 4500000
      }
    ],
    deliveryAddress: '222 Đường Pasteur, Quận 1, TP.HCM',
    deliveryDate: '2024-04-08',
    orderDate: '2024-04-02',
    totalAmount: 17500000,
    notes: 'Đơn hàng bị hủy do thay đổi kế hoạch kinh doanh',
    statusHistory: [
      {
        status: 'pending',
        timestamp: '2024-04-02T11:00:00Z',
        note: 'Đơn hàng được tạo'
      },
      {
        status: 'cancel',
        timestamp: '2024-04-04T16:00:00Z',
        note: 'Đơn hàng bị hủy theo yêu cầu của khách hàng do thay đổi kế hoạch kinh doanh'
      }
    ]
  }
};

export const getOrderById = (id: string): OrderDetail | null => {
  return mockOrders[id] || null;
};

export const getAllOrders = (): OrderDetail[] => {
  return Object.values(mockOrders);
};

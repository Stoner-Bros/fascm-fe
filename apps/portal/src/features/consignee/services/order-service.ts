import { OrderDetail, OrderStatus, OrderSummary } from '../../../types/order';
import { getOrderById, getAllOrders } from '../data/mock-orders';

export class OrderService {
  /**
   * Fetch order details by ID
   */
  static async getOrderDetail(orderId: string): Promise<OrderDetail | null> {
    // For development: instant response with mock data
    // In production, this would be replaced with actual API call
    return getOrderById(orderId);
  }

  /**
   * Get all orders for consignee
   */
  static async getOrders(): Promise<OrderDetail[]> {
    // For development: instant response with mock data
    // In production, this would be replaced with actual API call
    return getAllOrders();
  }

  /**
   * Calculate order summary
   */
  static calculateOrderSummary(order: OrderDetail): OrderSummary {
    const totalItems = order.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const subtotal = order.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );
    const tax = subtotal * 0.1; // 10% VAT
    const shippingFee = subtotal > 10000000 ? 0 : 200000; // Free shipping for orders > 10M VND
    const totalAmount = subtotal + tax + shippingFee;

    return {
      totalItems,
      totalAmount,
      subtotal,
      tax,
      shippingFee
    };
  }

  /**
   * Get status color for UI
   */
  static getStatusColor(status: OrderStatus): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'indelivery':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancel':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  /**
   * Get status text in Vietnamese
   */
  static getStatusText(status: OrderStatus): string {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'indelivery':
        return 'Đang giao hàng';
      case 'delivered':
        return 'Đã giao hàng';
      case 'cancel':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  }

  /**
   * Format currency in Vietnamese Dong
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  /**
   * Format date in Vietnamese format
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Check if order can be cancelled
   */
  static canCancelOrder(status: OrderStatus): boolean {
    return status === 'pending';
  }

  /**
   * Check if order can be modified
   */
  static canModifyOrder(status: OrderStatus): boolean {
    return status === 'pending';
  }
}

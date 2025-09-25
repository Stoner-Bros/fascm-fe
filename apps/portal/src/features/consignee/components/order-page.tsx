'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Plus,
  Minus,
  Package,
  AlertCircle,
  ShoppingCart,
  Trash2,
  MapPin,
  User,
  Building2,
  Clock,
  Truck,
  DollarSign,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Mock data cho sản phẩm trong kho
const mockProducts = [
  {
    id: 'SP001',
    name: 'Thịt bò đông lạnh',
    category: 'Thực phẩm đông lạnh',
    unit: 'kg',
    price: 200000
  },
  {
    id: 'SP002',
    name: 'Cá hồi Na Uy',
    category: 'Hải sản đông lạnh',
    unit: 'kg',
    price: 350000
  },
  {
    id: 'SP003',
    name: 'Tôm sú đông lạnh',
    category: 'Hải sản đông lạnh',
    unit: 'kg',
    price: 450000
  },
  {
    id: 'SP004',
    name: 'Rau cải xanh',
    category: 'Rau củ tươi',
    unit: 'kg',
    price: 25000
  },
  {
    id: 'SP005',
    name: 'Cà chua cherry',
    category: 'Rau củ tươi',
    unit: 'kg',
    price: 35000
  },
  {
    id: 'SP006',
    name: 'Gạo ST25',
    category: 'Ngũ cốc',
    unit: 'kg',
    price: 28000
  }
];

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  qualityRequirements: string;
  packaging: string;
}

interface DeliveryAddress {
  id: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  zipCode: string;
  contactName: string;
  contactPhone: string;
}

export function OrderPage() {
  // Thông tin lô hàng
  const [batchNumber, setBatchNumber] = useState('');
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');

  // Địa chỉ giao hàng
  const [deliveryAddresses, setDeliveryAddresses] = useState<DeliveryAddress[]>(
    []
  );
  const [currentAddress, setCurrentAddress] = useState<DeliveryAddress>({
    id: '',
    street: '',
    ward: '',
    district: '',
    city: '',
    zipCode: '',
    contactName: '',
    contactPhone: ''
  });

  // Sản phẩm
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [currentItem, setCurrentItem] = useState({
    quantity: 1,
    qualityRequirements: '',
    packaging: ''
  });

  // Vận chuyển
  const [transportationRequirements, setTransportationRequirements] =
    useState('');
  const [desiredDeliveryTime, setDesiredDeliveryTime] = useState('');

  // Thanh toán
  const [paymentMethod, setPaymentMethod] = useState('');
  const [vatInvoice, setVatInvoice] = useState(false);
  const [incoterms, setIncoterms] = useState('');

  const [errors, setErrors] = useState<string[]>([]);

  // Auto-generate batch number
  useEffect(() => {
    const generateBatchNumber = () => {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
      return `LOT${year}${month}${day}${random}`;
    };

    setBatchNumber(generateBatchNumber());
  }, []);

  // Thêm địa chỉ giao hàng
  const addDeliveryAddress = () => {
    if (
      !currentAddress.street ||
      !currentAddress.city ||
      !currentAddress.contactName ||
      !currentAddress.contactPhone
    ) {
      setErrors(['Vui lòng điền đầy đủ thông tin địa chỉ giao hàng']);
      return;
    }

    const newAddress: DeliveryAddress = {
      ...currentAddress,
      id: Date.now().toString()
    };

    setDeliveryAddresses([...deliveryAddresses, newAddress]);
    setCurrentAddress({
      id: '',
      street: '',
      ward: '',
      district: '',
      city: '',
      zipCode: '',
      contactName: '',
      contactPhone: ''
    });
    setErrors([]);
  };

  // Xóa địa chỉ giao hàng
  const removeDeliveryAddress = (id: string) => {
    setDeliveryAddresses(deliveryAddresses.filter((addr) => addr.id !== id));
  };

  // Thêm sản phẩm
  const addOrderItem = () => {
    if (!selectedProductId) {
      setErrors(['Vui lòng chọn sản phẩm']);
      return;
    }

    const selectedProduct = mockProducts.find(
      (p) => p.id === selectedProductId
    );
    if (!selectedProduct) return;

    const newItem: OrderItem = {
      id: Date.now().toString(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      category: selectedProduct.category,
      quantity: currentItem.quantity,
      unit: selectedProduct.unit,
      price: selectedProduct.price,
      qualityRequirements: currentItem.qualityRequirements,
      packaging: currentItem.packaging
    };

    setOrderItems([...orderItems, newItem]);
    setSelectedProductId('');
    setCurrentItem({
      quantity: 1,
      qualityRequirements: '',
      packaging: ''
    });
    setErrors([]);
  };

  // Xóa sản phẩm
  const removeOrderItem = (id: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  // Cập nhật số lượng
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setOrderItems(
      orderItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Tính tổng giá trị
  const getTotalValue = () => {
    return orderItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
  };

  // Gửi đơn hàng
  const submitOrder = () => {
    const newErrors: string[] = [];

    if (deliveryAddresses.length === 0) {
      newErrors.push('Vui lòng thêm ít nhất một địa chỉ giao hàng');
    }

    if (orderItems.length === 0) {
      newErrors.push('Vui lòng thêm ít nhất một sản phẩm');
    }

    if (!expectedDeliveryDate) {
      newErrors.push('Vui lòng chọn ngày giao hàng dự kiến');
    }

    if (!paymentMethod) {
      newErrors.push('Vui lòng chọn phương thức thanh toán');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Xử lý gửi đơn hàng
    console.log('Đơn hàng đã được gửi:', {
      batchNumber,
      orderDate,
      expectedDeliveryDate,
      deliveryAddresses,
      orderItems,
      transportationRequirements,
      desiredDeliveryTime,
      paymentMethod,
      vatInvoice,
      incoterms,
      totalValue: getTotalValue()
    });

    alert('Đơn hàng đã được gửi thành công!');
  };

  return (
    <div className='flex-1 space-y-6 p-6'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Đặt hàng theo lô</h1>
        <p className='text-muted-foreground'>
          Tạo đơn đặt hàng theo lô với thông tin chi tiết
        </p>
      </div>

      {/* Thông tin lô hàng */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5' />
            Thông tin lô hàng
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='space-y-2'>
              <Label htmlFor='batchNumber'>Số lô (tự động)</Label>
              <Input
                id='batchNumber'
                value={batchNumber}
                disabled
                className='bg-gray-50'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='orderDate'>Ngày đặt</Label>
              <Input
                id='orderDate'
                type='date'
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='expectedDeliveryDate'>Ngày dự kiến giao</Label>
              <Input
                id='expectedDeliveryDate'
                type='date'
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Địa chỉ giao hàng */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <MapPin className='h-5 w-5' />
            Địa chỉ giao hàng
          </CardTitle>
          <CardDescription>Có thể thêm nhiều điểm giao hàng</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='street'>Địa chỉ</Label>
              <Input
                id='street'
                placeholder='Số nhà, tên đường'
                value={currentAddress.street}
                onChange={(e) =>
                  setCurrentAddress({
                    ...currentAddress,
                    street: e.target.value
                  })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='ward'>Phường/Xã</Label>
              <Input
                id='ward'
                placeholder='Phường/Xã'
                value={currentAddress.ward}
                onChange={(e) =>
                  setCurrentAddress({ ...currentAddress, ward: e.target.value })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='district'>Quận/Huyện</Label>
              <Input
                id='district'
                placeholder='Quận/Huyện'
                value={currentAddress.district}
                onChange={(e) =>
                  setCurrentAddress({
                    ...currentAddress,
                    district: e.target.value
                  })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='city'>Tỉnh/Thành phố</Label>
              <Input
                id='city'
                placeholder='Tỉnh/Thành phố'
                value={currentAddress.city}
                onChange={(e) =>
                  setCurrentAddress({ ...currentAddress, city: e.target.value })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='zipCode'>Mã bưu điện</Label>
              <Input
                id='zipCode'
                placeholder='Mã bưu điện'
                value={currentAddress.zipCode}
                onChange={(e) =>
                  setCurrentAddress({
                    ...currentAddress,
                    zipCode: e.target.value
                  })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='contactName'>Người liên hệ</Label>
              <Input
                id='contactName'
                placeholder='Tên người liên hệ'
                value={currentAddress.contactName}
                onChange={(e) =>
                  setCurrentAddress({
                    ...currentAddress,
                    contactName: e.target.value
                  })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='contactPhone'>Số điện thoại</Label>
              <Input
                id='contactPhone'
                placeholder='Số điện thoại'
                value={currentAddress.contactPhone}
                onChange={(e) =>
                  setCurrentAddress({
                    ...currentAddress,
                    contactPhone: e.target.value
                  })
                }
              />
            </div>
          </div>

          <Button onClick={addDeliveryAddress} className='w-full'>
            <Plus className='mr-2 h-4 w-4' />
            Thêm địa chỉ giao hàng
          </Button>

          {/* Danh sách địa chỉ đã thêm */}
          {deliveryAddresses.length > 0 && (
            <div className='space-y-3'>
              <h4 className='font-medium'>Địa chỉ giao hàng đã thêm:</h4>
              {deliveryAddresses.map((address) => (
                <div
                  key={address.id}
                  className='flex items-center justify-between rounded-lg border p-3'
                >
                  <div className='flex-1'>
                    <p className='font-medium'>{address.contactName}</p>
                    <p className='text-sm text-gray-600'>
                      {address.street}, {address.ward}, {address.district},{' '}
                      {address.city}
                    </p>
                    <p className='text-sm text-gray-600'>
                      📞 {address.contactPhone}
                    </p>
                  </div>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => removeDeliveryAddress(address.id)}
                  >
                    <Trash2 className='h-3 w-3' />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Thông tin sản phẩm */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <ShoppingCart className='h-5 w-5' />
            Thông tin sản phẩm trong lô
          </CardTitle>
          <CardDescription>Chọn sản phẩm từ kho hàng có sẵn</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='product'>Chọn sản phẩm</Label>
              <Select
                value={selectedProductId}
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Chọn sản phẩm từ kho' />
                </SelectTrigger>
                <SelectContent>
                  {mockProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {product.category} (
                      {product.price.toLocaleString('vi-VN')} VNĐ/{product.unit}
                      )
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='quantity'>Số lượng</Label>
              <Input
                id='quantity'
                type='number'
                min='1'
                value={currentItem.quantity}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    quantity: parseInt(e.target.value) || 1
                  })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='quality'>Chất lượng, tiêu chuẩn bảo quản</Label>
              <Input
                id='quality'
                placeholder='VD: Nhiệt độ -18°C, độ ẩm 85%'
                value={currentItem.qualityRequirements}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    qualityRequirements: e.target.value
                  })
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='packaging'>Đóng gói (bao bì)</Label>
              <Select
                value={currentItem.packaging}
                onValueChange={(value) =>
                  setCurrentItem({ ...currentItem, packaging: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Chọn loại đóng gói' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='thung-xop'>Thùng xốp</SelectItem>
                  <SelectItem value='bao-nilon'>Bao nilon</SelectItem>
                  <SelectItem value='container-lanh'>Container lạnh</SelectItem>
                  <SelectItem value='thung-carton'>Thùng carton</SelectItem>
                  <SelectItem value='bao-vai'>Bao vải</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={addOrderItem} className='w-full'>
            <Plus className='mr-2 h-4 w-4' />
            Thêm sản phẩm vào lô
          </Button>

          {/* Danh sách sản phẩm đã thêm */}
          {orderItems.length > 0 && (
            <div className='space-y-3'>
              <h4 className='font-medium'>Sản phẩm trong lô:</h4>
              {orderItems.map((item) => (
                <div
                  key={item.id}
                  className='flex items-center justify-between rounded-lg border p-3'
                >
                  <div className='flex-1'>
                    <h4 className='font-medium'>{item.productName}</h4>
                    <p className='text-sm text-gray-600'>{item.category}</p>
                    <p className='text-sm text-gray-600'>
                      Chất lượng:{' '}
                      {item.qualityRequirements || 'Không yêu cầu đặc biệt'}
                    </p>
                    <p className='text-sm text-gray-600'>
                      Đóng gói: {item.packaging || 'Tiêu chuẩn'}
                    </p>
                    <p className='text-sm font-medium text-green-600'>
                      {item.price.toLocaleString('vi-VN')} VNĐ/{item.unit}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className='h-3 w-3' />
                    </Button>
                    <span className='w-8 text-center'>{item.quantity}</span>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className='h-3 w-3' />
                    </Button>
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={() => removeOrderItem(item.id)}
                    >
                      <Trash2 className='h-3 w-3' />
                    </Button>
                  </div>
                </div>
              ))}

              <Separator />

              <div className='flex items-center justify-between'>
                <span className='font-medium'>Tổng giá trị lô hàng:</span>
                <span className='text-lg font-bold text-green-600'>
                  {getTotalValue().toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Thông tin vận chuyển */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Truck className='h-5 w-5' />
            Thông tin vận chuyển
          </CardTitle>
          <CardDescription>
            Yêu cầu vận chuyển sẽ được Delivery Staff xử lý phù hợp
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='transportRequirements'>Yêu cầu vận chuyển</Label>
            <Textarea
              id='transportRequirements'
              placeholder='VD: Cần xe lạnh, Không được chồng chất, Giữ lạnh 2-8°C, Chống ẩm, Niêm phong...'
              value={transportationRequirements}
              onChange={(e) => setTransportationRequirements(e.target.value)}
              rows={3}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='deliveryTime'>Thời gian giao hàng mong muốn</Label>
            <Input
              id='deliveryTime'
              placeholder='VD: Trong 24h, Buổi sáng, Cuối tuần...'
              value={desiredDeliveryTime}
              onChange={(e) => setDesiredDeliveryTime(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Thanh toán & hợp đồng */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <DollarSign className='h-5 w-5' />
            Thanh toán & hợp đồng
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='paymentMethod'>Phương thức thanh toán</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder='Chọn phương thức thanh toán' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='cod'>
                    COD (Thanh toán khi nhận hàng)
                  </SelectItem>
                  <SelectItem value='bank-transfer'>
                    Chuyển khoản ngân hàng
                  </SelectItem>
                  <SelectItem value='lc'>Letter of Credit (LC)</SelectItem>
                  <SelectItem value='credit'>Thanh toán công nợ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='incoterms'>Điều khoản hợp đồng (Incoterms)</Label>
              <Select value={incoterms} onValueChange={setIncoterms}>
                <SelectTrigger>
                  <SelectValue placeholder='Chọn Incoterms (nếu B2B quốc tế)' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='fob'>FOB (Free On Board)</SelectItem>
                  <SelectItem value='cif'>
                    CIF (Cost, Insurance, Freight)
                  </SelectItem>
                  <SelectItem value='exw'>EXW (Ex Works)</SelectItem>
                  <SelectItem value='dap'>DAP (Delivered At Place)</SelectItem>
                  <SelectItem value='ddp'>DDP (Delivered Duty Paid)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='flex items-center space-x-2'>
            <Checkbox
              id='vatInvoice'
              checked={vatInvoice}
              onCheckedChange={(checked) => setVatInvoice(checked as boolean)}
            />
            <Label htmlFor='vatInvoice'>Xuất hóa đơn VAT</Label>
          </div>
        </CardContent>
      </Card>

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            <ul className='list-inside list-disc'>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Order */}
      <div className='flex justify-end'>
        <Button
          onClick={submitOrder}
          size='lg'
          disabled={orderItems.length === 0 || deliveryAddresses.length === 0}
        >
          <Package className='mr-2 h-4 w-4' />
          Gửi đơn hàng lô
        </Button>
      </div>
    </div>
  );
}

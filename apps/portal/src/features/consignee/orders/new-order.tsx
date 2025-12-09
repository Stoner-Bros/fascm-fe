'use client';

import { useReducer, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import PageContainer from '@/components/layout/page-container';

const AddressPickerMap = dynamic(
  () => import('@/components/map/osrm-map').then((m) => m.AddressPickerMap),
  { ssr: false }
);
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  IconShoppingCart,
  IconCalendar,
  IconMapPin,
  IconTrash,
  IconLoader2,
  IconCheck,
  IconPackage,
  IconArrowRight,
  IconArrowLeft
} from '@tabler/icons-react';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Services
import { createOrderSchedule } from '@/services/order-schedule.service';
import { fetchProducts } from '@/services/product.service';

// Types
import type { Product } from '@/types/product';
import type {
  CreateOrderScheduleDto,
  CreateOrderDto,
  CreateOrderDetailDto
} from '@/types/order';
import type { NewOrderState, NewOrderAction, OrderLine } from './types';
import { useAuth } from '@/hooks/use-auth';

// Initial state
const getInitialState = (): NewOrderState => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');

  return {
    currentStep: 'products',
    products: [],
    orderLines: [],
    selectedProducts: new Set<string>(),
    deliveryDate: `${yyyy}-${mm}-${dd}T09:00`,
    deliveryAddress: '',
    orderDescription: '',
    deliveryPos: undefined,
    showMap: false,
    loading: true,
    submitting: false
  };
};

// Reducer
const newOrderReducer = (
  state: NewOrderState,
  action: NewOrderAction
): NewOrderState => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };

    case 'SET_PRODUCTS':
      return { ...state, products: action.payload, loading: false };

    case 'SET_ORDER_LINES':
      return { ...state, orderLines: action.payload };

    case 'ADD_ORDER_LINE':
      return { ...state, orderLines: [...state.orderLines, action.payload] };

    case 'UPDATE_ORDER_LINE':
      return {
        ...state,
        orderLines: state.orderLines.map((line) =>
          line.productId === action.payload.productId
            ? { ...line, [action.payload.field]: action.payload.value }
            : line
        )
      };

    case 'REMOVE_ORDER_LINE':
      return {
        ...state,
        orderLines: state.orderLines.filter(
          (l) => l.productId !== action.payload
        )
      };

    case 'TOGGLE_PRODUCT': {
      const { product, orderLine } = action.payload;
      const newSelected = new Set(state.selectedProducts);
      const isSelected = newSelected.has(product.id);

      if (isSelected) {
        newSelected.delete(product.id);
        return {
          ...state,
          selectedProducts: newSelected,
          orderLines: state.orderLines.filter((l) => l.productId !== product.id)
        };
      } else {
        newSelected.add(product.id);
        return {
          ...state,
          selectedProducts: newSelected,
          orderLines: [...state.orderLines, orderLine]
        };
      }
    }

    case 'SET_SELECTED_PRODUCTS':
      return { ...state, selectedProducts: action.payload };

    case 'SET_DELIVERY_DATE':
      return { ...state, deliveryDate: action.payload };

    case 'SET_DELIVERY_ADDRESS':
      return { ...state, deliveryAddress: action.payload };

    case 'SET_ORDER_DESCRIPTION':
      return { ...state, orderDescription: action.payload };

    case 'SET_DELIVERY_POS':
      return { ...state, deliveryPos: action.payload };

    case 'TOGGLE_MAP':
      return { ...state, showMap: !state.showMap };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };

    case 'PREFILL_FROM_URL': {
      const { products, preSelectedIds } = action.payload;
      const validProducts = products.filter((p) =>
        preSelectedIds.includes(p.id)
      );

      return {
        ...state,
        selectedProducts: new Set(preSelectedIds),
        orderLines: validProducts.map((p) => {
          const unit =
            p.price && Array.isArray(p.price) && p.price.length > 0
              ? p.price[0].unit || 'kg'
              : 'kg';
          const unitPrice =
            p.price && Array.isArray(p.price) && p.price.length > 0
              ? p.price[0].price || 0
              : 0;

          return {
            productId: p.id,
            quantity: 1,
            unit,
            unitPrice
          };
        })
      };
    }

    default:
      return state;
  }
};

export default function NewOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { fullInfo } = useAuth();

  const [state, dispatch] = useReducer(newOrderReducer, getInitialState());
  const didFetchRef = useRef(false);
  const didPrefillAddressRef = useRef(false);

  // Prefill address from fullInfo when available
  useEffect(() => {
    if (fullInfo?.address && !didPrefillAddressRef.current) {
      dispatch({ type: 'SET_DELIVERY_ADDRESS', payload: fullInfo.address });
      didPrefillAddressRef.current = true;
    }
  }, [fullInfo?.address]);

  // Helper function to get product price
  const getProductPrice = (product: Product): number => {
    if (
      product.price &&
      Array.isArray(product.price) &&
      product.price.length > 0
    ) {
      // Get the first price entry (or you can add logic to select the right one)
      return product.price[0].price || 0;
    }
    return 0;
  };

  // Helper function to get product unit
  const getProductUnit = (product: Product): string => {
    if (
      product.price &&
      Array.isArray(product.price) &&
      product.price.length > 0
    ) {
      return product.price[0].unit || 'kg';
    }
    return 'kg';
  };

  // Fetch initial data
  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    fetchProducts({ page: 1, limit: 100 })
      .then((productsRes) => {
        const productsData = Array.isArray(productsRes?.data)
          ? productsRes.data
          : [];

        dispatch({ type: 'SET_PRODUCTS', payload: productsData });

        // Check for pre-selected products from URL
        const preSelectedIds = searchParams.getAll('product');
        if (preSelectedIds.length > 0) {
          dispatch({
            type: 'PREFILL_FROM_URL',
            payload: { products: productsData, preSelectedIds }
          });
        }
      })
      .catch(() => {
        dispatch({ type: 'SET_LOADING', payload: false });
        toast({
          title: 'Lỗi',
          description: 'Không thể tải dữ liệu. Vui lòng thử lại.',
          variant: 'destructive'
        });
      });
  }, [searchParams, toast]);

  // Product selection handlers
  const toggleProduct = (product: Product) => {
    const orderLine: OrderLine = {
      productId: product.id,
      quantity: 1,
      unit: getProductUnit(product),
      unitPrice: getProductPrice(product)
    };

    dispatch({ type: 'TOGGLE_PRODUCT', payload: { product, orderLine } });
  };

  // Update order line
  const updateOrderLine = (
    productId: string,
    field: keyof OrderLine,
    value: any
  ) => {
    dispatch({
      type: 'UPDATE_ORDER_LINE',
      payload: { productId, field, value }
    });
  };

  // Calculate totals
  const calculateTotal = () => {
    return state.orderLines.reduce(
      (sum, line) => sum + line.quantity * line.unitPrice,
      0
    );
  };

  // Validation
  const canProceedToDelivery = () => {
    return (
      state.orderLines.length > 0 &&
      state.orderLines.every((l) => l.quantity > 0)
    );
  };

  const canProceedToReview = () => {
    return state.deliveryAddress.trim() !== '' && state.deliveryDate !== '';
  };

  // Submit order
  const handleSubmit = async () => {
    dispatch({ type: 'SET_SUBMITTING', payload: true });
    try {
      const orderData: CreateOrderDto = {
        orderNumber: null,
        orderUrl: null
      };

      const orderDetails: CreateOrderDetailDto[] = state.orderLines.map(
        (line) => ({
          unitPrice: line.unitPrice,
          quantity: line.quantity,
          unit: line.unit,
          product: line.productId ? { id: line.productId } : null
        })
      );

      const payload: CreateOrderScheduleDto = {
        description: state.orderDescription || null,
        deliveryDate: new Date(state.deliveryDate).toISOString(),
        address: state.deliveryAddress,
        order: orderData,
        orderDetails: orderDetails
      };

      await createOrderSchedule(payload);

      toast({
        title: 'Thành công!',
        description: 'Đơn hàng của bạn đã được tạo thành công.',
        variant: 'default'
      });

      router.push('/consignee/orders');
    } catch (err: any) {
      toast({
        title: 'Lỗi',
        description:
          err?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.',
        variant: 'destructive'
      });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  };

  // Steps navigation
  const steps = [
    { id: 'products', label: 'Chọn sản phẩm', icon: IconPackage },
    { id: 'delivery', label: 'Thông tin giao hàng', icon: IconMapPin },
    { id: 'review', label: 'Xác nhận', icon: IconCheck }
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === state.currentStep);

  if (state.loading) {
    return (
      <PageContainer>
        <div className='flex h-[60vh] flex-1 items-center justify-center'>
          <IconLoader2 className='text-muted-foreground h-8 w-8 animate-spin' />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className='mx-auto w-full max-w-6xl space-y-6 pb-12'>
        {/* Header */}
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Tạo đơn hàng mới
          </h1>
          <p className='text-muted-foreground mt-2'>
            Chọn sản phẩm và điền thông tin giao hàng
          </p>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardContent className='flex items-center justify-center'>
            <div className='flex w-full max-w-3xl items-center justify-center'>
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.id === state.currentStep;
                const isCompleted = index < currentStepIndex;

                return (
                  <div key={step.id} className='flex flex-1 items-center'>
                    <div className='flex w-fit flex-1 flex-col items-center gap-2'>
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors',
                          isActive &&
                            'border-primary bg-primary text-primary-foreground',
                          isCompleted &&
                            'border-primary bg-primary text-primary-foreground',
                          !isActive &&
                            !isCompleted &&
                            'border-muted bg-muted text-muted-foreground'
                        )}
                      >
                        {isCompleted ? (
                          <IconCheck className='h-5 w-5' />
                        ) : (
                          <Icon className='h-5 w-5' />
                        )}
                      </div>
                      <span
                        className={cn(
                          'text-center text-sm font-medium',
                          isActive && 'text-primary',
                          !isActive && 'text-muted-foreground'
                        )}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          'h-0.5 w-full max-w-[100px] transition-colors',
                          isCompleted ? 'bg-primary' : 'bg-muted'
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {state.currentStep === 'products' && (
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconPackage className='h-5 w-5' />
                  Chọn sản phẩm
                </CardTitle>
                <CardDescription>
                  Chọn các sản phẩm bạn muốn đặt hàng
                  {state.selectedProducts.size > 0 && (
                    <Badge variant='secondary' className='ml-2'>
                      Đã chọn: {state.selectedProducts.size}
                    </Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {state.products.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-12 text-center'>
                    <IconPackage className='text-muted-foreground mb-4 h-12 w-12' />
                    <p className='text-muted-foreground'>
                      Không có sản phẩm nào
                    </p>
                  </div>
                ) : (
                  <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                    {state.products.map((product) => {
                      const isSelected = state.selectedProducts.has(product.id);
                      return (
                        <Card
                          key={product.id}
                          className={cn(
                            'cursor-pointer transition-all hover:shadow-md',
                            isSelected && 'ring-primary ring-2'
                          )}
                          onClick={() => toggleProduct(product)}
                        >
                          <CardContent className='p-4'>
                            <div className='flex items-start gap-3'>
                              {product.image ? (
                                <div className='relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md'>
                                  <Image
                                    src={product.image}
                                    alt={product.name || 'Product'}
                                    fill
                                    className='object-cover'
                                  />
                                </div>
                              ) : (
                                <div className='bg-muted flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md'>
                                  <IconPackage className='text-muted-foreground h-6 w-6' />
                                </div>
                              )}
                              <div className='min-w-0 flex-1'>
                                <h4 className='line-clamp-2 font-semibold'>
                                  {product.name}
                                </h4>
                                <p className='text-primary mt-1 text-sm font-medium'>
                                  {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                  }).format(getProductPrice(product))}
                                  /{getProductUnit(product)}
                                </p>
                              </div>
                              {isSelected && (
                                <IconCheck className='text-primary h-5 w-5 flex-shrink-0' />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {state.orderLines.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Nhập số lượng</CardTitle>
                  <CardDescription>
                    Điều chỉnh số lượng cho từng sản phẩm
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {state.orderLines.map((line) => {
                      const product = state.products.find(
                        (p) => p.id === line.productId
                      );
                      if (!product) return null;

                      const lineTotal = line.quantity * line.unitPrice;

                      return (
                        <div
                          key={line.productId}
                          className='bg-muted/50 flex flex-col gap-4 rounded-lg p-4 sm:flex-row sm:items-center'
                        >
                          <div className='flex flex-1 items-center gap-3'>
                            {product.image ? (
                              <div className='relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md'>
                                <Image
                                  src={product.image}
                                  alt={product.name || 'Product'}
                                  fill
                                  className='object-cover'
                                />
                              </div>
                            ) : (
                              <div className='bg-muted flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md'>
                                <IconPackage className='text-muted-foreground h-5 w-5' />
                              </div>
                            )}
                            <div className='min-w-0 flex-1'>
                              <h4 className='line-clamp-1 font-medium'>
                                {product.name}
                              </h4>
                              <p className='text-muted-foreground text-sm'>
                                {new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND'
                                }).format(line.unitPrice)}
                                /{line.unit}
                              </p>
                            </div>
                          </div>

                          <div className='flex items-center gap-3'>
                            <div className='flex items-center gap-2'>
                              <Label className='text-sm'>Số lượng:</Label>
                              <Input
                                type='number'
                                min='1'
                                step='1'
                                value={line.quantity}
                                onChange={(e) =>
                                  updateOrderLine(
                                    line.productId!,
                                    'quantity',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className='w-24'
                              />
                            </div>

                            <div className='flex items-center gap-2'>
                              <Select
                                value={line.unit}
                                onValueChange={(value) =>
                                  updateOrderLine(
                                    line.productId!,
                                    'unit',
                                    value
                                  )
                                }
                              >
                                <SelectTrigger className='w-20'>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='kg'>Kg</SelectItem>
                                  {/* <SelectItem value='tấn'>Tấn</SelectItem>
                                  <SelectItem value='l'>L</SelectItem> */}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className='text-primary min-w-[100px] text-right font-semibold'>
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(lineTotal)}
                            </div>

                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => toggleProduct(product)}
                              className='text-destructive hover:text-destructive'
                            >
                              <IconTrash className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Separator className='my-6' />

                  <div className='flex items-center justify-between'>
                    <span className='text-lg font-semibold'>
                      Tổng tạm tính:
                    </span>
                    <span className='text-primary text-2xl font-bold'>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(calculateTotal())}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {state.currentStep === 'delivery' && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconMapPin className='h-5 w-5' />
                Thông tin giao hàng
              </CardTitle>
              <CardDescription>
                Nhập địa chỉ và thời gian giao hàng mong muốn
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {fullInfo && (
                <div className='bg-muted/50 rounded-lg p-4'>
                  <h4 className='mb-3 font-semibold'>Thông tin người nhận</h4>
                  <div className='grid gap-3 sm:grid-cols-2'>
                    <div>
                      <Label className='text-muted-foreground text-xs'>
                        Tổ chức
                      </Label>
                      <p className='font-medium'>
                        {fullInfo.organizationName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className='text-muted-foreground text-xs'>
                        Người đại diện
                      </Label>
                      <p className='font-medium'>
                        {fullInfo.representativeName || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className='space-y-2'>
                <Label htmlFor='delivery-date'>
                  Ngày & giờ giao hàng{' '}
                  <span className='text-destructive'>*</span>
                </Label>
                <DateTimePicker
                  value={state.deliveryDate}
                  onChange={(value) =>
                    dispatch({ type: 'SET_DELIVERY_DATE', payload: value })
                  }
                  placeholder='Chọn ngày và giờ giao hàng'
                />
                <p className='text-muted-foreground text-xs'>
                  Chọn thời gian bạn muốn nhận hàng
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='delivery-address'>
                  Địa chỉ giao hàng <span className='text-destructive'>*</span>
                </Label>
                <Textarea
                  id='delivery-address'
                  value={state.deliveryAddress}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_DELIVERY_ADDRESS',
                      payload: e.target.value
                    })
                  }
                  placeholder='Nhập địa chỉ giao hàng chi tiết...'
                  rows={3}
                  className='resize-none'
                />
              </div>

              <div className='space-y-3'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => dispatch({ type: 'TOGGLE_MAP' })}
                >
                  {state.showMap ? 'Đóng bản đồ' : 'Chọn vị trí trên bản đồ'}
                </Button>
                {state.showMap && (
                  <div className='rounded-lg border p-2'>
                    <AddressPickerMap
                      value={{
                        position: state.deliveryPos,
                        address: state.deliveryAddress
                      }}
                      onChange={(v) => {
                        dispatch({
                          type: 'SET_DELIVERY_ADDRESS',
                          payload: v.address
                        });
                        dispatch({
                          type: 'SET_DELIVERY_POS',
                          payload: v.position
                        });
                      }}
                    />
                  </div>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='order-description'>Ghi chú đơn hàng</Label>
                <Textarea
                  id='order-description'
                  value={state.orderDescription}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_ORDER_DESCRIPTION',
                      payload: e.target.value
                    })
                  }
                  placeholder='Thêm ghi chú hoặc yêu cầu đặc biệt...'
                  rows={3}
                  className='resize-none'
                />
              </div>
            </CardContent>
          </Card>
        )}

        {state.currentStep === 'review' && (
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <IconCheck className='h-5 w-5' />
                  Xác nhận đơn hàng
                </CardTitle>
                <CardDescription>
                  Kiểm tra lại thông tin trước khi gửi đơn hàng
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Order items */}
                <div>
                  <h4 className='mb-3 font-semibold'>Sản phẩm đã chọn</h4>
                  <div className='space-y-3'>
                    {state.orderLines.map((line) => {
                      const product = state.products.find(
                        (p) => p.id === line.productId
                      );
                      if (!product) return null;

                      return (
                        <div
                          key={line.productId}
                          className='flex items-center justify-between rounded-lg border p-3'
                        >
                          <div className='flex items-center gap-3'>
                            {product.image ? (
                              <div className='relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md'>
                                <Image
                                  src={product.image}
                                  alt={product.name || 'Product'}
                                  fill
                                  className='object-cover'
                                />
                              </div>
                            ) : (
                              <div className='bg-muted flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md'>
                                <IconPackage className='text-muted-foreground h-5 w-5' />
                              </div>
                            )}
                            <div>
                              <p className='font-medium'>{product.name}</p>
                              <p className='text-muted-foreground text-sm'>
                                {line.quantity} {line.unit} ×{' '}
                                {new Intl.NumberFormat('vi-VN', {
                                  style: 'currency',
                                  currency: 'VND'
                                }).format(line.unitPrice)}
                              </p>
                            </div>
                          </div>
                          <p className='text-primary font-semibold'>
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND'
                            }).format(line.quantity * line.unitPrice)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Delivery info */}
                <div>
                  <h4 className='mb-3 font-semibold'>Thông tin giao hàng</h4>
                  <div className='bg-muted/50 space-y-2 rounded-lg p-4'>
                    <div className='flex items-start gap-2'>
                      <IconCalendar className='text-muted-foreground mt-0.5 h-4 w-4' />
                      <div>
                        <p className='text-muted-foreground text-xs'>
                          Thời gian giao hàng
                        </p>
                        <p className='font-medium'>
                          {new Date(state.deliveryDate).toLocaleString(
                            'vi-VN',
                            {
                              dateStyle: 'full',
                              timeStyle: 'short'
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-start gap-2'>
                      <IconMapPin className='text-muted-foreground mt-0.5 h-4 w-4' />
                      <div>
                        <p className='text-muted-foreground text-xs'>Địa chỉ</p>
                        <p className='font-medium'>{state.deliveryAddress}</p>
                      </div>
                    </div>
                    {state.orderDescription && (
                      <div className='flex items-start gap-2'>
                        <IconShoppingCart className='text-muted-foreground mt-0.5 h-4 w-4' />
                        <div>
                          <p className='text-muted-foreground text-xs'>
                            Ghi chú
                          </p>
                          <p className='font-medium'>
                            {state.orderDescription}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className='bg-primary/5 rounded-lg p-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-xl font-semibold'>
                      Tổng thanh toán:
                    </span>
                    <span className='text-primary text-3xl font-bold'>
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(calculateTotal())}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className='flex items-center justify-between gap-4'>
          <Button
            variant='outline'
            onClick={() => {
              if (state.currentStep === 'products') {
                router.push('/consignee/orders');
              } else if (state.currentStep === 'delivery') {
                dispatch({ type: 'SET_STEP', payload: 'products' });
              } else if (state.currentStep === 'review') {
                dispatch({ type: 'SET_STEP', payload: 'delivery' });
              }
            }}
            disabled={state.submitting}
          >
            <IconArrowLeft className='mr-2 h-4 w-4' />
            {state.currentStep === 'products' ? 'Hủy bỏ' : 'Quay lại'}
          </Button>

          <div className='flex gap-3'>
            {state.currentStep === 'products' && (
              <Button
                onClick={() =>
                  dispatch({ type: 'SET_STEP', payload: 'delivery' })
                }
                disabled={!canProceedToDelivery()}
              >
                Tiếp theo
                <IconArrowRight className='ml-2 h-4 w-4' />
              </Button>
            )}

            {state.currentStep === 'delivery' && (
              <Button
                onClick={() =>
                  dispatch({ type: 'SET_STEP', payload: 'review' })
                }
                disabled={!canProceedToReview()}
              >
                Tiếp theo
                <IconArrowRight className='ml-2 h-4 w-4' />
              </Button>
            )}

            {state.currentStep === 'review' && (
              <Button
                onClick={handleSubmit}
                disabled={state.submitting}
                size='lg'
              >
                {state.submitting ? (
                  <>
                    <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <IconCheck className='mr-2 h-4 w-4' />
                    Xác nhận đặt hàng
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

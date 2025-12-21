'use client';

import { useReducer, useEffect, useRef, useState } from 'react';
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
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Services
import { createOrderSchedule } from '@/services/order-schedule.service';
import { fetchProducts } from '@/services/product.service';
import { fetchBatches } from '@/services/batch.service';

// Types
import type { Product, ProductPrice } from '@/types/product';
import type { Batch } from '@/types/batch';
import type {
  CreateOrderScheduleDto,
  CreateOrderDto,
  CreateOrderDetailDto
} from '@/types/order';
import type { NewOrderState, NewOrderAction, OrderLine } from './types';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';

type Suggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

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
    productBatches: {},
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

    case 'SET_PRODUCT_BATCHES':
      return {
        ...state,
        productBatches: {
          ...state.productBatches,
          [action.payload.productId]: action.payload.batches
        }
      };

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
          // Use price tier logic for quantity = 1
          let unit = 'kg';
          let unitPrice = 0;

          if (p.price && Array.isArray(p.price) && p.price.length > 0) {
            // Sort price tiers by quantity in descending order
            const sortedPrices = [...p.price].sort(
              (a, b) => (b.quantity || 0) - (a.quantity || 0)
            );

            // Find the appropriate price tier for quantity = 1
            const applicableTier = sortedPrices.find(
              (tier) => 1 >= (tier.quantity || 0)
            );

            if (applicableTier) {
              unitPrice = applicableTier.price || 0;
              unit = applicableTier.unit || 'kg';
            } else {
              // Use the lowest tier
              const lowestTier = sortedPrices[sortedPrices.length - 1];
              unitPrice = lowestTier.price || 0;
              unit = lowestTier.unit || 'kg';
            }
          }

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
  const t = useTranslations('Orders');

  const [state, dispatch] = useReducer(newOrderReducer, getInitialState());
  const didFetchRef = useRef(false);
  const didPrefillAddressRef = useRef(false);

  // Address autocomplete state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&addressdetails=1&limit=5&countrycodes=vn&accept-language=vi`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 240) {
      dispatch({ type: 'SET_DELIVERY_ADDRESS', payload: value });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 500);
    }
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    const address = suggestion.display_name;
    const truncatedAddress =
      address.length > 240 ? address.substring(0, 240) : address;

    dispatch({ type: 'SET_DELIVERY_ADDRESS', payload: truncatedAddress });
    dispatch({
      type: 'SET_DELIVERY_POS',
      payload: {
        lat: parseFloat(suggestion.lat),
        lng: parseFloat(suggestion.lon)
      }
    });
    setShowSuggestions(false);
  };

  // Prefill address from fullInfo when available
  useEffect(() => {
    if (fullInfo?.address && !didPrefillAddressRef.current) {
      dispatch({ type: 'SET_DELIVERY_ADDRESS', payload: fullInfo.address });
      didPrefillAddressRef.current = true;
    }
  }, [fullInfo?.address]);

  // Helper function to calculate price based on quantity and price tiers
  const calculatePriceForQuantity = (
    product: Product,
    quantity: number
  ): { unitPrice: number; unit: string } => {
    if (
      !product.price ||
      !Array.isArray(product.price) ||
      product.price.length === 0
    ) {
      return { unitPrice: 0, unit: 'kg' };
    }

    // Sort price tiers by quantity in descending order
    const sortedPrices = [...product.price].sort(
      (a, b) => (b.quantity || 0) - (a.quantity || 0)
    );

    // Find the appropriate price tier based on quantity
    const applicableTier = sortedPrices.find(
      (tier) => quantity >= (tier.quantity || 0)
    );

    if (applicableTier) {
      return {
        unitPrice: applicableTier.price || 0,
        unit: applicableTier.unit || 'kg'
      };
    }

    // If no tier matches, use the lowest tier (last in sorted array)
    const lowestTier = sortedPrices[sortedPrices.length - 1];
    return {
      unitPrice: lowestTier.price || 0,
      unit: lowestTier.unit || 'kg'
    };
  };

  // Helper function to get default unit from product

  // Helper function to get price tiers for display
  const getPriceTiers = (product: Product): ProductPrice[] => {
    if (
      !product.price ||
      !Array.isArray(product.price) ||
      product.price.length === 0
    ) {
      return [];
    }
    // Sort by quantity ascending for display
    return [...product.price].sort(
      (a, b) => (a.quantity || 0) - (b.quantity || 0)
    );
  };

  const calculateBatchPrice = (
    batch: Batch,
    quantity: number
  ): { unitPrice: number; unit: string } => {
    if (
      !batch.price ||
      !Array.isArray(batch.price) ||
      batch.price.length === 0
    ) {
      return { unitPrice: 0, unit: batch.unit };
    }

    // Sort price tiers by quantity in descending order
    const sortedPrices = [...batch.price].sort(
      (a, b) => (b.quantity || 0) - (a.quantity || 0)
    );

    // Find the appropriate price tier based on quantity
    const applicableTier = sortedPrices.find(
      (tier) => quantity >= (tier.quantity || 0)
    );

    if (applicableTier) {
      return {
        unitPrice: applicableTier.price || 0,
        unit: applicableTier.unit || batch.unit
      };
    }

    // If no tier matches, use the lowest tier (last in sorted array)
    const lowestTier = sortedPrices[sortedPrices.length - 1];
    return {
      unitPrice: lowestTier.price || 0,
      unit: lowestTier.unit || batch.unit
    };
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
          title: t('newOrder.toast.errorTitle'),
          description: t('newOrder.toast.errorDescription'),
          variant: 'destructive'
        });
      });
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Handle batch change
  const handleBatchChange = (
    productId: string,
    batchId: string,
    providedBatches?: Batch[]
  ) => {
    const batches = providedBatches || state.productBatches[productId] || [];
    const batch = batches.find((b) => b.id === batchId);

    if (batch) {
      const currentLine = state.orderLines.find(
        (l) => l.productId === productId
      );
      const quantity = currentLine?.quantity || 1;

      const { unitPrice, unit } = calculateBatchPrice(batch, quantity);

      dispatch({
        type: 'UPDATE_ORDER_LINE',
        payload: { productId, field: 'batchId', value: batch.id }
      });
      dispatch({
        type: 'UPDATE_ORDER_LINE',
        payload: { productId, field: 'batchCode', value: batch.batchCode }
      });
      dispatch({
        type: 'UPDATE_ORDER_LINE',
        payload: { productId, field: 'unitPrice', value: unitPrice }
      });
      dispatch({
        type: 'UPDATE_ORDER_LINE',
        payload: { productId, field: 'unit', value: unit }
      });
    }
  };

  // Product selection handlers
  const toggleProduct = (product: Product) => {
    const isSelected = state.selectedProducts.has(product.id);

    if (!isSelected) {
      // Fetch batches
      fetchBatches({ productId: product.id, limit: 100 })
        .then((res) => {
          const batches = res?.data || [];
          dispatch({
            type: 'SET_PRODUCT_BATCHES',
            payload: { productId: product.id, batches }
          });

          // Auto-select first batch if available
          if (batches.length > 0) {
            handleBatchChange(product.id, batches[0].id, batches);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch batches', err);
        });
    }

    const { unitPrice, unit } = calculatePriceForQuantity(product, 1);
    const orderLine: OrderLine = {
      productId: product.id,
      quantity: 1,
      unit,
      unitPrice
    };

    dispatch({ type: 'TOGGLE_PRODUCT', payload: { product, orderLine } });
  };

  // Update order line
  const updateOrderLine = (
    productId: string,
    field: keyof OrderLine,
    value: any
  ) => {
    // If quantity is being updated, recalculate the price
    if (field === 'quantity') {
      const product = state.products.find((p) => p.id === productId);
      const currentLine = state.orderLines.find(
        (l) => l.productId === productId
      );

      if (product) {
        let unitPrice = 0;
        let unit = 'kg';

        // Check if batch is selected
        const batchId = currentLine?.batchId;
        if (batchId) {
          const batches = state.productBatches[productId];
          const batch = batches?.find((b) => b.id === batchId);
          if (batch) {
            const res = calculateBatchPrice(batch, value);
            unitPrice = res.unitPrice;
            unit = res.unit;
          }
        } else {
          const res = calculatePriceForQuantity(product, value);
          unitPrice = res.unitPrice;
          unit = res.unit;
        }

        // Update both quantity and unitPrice
        dispatch({
          type: 'UPDATE_ORDER_LINE',
          payload: { productId, field: 'quantity', value }
        });
        dispatch({
          type: 'UPDATE_ORDER_LINE',
          payload: { productId, field: 'unitPrice', value: unitPrice }
        });
        dispatch({
          type: 'UPDATE_ORDER_LINE',
          payload: { productId, field: 'unit', value: unit }
        });
        return;
      }
    }

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

      const groupedLines = state.orderLines.reduce(
        (acc, line) => {
          if (!line.productId) return acc;

          if (!acc[line.productId]) {
            acc[line.productId] = {
              quantity: 0,
              unit: line.unit,
              product: { id: line.productId },
              batchInfo: []
            };
          }

          // Add to total quantity
          acc[line.productId].quantity =
            (acc[line.productId].quantity || 0) + line.quantity;

          // Add batch info if available
          if (line.batchId) {
            if (!acc[line.productId].batchInfo) {
              acc[line.productId].batchInfo = [];
            }
            acc[line.productId].batchInfo!.push({
              batchId: line.batchId,
              quantity: line.quantity,
              unit: line.unit,
              unitPrice: line.unitPrice
            });
          }

          return acc;
        },
        {} as Record<string, CreateOrderDetailDto>
      );

      const orderDetails: CreateOrderDetailDto[] = Object.values(groupedLines);

      const payload: CreateOrderScheduleDto = {
        description: state.orderDescription || null,
        deliveryDate: new Date(state.deliveryDate).toISOString(),
        address: state.deliveryAddress,
        order: orderData,
        orderDetails: orderDetails
      };

      await createOrderSchedule(payload);

      toast({
        title: t('newOrder.toast.successTitle'),
        description: t('newOrder.toast.successDescription'),
        variant: 'default'
      });

      router.push('/consignee/orders');
    } catch (err: any) {
      toast({
        title: t('newOrder.toast.errorCreateTitle'),
        description: err?.message || t('newOrder.toast.errorCreateDescription'),
        variant: 'destructive'
      });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  };

  // Steps navigation
  const steps = [
    { id: 'products', label: t('newOrder.steps.products'), icon: IconPackage },
    { id: 'delivery', label: t('newOrder.steps.delivery'), icon: IconMapPin },
    { id: 'review', label: t('newOrder.steps.review'), icon: IconCheck }
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
            {t('newOrder.title')}
          </h1>
          <p className='text-muted-foreground mt-2'>{t('newOrder.subtitle')}</p>
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
                  {t('newOrder.products.title')}
                </CardTitle>
                <CardDescription>
                  {t('newOrder.products.description')}
                  {state.selectedProducts.size > 0 && (
                    <Badge variant='secondary' className='ml-2'>
                      {t('newOrder.products.selected')}:{' '}
                      {state.selectedProducts.size}
                    </Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {state.products.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-12 text-center'>
                    <IconPackage className='text-muted-foreground mb-4 h-12 w-12' />
                    <p className='text-muted-foreground'>
                      {t('newOrder.products.empty')}
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
                                <div className='mt-1 space-y-1'>
                                  {getPriceTiers(product).length > 0 ? (
                                    getPriceTiers(product).map((tier, idx) => (
                                      <p
                                        key={idx}
                                        className='text-primary text-xs font-medium'
                                      >
                                        {new Intl.NumberFormat('vi-VN', {
                                          style: 'currency',
                                          currency: 'VND'
                                        }).format(tier.price || 0)}
                                        /{tier.unit || 'kg'}
                                        <span className='text-muted-foreground ml-1'>
                                          (≥{tier.quantity || 0}
                                          {tier.unit || 'kg'})
                                        </span>
                                      </p>
                                    ))
                                  ) : (
                                    <p className='text-muted-foreground text-xs'>
                                      Liên hệ
                                    </p>
                                  )}
                                </div>
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
                  <CardTitle>
                    {t('newOrder.products.enterQuantityTitle')}
                  </CardTitle>
                  <CardDescription>
                    {t('newOrder.products.enterQuantityDescription')}
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
                              <div className='space-y-0.5'>
                                <p className='text-muted-foreground text-sm'>
                                  {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                  }).format(line.unitPrice)}
                                  /{line.unit}
                                </p>
                                {getPriceTiers(product).length > 1 && (
                                  <p className='text-muted-foreground/70 text-xs'>
                                    {getPriceTiers(product).length} bậc giá có
                                    sẵn
                                  </p>
                                )}
                              </div>
                              {state.productBatches[product.id] &&
                                state.productBatches[product.id].length > 0 && (
                                  <div className='mt-2'>
                                    <Select
                                      value={line.batchId}
                                      onValueChange={(val) =>
                                        handleBatchChange(product.id, val)
                                      }
                                    >
                                      <SelectTrigger className='h-8 w-full max-w-[400px] text-xs'>
                                        <SelectValue placeholder='Select batch' />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {state.productBatches[product.id].map(
                                          (batch) => (
                                            <SelectItem
                                              key={batch.id}
                                              value={batch.id}
                                              className='text-xs'
                                            >
                                              {batch.batchCode}
                                              {batch.expiredAt &&
                                                ` - Exp: ${new Date(
                                                  batch.expiredAt
                                                ).toLocaleDateString('vi-VN')}`}
                                              {batch.currentQuantity !==
                                                undefined &&
                                                ` - Qty: ${batch.currentQuantity}`}
                                            </SelectItem>
                                          )
                                        )}
                                      </SelectContent>
                                    </Select>

                                    {(() => {
                                      const selectedBatch =
                                        state.productBatches[product.id]?.find(
                                          (b) => b.id === line.batchId
                                        );

                                      if (!selectedBatch) return null;

                                      return (
                                        <div className='mt-2 max-w-[400px]'>
                                          <Tabs
                                            defaultValue='batch'
                                            className='w-full'
                                          >
                                            <TabsList className='grid h-8 w-full grid-cols-2'>
                                              <TabsTrigger
                                                value='batch'
                                                className='h-6 text-xs'
                                              >
                                                {t(
                                                  'newOrder.products.batchInfo'
                                                )}
                                              </TabsTrigger>
                                              <TabsTrigger
                                                value='supplier'
                                                className='h-6 text-xs'
                                              >
                                                {t(
                                                  'newOrder.products.supplierInfo'
                                                )}
                                              </TabsTrigger>
                                            </TabsList>
                                            <TabsContent
                                              value='batch'
                                              className='bg-muted/30 mt-2 h-[400px] space-y-1 rounded-md p-2 text-xs'
                                            >
                                              <div className='flex justify-between'>
                                                <span className='text-muted-foreground'>
                                                  {t(
                                                    'newOrder.products.createdAt'
                                                  )}
                                                  :
                                                </span>
                                                <span className='font-medium'>
                                                  {selectedBatch.createdAt
                                                    ? new Date(
                                                        selectedBatch.createdAt
                                                      ).toLocaleDateString(
                                                        'vi-VN'
                                                      )
                                                    : t('common.notSpecified')}
                                                </span>
                                              </div>
                                              <div className='flex justify-between'>
                                                <span className='text-muted-foreground'>
                                                  {t(
                                                    'newOrder.products.expiryDate'
                                                  )}
                                                  :
                                                </span>
                                                <span className='font-medium'>
                                                  {selectedBatch.expiredAt
                                                    ? new Date(
                                                        selectedBatch.expiredAt
                                                      ).toLocaleDateString(
                                                        'vi-VN'
                                                      )
                                                    : 'N/A'}
                                                </span>
                                              </div>
                                              <div className='flex justify-between'>
                                                <span className='text-muted-foreground'>
                                                  {t(
                                                    'newOrder.products.quantity'
                                                  )}
                                                  :
                                                </span>
                                                <span className='font-medium'>
                                                  {
                                                    selectedBatch.currentQuantity
                                                  }{' '}
                                                  {selectedBatch.unit}
                                                </span>
                                              </div>
                                            </TabsContent>
                                            <TabsContent
                                              value='supplier'
                                              className='bg-muted/30 mt-2 h-[400px] space-y-1 rounded-md p-2 text-xs'
                                            >
                                              <div className='flex justify-between'>
                                                <span className='text-muted-foreground'>
                                                  {t(
                                                    'newOrder.products.gardenName'
                                                  )}
                                                  :
                                                </span>
                                                <span className='font-medium'>
                                                  {selectedBatch.gardenName ||
                                                    'N/A'}
                                                </span>
                                              </div>
                                              <div className='flex justify-between'>
                                                <span className='text-muted-foreground'>
                                                  {t(
                                                    'newOrder.products.harvestDate'
                                                  )}
                                                  :
                                                </span>
                                                <span className='font-medium'>
                                                  {selectedBatch.harvestDate
                                                    ? new Date(
                                                        selectedBatch.harvestDate
                                                      ).toLocaleDateString(
                                                        'vi-VN'
                                                      )
                                                    : 'N/A'}
                                                </span>
                                              </div>
                                              <div className='flex justify-between'>
                                                <span className='text-muted-foreground'>
                                                  {t(
                                                    'newOrder.products.updatedAt'
                                                  )}
                                                  :
                                                </span>
                                                <span className='font-medium'>
                                                  {selectedBatch.updatedAt
                                                    ? new Date(
                                                        selectedBatch.updatedAt
                                                      ).toLocaleDateString(
                                                        'vi-VN'
                                                      )
                                                    : 'N/A'}
                                                </span>
                                              </div>
                                            </TabsContent>
                                          </Tabs>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                )}
                            </div>
                          </div>

                          <div className='flex items-center gap-3'>
                            <div className='flex items-center gap-2'>
                              <Label className='text-sm'>
                                {t('newOrder.products.quantity')}:
                              </Label>
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
                                onKeyDown={(e) => {
                                  // Prevent arrow keys from incrementing/decrementing the value
                                  if (
                                    e.key === 'ArrowUp' ||
                                    e.key === 'ArrowDown'
                                  ) {
                                    e.preventDefault();
                                  }
                                }}
                                className='w-24 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
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
                      {t('newOrder.products.total')}:
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
                {t('newOrder.delivery.title')}
              </CardTitle>
              <CardDescription>
                {t('newOrder.delivery.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {fullInfo && (
                <div className='bg-muted/50 rounded-lg p-4'>
                  <h4 className='mb-3 font-semibold'>
                    {t('newOrder.delivery.receiverInfoTitle')}
                  </h4>
                  <div className='grid gap-3 sm:grid-cols-2'>
                    <div>
                      <Label className='text-muted-foreground text-xs'>
                        {t('newOrder.delivery.organizationLabel')}
                      </Label>
                      <p className='font-medium'>
                        {fullInfo.organizationName || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className='text-muted-foreground text-xs'>
                        {t('newOrder.delivery.representativeLabel')}
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
                  {t('newOrder.delivery.deliveryDate')}{' '}
                  <span className='text-destructive'>*</span>
                </Label>
                <DateTimePicker
                  value={state.deliveryDate}
                  onChange={(value) =>
                    dispatch({ type: 'SET_DELIVERY_DATE', payload: value })
                  }
                  placeholder={t('newOrder.delivery.deliveryDate')}
                />
              </div>

              <div className='space-y-2' ref={wrapperRef}>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='delivery-address'>
                    {t('newOrder.delivery.deliveryAddress')}{' '}
                    <span className='text-destructive'>*</span>
                  </Label>
                  <span className='text-muted-foreground text-xs'>
                    {state.deliveryAddress.length}/240
                  </span>
                </div>
                <div className='relative'>
                  <Textarea
                    id='delivery-address'
                    value={state.deliveryAddress}
                    onChange={handleAddressChange}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    placeholder={t('newOrder.delivery.deliveryAddress')}
                    rows={3}
                    className='resize-none'
                    maxLength={240}
                  />
                  {isLoadingSuggestions && (
                    <div className='absolute top-2 right-2'>
                      <Loader2 className='text-muted-foreground h-4 w-4 animate-spin' />
                    </div>
                  )}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className='bg-popover text-popover-foreground absolute top-full z-50 mt-1 w-full rounded-md border shadow-md'>
                      <ScrollArea className='h-[200px]'>
                        <div className='p-1'>
                          {suggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className='hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-start gap-2 rounded-sm px-2 py-1.5 text-sm'
                              onClick={() => handleSelectSuggestion(suggestion)}
                            >
                              <IconMapPin className='mt-0.5 h-4 w-4 shrink-0 opacity-50' />
                              <span>{suggestion.display_name}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </div>

              <div className='space-y-3'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => dispatch({ type: 'TOGGLE_MAP' })}
                >
                  {state.showMap
                    ? t('newOrder.buttons.cancel')
                    : t('newOrder.delivery.selectOnMap')}
                </Button>
                {state.showMap && (
                  <div className='rounded-lg border p-2'>
                    <AddressPickerMap
                      value={{
                        position: state.deliveryPos,
                        address: state.deliveryAddress
                      }}
                      onChange={(v) => {
                        const addr = v.address || '';
                        const truncated =
                          addr.length > 240 ? addr.slice(0, 240) : addr;
                        dispatch({
                          type: 'SET_DELIVERY_ADDRESS',
                          payload: truncated
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
                <div className='flex items-center justify-between'>
                  <Label htmlFor='order-description'>
                    {t('newOrder.delivery.orderDescription')}
                  </Label>
                  <span className='text-muted-foreground text-xs'>
                    {state.orderDescription.length}/240
                  </span>
                </div>
                <Textarea
                  id='order-description'
                  value={state.orderDescription}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 240) {
                      dispatch({
                        type: 'SET_ORDER_DESCRIPTION',
                        payload: value
                      });
                    }
                  }}
                  placeholder={t('newOrder.delivery.descriptionPlaceholder')}
                  rows={3}
                  className='resize-none'
                  maxLength={240}
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
                  {t('newOrder.review.title')}
                </CardTitle>
                <CardDescription>
                  {t('newOrder.review.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                {/* Order items */}
                <div>
                  <h4 className='mb-3 font-semibold'>
                    {t('newOrder.review.selectedProductsTitle')}
                  </h4>
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
                              {line.batchCode && (
                                <p className='text-muted-foreground text-xs'>
                                  Batch: {line.batchCode}
                                </p>
                              )}
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
                  <h4 className='mb-3 font-semibold'>
                    {t('newOrder.review.deliveryInfoTitle')}
                  </h4>
                  <div className='bg-muted/50 space-y-2 rounded-lg p-4'>
                    <div className='flex items-start gap-2'>
                      <IconCalendar className='text-muted-foreground mt-0.5 h-4 w-4' />
                      <div>
                        <p className='text-muted-foreground text-xs'>
                          {t('newOrder.review.deliveryTimeLabel')}
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
                        <p className='text-muted-foreground text-xs'>
                          {t('newOrder.delivery.deliveryAddress')}
                        </p>
                        <p className='font-medium'>{state.deliveryAddress}</p>
                      </div>
                    </div>
                    {state.orderDescription && (
                      <div className='flex items-start gap-2'>
                        <IconShoppingCart className='text-muted-foreground mt-0.5 h-4 w-4' />
                        <div>
                          <p className='text-muted-foreground text-xs'>
                            {t('newOrder.review.notesLabel')}
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
                      {t('newOrder.review.totalAmount')}:
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
            {state.currentStep === 'products'
              ? t('newOrder.buttons.cancel')
              : t('newOrder.buttons.previous')}
          </Button>

          <div className='flex gap-3'>
            {state.currentStep === 'products' && (
              <Button
                onClick={() =>
                  dispatch({ type: 'SET_STEP', payload: 'delivery' })
                }
                disabled={!canProceedToDelivery()}
              >
                {t('newOrder.buttons.next')}
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
                {t('newOrder.buttons.next')}
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
                    {t('newOrder.review.submitting')}
                  </>
                ) : (
                  <>
                    <IconCheck className='mr-2 h-4 w-4' />
                    {t('newOrder.review.submit')}
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

'use client';

import { useReducer, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { createHarvestSchedule } from '@/services/harvest-schedule.service';
import { fetchProducts, Product } from '@/services/product.service';
import { fetchSupplier } from '@/services/supplier.service';
import type { Supplier } from '@/types/supplier';
import type { CreateHarvestScheduleDto } from '@/types/harvest-schedule';
import type { FormState, FormAction, HarvestDetail, Step } from '../types';

// Initial state
const getInitialState = (): FormState => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');

  return {
    currentStep: 'products',
    products: [],
    harvestDetails: [],
    selectedProducts: new Set<string>(),
    harvestDate: `${yyyy}-${mm}-${dd}T09:00`,
    harvestAddress: '',
    description: '',
    harvestPos: undefined,
    showMap: false,
    loading: true,
    submitting: false
  };
};

// Reducer
const reducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };

    case 'SET_PRODUCTS':
      return { ...state, products: action.payload, loading: false };

    case 'SET_HARVEST_DETAILS':
      return { ...state, harvestDetails: action.payload };

    case 'ADD_HARVEST_DETAIL':
      return {
        ...state,
        harvestDetails: [...state.harvestDetails, action.payload]
      };

    case 'UPDATE_HARVEST_DETAIL':
      return {
        ...state,
        harvestDetails: state.harvestDetails.map((detail) =>
          detail.productId === action.payload.productId
            ? { ...detail, [action.payload.field]: action.payload.value }
            : detail
        )
      };

    case 'REMOVE_HARVEST_DETAIL':
      return {
        ...state,
        harvestDetails: state.harvestDetails.filter(
          (d) => d.productId !== action.payload
        )
      };

    case 'TOGGLE_PRODUCT': {
      const { product, harvestDetail } = action.payload;
      const newSelected = new Set(state.selectedProducts);
      const isSelected = newSelected.has(product.id);

      if (isSelected) {
        newSelected.delete(product.id);
        return {
          ...state,
          selectedProducts: newSelected,
          harvestDetails: state.harvestDetails.filter(
            (d) => d.productId !== product.id
          )
        };
      } else {
        newSelected.add(product.id);
        return {
          ...state,
          selectedProducts: newSelected,
          harvestDetails: [...state.harvestDetails, harvestDetail]
        };
      }
    }

    case 'SET_SELECTED_PRODUCTS':
      return { ...state, selectedProducts: action.payload };

    case 'SET_HARVEST_DATE':
      return { ...state, harvestDate: action.payload };

    case 'SET_HARVEST_ADDRESS':
      return { ...state, harvestAddress: action.payload };

    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload };

    case 'SET_HARVEST_POS':
      return { ...state, harvestPos: action.payload };

    case 'TOGGLE_MAP':
      return { ...state, showMap: !state.showMap };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload };

    default:
      return state;
  }
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

export function useCreateHarvestSchedule() {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('SupplierHarvestBatches');

  const [state, dispatch] = useReducer(reducer, getInitialState());
  const didFetchRef = useRef(false);
  const didPrefillAddressRef = useRef(false);

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
      })
      .catch(() => {
        dispatch({ type: 'SET_LOADING', payload: false });
        toast({
          title: t('new.toast.errorTitle'),
          description: t('new.toast.errorLoadProducts'),
          variant: 'destructive'
        });
      });

    // Prefill address from supplier
    fetchSupplier()
      .then((supplier: Supplier) => {
        if (supplier?.address && !didPrefillAddressRef.current) {
          dispatch({ type: 'SET_HARVEST_ADDRESS', payload: supplier.address });
          didPrefillAddressRef.current = true;
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Product selection handler
  const toggleProduct = useCallback((product: Product) => {
    const harvestDetail: HarvestDetail = {
      productId: product.id,
      quantity: 0,
      expectedUnitPrice: 0,
      unit: 'kg'
    };

    dispatch({ type: 'TOGGLE_PRODUCT', payload: { product, harvestDetail } });
  }, []);

  // Update harvest detail
  const updateHarvestDetail = useCallback(
    (productId: string, field: keyof HarvestDetail, value: unknown) => {
      dispatch({
        type: 'UPDATE_HARVEST_DETAIL',
        payload: { productId, field, value }
      });
    },
    []
  );

  // Set step
  const setStep = useCallback((step: Step) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  // Set harvest date
  const setHarvestDate = useCallback((date: string) => {
    dispatch({ type: 'SET_HARVEST_DATE', payload: date });
  }, []);

  // Set harvest address
  const setHarvestAddress = useCallback((address: string) => {
    dispatch({ type: 'SET_HARVEST_ADDRESS', payload: address });
  }, []);

  // Set description
  const setDescription = useCallback((description: string) => {
    dispatch({ type: 'SET_DESCRIPTION', payload: description });
  }, []);

  // Set harvest position
  const setHarvestPos = useCallback(
    (pos: { lat: number; lng: number } | undefined) => {
      dispatch({ type: 'SET_HARVEST_POS', payload: pos });
    },
    []
  );

  // Toggle map
  const toggleMap = useCallback(() => {
    dispatch({ type: 'TOGGLE_MAP' });
  }, []);

  // Calculate totals
  const calculateTotal = useCallback(() => {
    return state.harvestDetails.reduce(
      (sum, detail) =>
        sum + (detail.quantity || 0) * (detail.expectedUnitPrice || 0),
      0
    );
  }, [state.harvestDetails]);

  const calculateTotalQuantity = useCallback(() => {
    return state.harvestDetails.reduce(
      (sum, detail) => sum + (detail.quantity || 0),
      0
    );
  }, [state.harvestDetails]);

  // Validation
  const canProceedToSchedule = useMemo(() => {
    return (
      state.harvestDetails.length > 0 &&
      state.harvestDetails.every(
        (d) =>
          d.quantity !== null &&
          d.quantity > 0 &&
          d.expectedUnitPrice !== null &&
          d.expectedUnitPrice > 0
      )
    );
  }, [state.harvestDetails]);

  const canProceedToReview = useMemo(() => {
    return state.harvestAddress.trim() !== '' && state.harvestDate !== '';
  }, [state.harvestAddress, state.harvestDate]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    dispatch({ type: 'SET_SUBMITTING', payload: true });
    try {
      const dto: CreateHarvestScheduleDto = {
        description: state.description || null,
        harvestDate: new Date(state.harvestDate).toISOString(),
        address: state.harvestAddress || null,
        harvestDetails: state.harvestDetails.map((detail) => ({
          product: {
            id: detail.productId
          },
          quantity: detail.quantity,
          expectedUnitPrice: detail.expectedUnitPrice,
          unit: detail.unit
        }))
      };

      await createHarvestSchedule(dto);

      toast({
        title: t('new.toast.successTitle'),
        description: t('new.toast.successDescription')
      });
      router.push('/supplier/harvest-batches');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('new.toast.errorCreateDescription');
      toast({
        title: t('new.toast.errorTitle'),
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [
    state.description,
    state.harvestDate,
    state.harvestAddress,
    state.harvestDetails,
    router,
    toast,
    t
  ]);

  // Navigate back
  const handleBack = useCallback(() => {
    if (state.currentStep === 'products') {
      router.push('/supplier/harvest-batches');
    } else if (state.currentStep === 'schedule') {
      dispatch({ type: 'SET_STEP', payload: 'products' });
    } else if (state.currentStep === 'review') {
      dispatch({ type: 'SET_STEP', payload: 'schedule' });
    }
  }, [state.currentStep, router]);

  return {
    state,
    toggleProduct,
    updateHarvestDetail,
    setStep,
    setHarvestDate,
    setHarvestAddress,
    setDescription,
    setHarvestPos,
    toggleMap,
    calculateTotal,
    calculateTotalQuantity,
    canProceedToSchedule,
    canProceedToReview,
    handleSubmit,
    handleBack,
    t
  };
}

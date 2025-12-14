import type { Product } from '@/services/product.service';

export type HarvestDetail = {
  productId: string;
  quantity: number | null;
  expectedUnitPrice: number | null;
  unit: string | null;
};

export type Step = 'products' | 'schedule' | 'review';

export type FormState = {
  currentStep: Step;
  products: Product[];
  harvestDetails: HarvestDetail[];
  selectedProducts: Set<string>;
  harvestDate: string;
  harvestAddress: string;
  description: string;
  harvestPos: { lat: number; lng: number } | undefined;
  showMap: boolean;
  loading: boolean;
  submitting: boolean;
};

export type FormAction =
  | { type: 'SET_STEP'; payload: Step }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_HARVEST_DETAILS'; payload: HarvestDetail[] }
  | { type: 'ADD_HARVEST_DETAIL'; payload: HarvestDetail }
  | {
      type: 'UPDATE_HARVEST_DETAIL';
      payload: {
        productId: string;
        field: keyof HarvestDetail;
        value: unknown;
      };
    }
  | { type: 'REMOVE_HARVEST_DETAIL'; payload: string }
  | {
      type: 'TOGGLE_PRODUCT';
      payload: { product: Product; harvestDetail: HarvestDetail };
    }
  | { type: 'SET_SELECTED_PRODUCTS'; payload: Set<string> }
  | { type: 'SET_HARVEST_DATE'; payload: string }
  | { type: 'SET_HARVEST_ADDRESS'; payload: string }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | {
      type: 'SET_HARVEST_POS';
      payload: { lat: number; lng: number } | undefined;
    }
  | { type: 'TOGGLE_MAP' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SUBMITTING'; payload: boolean };

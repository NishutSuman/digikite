import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SubscriptionPlan } from '../types/admin';

export type BillingCycle = 'MONTHLY' | 'YEARLY';

export interface SelectedPlan {
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  amount: number;
  isFreeTrial: boolean;
}

interface SubscriptionState {
  selectedPlan: SelectedPlan | null;
  isModalOpen: boolean;
  flowStep: 'select' | 'auth' | 'organization' | 'payment' | 'success';
  organizationDetails: {
    name: string;
    shortName: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
  } | null;
  paymentStatus: 'idle' | 'processing' | 'success' | 'failed';
  paymentError: string | null;
}

const initialState: SubscriptionState = {
  selectedPlan: null,
  isModalOpen: false,
  flowStep: 'select',
  organizationDetails: null,
  paymentStatus: 'idle',
  paymentError: null,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    selectPlan: (state, action: PayloadAction<SelectedPlan>) => {
      state.selectedPlan = action.payload;
      state.isModalOpen = true;
      state.flowStep = 'select';
    },
    openSubscriptionModal: (state) => {
      state.isModalOpen = true;
    },
    closeSubscriptionModal: (state) => {
      state.isModalOpen = false;
      // Reset flow but keep selected plan if user wants to come back
    },
    setFlowStep: (state, action: PayloadAction<SubscriptionState['flowStep']>) => {
      state.flowStep = action.payload;
    },
    setOrganizationDetails: (state, action: PayloadAction<SubscriptionState['organizationDetails']>) => {
      state.organizationDetails = action.payload;
    },
    setPaymentStatus: (state, action: PayloadAction<SubscriptionState['paymentStatus']>) => {
      state.paymentStatus = action.payload;
    },
    setPaymentError: (state, action: PayloadAction<string | null>) => {
      state.paymentError = action.payload;
    },
    resetSubscriptionFlow: (state) => {
      state.selectedPlan = null;
      state.isModalOpen = false;
      state.flowStep = 'select';
      state.organizationDetails = null;
      state.paymentStatus = 'idle';
      state.paymentError = null;
    },
    // Called when user completes auth during subscription flow
    continueAfterAuth: (state) => {
      if (state.selectedPlan) {
        state.flowStep = 'organization';
        state.isModalOpen = true;
      }
    },
  },
});

export const {
  selectPlan,
  openSubscriptionModal,
  closeSubscriptionModal,
  setFlowStep,
  setOrganizationDetails,
  setPaymentStatus,
  setPaymentError,
  resetSubscriptionFlow,
  continueAfterAuth,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;

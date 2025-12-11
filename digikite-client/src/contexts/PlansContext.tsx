import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getPublicPlans } from '../services/adminService';
import type { SubscriptionPlan } from '../types/admin';

interface PlansContextType {
  plans: SubscriptionPlan[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const PlansContext = createContext<PlansContextType | undefined>(undefined);

// Module-level singleton to persist across ALL remounts (HMR, StrictMode, navigation)
const plansCache = {
  data: null as SubscriptionPlan[] | null,
  promise: null as Promise<SubscriptionPlan[]> | null,
  hasFetched: false,
  error: null as string | null,
};

// Single fetch function that handles all caching
const fetchPlansOnce = (): Promise<SubscriptionPlan[]> => {
  // Return cached data immediately
  if (plansCache.data) {
    return Promise.resolve(plansCache.data);
  }

  // Return existing promise if fetch is in progress
  if (plansCache.promise) {
    return plansCache.promise;
  }

  // Prevent any future fetches until explicitly reset
  plansCache.hasFetched = true;

  // Start single fetch
  plansCache.promise = getPublicPlans()
    .then((data) => {
      if (Array.isArray(data)) {
        const sortedPlans = [...data].sort((a, b) =>
          (a.sortOrder ?? 999) - (b.sortOrder ?? 999) ||
          (a.monthlyPrice || a.priceMonthly || 0) - (b.monthlyPrice || b.priceMonthly || 0)
        );
        plansCache.data = sortedPlans;
        plansCache.error = null;
        return sortedPlans;
      }
      return [];
    })
    .catch((err) => {
      plansCache.error = err instanceof Error ? err.message : 'Failed to fetch plans';
      console.error('Failed to fetch plans:', err);
      throw err;
    });

  return plansCache.promise;
};

export const PlansProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(plansCache.data || []);
  const [isLoading, setIsLoading] = useState(!plansCache.data);
  const [error, setError] = useState<string | null>(plansCache.error);

  useEffect(() => {
    // Skip if we already have cached data
    if (plansCache.data) {
      setPlans(plansCache.data);
      setIsLoading(false);
      return;
    }

    // Fetch plans (will only make one API call due to singleton pattern)
    setIsLoading(true);
    fetchPlansOnce()
      .then((data) => {
        setPlans(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch plans');
        setIsLoading(false);
      });
  }, []);

  const refetch = useCallback(async () => {
    // Reset cache to force new fetch
    plansCache.data = null;
    plansCache.promise = null;
    plansCache.hasFetched = false;
    plansCache.error = null;

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchPlansOnce();
      setPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch plans');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <PlansContext.Provider value={{ plans, isLoading, error, refetch }}>
      {children}
    </PlansContext.Provider>
  );
};

export const usePlans = (): PlansContextType => {
  const context = useContext(PlansContext);
  if (context === undefined) {
    throw new Error('usePlans must be used within a PlansProvider');
  }
  return context;
};

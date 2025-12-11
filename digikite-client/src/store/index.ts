import { configureStore } from '@reduxjs/toolkit';
import authSlice from '../slices/authSlice';
import subscriptionSlice from '../slices/subscriptionSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    subscription: subscriptionSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
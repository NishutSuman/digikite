import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../services/authService';
import type { User, LoginCredentials, RegisterCredentials } from '../types/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isModalOpen: boolean;
  modalType: 'login' | 'register' | null;
  redirectPath: string | null;
  showSuccessAnimation: boolean;
  successMessage: string;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isModalOpen: false,
  modalType: null,
  redirectPath: null,
  showSuccessAnimation: false,
  successMessage: '',
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.token);
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.register(credentials);
      localStorage.setItem('token', response.token);
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const googleAuth = createAsyncThunk(
  'auth/googleAuth',
  async (tokenResponse: any, { rejectWithValue }) => {
    try {
      const response = await authService.googleAuth(tokenResponse);
      localStorage.setItem('token', response.token);
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Google authentication failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getCurrentUser();
    } catch (error: any) {
      localStorage.removeItem('token');
      return rejectWithValue(error.response?.data?.message || 'Failed to get user');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      localStorage.removeItem('token');
    } catch (error: any) {
      localStorage.removeItem('token');
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    openAuthModal: (state, action: PayloadAction<'login' | 'register'>) => {
      state.isModalOpen = true;
      state.modalType = action.payload;
      state.error = null;
    },
    closeAuthModal: (state) => {
      state.isModalOpen = false;
      state.modalType = null;
      state.error = null;
    },
    switchModalType: (state, action: PayloadAction<'login' | 'register'>) => {
      state.modalType = action.payload;
      state.error = null;
    },
    setRedirectPath: (state, action: PayloadAction<string>) => {
      state.redirectPath = action.payload;
    },
    showSuccess: (state, action: PayloadAction<string>) => {
      state.showSuccessAnimation = true;
      state.successMessage = action.payload;
    },
    hideSuccess: (state) => {
      state.showSuccessAnimation = false;
      state.successMessage = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.showSuccessAnimation = true;
        state.successMessage = 'Welcome back! Successfully signed in.';
        state.isModalOpen = false;
        state.modalType = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.showSuccessAnimation = true;
        state.successMessage = 'Account created successfully! Welcome to DigiKite.';
        state.isModalOpen = false;
        state.modalType = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Google Auth
      .addCase(googleAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.showSuccessAnimation = true;
        state.successMessage = 'Successfully signed in with Google!';
        state.isModalOpen = false;
        state.modalType = null;
      })
      .addCase(googleAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const { clearError, openAuthModal, closeAuthModal, switchModalType, setRedirectPath, showSuccess, hideSuccess } = authSlice.actions;
export default authSlice.reducer;
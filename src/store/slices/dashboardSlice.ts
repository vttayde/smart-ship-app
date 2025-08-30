import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Dashboard Statistics Interface
interface DashboardStats {
  totalShipments: number;
  activeShipments: number;
  deliveredToday: number;
  pendingPickups: number;
  totalRevenue: number;
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  customerSatisfaction: number;
}

// Recent Shipment Interface
interface RecentShipment {
  id: string;
  trackingNumber: string;
  customerName: string;
  destination: string;
  status: string;
  courierName: string;
  estimatedDelivery: Date;
  value: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Courier Performance Interface
interface CourierPerformance {
  courierName: string;
  totalShipments: number;
  onTimeRate: number;
  averageDeliveryTime: number;
  rating: number;
  cost: number;
}

// Alert Interface
interface AlertItem {
  id: string;
  type: 'delay' | 'failed_delivery' | 'exception' | 'urgent';
  message: string;
  shipmentId: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
}

// Dashboard State Interface
interface DashboardState {
  stats: DashboardStats | null;
  recentShipments: RecentShipment[];
  courierPerformance: CourierPerformance[];
  alerts: AlertItem[];
  loading: {
    stats: boolean;
    shipments: boolean;
    performance: boolean;
    alerts: boolean;
  };
  error: {
    stats: string | null;
    shipments: string | null;
    performance: string | null;
    alerts: string | null;
  };
  filters: {
    timeRange: '1d' | '7d' | '30d' | '90d';
    searchTerm: string;
  };
  lastUpdated: Date | null;
}

const initialState: DashboardState = {
  stats: null,
  recentShipments: [],
  courierPerformance: [],
  alerts: [],
  loading: {
    stats: false,
    shipments: false,
    performance: false,
    alerts: false,
  },
  error: {
    stats: null,
    shipments: null,
    performance: null,
    alerts: null,
  },
  filters: {
    timeRange: '7d',
    searchTerm: '',
  },
  lastUpdated: null,
};

// Async Thunks for API calls
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (timeRange: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/dashboard/stats?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchRecentShipments = createAsyncThunk(
  'dashboard/fetchRecentShipments',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/dashboard/recent-shipments?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recent shipments');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchCourierPerformance = createAsyncThunk(
  'dashboard/fetchCourierPerformance',
  async (timeRange: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/dashboard/courier-performance?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch courier performance');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const fetchAlerts = createAsyncThunk(
  'dashboard/fetchAlerts',
  async (limit: number = 5, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/dashboard/alerts?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Dashboard Slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setTimeRange: (state, action: PayloadAction<'1d' | '7d' | '30d' | '90d'>) => {
      state.filters.timeRange = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.filters.searchTerm = action.payload;
    },
    clearErrors: state => {
      state.error = {
        stats: null,
        shipments: null,
        performance: null,
        alerts: null,
      };
    },
    dismissAlert: (state, action: PayloadAction<string>) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    },
    updateLastRefresh: state => {
      state.lastUpdated = new Date();
    },
  },
  extraReducers: builder => {
    // Dashboard Stats
    builder
      .addCase(fetchDashboardStats.pending, state => {
        state.loading.stats = true;
        state.error.stats = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.stats = action.payload;
        state.lastUpdated = new Date();
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading.stats = false;
        state.error.stats = action.payload as string;
      });

    // Recent Shipments
    builder
      .addCase(fetchRecentShipments.pending, state => {
        state.loading.shipments = true;
        state.error.shipments = null;
      })
      .addCase(fetchRecentShipments.fulfilled, (state, action) => {
        state.loading.shipments = false;
        state.recentShipments = action.payload;
      })
      .addCase(fetchRecentShipments.rejected, (state, action) => {
        state.loading.shipments = false;
        state.error.shipments = action.payload as string;
      });

    // Courier Performance
    builder
      .addCase(fetchCourierPerformance.pending, state => {
        state.loading.performance = true;
        state.error.performance = null;
      })
      .addCase(fetchCourierPerformance.fulfilled, (state, action) => {
        state.loading.performance = false;
        state.courierPerformance = action.payload;
      })
      .addCase(fetchCourierPerformance.rejected, (state, action) => {
        state.loading.performance = false;
        state.error.performance = action.payload as string;
      });

    // Alerts
    builder
      .addCase(fetchAlerts.pending, state => {
        state.loading.alerts = true;
        state.error.alerts = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.loading.alerts = false;
        state.alerts = action.payload;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading.alerts = false;
        state.error.alerts = action.payload as string;
      });
  },
});

export const { setTimeRange, setSearchTerm, clearErrors, dismissAlert, updateLastRefresh } =
  dashboardSlice.actions;

export default dashboardSlice.reducer;

// Selectors
export const selectDashboardStats = (state: { dashboard: DashboardState }) => state.dashboard.stats;
export const selectRecentShipments = (state: { dashboard: DashboardState }) =>
  state.dashboard.recentShipments;
export const selectCourierPerformance = (state: { dashboard: DashboardState }) =>
  state.dashboard.courierPerformance;
export const selectAlerts = (state: { dashboard: DashboardState }) => state.dashboard.alerts;
export const selectDashboardLoading = (state: { dashboard: DashboardState }) =>
  state.dashboard.loading;
export const selectDashboardErrors = (state: { dashboard: DashboardState }) =>
  state.dashboard.error;
export const selectDashboardFilters = (state: { dashboard: DashboardState }) =>
  state.dashboard.filters;
export const selectLastUpdated = (state: { dashboard: DashboardState }) =>
  state.dashboard.lastUpdated;

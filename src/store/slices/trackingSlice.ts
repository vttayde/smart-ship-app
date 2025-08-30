import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Tracking Update Interface
interface TrackingUpdate {
  status: string;
  timestamp: Date;
  location?: string;
  description: string;
  isCurrentStatus: boolean;
}

// Shipment Data Interface
interface ShipmentData {
  id: string;
  trackingNumber: string;
  currentStatus: string;
  courierName: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  origin: string;
  destination: string;
}

// Tracking Data Interface
interface TrackingData {
  success: boolean;
  shipment: ShipmentData;
  timeline: TrackingUpdate[];
  liveUpdates?: TrackingUpdate[];
  metadata: {
    lastUpdated: Date;
    totalStops: number;
    isDelivered: boolean;
    canCancel: boolean;
    labelUrl?: string;
  };
  deliveryProgress: number;
  statusDescription: string;
  nextSteps: string[];
}

// Tracking State Interface
interface TrackingState {
  currentTracking: TrackingData | null;
  trackingHistory: TrackingData[];
  loading: boolean;
  error: string | null;
  autoRefreshEnabled: boolean;
  refreshInterval: number;
  lastRefresh: Date | null;
  searchHistory: string[];
}

const initialState: TrackingState = {
  currentTracking: null,
  trackingHistory: [],
  loading: false,
  error: null,
  autoRefreshEnabled: true,
  refreshInterval: 30,
  lastRefresh: null,
  searchHistory: [],
};

// Async Thunks
export const fetchTrackingData = createAsyncThunk(
  'tracking/fetchTrackingData',
  async (
    params: { trackingNumber?: string; orderId?: string; includeRealTime?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const searchParams = new URLSearchParams();
      if (params.trackingNumber) searchParams.append('trackingNumber', params.trackingNumber);
      if (params.orderId) searchParams.append('orderId', params.orderId);
      if (params.includeRealTime) searchParams.append('includeRealTime', 'true');

      const response = await fetch(`/api/tracking/enhanced?${searchParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tracking data');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const refreshTrackingData = createAsyncThunk(
  'tracking/refreshTrackingData',
  async (params: { trackingNumber?: string; orderId?: string }, { rejectWithValue }) => {
    try {
      const searchParams = new URLSearchParams();
      if (params.trackingNumber) searchParams.append('trackingNumber', params.trackingNumber);
      if (params.orderId) searchParams.append('orderId', params.orderId);
      searchParams.append('includeRealTime', 'true');

      const response = await fetch(`/api/tracking/enhanced?${searchParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to refresh tracking data');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Tracking Slice
const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {
    clearCurrentTracking: state => {
      state.currentTracking = null;
      state.error = null;
    },
    setAutoRefresh: (state, action: PayloadAction<boolean>) => {
      state.autoRefreshEnabled = action.payload;
    },
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload;
    },
    addToSearchHistory: (state, action: PayloadAction<string>) => {
      const trackingNumber = action.payload;
      if (!state.searchHistory.includes(trackingNumber)) {
        state.searchHistory.unshift(trackingNumber);
        // Keep only last 10 searches
        if (state.searchHistory.length > 10) {
          state.searchHistory = state.searchHistory.slice(0, 10);
        }
      }
    },
    clearSearchHistory: state => {
      state.searchHistory = [];
    },
    clearTrackingError: state => {
      state.error = null;
    },
    updateLastRefresh: state => {
      state.lastRefresh = new Date();
    },
  },
  extraReducers: builder => {
    // Fetch Tracking Data
    builder
      .addCase(fetchTrackingData.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTrackingData.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTracking = action.payload;
        state.lastRefresh = new Date();

        // Add to history if not already present
        const existingIndex = state.trackingHistory.findIndex(
          item => item.shipment.trackingNumber === action.payload.shipment.trackingNumber
        );

        if (existingIndex >= 0) {
          state.trackingHistory[existingIndex] = action.payload;
        } else {
          state.trackingHistory.unshift(action.payload);
          // Keep only last 20 tracking records
          if (state.trackingHistory.length > 20) {
            state.trackingHistory = state.trackingHistory.slice(0, 20);
          }
        }
      })
      .addCase(fetchTrackingData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Refresh Tracking Data (Silent)
    builder
      .addCase(refreshTrackingData.fulfilled, (state, action) => {
        if (state.currentTracking) {
          state.currentTracking = action.payload;
          state.lastRefresh = new Date();

          // Update in history as well
          const existingIndex = state.trackingHistory.findIndex(
            item => item.shipment.trackingNumber === action.payload.shipment.trackingNumber
          );

          if (existingIndex >= 0) {
            state.trackingHistory[existingIndex] = action.payload;
          }
        }
      })
      .addCase(refreshTrackingData.rejected, (state, action) => {
        // For silent refresh, don't show error to user, just log
        console.error('Silent tracking refresh failed:', action.payload);
      });
  },
});

export const {
  clearCurrentTracking,
  setAutoRefresh,
  setRefreshInterval,
  addToSearchHistory,
  clearSearchHistory,
  clearTrackingError,
  updateLastRefresh,
} = trackingSlice.actions;

export default trackingSlice.reducer;

// Selectors
export const selectCurrentTracking = (state: { tracking: TrackingState }) =>
  state.tracking.currentTracking;
export const selectTrackingHistory = (state: { tracking: TrackingState }) =>
  state.tracking.trackingHistory;
export const selectTrackingLoading = (state: { tracking: TrackingState }) => state.tracking.loading;
export const selectTrackingError = (state: { tracking: TrackingState }) => state.tracking.error;
export const selectAutoRefreshEnabled = (state: { tracking: TrackingState }) =>
  state.tracking.autoRefreshEnabled;
export const selectRefreshInterval = (state: { tracking: TrackingState }) =>
  state.tracking.refreshInterval;
export const selectTrackingLastRefresh = (state: { tracking: TrackingState }) =>
  state.tracking.lastRefresh;
export const selectSearchHistory = (state: { tracking: TrackingState }) =>
  state.tracking.searchHistory;

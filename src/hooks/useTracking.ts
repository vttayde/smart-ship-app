import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  fetchTrackingData,
  refreshTrackingData,
  clearCurrentTracking,
  setAutoRefresh,
  setRefreshInterval,
  addToSearchHistory,
  clearSearchHistory,
  clearTrackingError,
  updateLastRefresh,
  selectCurrentTracking,
  selectTrackingHistory,
  selectTrackingLoading,
  selectTrackingError,
  selectAutoRefreshEnabled,
  selectRefreshInterval,
  selectTrackingLastRefresh,
  selectSearchHistory,
} from '@/store/slices/trackingSlice';

export const useTracking = () => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const currentTracking = useAppSelector(selectCurrentTracking);
  const trackingHistory = useAppSelector(selectTrackingHistory);
  const loading = useAppSelector(selectTrackingLoading);
  const error = useAppSelector(selectTrackingError);
  const autoRefreshEnabled = useAppSelector(selectAutoRefreshEnabled);
  const refreshInterval = useAppSelector(selectRefreshInterval);
  const lastRefresh = useAppSelector(selectTrackingLastRefresh);
  const searchHistory = useAppSelector(selectSearchHistory);

  // Actions
  const trackShipment = useCallback(
    async (params: { trackingNumber?: string; orderId?: string; includeRealTime?: boolean }) => {
      const result = await dispatch(fetchTrackingData(params));
      
      // Add to search history if successful and trackingNumber provided
      if (fetchTrackingData.fulfilled.match(result) && params.trackingNumber) {
        dispatch(addToSearchHistory(params.trackingNumber));
      }
      
      return result;
    },
    [dispatch]
  );

  const refreshCurrentTracking = useCallback(
    async (params: { trackingNumber?: string; orderId?: string }) => {
      return dispatch(refreshTrackingData(params));
    },
    [dispatch]
  );

  const clearTracking = useCallback(
    () => dispatch(clearCurrentTracking()),
    [dispatch]
  );

  const toggleAutoRefresh = useCallback(
    (enabled: boolean) => dispatch(setAutoRefresh(enabled)),
    [dispatch]
  );

  const updateRefreshInterval = useCallback(
    (interval: number) => dispatch(setRefreshInterval(interval)),
    [dispatch]
  );

  const addSearchTerm = useCallback(
    (trackingNumber: string) => dispatch(addToSearchHistory(trackingNumber)),
    [dispatch]
  );

  const clearHistory = useCallback(
    () => dispatch(clearSearchHistory()),
    [dispatch]
  );

  const clearError = useCallback(
    () => dispatch(clearTrackingError()),
    [dispatch]
  );

  const markAsRefreshed = useCallback(
    () => dispatch(updateLastRefresh()),
    [dispatch]
  );

  // Utility functions
  const getTrackingFromHistory = useCallback(
    (trackingNumber: string) => {
      return trackingHistory.find(
        item => item.shipment.trackingNumber === trackingNumber
      );
    },
    [trackingHistory]
  );

  const isTrackingNumber = useCallback(
    (value: string) => {
      // Basic validation for tracking number format
      return /^[A-Z0-9]{6,20}$/i.test(value.trim());
    },
    []
  );

  const formatTrackingNumber = useCallback(
    (value: string) => {
      return value.trim().toUpperCase();
    },
    []
  );

  return {
    // State
    currentTracking,
    trackingHistory,
    loading,
    error,
    autoRefreshEnabled,
    refreshInterval,
    lastRefresh,
    searchHistory,
    
    // Actions
    trackShipment,
    refreshCurrentTracking,
    clearTracking,
    toggleAutoRefresh,
    updateRefreshInterval,
    addSearchTerm,
    clearHistory,
    clearError,
    markAsRefreshed,
    
    // Utilities
    getTrackingFromHistory,
    isTrackingNumber,
    formatTrackingNumber,
  };
};

import { useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  fetchDashboardStats,
  fetchRecentShipments,
  fetchCourierPerformance,
  fetchAlerts,
  setTimeRange,
  setSearchTerm,
  clearErrors,
  dismissAlert,
  updateLastRefresh,
  selectDashboardStats,
  selectRecentShipments,
  selectCourierPerformance,
  selectAlerts,
  selectDashboardLoading,
  selectDashboardErrors,
  selectDashboardFilters,
  selectLastUpdated,
} from '@/store/slices/dashboardSlice';

export const useDashboard = () => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const stats = useAppSelector(selectDashboardStats);
  const recentShipments = useAppSelector(selectRecentShipments);
  const courierPerformance = useAppSelector(selectCourierPerformance);
  const alerts = useAppSelector(selectAlerts);
  const loading = useAppSelector(selectDashboardLoading);
  const errors = useAppSelector(selectDashboardErrors);
  const filters = useAppSelector(selectDashboardFilters);
  const lastUpdated = useAppSelector(selectLastUpdated);

  // Actions
  const loadDashboardStats = useCallback(
    (timeRange: string) => dispatch(fetchDashboardStats(timeRange)),
    [dispatch]
  );

  const loadRecentShipments = useCallback(
    (limit: number = 10) => dispatch(fetchRecentShipments(limit)),
    [dispatch]
  );

  const loadCourierPerformance = useCallback(
    (timeRange: string) => dispatch(fetchCourierPerformance(timeRange)),
    [dispatch]
  );

  const loadAlerts = useCallback(
    (limit: number = 5) => dispatch(fetchAlerts(limit)),
    [dispatch]
  );

  const updateTimeRange = useCallback(
    (timeRange: '1d' | '7d' | '30d' | '90d') => dispatch(setTimeRange(timeRange)),
    [dispatch]
  );

  const updateSearchTerm = useCallback(
    (searchTerm: string) => dispatch(setSearchTerm(searchTerm)),
    [dispatch]
  );

  const clearAllErrors = useCallback(
    () => dispatch(clearErrors()),
    [dispatch]
  );

  const removeAlert = useCallback(
    (alertId: string) => dispatch(dismissAlert(alertId)),
    [dispatch]
  );

  const markAsRefreshed = useCallback(
    () => dispatch(updateLastRefresh()),
    [dispatch]
  );

  const refreshAllData = useCallback(
    async (timeRange: string = '7d') => {
      await Promise.all([
        dispatch(fetchDashboardStats(timeRange)),
        dispatch(fetchRecentShipments(10)),
        dispatch(fetchCourierPerformance(timeRange)),
        dispatch(fetchAlerts(5)),
      ]);
      dispatch(updateLastRefresh());
    },
    [dispatch]
  );

  return {
    // State
    stats,
    recentShipments,
    courierPerformance,
    alerts,
    loading,
    errors,
    filters,
    lastUpdated,
    
    // Actions
    loadDashboardStats,
    loadRecentShipments,
    loadCourierPerformance,
    loadAlerts,
    updateTimeRange,
    updateSearchTerm,
    clearAllErrors,
    removeAlert,
    markAsRefreshed,
    refreshAllData,
  };
};

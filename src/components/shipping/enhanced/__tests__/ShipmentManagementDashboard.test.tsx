import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ShipmentManagementDashboard from '../ShipmentManagementDashboard';
import dashboardReducer from '@/store/slices/dashboardSlice';

// Mock the API calls
global.fetch = jest.fn();

// Create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      dashboard: dashboardReducer,
    },
    preloadedState: {
      dashboard: {
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
        ...initialState,
      },
    },
  });
};

const renderWithStore = (component: React.ReactElement, initialState = {}) => {
  const store = createTestStore(initialState);
  return {
    ...render(
      <Provider store={store}>
        {component}
      </Provider>
    ),
    store,
  };
};

describe('ShipmentManagementDashboard', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('renders loading state initially', () => {
    const initialState = {
      loading: {
        stats: true,
        shipments: false,
        performance: false,
        alerts: false,
      },
    };

    renderWithStore(<ShipmentManagementDashboard />, initialState);
    
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('renders dashboard with mock data', async () => {
    const mockStats = {
      totalShipments: 150,
      activeShipments: 45,
      deliveredToday: 12,
      pendingPickups: 8,
      totalRevenue: 50000,
      averageDeliveryTime: 48,
      onTimeDeliveryRate: 92,
      customerSatisfaction: 4.2,
    };

    const mockShipments = [
      {
        id: '1',
        trackingNumber: 'TRK001',
        customerName: 'John Doe',
        destination: 'Mumbai, Maharashtra',
        status: 'in_transit',
        courierName: 'Blue Dart',
        estimatedDelivery: new Date('2025-09-01'),
        value: 1000,
        priority: 'medium' as const,
      },
    ];

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockShipments,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    renderWithStore(<ShipmentManagementDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Shipment Management Dashboard')).toBeInTheDocument();
    });

    // Check if stats are displayed
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument(); // Total shipments
      expect(screen.getByText('45')).toBeInTheDocument(); // Active shipments
    });
  });

  it('handles time range filter change', async () => {
    renderWithStore(<ShipmentManagementDashboard />);

    const timeRangeSelect = screen.getByDisplayValue('Last 7 Days');
    fireEvent.change(timeRangeSelect, { target: { value: '30d' } });

    await waitFor(() => {
      expect(timeRangeSelect).toHaveValue('30d');
    });
  });

  it('handles refresh button click', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    renderWithStore(<ShipmentManagementDashboard />);

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    // Should make API calls when refresh is clicked
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  it('displays error state when API fails', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

    renderWithStore(<ShipmentManagementDashboard />);

    await waitFor(() => {
      // The component should handle errors gracefully
      expect(screen.getByText('Shipment Management Dashboard')).toBeInTheDocument();
    });
  });

  it('filters shipments based on search term', async () => {
    const mockShipments = [
      {
        id: '1',
        trackingNumber: 'TRK001',
        customerName: 'John Doe',
        destination: 'Mumbai, Maharashtra',
        status: 'in_transit',
        courierName: 'Blue Dart',
        estimatedDelivery: new Date('2025-09-01'),
        value: 1000,
        priority: 'medium' as const,
      },
      {
        id: '2',
        trackingNumber: 'TRK002',
        customerName: 'Jane Smith',
        destination: 'Delhi, Delhi',
        status: 'delivered',
        courierName: 'FedEx',
        estimatedDelivery: new Date('2025-08-31'),
        value: 2000,
        priority: 'high' as const,
      },
    ];

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockShipments,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    renderWithStore(<ShipmentManagementDashboard />);

    await waitFor(() => {
      expect(screen.getByText('TRK001')).toBeInTheDocument();
      expect(screen.getByText('TRK002')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search shipments...');
    fireEvent.change(searchInput, { target: { value: 'TRK001' } });

    await waitFor(() => {
      expect(screen.getByText('TRK001')).toBeInTheDocument();
      expect(screen.queryByText('TRK002')).not.toBeInTheDocument();
    });
  });
});

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface CourierPartner {
  id: string;
  name: string;
  pricingModel?: Record<string, unknown>;
  coverageAreas?: Record<string, unknown>;
  rating: number;
  apiEndpoint?: string;
  isActive: boolean;
}

interface UseCourierPartnersReturn {
  courierPartners: CourierPartner[];
  loading: boolean;
  error: string | null;
  refreshCourierPartners: () => Promise<void>;
}

export const useCourierPartners = (): UseCourierPartnersReturn => {
  const { data: session } = useSession();
  const [courierPartners, setCourierPartners] = useState<CourierPartner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourierPartners = async () => {
    if (!session) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/courier-partners', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courier partners');
      }

      const data = await response.json();
      setCourierPartners(data.courierPartners || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch courier partners');
    } finally {
      setLoading(false);
    }
  };

  const refreshCourierPartners = async () => {
    await fetchCourierPartners();
  };

  // Fetch courier partners when session is available
  useEffect(() => {
    if (session) {
      fetchCourierPartners();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return {
    courierPartners,
    loading,
    error,
    refreshCourierPartners,
  };
};

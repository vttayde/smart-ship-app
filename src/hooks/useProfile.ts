import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  gstin?: string;
  role: 'USER' | 'ADMIN';
  phoneVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

interface Address {
  id: string;
  type: 'HOME' | 'OFFICE' | 'OTHER';
  name: string;
  phone: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UseProfileReturn {
  profile: UserProfile | null;
  addresses: Address[];
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  addAddress: (address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  refreshAddresses: () => Promise<void>;
}

export const useProfile = (): UseProfileReturn => {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!session) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    if (!session) return;

    try {
      setError(null);

      const response = await fetch('/api/user/addresses', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }

      const data = await response.json();
      setAddresses(data.addresses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch addresses');
    }
  };

  const updateProfile = async (updateData: Partial<UserProfile>): Promise<boolean> => {
    if (!session) return false;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.user);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (
    addressData: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<boolean> => {
    if (!session) return false;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add address');
      }

      // Refresh addresses after adding
      await fetchAddresses();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add address');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const refreshAddresses = async () => {
    await fetchAddresses();
  };

  // Fetch data when session is available
  useEffect(() => {
    if (session) {
      const fetchData = async () => {
        await Promise.all([fetchProfile(), fetchAddresses()]);
      };
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return {
    profile,
    addresses,
    loading,
    error,
    updateProfile,
    addAddress,
    refreshProfile,
    refreshAddresses,
  };
};

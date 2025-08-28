'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Plus,
  Edit3,
  CheckCircle,
  AlertCircle,
  Home,
  Building,
  Package,
} from 'lucide-react';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  addresses: Address[];
  orderCount: number;
}

interface Address {
  id: string;
  type: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function ProfileManagement() {
  const { update } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();

      if (data.success) {
        setProfile(data.user);
        setFormData({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          phone: data.user.phone || '',
        });
      } else {
        setError('Failed to load profile');
      }
    } catch {
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Profile updated successfully!');
        setProfile(prev => (prev ? { ...prev, ...data.user } : null));
        // Update NextAuth session
        await update();
      } else {
        setError(
          data.errors ? (Object.values(data.errors)[0] as string) : 'Failed to update profile'
        );
      }
    } catch {
      setError('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className='w-4 h-4' />;
      case 'work':
        return <Building className='w-4 h-4' />;
      default:
        return <MapPin className='w-4 h-4' />;
    }
  };

  const getAddressTypeLabel = (type: string) => {
    switch (type) {
      case 'home':
        return 'Home';
      case 'work':
        return 'Work';
      default:
        return 'Other';
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <Loading size='lg' />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className='text-center p-8'>
        <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>Failed to Load Profile</h3>
        <p className='text-gray-600'>Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* Profile Header */}
      <div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white'>
        <div className='flex items-center space-x-4'>
          <div className='w-16 h-16 bg-white/20 rounded-full flex items-center justify-center'>
            <User className='w-8 h-8' />
          </div>
          <div>
            <h1 className='text-2xl font-bold'>
              {profile.firstName} {profile.lastName}
            </h1>
            <p className='text-blue-100'>{profile.email}</p>
            <div className='flex items-center space-x-4 mt-2'>
              <Badge className='bg-white/20 text-white hover:bg-white/20'>
                <Package className='w-3 h-3 mr-1' />
                {profile.orderCount} Orders
              </Badge>
              {profile.emailVerified && (
                <Badge className='bg-green-500/20 text-white hover:bg-green-500/20'>
                  <CheckCircle className='w-3 h-3 mr-1' />
                  Email Verified
                </Badge>
              )}
              {profile.phoneVerified && (
                <Badge className='bg-green-500/20 text-white hover:bg-green-500/20'>
                  <CheckCircle className='w-3 h-3 mr-1' />
                  Phone Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2'>
          <AlertCircle className='w-4 h-4' />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2'>
          <CheckCircle className='w-4 h-4' />
          <span>{success}</span>
        </div>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Edit3 className='w-5 h-5' />
              <span>Profile Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label
                    htmlFor='firstName'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    First Name
                  </label>
                  <Input
                    id='firstName'
                    name='firstName'
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder='Enter first name'
                  />
                </div>
                <div>
                  <label
                    htmlFor='lastName'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Last Name
                  </label>
                  <Input
                    id='lastName'
                    name='lastName'
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder='Enter last name'
                  />
                </div>
              </div>

              <div>
                <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
                  Email Address
                </label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                  <Input id='email' value={profile.email} disabled className='pl-9 bg-gray-50' />
                </div>
                <p className='text-sm text-gray-500 mt-1'>Email cannot be changed</p>
              </div>

              <div>
                <label htmlFor='phone' className='block text-sm font-medium text-gray-700 mb-1'>
                  Phone Number
                </label>
                <div className='relative'>
                  <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                  <Input
                    id='phone'
                    name='phone'
                    type='tel'
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder='Enter phone number'
                    className='pl-9'
                  />
                </div>
              </div>

              <Button type='submit' disabled={isSaving} className='w-full'>
                {isSaving ? (
                  <div className='flex items-center space-x-2'>
                    <Loading size='sm' />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className='flex items-center space-x-2'>
                    <Save className='w-4 h-4' />
                    <span>Save Changes</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Address Book */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                <MapPin className='w-5 h-5' />
                <span>Address Book</span>
              </div>
              <Button size='sm' variant='outline'>
                <Plus className='w-4 h-4 mr-1' />
                Add Address
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.addresses.length > 0 ? (
              <div className='space-y-3'>
                {profile.addresses.map(address => (
                  <div key={address.id} className='p-3 border rounded-lg hover:bg-gray-50'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-start space-x-3'>
                        <div className='mt-1'>{getAddressIcon(address.type)}</div>
                        <div className='flex-1'>
                          <div className='flex items-center space-x-2 mb-1'>
                            <span className='font-medium'>{getAddressTypeLabel(address.type)}</span>
                            {address.isDefault && <Badge>Default</Badge>}
                          </div>
                          <p className='text-sm text-gray-600'>
                            {address.addressLine1}
                            {address.addressLine2 && `, ${address.addressLine2}`}
                          </p>
                          <p className='text-sm text-gray-600'>
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                      </div>
                      <Button size='sm' variant='ghost'>
                        <Edit3 className='w-3 h-3' />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-6 text-gray-500'>
                <MapPin className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                <p>No addresses added yet</p>
                <p className='text-sm'>Add an address to get started with shipping</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

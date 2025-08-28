'use client';

import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Mail, MapPin, Phone, Shield, User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  emailVerified?: boolean;
  createdAt: string;
  addresses?: Address[];
}

interface Address {
  id: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfile();
      fetchAddresses();
    }
  }, [isAuthenticated, user]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setEditForm({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          phone: data.user.phone || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/user/addresses');
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setIsEditing(false);
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('An error occurred while updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto' />
            <p className='mt-4 text-gray-600'>Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>Access Denied</h2>
            <p className='text-gray-600'>Please log in to view your profile.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>My Profile</h1>
            <p className='text-gray-600'>Manage your account information and settings</p>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes('success')
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {message}
            </div>
          )}

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Profile Information */}
            <div className='lg:col-span-2'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                  <CardTitle className='flex items-center gap-2'>
                    <User className='w-5 h-5' />
                    Profile Information
                  </CardTitle>
                  <Button
                    variant='outline'
                    onClick={() => {
                      if (isEditing) {
                        setIsEditing(false);
                        setEditForm({
                          firstName: profile?.firstName || '',
                          lastName: profile?.lastName || '',
                          phone: profile?.phone || '',
                        });
                      } else {
                        setIsEditing(true);
                      }
                    }}
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {isEditing ? (
                    <>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            First Name
                          </label>
                          <Input
                            value={editForm.firstName}
                            onChange={e => setEditForm({ ...editForm, firstName: e.target.value })}
                            placeholder='Enter first name'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Last Name
                          </label>
                          <Input
                            value={editForm.lastName}
                            onChange={e => setEditForm({ ...editForm, lastName: e.target.value })}
                            placeholder='Enter last name'
                          />
                        </div>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Phone Number
                        </label>
                        <Input
                          value={editForm.phone}
                          onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                          placeholder='Enter phone number'
                        />
                      </div>
                      <div className='flex gap-4'>
                        <Button onClick={handleSaveProfile} disabled={isSaving}>
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          variant='outline'
                          onClick={() => setIsEditing(false)}
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            First Name
                          </label>
                          <p className='text-gray-900'>{profile?.firstName || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Last Name
                          </label>
                          <p className='text-gray-900'>{profile?.lastName || 'Not provided'}</p>
                        </div>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Email Address
                        </label>
                        <div className='flex items-center gap-2'>
                          <Mail className='w-4 h-4 text-gray-400' />
                          <p className='text-gray-900'>{profile?.email}</p>
                          {profile?.emailVerified && (
                            <span className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800'>
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Phone Number
                        </label>
                        <div className='flex items-center gap-2'>
                          <Phone className='w-4 h-4 text-gray-400' />
                          <p className='text-gray-900'>{profile?.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Address Management */}
              <Card className='mt-6'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <MapPin className='w-5 h-5' />
                    Saved Addresses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {addresses.length > 0 ? (
                    <div className='space-y-4'>
                      {addresses.map(address => (
                        <div key={address.id} className='border rounded-lg p-4'>
                          <div className='flex items-start justify-between'>
                            <div>
                              <h4 className='font-medium text-gray-900'>{address.name}</h4>
                              <p className='text-gray-600 text-sm mt-1'>
                                {address.line1}
                                {address.line2 && `, ${address.line2}`}
                              </p>
                              <p className='text-gray-600 text-sm'>
                                {address.city}, {address.state} {address.postalCode}
                              </p>
                              <p className='text-gray-600 text-sm'>{address.country}</p>
                              {address.isDefault && (
                                <span className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 mt-2'>
                                  Default
                                </span>
                              )}
                            </div>
                            <Button variant='outline' size='sm'>
                              Edit
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center py-8'>
                      <MapPin className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                      <p className='text-gray-600'>No addresses saved yet</p>
                      <Button className='mt-4'>Add Address</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Account Details Sidebar */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Shield className='w-5 h-5' />
                    Account Details
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Account Type
                    </label>
                    <div className='flex items-center gap-2'>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          profile?.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {profile?.role}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Member Since
                    </label>
                    <div className='flex items-center gap-2'>
                      <Calendar className='w-4 h-4 text-gray-400' />
                      <p className='text-gray-900 text-sm'>
                        {profile?.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString()
                          : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className='pt-4 border-t'>
                    <Button variant='outline' className='w-full'>
                      Change Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

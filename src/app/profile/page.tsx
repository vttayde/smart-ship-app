'use client';

import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/loading';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import {
  AlertCircle,
  Building,
  CheckCircle,
  Edit,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Shield,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const {
    profile,
    addresses,
    loading: profileLoading,
    error,
    updateProfile,
    refreshProfile,
  } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
  });

  useEffect(() => {
    if (profile) {
      setEditForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        company: profile.company || '',
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    try {
      const success = await updateProfile(editForm);

      if (success) {
        setIsEditing(false);
        setMessage('Profile updated successfully!');
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update profile');
        setMessageType('error');
      }
    } catch {
      setMessage('An error occurred while updating profile');
      setMessageType('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        company: profile.company || '',
      });
    }
    setIsEditing(false);
    setMessage('');
  };

  if (isLoading || profileLoading) {
    return (
      <Layout>
        <div className='min-h-screen flex items-center justify-center'>
          <Loading />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className='min-h-screen flex items-center justify-center'>
          <Card className='w-full max-w-md'>
            <CardContent className='p-6 text-center'>
              <Shield className='w-12 h-12 mx-auto mb-4 text-gray-400' />
              <h2 className='text-xl font-semibold mb-2'>Authentication Required</h2>
              <p className='text-gray-600'>Please log in to view your profile.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className='min-h-screen flex items-center justify-center'>
          <Card className='w-full max-w-md'>
            <CardContent className='p-6 text-center'>
              <AlertCircle className='w-12 h-12 mx-auto mb-4 text-red-500' />
              <h2 className='text-xl font-semibold mb-2'>Error Loading Profile</h2>
              <p className='text-gray-600 mb-4'>{error}</p>
              <Button onClick={refreshProfile}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className='min-h-screen bg-gray-50 py-8'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900'>Profile Settings</h1>
            <p className='mt-2 text-gray-600'>
              Manage your account information and shipping addresses
            </p>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center ${
                messageType === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {messageType === 'success' ? (
                <CheckCircle className='w-5 h-5 mr-2' />
              ) : (
                <AlertCircle className='w-5 h-5 mr-2' />
              )}
              {message}
            </div>
          )}

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Profile Information */}
            <div className='lg:col-span-2'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                  <CardTitle className='flex items-center'>
                    <User className='w-5 h-5 mr-2' />
                    Personal Information
                  </CardTitle>
                  {!isEditing && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setIsEditing(true)}
                      className='flex items-center'
                    >
                      <Edit className='w-4 h-4 mr-1' />
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <form onSubmit={handleSaveProfile} className='space-y-6'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            First Name
                          </label>
                          <Input
                            type='text'
                            name='firstName'
                            value={editForm.firstName}
                            onChange={handleInputChange}
                            placeholder='Enter your first name'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Last Name
                          </label>
                          <Input
                            type='text'
                            name='lastName'
                            value={editForm.lastName}
                            onChange={handleInputChange}
                            placeholder='Enter your last name'
                          />
                        </div>
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Phone Number
                        </label>
                        <Input
                          type='tel'
                          name='phone'
                          value={editForm.phone}
                          onChange={handleInputChange}
                          placeholder='Enter your phone number'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Company (Optional)
                        </label>
                        <Input
                          type='text'
                          name='company'
                          value={editForm.company}
                          onChange={handleInputChange}
                          placeholder='Enter your company name'
                        />
                      </div>

                      <div className='flex space-x-3'>
                        <Button type='submit' disabled={isSaving} className='flex items-center'>
                          {isSaving ? (
                            <Loading />
                          ) : (
                            <>
                              <Save className='w-4 h-4 mr-2' />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button
                          type='button'
                          variant='outline'
                          onClick={handleCancel}
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className='space-y-6'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className='flex items-center'>
                          <User className='w-5 h-5 text-gray-400 mr-3' />
                          <div>
                            <p className='text-sm text-gray-600'>Full Name</p>
                            <p className='font-medium'>
                              {profile?.firstName || profile?.lastName
                                ? `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim()
                                : 'Not provided'}
                            </p>
                          </div>
                        </div>

                        <div className='flex items-center'>
                          <Mail className='w-5 h-5 text-gray-400 mr-3' />
                          <div>
                            <p className='text-sm text-gray-600'>Email</p>
                            <p className='font-medium'>{profile?.email}</p>
                          </div>
                        </div>

                        <div className='flex items-center'>
                          <Phone className='w-5 h-5 text-gray-400 mr-3' />
                          <div>
                            <p className='text-sm text-gray-600'>Phone</p>
                            <p className='font-medium'>{profile?.phone || 'Not provided'}</p>
                          </div>
                        </div>

                        <div className='flex items-center'>
                          <Building className='w-5 h-5 text-gray-400 mr-3' />
                          <div>
                            <p className='text-sm text-gray-600'>Company</p>
                            <p className='font-medium'>{profile?.company || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Account Details Sidebar */}
            <div className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center'>
                    <Shield className='w-5 h-5 mr-2' />
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>Account Type</span>
                    <span className='px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium'>
                      {profile?.role}
                    </span>
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>Phone Verified</span>
                    {profile?.phoneVerified ? (
                      <CheckCircle className='w-5 h-5 text-green-500' />
                    ) : (
                      <AlertCircle className='w-5 h-5 text-yellow-500' />
                    )}
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>Member Since</span>
                    <span className='text-sm font-medium'>
                      {profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Addresses Summary */}
              <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                  <CardTitle className='flex items-center'>
                    <MapPin className='w-5 h-5 mr-2' />
                    Addresses
                  </CardTitle>
                  <Button variant='outline' size='sm'>
                    <Plus className='w-4 h-4 mr-1' />
                    Add
                  </Button>
                </CardHeader>
                <CardContent>
                  {addresses && addresses.length > 0 ? (
                    <div className='space-y-3'>
                      {addresses.slice(0, 2).map(address => (
                        <div key={address.id} className='border rounded-lg p-3'>
                          <div className='flex items-center justify-between mb-1'>
                            <span className='font-medium text-sm'>{address.name}</span>
                            {address.isDefault && (
                              <span className='px-2 py-1 bg-green-100 text-green-800 rounded text-xs'>
                                Default
                              </span>
                            )}
                          </div>
                          <p className='text-sm text-gray-600'>
                            {address.street}, {address.city}
                          </p>
                          <p className='text-sm text-gray-600'>
                            {address.state} {address.pincode}
                          </p>
                        </div>
                      ))}
                      {addresses.length > 2 && (
                        <p className='text-sm text-gray-500 text-center'>
                          +{addresses.length - 2} more addresses
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className='text-sm text-gray-500 text-center py-4'>No addresses added yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Bell, Globe, Shield, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'preferences', name: 'Preferences', icon: Globe },
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        <div className='px-4 py-6 sm:px-0'>
          <div className='mb-6'>
            <h1 className='text-3xl font-bold text-gray-900'>Settings</h1>
            <p className='mt-1 text-sm text-gray-500'>
              Manage your account settings and preferences.
            </p>
          </div>

          <div className='flex flex-col lg:flex-row gap-6'>
            {/* Sidebar */}
            <div className='lg:w-64'>
              <nav className='space-y-1'>
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className='w-4 h-4 mr-3' />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className='flex-1'>
              <Card className='p-6'>
                {activeTab === 'profile' && (
                  <div>
                    <h2 className='text-lg font-medium text-gray-900 mb-4'>Profile Information</h2>
                    <div className='space-y-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>Name</label>
                        <Input
                          type='text'
                          defaultValue={session?.user?.name || ''}
                          className='mt-1'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>Email</label>
                        <Input
                          type='email'
                          defaultValue={session?.user?.email || ''}
                          className='mt-1'
                          disabled
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>Phone</label>
                        <Input type='tel' placeholder='Enter your phone number' className='mt-1' />
                      </div>
                      <Button>Save Changes</Button>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div>
                    <h2 className='text-lg font-medium text-gray-900 mb-4'>
                      Notification Preferences
                    </h2>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <h3 className='text-sm font-medium text-gray-900'>Email notifications</h3>
                          <p className='text-sm text-gray-500'>
                            Receive email updates about your orders
                          </p>
                        </div>
                        <input
                          type='checkbox'
                          className='h-4 w-4 text-blue-600 rounded'
                          defaultChecked
                        />
                      </div>
                      <div className='flex items-center justify-between'>
                        <div>
                          <h3 className='text-sm font-medium text-gray-900'>SMS notifications</h3>
                          <p className='text-sm text-gray-500'>
                            Receive SMS updates about order status
                          </p>
                        </div>
                        <input type='checkbox' className='h-4 w-4 text-blue-600 rounded' />
                      </div>
                      <Button>Save Preferences</Button>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div>
                    <h2 className='text-lg font-medium text-gray-900 mb-4'>Security Settings</h2>
                    <div className='space-y-4'>
                      <div>
                        <h3 className='text-sm font-medium text-gray-900 mb-2'>Change Password</h3>
                        <div className='space-y-3'>
                          <Input type='password' placeholder='Current password' />
                          <Input type='password' placeholder='New password' />
                          <Input type='password' placeholder='Confirm new password' />
                        </div>
                      </div>
                      <Button>Update Password</Button>
                    </div>
                  </div>
                )}

                {activeTab === 'preferences' && (
                  <div>
                    <h2 className='text-lg font-medium text-gray-900 mb-4'>Preferences</h2>
                    <div className='space-y-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>Language</label>
                        <select className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'>
                          <option>English</option>
                          <option>Hindi</option>
                          <option>Spanish</option>
                        </select>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>Timezone</label>
                        <select className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'>
                          <option>Asia/Kolkata</option>
                          <option>America/New_York</option>
                          <option>Europe/London</option>
                        </select>
                      </div>
                      <Button>Save Preferences</Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });
  const [accountSettings, setAccountSettings] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login');
    }
  }, [session, status, router]);

  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleAccountSettingChange = (setting: keyof typeof accountSettings, value: string) => {
    setAccountSettings(prev => ({
      ...prev,
      [setting]: value,
    }));
  };

  const handleSave = () => {
    // Save settings logic would go here
    alert('Settings saved successfully!');
  };

  if (status === 'loading') {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>Settings</h1>
          <p className='mt-2 text-gray-600'>Manage your account preferences and notifications</p>
        </div>

        <div className='space-y-6'>
          {/* Account Information */}
          <Card className='p-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Account Information</h2>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Name</label>
                <p className='mt-1 text-sm text-gray-900'>{session.user?.name || 'Not provided'}</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>Email</label>
                <p className='mt-1 text-sm text-gray-900'>
                  {session.user?.email || 'Not provided'}
                </p>
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className='p-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4'>Notification Preferences</h2>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <label className='text-sm font-medium text-gray-700'>Email Notifications</label>
                  <p className='text-sm text-gray-500'>Receive notifications via email</p>
                </div>
                <button
                  onClick={() => handleNotificationChange('email')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.email ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.email ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <label className='text-sm font-medium text-gray-700'>Push Notifications</label>
                  <p className='text-sm text-gray-500'>
                    Receive push notifications in your browser
                  </p>
                </div>
                <button
                  onClick={() => handleNotificationChange('push')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.push ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.push ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className='flex items-center justify-between'>
                <div>
                  <label className='text-sm font-medium text-gray-700'>SMS Notifications</label>
                  <p className='text-sm text-gray-500'>Receive notifications via SMS</p>
                </div>
                <button
                  onClick={() => handleNotificationChange('sms')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.sms ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.sms ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          {/* App Settings */}
          <Card className='p-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4'>App Preferences</h2>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Theme</label>
                <select
                  value={accountSettings.theme}
                  onChange={e => handleAccountSettingChange('theme', e.target.value)}
                  className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm'
                >
                  <option value='light'>Light</option>
                  <option value='dark'>Dark</option>
                  <option value='system'>System</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Language</label>
                <select
                  value={accountSettings.language}
                  onChange={e => handleAccountSettingChange('language', e.target.value)}
                  className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm'
                >
                  <option value='en'>English</option>
                  <option value='hi'>Hindi</option>
                  <option value='mr'>Marathi</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>Timezone</label>
                <select
                  value={accountSettings.timezone}
                  onChange={e => handleAccountSettingChange('timezone', e.target.value)}
                  className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm'
                >
                  <option value='UTC'>UTC</option>
                  <option value='Asia/Kolkata'>India Standard Time</option>
                  <option value='America/New_York'>Eastern Time</option>
                  <option value='America/Los_Angeles'>Pacific Time</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className='flex justify-end'>
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

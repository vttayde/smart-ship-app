'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate password reset request
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
    } catch {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          <div className='text-center'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>Check your email</h2>
            <p className='text-gray-600 mb-6'>
              If an account with email {email} exists, we sent you a password reset link.
            </p>
            <Link href='/auth/login'>
              <Button>Return to Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='text-center text-3xl font-bold text-gray-900'>Forgot your password?</h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>
        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          {error && (
            <div className='bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded'>
              {error}
            </div>
          )}

          <div>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
              Email address
            </label>
            <Input
              id='email'
              name='email'
              type='email'
              autoComplete='email'
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='Enter your email'
              className='mt-1'
            />
          </div>

          <div>
            <Button type='submit' disabled={isLoading} className='w-full'>
              {isLoading ? 'Sending...' : 'Send reset link'}
            </Button>
          </div>

          <div className='text-center'>
            <Link href='/auth/login' className='text-sm text-blue-600 hover:text-blue-500'>
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Implement forgot password functionality
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    setIsLoading(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          <div className='text-center'>
            <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>Check your email</h2>
            <p className='mt-2 text-sm text-gray-600'>
              We&apos;ve sent a password reset link to your email address.
            </p>
          </div>
          <div className='text-center'>
            <Link href='/auth/login' className='font-medium text-blue-600 hover:text-blue-500'>
              Back to login
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
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Forgot your password?
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>
        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div>
            <label htmlFor='email' className='sr-only'>
              Email address
            </label>
            <Input
              id='email'
              name='email'
              type='email'
              autoComplete='email'
              required
              className='relative block w-full'
              placeholder='Email address'
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Button
              type='submit'
              disabled={isLoading}
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50'
            >
              {isLoading ? 'Sending...' : 'Send reset link'}
            </Button>
          </div>

          <div className='text-center'>
            <Link href='/auth/login' className='font-medium text-blue-600 hover:text-blue-500'>
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

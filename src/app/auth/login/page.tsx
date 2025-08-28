'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, getSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle, Truck, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials. Please try again.');
      } else {
        // Wait for session to update
        const session = await getSession();
        if (session) {
          router.push('/dashboard');
          router.refresh();
        }
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex'>
      {/* Left Side - Branding & Features */}
      <div className='hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 p-12 flex-col justify-between text-white'>
        <div>
          <Link href='/' className='flex items-center space-x-3 mb-12'>
            <Truck className='w-8 h-8' />
            <span className='text-2xl font-bold'>Ship Smart</span>
          </Link>

          <div className='space-y-8'>
            <div>
              <h1 className='text-4xl font-bold mb-4'>Welcome back to the future of shipping</h1>
              <p className='text-xl text-blue-100'>
                Access your dashboard and continue managing your shipments with ease.
              </p>
            </div>

            <div className='space-y-6'>
              <div className='flex items-center space-x-4'>
                <div className='w-12 h-12 bg-white/20 rounded-full flex items-center justify-center'>
                  <CheckCircle className='w-6 h-6' />
                </div>
                <div>
                  <h3 className='font-semibold'>Quick Access Dashboard</h3>
                  <p className='text-blue-100'>
                    View all your shipments and analytics in one place
                  </p>
                </div>
              </div>

              <div className='flex items-center space-x-4'>
                <div className='w-12 h-12 bg-white/20 rounded-full flex items-center justify-center'>
                  <Shield className='w-6 h-6' />
                </div>
                <div>
                  <h3 className='font-semibold'>Secure & Reliable</h3>
                  <p className='text-blue-100'>Enterprise-grade security for your shipping data</p>
                </div>
              </div>

              <div className='flex items-center space-x-4'>
                <div className='w-12 h-12 bg-white/20 rounded-full flex items-center justify-center'>
                  <Truck className='w-6 h-6' />
                </div>
                <div>
                  <h3 className='font-semibold'>Real-time Tracking</h3>
                  <p className='text-blue-100'>Monitor your packages every step of the way</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='text-sm text-blue-100'>
          <p>© 2025 Ship Smart. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className='w-full lg:w-1/2 flex items-center justify-center p-8'>
        <div className='max-w-md w-full space-y-8'>
          {/* Mobile Logo */}
          <div className='lg:hidden text-center'>
            <Link href='/' className='inline-flex items-center space-x-3'>
              <Truck className='w-8 h-8 text-blue-600' />
              <span className='text-2xl font-bold text-gray-900'>Ship Smart</span>
            </Link>
          </div>

          <div className='text-center lg:text-left'>
            <Badge className='mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100'>
              <Lock className='w-4 h-4 mr-2' />
              Secure Login
            </Badge>
            <h2 className='text-3xl font-bold text-gray-900 mb-2'>Sign in to your account</h2>
            <p className='text-gray-600'>
              Welcome back! Please enter your credentials to access your dashboard.
            </p>
          </div>

          <Card className='border-0 shadow-xl'>
            <CardContent className='p-8'>
              {/* Demo Credentials Info */}
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
                <h4 className='font-semibold text-blue-900 mb-2'>Demo Credentials</h4>
                <div className='text-sm text-blue-800 space-y-1'>
                  <p>
                    <strong>User:</strong> demo@smartship.com / demo123
                  </p>
                  <p>
                    <strong>Admin:</strong> admin@smartship.com / admin123
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className='space-y-6'>
                {error && (
                  <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2'>
                    <div className='w-4 h-4 rounded-full bg-red-200 flex-shrink-0'></div>
                    <span>{error}</span>
                  </div>
                )}

                <div className='space-y-4'>
                  <div>
                    <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
                      Email Address
                    </label>
                    <div className='relative'>
                      <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                      <Input
                        id='email'
                        name='email'
                        type='email'
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder='Enter your email'
                        className='pl-10 h-12'
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor='password'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Password
                    </label>
                    <div className='relative'>
                      <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                      <Input
                        id='password'
                        name='password'
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder='Enter your password'
                        className='pl-10 pr-10 h-12'
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                      >
                        {showPassword ? (
                          <EyeOff className='w-5 h-5' />
                        ) : (
                          <Eye className='w-5 h-5' />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className='flex items-center justify-between'>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      className='rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50'
                    />
                    <span className='ml-2 text-sm text-gray-600'>Remember me</span>
                  </label>
                  <Link
                    href='/auth/forgot-password'
                    className='text-sm text-blue-600 hover:text-blue-500 font-medium'
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button type='submit' disabled={isLoading} className='w-full h-12 text-lg'>
                  {isLoading ? (
                    <div className='flex items-center space-x-2'>
                      <Loading size='sm' />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className='flex items-center space-x-2'>
                      <span>Sign In</span>
                      <ArrowRight className='w-5 h-5' />
                    </div>
                  )}
                </Button>

                <div className='text-center'>
                  <span className='text-sm text-gray-600'>
                    Don&apos;t have an account?{' '}
                    <Link
                      href='/auth/signup'
                      className='text-blue-600 hover:text-blue-500 font-medium'
                    >
                      Create one now
                    </Link>
                  </span>
                </div>

                {/* Social Login Options */}
                <div className='mt-8'>
                  <div className='relative'>
                    <div className='absolute inset-0 flex items-center'>
                      <div className='w-full border-t border-gray-200' />
                    </div>
                    <div className='relative flex justify-center text-sm'>
                      <span className='px-4 bg-white text-gray-500'>Or continue with</span>
                    </div>
                  </div>

                  <div className='mt-6'>
                    <div className='relative'>
                      <div className='absolute inset-0 flex items-center'>
                        <div className='w-full border-t border-gray-200' />
                      </div>
                      <div className='relative flex justify-center text-sm'>
                        <span className='px-4 bg-white text-gray-500'>
                          Social login coming soon
                        </span>
                      </div>
                    </div>

                    <div className='mt-6 text-center'>
                      <p className='text-sm text-gray-500'>
                        Google and Facebook login will be available in production
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import { validateEmail, validatePassword, validatePhone } from '@/lib/auth-utils';
import {
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Shield,
  Star,
  Truck,
  User,
  UserPlus,
} from 'lucide-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (formErrors[e.target.name]) {
      setFormErrors({
        ...formErrors,
        [e.target.name]: '',
      });
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      errors.phone = 'Invalid phone number format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.errors[0];
      }
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      // Call signup API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account');
        return;
      }

      // Auto sign in after successful registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          'Account created successfully, but failed to sign in. Please try logging in manually.'
        );
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex'>
      {/* Left Side - Branding & Features */}
      <div className='hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-blue-700 p-12 flex-col justify-between text-white'>
        <div>
          <Link href='/' className='flex items-center space-x-3 mb-12'>
            <Truck className='w-8 h-8' />
            <span className='text-2xl font-bold'>Ship Smart</span>
          </Link>

          <div className='space-y-8'>
            <div>
              <h1 className='text-4xl font-bold mb-4'>Join thousands of satisfied customers</h1>
              <p className='text-xl text-purple-100'>
                Start your shipping journey with the most trusted logistics platform in India.
              </p>
            </div>

            <div className='space-y-6'>
              <div className='flex items-center space-x-4'>
                <div className='w-12 h-12 bg-white/20 rounded-full flex items-center justify-center'>
                  <Star className='w-6 h-6' />
                </div>
                <div>
                  <h3 className='font-semibold'>50,000+ Happy Customers</h3>
                  <p className='text-purple-100'>
                    Join our growing community of satisfied shippers
                  </p>
                </div>
              </div>

              <div className='flex items-center space-x-4'>
                <div className='w-12 h-12 bg-white/20 rounded-full flex items-center justify-center'>
                  <Shield className='w-6 h-6' />
                </div>
                <div>
                  <h3 className='font-semibold'>100% Secure Platform</h3>
                  <p className='text-purple-100'>
                    Your data and shipments are protected with enterprise-grade security
                  </p>
                </div>
              </div>

              <div className='flex items-center space-x-4'>
                <div className='w-12 h-12 bg-white/20 rounded-full flex items-center justify-center'>
                  <CheckCircle className='w-6 h-6' />
                </div>
                <div>
                  <h3 className='font-semibold'>Instant Rate Comparison</h3>
                  <p className='text-purple-100'>
                    Compare rates from 5+ courier partners in seconds
                  </p>
                </div>
              </div>
            </div>

            <div className='bg-white/10 rounded-lg p-6'>
              <div className='flex items-center space-x-4 mb-4'>
                <div className='flex space-x-1'>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className='w-5 h-5 text-yellow-400 fill-current' />
                  ))}
                </div>
                <span className='font-semibold'>4.9/5 Rating</span>
              </div>
              <p className='text-purple-100 italic'>
                &ldquo;Ship Smart has transformed our business logistics. We save 30% on shipping costs
                and our customers love the tracking experience!&rdquo;
              </p>
              <div className='mt-3 text-sm'>
                <span className='font-medium'>- Rajesh Kumar, TechCorp Solutions</span>
              </div>
            </div>
          </div>
        </div>

        <div className='text-sm text-purple-100'>
          <p>© 2025 Ship Smart. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className='w-full lg:w-1/2 flex items-center justify-center p-8'>
        <div className='max-w-md w-full space-y-8'>
          {/* Mobile Logo */}
          <div className='lg:hidden text-center'>
            <Link href='/' className='inline-flex items-center space-x-3'>
              <Truck className='w-8 h-8 text-purple-600' />
              <span className='text-2xl font-bold text-gray-900'>Ship Smart</span>
            </Link>
          </div>

          <div className='text-center lg:text-left'>
            <Badge className='mb-4 bg-purple-100 text-purple-800 hover:bg-purple-100'>
              <UserPlus className='w-4 h-4 mr-2' />
              Create Account
            </Badge>
            <h2 className='text-3xl font-bold text-gray-900 mb-2'>Create your account</h2>
            <p className='text-gray-600'>
              Get started with your free account and start shipping smarter today.
            </p>
          </div>

          <Card className='border-0 shadow-xl'>
            <CardContent className='p-8'>
              <form onSubmit={handleSubmit} className='space-y-6'>
                {error && (
                  <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2'>
                    <div className='w-4 h-4 rounded-full bg-red-200 flex-shrink-0' />
                    <span>{error}</span>
                  </div>
                )}

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label
                      htmlFor='firstName'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      First Name
                    </label>
                    <div className='relative'>
                      <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                      <Input
                        id='firstName'
                        name='firstName'
                        type='text'
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder='First name'
                        className='pl-10 h-12'
                      />
                    </div>
                    {formErrors.firstName && (
                      <p className='mt-1 text-sm text-red-600'>{formErrors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor='lastName'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Last Name
                    </label>
                    <div className='relative'>
                      <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                      <Input
                        id='lastName'
                        name='lastName'
                        type='text'
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder='Last name'
                        className='pl-10 h-12'
                      />
                    </div>
                    {formErrors.lastName && (
                      <p className='mt-1 text-sm text-red-600'>{formErrors.lastName}</p>
                    )}
                  </div>
                </div>

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
                  {formErrors.email && (
                    <p className='mt-1 text-sm text-red-600'>{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor='phone' className='block text-sm font-medium text-gray-700 mb-2'>
                    Phone Number <span className='text-gray-400'>(Optional)</span>
                  </label>
                  <div className='relative'>
                    <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                    <Input
                      id='phone'
                      name='phone'
                      type='tel'
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder='+91 9876543210'
                      className='pl-10 h-12'
                    />
                  </div>
                  {formErrors.phone && (
                    <p className='mt-1 text-sm text-red-600'>{formErrors.phone}</p>
                  )}
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
                      placeholder='Create a strong password'
                      className='pl-10 pr-10 h-12'
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                    >
                      {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className='mt-1 text-sm text-red-600'>{formErrors.password}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor='confirmPassword'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Confirm Password
                  </label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                    <Input
                      id='confirmPassword'
                      name='confirmPassword'
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder='Confirm your password'
                      className='pl-10 pr-10 h-12'
                    />
                    <button
                      type='button'
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                    >
                      {showConfirmPassword ? (
                        <EyeOff className='w-5 h-5' />
                      ) : (
                        <Eye className='w-5 h-5' />
                      )}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <p className='mt-1 text-sm text-red-600'>{formErrors.confirmPassword}</p>
                  )}
                </div>

                <div className='flex items-start'>
                  <input
                    type='checkbox'
                    required
                    className='mt-1 rounded border-gray-300 text-purple-600 shadow-sm focus:border-purple-300 focus:ring focus:ring-purple-200 focus:ring-opacity-50'
                  />
                  <span className='ml-2 text-sm text-gray-600'>
                    I agree to the{' '}
                    <Link
                      href='/terms'
                      className='text-purple-600 hover:text-purple-500 font-medium'
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href='/privacy'
                      className='text-purple-600 hover:text-purple-500 font-medium'
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </div>

                <Button
                  type='submit'
                  disabled={isLoading}
                  className='w-full h-12 text-lg bg-purple-600 hover:bg-purple-700'
                >
                  {isLoading ? (
                    <div className='flex items-center space-x-2'>
                      <Loading size='sm' />
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    <div className='flex items-center space-x-2'>
                      <span>Create Account</span>
                      <ArrowRight className='w-5 h-5' />
                    </div>
                  )}
                </Button>

                <div className='text-center'>
                  <span className='text-sm text-gray-600'>
                    Already have an account?{' '}
                    <Link
                      href='/auth/login'
                      className='text-purple-600 hover:text-purple-500 font-medium'
                    >
                      Sign in here
                    </Link>
                  </span>
                </div>

                {/* Social Signup Options */}
                <div className='mt-8'>
                  <div className='relative'>
                    <div className='absolute inset-0 flex items-center'>
                      <div className='w-full border-t border-gray-200' />
                    </div>
                    <div className='relative flex justify-center text-sm'>
                      <span className='px-4 bg-white text-gray-500'>Or sign up with</span>
                    </div>
                  </div>

                  <div className='mt-6 grid grid-cols-2 gap-4'>
                    <Button variant='outline' className='h-12'>
                      <svg className='w-5 h-5 mr-2' viewBox='0 0 24 24'>
                        <path
                          fill='currentColor'
                          d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                        />
                        <path
                          fill='currentColor'
                          d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                        />
                        <path
                          fill='currentColor'
                          d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                        />
                        <path
                          fill='currentColor'
                          d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                        />
                      </svg>
                      Google
                    </Button>
                    <Button variant='outline' className='h-12'>
                      <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 24 24'>
                        <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                      </svg>
                      Facebook
                    </Button>
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

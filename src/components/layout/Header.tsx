'use client';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import {
  BarChart3,
  Bell,
  ChevronDown,
  History,
  LogOut,
  LucideIcon,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  Truck,
  User,
  X,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface NavigationItem {
  name: string;
  href: string;
  icon?: LucideIcon;
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const publicNavigationItems: NavigationItem[] = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Track Shipment', href: '/tracking/enhanced' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: '/contact' },
  ];

  const dashboardNavigationItems: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard/enhanced', icon: BarChart3 },
    { name: 'Ship Now', href: '/shipping/enhanced', icon: Plus },
    { name: 'My Orders', href: '/orders', icon: Package },
    { name: 'Track', href: '/tracking/enhanced', icon: Search },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const userMenuItems: NavigationItem[] = [
    { name: 'My Profile', href: '/profile', icon: User },
    { name: 'Order History', href: '/orders', icon: History },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isDashboard = pathname?.startsWith('/dashboard');
  const navigationItems = isDashboard ? dashboardNavigationItems : publicNavigationItems;

  const isActivePath = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <header className='bg-white shadow-sm border-b sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <Link href={isAuthenticated ? '/dashboard' : '/'} className='flex items-center space-x-3'>
            <Truck className='w-8 h-8 text-blue-600' />
            <span className='text-xl font-bold text-gray-900'>Ship Smart</span>
            {isDashboard && (
              <Badge variant='secondary' className='ml-2'>
                Dashboard
              </Badge>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center space-x-1'>
            {navigationItems.map(item => {
              const isActive = isActivePath(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  {item.icon && <item.icon className='w-4 h-4' />}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Auth Section */}
          <div className='hidden md:flex items-center space-x-4'>
            {isAuthenticated && user ? (
              <div className='flex items-center space-x-4'>
                {/* Notifications */}
                <button className='relative p-2 text-gray-400 hover:text-gray-600 transition-colors'>
                  <Bell className='w-5 h-5' />
                  <span className='absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400' />
                </button>

                {/* Quick Ship Button */}
                {isDashboard && (
                  <Button
                    onClick={() => router.push('/dashboard/ship')}
                    className='bg-blue-600 hover:bg-blue-700'
                  >
                    <Plus className='w-4 h-4 mr-2' />
                    Ship Now
                  </Button>
                )}

                {/* User Menu Dropdown */}
                <div className='relative'>
                  <button
                    className='flex items-center space-x-3 text-sm bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 p-2 hover:bg-gray-50 transition-colors'
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium'>
                      {user.name
                        ? user.name.charAt(0).toUpperCase()
                        : user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className='text-left'>
                      <div className='font-medium text-gray-900'>{user.name || 'User'}</div>
                      <div className='text-xs text-gray-500'>{user.email}</div>
                    </div>
                    <ChevronDown className='w-4 h-4 text-gray-400' />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className='absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5'>
                      <div className='py-1'>
                        {userMenuItems.map(item => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            {item.icon && <item.icon className='w-4 h-4 mr-3' />}
                            {item.name}
                          </Link>
                        ))}
                        <hr className='my-1' />
                        <button
                          onClick={handleLogout}
                          className='flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                        >
                          <LogOut className='w-4 h-4 mr-3' />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className='flex items-center space-x-3'>
                <Link href='/auth/login'>
                  <Button variant='outline'>Sign In</Button>
                </Link>
                <Link href='/auth/signup'>
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden'>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 p-2 rounded-md'
            >
              {isMobileMenuOpen ? (
                <X className='block h-6 w-6' />
              ) : (
                <Menu className='block h-6 w-6' />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className='md:hidden'>
            <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
              {navigationItems.map(item => {
                const isActive = isActivePath(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 text-base font-medium rounded-md ${isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon && <item.icon className='w-5 h-5' />}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Mobile Auth Section */}
            <div className='pt-4 pb-3 border-t border-gray-200'>
              {isAuthenticated && user ? (
                <div className='flex items-center px-5'>
                  <div className='w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium'>
                    {user.name
                      ? user.name.charAt(0).toUpperCase()
                      : user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className='ml-3'>
                    <div className='text-base font-medium text-gray-800'>{user.name || 'User'}</div>
                    <div className='text-sm text-gray-500'>{user.email}</div>
                  </div>
                </div>
              ) : (
                <div className='px-5 space-y-3'>
                  <Link href='/auth/login' onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant='outline' className='w-full'>
                      Sign In
                    </Button>
                  </Link>
                  <Link href='/auth/signup' onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className='w-full'>Get Started</Button>
                  </Link>
                </div>
              )}

              {isAuthenticated && user && (
                <div className='mt-3 px-2 space-y-1'>
                  {userMenuItems.map(item => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className='flex items-center px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md'
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.icon && <item.icon className='w-5 h-5 mr-3' />}
                      {item.name}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className='flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md'
                  >
                    <LogOut className='w-5 h-5 mr-3' />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

import { PWAProvider } from '@/components/pwa/PWAProvider';
import AuthProvider from '@/providers/AuthProvider';
import { StoreProvider } from '@/providers/StoreProvider';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SmartShip - AI-Powered Shipping Platform',
  description:
    'Intelligent shipping platform with AI-powered courier recommendations, advanced analytics, and seamless logistics management',
  manifest: '/manifest.json',
  keywords: ['shipping', 'logistics', 'courier', 'AI', 'analytics', 'smart shipping'],
  authors: [{ name: 'SmartShip Team' }],
  creator: 'SmartShip',
  publisher: 'SmartShip',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SmartShip',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'application-name': 'SmartShip',
    'msapplication-TileColor': '#2563eb',
    'theme-color': '#2563eb',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        <script src='https://checkout.razorpay.com/v1/checkout.js' async />
        <link rel='manifest' href='/manifest.json' />
        <meta name='theme-color' content='#2563eb' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
        />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content='SmartShip' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='application-name' content='SmartShip' />
        <meta name='msapplication-TileColor' content='#2563eb' />
        <meta name='msapplication-config' content='/browserconfig.xml' />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <StoreProvider>
          <AuthProvider>
            <PWAProvider>{children}</PWAProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}

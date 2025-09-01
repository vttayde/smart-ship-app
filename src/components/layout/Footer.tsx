import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Services',
      links: [
        { name: 'Domestic Shipping', href: '/services/domestic' },
        { name: 'Express Delivery', href: '/services/express' },
        { name: 'Package Tracking', href: '/tracking' },
        { name: 'Bulk Shipping', href: '/services/bulk' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Contact', href: '/contact' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press', href: '/press' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Shipping Guide', href: '/guide' },
        { name: 'API Documentation', href: '/docs' },
        { name: 'Status Page', href: '/status' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
        { name: 'Data Protection', href: '/data-protection' },
      ],
    },
  ];

  return (
    <footer className='bg-gray-50 border-t'>
      <div className='max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
        {/* Main Footer Content */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8'>
          {/* Company Info */}
          <div className='lg:col-span-1'>
            <Link href='/' className='flex items-center space-x-2 mb-4'>
              <div className='text-2xl'>📦</div>
              <span className='text-xl font-bold text-gray-900'>Ship Smart</span>
            </Link>
            <p className='text-gray-600 text-sm mb-4'>
              India&apos;s leading logistics aggregation platform. Compare courier services and book
              shipments across the country with ease.
            </p>
            <div className='flex space-x-4'>
              <a
                href='https://twitter.com'
                target='_blank'
                rel='noopener noreferrer'
                className='text-gray-400 hover:text-gray-600'
              >
                <span className='sr-only'>Twitter</span>
                <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' />
                </svg>
              </a>
              <a
                href='https://linkedin.com'
                target='_blank'
                rel='noopener noreferrer'
                className='text-gray-400 hover:text-gray-600'
              >
                <span className='sr-only'>LinkedIn</span>
                <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                </svg>
              </a>
              <a
                href='https://facebook.com'
                target='_blank'
                rel='noopener noreferrer'
                className='text-gray-400 hover:text-gray-600'
              >
                <span className='sr-only'>Facebook</span>
                <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
                </svg>
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map(section => (
            <div key={section.title}>
              <h3 className='text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4'>
                {section.title}
              </h3>
              <ul className='space-y-3'>
                {section.links.map(link => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className='border-t border-gray-200 my-8' />

        {/* Bottom Footer */}
        <div className='flex flex-col md:flex-row justify-between items-center'>
          <div className='flex space-x-6 mb-4 md:mb-0'>
            <p className='text-sm text-gray-600'>
              © {currentYear} Ship Smart. All rights reserved.
            </p>
          </div>
          <div className='flex space-x-6'>
            <span className='text-sm text-gray-600'>Made with ❤️ in India</span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className='mt-8 pt-8 border-t border-gray-200'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='flex items-center justify-center p-4 bg-white rounded-lg border'>
              <span className='text-sm font-medium text-gray-600'>🔒 SSL Secured</span>
            </div>
            <div className='flex items-center justify-center p-4 bg-white rounded-lg border'>
              <span className='text-sm font-medium text-gray-600'>📱 24/7 Support</span>
            </div>
            <div className='flex items-center justify-center p-4 bg-white rounded-lg border'>
              <span className='text-sm font-medium text-gray-600'>🚚 Pan India</span>
            </div>
            <div className='flex items-center justify-center p-4 bg-white rounded-lg border'>
              <span className='text-sm font-medium text-gray-600'>⚡ Real-time</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

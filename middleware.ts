import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user is authenticated
        if (!token) return false

        // Protect admin routes
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token.role === 'ADMIN' || token.role === 'SUPER_ADMIN'
        }

        // Protect dashboard and user routes
        if (
          req.nextUrl.pathname.startsWith('/dashboard') ||
          req.nextUrl.pathname.startsWith('/profile') ||
          req.nextUrl.pathname.startsWith('/orders') ||
          req.nextUrl.pathname.startsWith('/bookings')
        ) {
          return !!token
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/orders/:path*',
    '/bookings/:path*',
    '/admin/:path*',
  ]
}

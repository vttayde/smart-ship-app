"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/Button"
import { User, LogOut, Package, History, Settings, Menu, X } from "lucide-react"

export default function Header() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const navigationItems = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Tracking", href: "/tracking" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl">📦</div>
            <span className="text-xl font-bold text-gray-900">Ship Smart</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => router.push("/book")}
                  className="text-sm"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Book Shipment
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                  className="text-sm"
                >
                  <User className="w-4 h-4 mr-2" />
                  {user.name || user.email}
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/auth/login")}
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => router.push("/auth/signup")}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {isAuthenticated && user ? (
                <>
                  <div className="border-t pt-4 mt-4">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/book"
                      className="text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Book Shipment
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium w-full text-left"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t pt-4 mt-4 space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      router.push("/auth/login")
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full"
                    onClick={() => {
                      router.push("/auth/signup")
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

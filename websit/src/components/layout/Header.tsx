'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Menu, X, Phone, User, LogOut } from 'lucide-react';
import { NAVIGATION_LINKS, SITE_CONFIG, CONTACT_INFO } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/contexts/auth-context';
import { AuthModal } from '@/components/auth';

// إضافة دالة مساعدة لاستخراج الاسم
const getDisplayName = (user: any) => {
  if (user?.name) return user.name;
  if (user?.email) {
    // استخراج الجزء قبل @ من البريد الإلكتروني
    const emailName = user.email.split('@')[0];
    // تحويل إلى اسم مناسب (إزالة الأرقام والرموز)
    return emailName.replace(/[0-9._-]/g, ' ').replace(/\s+/g, ' ').trim() || 'مستخدم';
  }
  return 'مستخدم';
};

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* الشعار */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-24 h-24 relative">
                <Image
                  src="/medflow.png"
                  alt="MedFlow Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
          </div>

          {/* التنقل - سطح المكتب */}
          <nav className="hidden md:flex space-x-8 space-x-reverse">
            {NAVIGATION_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* أزرار العمل */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 space-x-reverse text-gray-700 hover:text-primary-600"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{getDisplayName(user)}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-medium">{getDisplayName(user)}</p>
                      <p className="text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      لوحة التحكم
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      الملف الشخصي
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <LogOut className="w-4 h-4" />
                        <span>تسجيل الخروج</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAuthModalMode('login');
                    setShowAuthModal(true);
                  }}
                >
                  تسجيل الدخول
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setAuthModalMode('register');
                    setShowAuthModal(true);
                  }}
                >
                  إنشاء حساب
                </Button>
              </>
            )}
          </div>

          {/* قائمة الهاتف المحمول */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* قائمة الهاتف المحمول المنسدلة */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {NAVIGATION_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-4 space-y-2 border-t">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 text-sm text-gray-700">
                      <p className="font-medium">{getDisplayName(user)}</p>
                      <p className="text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      لوحة التحكم
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      الملف الشخصي
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 space-x-reverse w-full px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setAuthModalMode('login');
                        setShowAuthModal(true);
                        setIsMenuOpen(false);
                      }}
                    >
                      تسجيل الدخول
                    </Button>
                    <Button
                      className="w-full"
                      onClick={() => {
                        setAuthModalMode('register');
                        setShowAuthModal(true);
                        setIsMenuOpen(false);
                      }}
                    >
                      إنشاء حساب
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authModalMode}
      />

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

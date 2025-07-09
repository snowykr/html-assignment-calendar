'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function TopNav() {
  const pathname = usePathname();
  const t = useTranslations('bottomTabs');
  const tAuth = useTranslations('auth');
  const tNav = useTranslations('navigation');
  const tDemo = useTranslations('demo');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const isDemoMode = pathname.includes('/demo/');
  
  const tabs = isDemoMode ? [
    { href: '/demo/calendar', label: t('calendar') },
    { href: '/demo/subjects', label: t('subjects') },
    { href: '/demo/settings', label: t('settings') }
  ] : [
    { href: '/calendar', label: t('calendar') },
    { href: '/subjects', label: t('subjects') },
    { href: '/settings', label: t('settings') }
  ];
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="hidden lg:fixed lg:top-0 lg:left-0 lg:right-0 lg:z-50 lg:flex items-center justify-between py-4 px-8 bg-white shadow-sm border-b border-gray-200">
      <div className="flex-1">
        {isDemoMode ? (
          <Link 
            href="/"
            className="inline-flex items-center gap-3 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg transition-all group w-fit"
          >
            <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              {tDemo('demoMode')}
            </div>
            <span className="text-sm font-medium">
              {tAuth('signIn')}
            </span>
          </Link>
        ) : (
          (status === 'loading' || session) && (
            <div className="relative" ref={userMenuRef}>
              {status === 'loading' ? (
                <div className="flex items-center gap-2 p-1">
                  <div className="animate-pulse w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="text-left">
                    <div className="animate-pulse w-20 h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="animate-pulse w-16 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {session?.user?.image && (
                      <Image 
                        src={session?.user?.image || ''} 
                        alt={session?.user?.name || ''} 
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                      <p className="text-xs text-gray-500">{session?.user?.email}</p>
                    </div>
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <button
                        onClick={() => {
                          signOut({ callbackUrl: '/' });
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        {tAuth('signOut')}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )
        )}
      </div>
      
      <div className="flex items-center gap-8">
        {isDemoMode ? (
          // 데모 모드에서는 항상 탭 표시
          tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`
                px-6 py-2 rounded-lg text-sm font-medium transition-all
                ${pathname === tab.href 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              {tab.label}
            </Link>
          ))
        ) : (
          status === 'loading' || !session ? (
            // 로딩 중이거나 미로그인 시 탭 버튼 스켈레톤
            tabs.map((tab, index) => (
              <div key={index} className="px-6 py-2 rounded-lg">
                <div className="animate-pulse w-12 h-5 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : (
            tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`
                  px-6 py-2 rounded-lg text-sm font-medium transition-all
                  ${pathname === tab.href 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                {tab.label}
              </Link>
            ))
          )
        )}
      </div>
      
      <div className="flex items-center gap-4 flex-1 justify-end">
        {!isDemoMode && status !== 'loading' && !session && (
          <button
            onClick={() => signIn('google')}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
          >
            {tAuth('signIn')}
          </button>
        )}
      </div>
    </nav>
  );
}
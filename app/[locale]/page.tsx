'use client';

import { useTranslations, useLocale } from 'next-intl';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from '@/navigation';
import { useEffect, useState } from 'react';
import { getCookie } from '@/utils/utils';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
  const t = useTranslations('landing');
  const tAuth = useTranslations('auth');
  const tSettings = useTranslations('settings');
  const tDemo = useTranslations('demo');
  const { data: session, status } = useSession();
  const router = useRouter();
  const locale = useLocale();
  const [selectedLocale, setSelectedLocale] = useState(() => {
    const cookieLocale = getCookie('NEXT_LOCALE');
    return cookieLocale || locale;
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleLanguageChange = (newLocale: string) => {
    setSelectedLocale(newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    router.refresh();
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#000000');
      }
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#f2f2f7');
      }
    }
  };

  useEffect(() => {
    const initializeDarkMode = () => {
      const savedTheme = localStorage.getItem('theme');
      
      if (savedTheme) {
        const isDark = savedTheme === 'dark';
        setIsDarkMode(isDark);
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        }
      }
    };
    
    initializeDarkMode();
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/calendar');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[var(--color-bg-primary)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{tAuth('loading')}</p>
        </div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-black dark:to-[var(--color-bg-secondary)] flex items-center justify-center px-4 relative transition-colors">
      {/* 언어 선택 및 다크모드 버튼 */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={toggleDarkMode}
          className="p-2 text-sm border border-gray-300 dark:border-[var(--color-border-secondary)] rounded-lg bg-white dark:bg-[var(--color-bg-secondary)] shadow-sm hover:bg-gray-50 dark:hover:bg-[var(--color-bg-tertiary)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <SunIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          ) : (
            <MoonIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          )}
        </button>
        <select 
          className="px-3 py-2 text-sm border border-gray-300 dark:border-[var(--color-border-secondary)] rounded-lg bg-white dark:bg-[var(--color-bg-secondary)] text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={selectedLocale}
          onChange={(e) => handleLanguageChange(e.target.value)}
          aria-label={tSettings('language')}
        >
          <option value="ko">{tSettings('korean')}</option>
          <option value="en">{tSettings('english')}</option>
          <option value="ja">{tSettings('japanese')}</option>
        </select>
      </div>

      <div className="max-w-6xl w-full mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6 break-keep">
              {t('title')}
            </h1>
            <div className="space-y-4 mb-8 max-w-xs sm:max-w-sm lg:max-w-none mx-auto lg:mx-0 text-left">
              <div className="flex items-start gap-3">
                <svg className="w-7 h-7 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700 dark:text-gray-300">{t('feature1')}</p>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-7 h-7 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700 dark:text-gray-300">{t('feature2')}</p>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-7 h-7 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700 dark:text-gray-300">{t('feature3')}</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => signIn('google', { callbackUrl: '/calendar' })}
                className="group relative inline-flex justify-center py-3 px-6 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-150 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </span>
                <span className="ml-3">{t('startWithGoogle')}</span>
              </button>
              
              <button
                onClick={() => router.push('/demo/calendar')}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-[var(--color-border-secondary)] text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-[var(--color-bg-secondary)] hover:bg-gray-50 dark:hover:bg-[var(--color-bg-tertiary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-150 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full"
              >
                <span className="flex items-center">
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {tDemo('tryDemo')}
                </span>
              </button>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 dark:from-blue-600 dark:to-purple-600 rounded-lg transform rotate-3 opacity-25"></div>
              <div className="relative bg-white dark:bg-[var(--color-bg-secondary)] rounded-lg shadow-xl p-8">
                <div className="space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-[var(--color-bg-tertiary)] rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-[var(--color-bg-tertiary)] rounded w-1/2"></div>
                  <div className="grid grid-cols-7 gap-2 mt-6">
                    {[...Array(35)].map((_, i) => (
                      <div key={i} className={`h-12 rounded ${i % 7 === 0 || i % 7 === 6 ? 'bg-gray-100 dark:bg-[var(--color-bg-tertiary)]' : i % 5 === 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-50 dark:bg-[var(--color-bg-secondary)]'}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
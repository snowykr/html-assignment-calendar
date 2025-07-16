import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { SessionProvider } from 'next-auth/react';
import { AppProvider } from '@/contexts/AppContext';
import NavigationWrapper from '@/components/NavigationWrapper';
import GlobalModals from '@/components/GlobalModals';
import { routing } from '@/routing';
import '../globals.css';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'app' });
  
  return {
    title: t('title'),
    description: t('description'),
    manifest: '/manifest',
    icons: {
      icon: [
        { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
      ],
      apple: '/icons/apple-touch-icon.png'
    },
    other: {
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default'
    }
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2f2f7' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ]
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: paramLocale } = await params;
  
  // 쿠키에서 실제 locale 확인 (서버 사이드와 클라이언트 사이드 동기화)
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  
  // 쿠키에 저장된 locale이 있고 유효하면 사용, 없으면 URL 파라미터 사용
  const actualLocale = (cookieLocale && routing.locales.includes(cookieLocale as any)) 
    ? cookieLocale 
    : paramLocale;
  
  // 유효한 locale인지 확인
  if (!routing.locales.includes(actualLocale as any)) {
    notFound();
  }

  // 쿠키에서 테마 확인 (서버 사이드 테마 설정)
  const themeCookie = cookieStore.get('theme')?.value;
  const isDarkMode = themeCookie === 'dark';

  const messages = await getMessages({ locale: actualLocale });
  const t = await getTranslations({ locale: actualLocale, namespace: 'app' });

  return (
    <html lang={actualLocale} className={isDarkMode ? 'dark' : ''} data-theme={isDarkMode ? 'dark' : 'light'} suppressHydrationWarning>
      <head>
        <title>{t('title')}</title>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 쿠키 비활성화 환경을 위한 최소한의 백업 로직
              (function() {
                try {
                  // 서버에서 이미 설정되었으면 skip
                  if (document.documentElement.getAttribute('data-theme')) return;
                  
                  // localStorage 확인 후 시스템 선호도 사용
                  const savedTheme = localStorage.getItem('theme');
                  const isDark = savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
                  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
                  if (isDark) document.documentElement.classList.add('dark');
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <SessionProvider 
          refetchOnWindowFocus={false}
          refetchInterval={0}
        >
          <NextIntlClientProvider messages={messages} locale={actualLocale}>
            <AppProvider>
              <NavigationWrapper>
                {children}
              </NavigationWrapper>
              <GlobalModals />
            </AppProvider>
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
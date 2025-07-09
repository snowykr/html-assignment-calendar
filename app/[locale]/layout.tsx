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
    manifest: '/manifest.json',
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
  themeColor: '#f2f2f7'
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

  const messages = await getMessages({ locale: actualLocale });

  return (
    <html lang={actualLocale}>
      <body>
        <SessionProvider>
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
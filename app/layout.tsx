import type { Metadata, Viewport } from 'next';
import { AppProvider } from '@/contexts/AppContext';
import BottomTabs from '@/components/BottomTabs';
import GlobalModals from '@/components/GlobalModals';
import './globals.css';

export const metadata: Metadata = {
  title: '課題管理アプリ',
  description: '과제 관리 캘린더 애플리케이션',
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  themeColor: '#f2f2f7'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <AppProvider>
          <div className="app-container">
            <div className="main-content-area">
              {children}
            </div>
            <BottomTabs />
          </div>
          <GlobalModals />
        </AppProvider>
      </body>
    </html>
  );
}
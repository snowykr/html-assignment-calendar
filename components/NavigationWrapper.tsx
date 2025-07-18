'use client';

import { usePathname } from '@/navigation';
import TopNav from '@/components/TopNav';
import BottomTabs from '@/components/BottomTabs';
import FloatingLoginButton from '@/components/FloatingLoginButton';

interface NavigationWrapperProps {
  children: React.ReactNode;
}

export default function NavigationWrapper({ children }: NavigationWrapperProps) {
  const pathname = usePathname();
  
  const shouldShowTopNav = !['/login', '/'].includes(pathname);
  const shouldShowBottomTabs = !['/login', '/'].includes(pathname);
  const isCalendarPage = pathname.includes('/calendar');

  // 랜딩페이지와 로그인 페이지는 래퍼 없이 전체 화면 사용
  if (pathname === '/' || pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className={`app-container flex flex-col ${isCalendarPage ? 'h-screen' : 'min-h-screen'}`}>
      {shouldShowTopNav && <TopNav />}
      <div className="flex-1 flex flex-col lg:max-w-7xl lg:mx-auto lg:w-full">
        <div className={`main-content-area flex-1 lg:px-8 xl:px-12 2xl:px-16 ${isCalendarPage ? 'calendar-page-main-content' : ''}`}>
          {children}
        </div>
      </div>
      {shouldShowBottomTabs && <BottomTabs />}
      <FloatingLoginButton />
    </div>
  );
}
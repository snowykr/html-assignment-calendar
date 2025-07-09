'use client';

import { usePathname } from '@/navigation';
import { Link } from '@/navigation';

export default function FloatingLoginButton() {
  const pathname = usePathname();
  
  const isDemoMode = pathname.includes('/demo/');
  
  if (!isDemoMode) {
    return null;
  }
  
  return (
    <Link 
      href="/"
      className="fixed bottom-20 right-4 z-50 lg:hidden inline-flex items-center gap-3 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg transition-all shadow-lg"
    >
      <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
        데모 모드
      </div>
      <span className="text-sm font-medium">
        로그인하기
      </span>
    </Link>
  );
}
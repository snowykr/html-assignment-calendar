'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/navigation';

export default function TopNav() {
  const pathname = usePathname();
  const t = useTranslations('bottomTabs');
  
  const tabs = [
    { href: '/calendar', label: t('calendar') },
    { href: '/subjects', label: t('subjects') },
    { href: '/settings', label: t('settings') }
  ];

  return (
    <nav className="hidden lg:fixed lg:top-0 lg:left-0 lg:right-0 lg:z-50 lg:flex items-center justify-center py-4 bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center gap-8">
        {tabs.map((tab) => (
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
        ))}
      </div>
    </nav>
  );
}
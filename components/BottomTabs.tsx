'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/navigation';
import { AppCalendarIcon, AppBookIcon, AppCogIcon } from '@/utils/icons';

export default function BottomTabs() {
  const pathname = usePathname();
  const t = useTranslations('bottomTabs');
  
  const isDemoMode = pathname.includes('/demo/');
  
  const tabs = isDemoMode ? [
    { href: '/demo/calendar', label: t('calendar'), icon: <AppCalendarIcon className="h-5 w-5" aria-label={t('calendar')} /> },
    { href: '/demo/subjects', label: t('subjects'), icon: <AppBookIcon className="h-5 w-5" aria-label={t('subjects')} /> },
    { href: '/demo/settings', label: t('settings'), icon: <AppCogIcon className="h-5 w-5" aria-label={t('settings')} /> }
  ] : [
    { href: '/calendar', label: t('calendar'), icon: <AppCalendarIcon className="h-5 w-5" aria-label={t('calendar')} /> },
    { href: '/subjects', label: t('subjects'), icon: <AppBookIcon className="h-5 w-5" aria-label={t('subjects')} /> },
    { href: '/settings', label: t('settings'), icon: <AppCogIcon className="h-5 w-5" aria-label={t('settings')} /> }
  ];

  return (
    <div className="bottom-tabs lg:hidden">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`tab-button ${pathname === tab.href ? 'active' : ''}`}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span>{tab.label}</span>
        </Link>
      ))}
    </div>
  );
}
'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/navigation';

export default function BottomTabs() {
  const pathname = usePathname();
  const t = useTranslations('bottomTabs');
  
  const tabs = [
    { href: '/calendar', label: t('calendar'), icon: '📅' },
    { href: '/subjects', label: t('subjects'), icon: '📚' },
    { href: '/settings', label: t('settings'), icon: '⚙️' }
  ];

  return (
    <div className="bottom-tabs">
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
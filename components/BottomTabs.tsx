'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomTabs() {
  const pathname = usePathname();
  
  const tabs = [
    { href: '/calendar', label: 'カレンダー', icon: '📅' },
    { href: '/subjects', label: '科目', icon: '📚' },
    { href: '/settings', label: '設定', icon: '⚙️' }
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
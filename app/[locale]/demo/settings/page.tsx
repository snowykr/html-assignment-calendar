'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/navigation';
import { getCookie } from '@/utils/utils';
import { useApp } from '@/contexts/AppContext';

export default function DemoSettingsPage() {
  const [notifications, setNotifications] = useState(false);
  const { isDarkMode, toggleDarkMode } = useApp();
  const locale = useLocale();
  const [selectedLocale, setSelectedLocale] = useState(() => {
    const cookieLocale = getCookie('NEXT_LOCALE');
    return cookieLocale || locale;
  });
  const t = useTranslations('settings');
  const router = useRouter();
  
  const handleLanguageChange = (newLocale: string) => {
    setSelectedLocale(newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    router.refresh();
  };

  return (
    <div className="tab-content active">
      <div className="content">
        <div className="filter-section">
          <div className="filter-row">
            <span className="filter-label">{t('notifications')}</span>
            <div 
              className={`toggle-switch ${!notifications ? 'off' : ''}`}
              onClick={() => setNotifications(!notifications)}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
          <div className="filter-row">
            <span className="filter-label">{t('darkMode')}</span>
            <div 
              className={`toggle-switch ${!isDarkMode ? 'off' : ''}`}
              onClick={toggleDarkMode}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
          <div className="filter-row">
            <span className="filter-label">{t('language')}</span>
            <select 
              className="form-select" 
              style={{ width: '120px', marginLeft: 'auto' }}
              value={selectedLocale}
              onChange={(e) => handleLanguageChange(e.target.value)}
              aria-label={t('language')}
            >
              <option value="ko">{t('korean')}</option>
              <option value="en">{t('english')}</option>
              <option value="ja">{t('japanese')}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
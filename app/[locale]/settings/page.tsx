'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/navigation';
import { getCookie } from '@/utils/utils';
import { useSession, signOut } from 'next-auth/react';
import { useApp } from '@/contexts/AppContext';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(false);
  const { isDarkMode, toggleDarkMode } = useApp();
  const locale = useLocale();
  const [selectedLocale, setSelectedLocale] = useState(() => {
    const cookieLocale = getCookie('NEXT_LOCALE');
    return cookieLocale || locale;
  });
  const t = useTranslations('settings');
  const tAuth = useTranslations('auth');
  const router = useRouter();
  const { data: session } = useSession();
  
  
  const handleLanguageChange = (newLocale: string) => {
    // UI 즉시 업데이트
    setSelectedLocale(newLocale);
    
    // 쿠키에 로케일 설정 (SameSite 속성 추가로 브라우저 호환성 개선)
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    
    // next-intl의 router를 사용하여 페이지 새로고침
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
              <option value="ja">{t('japanese')}</option>
              <option value="ko">{t('korean')}</option>
              <option value="en">{t('english')}</option>
            </select>
          </div>
          
          {/* Mobile only logout button */}
          {session && (
            <div className="lg:hidden border-t border-gray-200 mt-6 pt-6">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                {tAuth('signOut')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
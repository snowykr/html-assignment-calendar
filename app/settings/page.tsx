'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('日本語');

  return (
    <div className="tab-content active">
      <div className="content">
        <div className="filter-section">
          <div className="filter-row">
            <span className="filter-label">알림 설정</span>
            <div 
              className={`toggle-switch ${!notifications ? 'off' : ''}`}
              onClick={() => setNotifications(!notifications)}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
          <div className="filter-row">
            <span className="filter-label">다크 모드</span>
            <div 
              className={`toggle-switch ${!darkMode ? 'off' : ''}`}
              onClick={() => setDarkMode(!darkMode)}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
          <div className="filter-row">
            <span className="filter-label">언어 설정</span>
            <select 
              className="form-select" 
              style={{ width: '120px', marginLeft: 'auto' }}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label="언어 설정"
            >
              <option>한국어</option>
              <option>English</option>
              <option>日本語</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
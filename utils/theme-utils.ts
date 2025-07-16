/**
 * 테마 관리 유틸리티
 * 테마 관련 모든 DOM 조작과 storage 관리를 중앙화
 */

export type ThemeValue = 'light' | 'dark' | 'system';

/**
 * DOM에서 현재 테마 상태를 읽어옴 (Single Source of Truth)
 */
export function getDOMThemeState(): boolean {
  const currentDataTheme = document.documentElement.getAttribute('data-theme');
  const hasDarkClass = document.documentElement.classList.contains('dark');
  
  return currentDataTheme === 'dark' || hasDarkClass;
}

/**
 * DOM에 테마 상태를 설정 (HTML 클래스 및 data-theme 속성)
 */
export function setDOMThemeState(isDark: boolean): void {
  if (isDark) {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
  }
}

/**
 * PWA용 메타 태그 테마 색상 업데이트
 */
export function updateMetaThemeColor(isDark: boolean): void {
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', isDark ? '#000000' : '#f2f2f7');
  }
}

/**
 * localStorage에 테마 설정 저장
 */
export function saveThemeToStorage(isDark: boolean): void {
  const themeValue = isDark ? 'dark' : 'light';
  localStorage.setItem('theme', themeValue);
}

/**
 * localStorage에서 테마 설정 읽기
 */
export function getThemeFromStorage(): ThemeValue | null {
  return localStorage.getItem('theme') as ThemeValue | null;
}

/**
 * 쿠키에 테마 설정 저장 (서버사이드 렌더링 지원)
 */
export function saveThemeToCookie(isDark: boolean): void {
  const themeValue = isDark ? 'dark' : 'light';
  const maxAge = 60 * 60 * 24 * 365; // 1년
  document.cookie = `theme=${themeValue}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * 시스템 다크모드 선호도 확인
 */
export function getSystemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * 모든 저장소에 테마 설정 저장 (localStorage + cookie)
 */
export function saveThemeToAllStorages(isDark: boolean): void {
  saveThemeToStorage(isDark);
  saveThemeToCookie(isDark);
}

/**
 * 완전한 테마 업데이트 (DOM + storage + meta tag)
 * React 상태는 별도로 관리
 */
export function updateCompleteThemeState(isDark: boolean): void {
  setDOMThemeState(isDark);
  saveThemeToAllStorages(isDark);
  updateMetaThemeColor(isDark);
}
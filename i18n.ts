import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export const locales = routing.locales;
export type Locale = (typeof locales)[number];
export const defaultLocale = routing.defaultLocale;

function normalizeLocale(locale: string | undefined): Locale {
  if (!locale) return defaultLocale;
  
  // 지역 코드 제거 (en-US → en, ko-KR → ko)
  const baseLocale = locale.split('-')[0];
  
  // 지원하는 로케일인지 확인
  if (locales.includes(baseLocale as Locale)) {
    return baseLocale as Locale;
  }
  
  // 지원하지 않는 언어는 기본 로케일로 fallback
  return defaultLocale;
}

export default getRequestConfig(async ({ locale }) => {
  // locale이 undefined이거나 없을 때 defaultLocale 사용
  const validLocale = normalizeLocale(locale || defaultLocale);

  try {
    const messages = (await import(`./messages/${validLocale}.json`)).default;
    
    return {
      locale: validLocale,
      messages: messages,
    };
  } catch (error) {
    // 에러 발생 시 기본 로케일 메시지 로드
    console.error('[i18n] Error loading messages for locale:', validLocale, error);
    const messages = (await import(`./messages/${defaultLocale}.json`)).default;
    return {
      locale: defaultLocale,
      messages: messages,
    };
  }
});
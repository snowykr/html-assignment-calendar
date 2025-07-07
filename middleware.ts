import createMiddleware from 'next-intl/middleware';
import { routing } from './routing';

export default createMiddleware({
  ...routing,
  localeDetection: true,
  // 쿠키에서 locale 감지하여 서버 사이드와 클라이언트 사이드 동기화
  defaultLocale: routing.defaultLocale,
  locales: routing.locales,
  localePrefix: routing.localePrefix
});

export const config = {
  // 정적 파일과 API 라우트는 제외
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|workbox-.*).*)']
};
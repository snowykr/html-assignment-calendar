import { MetadataRoute } from 'next'
import { cookies } from 'next/headers'

// 메시지 파일들을 동적으로 import
const getMessages = async (locale: string) => {
  try {
    const messages = await import(`../messages/${locale}.json`)
    return messages.default
  } catch (error) {
    // 기본값으로 일본어 사용
    const messages = await import('../messages/ja.json')
    return messages.default
  }
}

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  // 쿠키에서 사용자 언어 설정 읽기
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'ja'
  
  // 해당 언어의 메시지 로드
  const messages = await getMessages(locale)
  
  return {
    name: messages.app.title,
    short_name: messages.app.title,
    description: messages.app.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
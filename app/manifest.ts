import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    // name과 short_name을 제거하여 브라우저가 페이지 제목을 사용하도록 함
    // 이렇게 하면 언어 변경 시 앱 이름이 즉시 반영됨
    description: 'Assignment Management Calendar Application',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
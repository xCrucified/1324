import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Проверяем, идет ли запрос к админке
  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    // Если сайт запущен НЕ на локальном компьютере (то есть на Vercel в продакшене)
    if (process.env.NODE_ENV === 'production') {
      // Отдаем страницу 404 (будто админки вообще не существует)
      return NextResponse.rewrite(new URL('/404', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
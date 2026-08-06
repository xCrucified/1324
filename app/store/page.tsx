import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import StoreClient from './store-client';
import TopBar from '@/components/shared/top-bar';
import Header from '@/components/header';

// Примусовий динамічний рендеринг для уникнення помилок prerender з useSearchParams
export const dynamic = 'force-dynamic';

interface StorePageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function StorePage({ searchParams }: StorePageProps) {
  // 1. Зчитуємо категорію з URL (підтримка Next.js 15 async searchParams)
  const resolvedParams = await searchParams;
  const initialCategory = resolvedParams?.category || 'all';

  // 2. Отримуємо всі товари з бази даних
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-ivory text-bark pb-16">
      {/* Підключаємо глобальні топ-бар та хедер */}
      <TopBar />
      <Header />

      {/* Головний контейнер з фільтрами та сіткою товарів */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
        <Suspense fallback={<div className="p-12 text-center text-oak text-sm">Завантаження каталогу...</div>}>
          <StoreClient initialProducts={products} initialCategory={initialCategory} />
        </Suspense>
      </main>
    </div>
  );
}
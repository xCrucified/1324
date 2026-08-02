import { prisma } from '@/lib/prisma';
import StoreClient from './store-client';
import TopBar from '@/components/shared/top-bar';
import Header from '@/components/header';

export default async function StorePage() {
  // Отримуємо всі товари з бази даних
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
        <StoreClient initialProducts={products} />
      </main>
    </div>
  );
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import OrdersTableClient from './admin-dashboard'
import ProductsTableClient from './products-table'

export const dynamic = 'force-dynamic'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }> | { tab?: string }
}) {
  const resolvedParams = await Promise.resolve(searchParams)
  const activeTab = resolvedParams?.tab === 'orders' ? 'orders' : 'products'

  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  let orders: any[] = []
  try {
    orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch (e) {
    orders = []
  }

  return (
    <div className="min-h-screen bg-ivory text-bark pb-16" suppressHydrationWarning>
      <header className="bg-bark text-parchment border-b border-oak/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-script text-wheat text-2xl hover:opacity-80 transition-opacity">
              Pentu24
            </Link>
            <span className="text-oak">/</span>
            <h1 className="font-display font-bold text-lg text-cream tracking-wide">
              Панель управління
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-body text-xs bg-parchment/10 hover:bg-parchment/20 text-wheat px-3 py-1.5 rounded-sm transition-colors"
            >
              ← На головну
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 bg-parchment/60 p-1 rounded-sm border border-mist w-fit">
            <Link
              href="/admin?tab=products"
              className={`px-5 py-2 font-display text-xs font-bold rounded-sm transition-all ${
                activeTab === 'products'
                  ? 'bg-caramel text-cream shadow-sm'
                  : 'text-bark hover:text-caramel'
              }`}
            >
              Товари ({products.length})
            </Link>
            <Link
              href="/admin?tab=orders"
              className={`px-5 py-2 font-display text-xs font-bold rounded-sm transition-all ${
                activeTab === 'orders'
                  ? 'bg-caramel text-cream shadow-sm'
                  : 'text-bark hover:text-caramel'
              }`}
            >
              Оплачені замовлення ({orders.length})
            </Link>
          </div>

          {activeTab === 'products' && (
            <Link
              href="/admin/new"
              className="bg-caramel hover:bg-amber text-cream font-body text-xs font-bold px-5 py-2.5 rounded-sm shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <span className="text-base leading-none">+</span> Додати новий товар
            </Link>
          )}
        </div>

        {/* Вкладка товарів */}
        {activeTab === 'products' && <ProductsTableClient products={products} />}

        {/* Вкладка замовлень */}
        {activeTab === 'orders' && <OrdersTableClient orders={orders} />}
      </main>
    </div>
  )
}
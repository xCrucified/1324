/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { deleteProduct } from './actions'

interface AdminDashboardProps {
  products: any[]
  orders: any[]
}

export default function AdminDashboard({ products, orders }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products')

  return (
    <div className="min-h-screen bg-ivory text-bark pb-16" suppressHydrationWarning>
      {/* Верхня панель адмінки */}
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
          <Link
            href="/"
            className="font-body text-xs bg-parchment/15 hover:bg-parchment/25 text-wheat px-3 py-1.5 rounded-sm transition-colors"
          >
            ← На головну
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Перемикач вкладок та кнопка додавання */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 bg-parchment/60 p-1 rounded-sm border border-mist w-fit">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-5 py-2 font-display text-xs font-bold rounded-sm transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-caramel text-cream shadow-sm'
                  : 'text-bark hover:text-caramel'
              }`}
            >
              Товари ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-5 py-2 font-display text-xs font-bold rounded-sm transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-caramel text-cream shadow-sm'
                  : 'text-bark hover:text-caramel'
              }`}
            >
              Оплачені замовлення ({orders.length})
            </button>
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

        {/* Вкладка: Товари */}
        {activeTab === 'products' && (
          <div className="bg-ivory border border-parchment rounded-sm shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-parchment bg-parchment/40 font-display text-xs text-oak">
                    <th className="p-4 w-20">Фото</th>
                    <th className="p-4">Назва товару</th>
                    <th className="p-4">Ціна</th>
                    <th className="p-4">Дата створення</th>
                    <th className="p-4 text-right">Дії</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-parchment/60">
                  {products.map((product) => {
                    const displayImage = product.image || (product.images && product.images[0])
                    const imagesCount = product.images?.length || (product.image ? 1 : 0)
                    const formattedPrice = Number(product.price || 0).toFixed(2)

                    return (
                      <tr key={product.id} className="hover:bg-parchment/20 transition-colors font-body text-sm">
                        <td className="p-4">
                          <div className="relative w-12 h-12 bg-parchment rounded-sm overflow-hidden border border-mist">
                            {displayImage ? (
                              <img src={displayImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-oak">
                                Немає
                              </div>
                            )}
                            {imagesCount > 1 && (
                              <span className="absolute bottom-0 right-0 bg-bark/80 text-cream text-[9px] px-1 rounded-tl font-mono">
                                {imagesCount}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 font-display font-semibold text-bark max-w-xs truncate">
                          {product.title}
                        </td>
                        <td className="p-4 font-bold text-amber whitespace-nowrap">
                          £ {formattedPrice}
                        </td>
                        <td className="p-4 text-xs text-oak whitespace-nowrap">
                          {new Date(product.createdAt).toLocaleDateString('uk-UA')}
                        </td>
                        <td className="p-4 text-right space-x-3 whitespace-nowrap">
                          <Link
                            href={`/admin/edit/${product.id}`}
                            className="text-oak hover:text-caramel font-semibold text-xs transition-colors"
                          >
                            Редагувати
                          </Link>
                          <form action={deleteProduct.bind(null, product.id)} className="inline">
                            <button
                              type="submit"
                              className="text-red-700 hover:text-red-900 font-semibold text-xs transition-colors cursor-pointer"
                            >
                              Видалити
                            </button>
                          </form>
                        </td>
                      </tr>
                    )
                  })}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-oak font-body">
                        Список товарів порожній.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Вкладка: Оплачені замовлення */}
        {activeTab === 'orders' && (
          <div className="bg-ivory border border-parchment rounded-sm shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-parchment bg-parchment/40 font-display text-xs text-oak">
                    <th className="p-4">ID / Дата</th>
                    <th className="p-4">Покупець (Акаунт)</th>
                    <th className="p-4">Контакти / Доставка</th>
                    <th className="p-4">Сума</th>
                    <th className="p-4">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-parchment/60">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-parchment/20 transition-colors font-body text-sm">
                      <td className="p-4">
                        <div className="font-mono text-xs text-bark font-bold">#{order.id.slice(-6)}</div>
                        <div className="text-[11px] text-oak">
                          {new Date(order.createdAt).toLocaleString('uk-UA')}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-display font-semibold text-bark">
                          {order.user?.name || order.customerName || 'Гість'}
                        </div>
                        <div className="text-xs text-oak">
                          {order.user?.email || order.email || 'Email не вказано'}
                        </div>
                      </td>
                      <td className="p-4 text-xs text-bark">
                        <div>{order.address || order.shippingAddress || 'Не вказано'}</div>
                        <div className="text-oak">{order.phone || ''}</div>
                      </td>
                      <td className="p-4 font-bold text-amber whitespace-nowrap">
                        £ {Number(order.total || order.amount || 0).toFixed(2)}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="inline-block bg-amber/10 text-amber border border-amber/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                          {order.status || 'Оплачено'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-oak font-body">
                        Ще немає оплачених замовлень або таблиця замовлень не створена в базі даних.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
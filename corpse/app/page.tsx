'use client'
import { useState, useRef } from 'react'
import { PRODUCTS } from '@/constants/products'
import { TopBar } from './components/shared/TopBar'
import { Banner } from './components/ui/Banner'
import { FlashSale } from './components/shared/FlashSale'
import { CategoryGrid } from './components/shared/CategoryGrid'
import { TrustBar } from './components/ui/TrustBar'
import { ProductCard } from './components/shared/ProductCard'
import { ProductSection } from './components/shared/ProductSection'
import { Footer } from './components/shared/Footer'
import { CartToast } from './components/ui/CartToast'
import { Header } from './components/shared/Header'

export default function Home() {
  const [cart, setCart] = useState(0)
  const [toastVisible, setToastVisible] = useState(false)
  const [query, setQuery] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleAdd() {
    setCart((c) => c + 1)
    setToastVisible(true)
    if (toastTimer.current) {
      clearTimeout(toastTimer.current)
    }
    toastTimer.current = setTimeout(() => setToastVisible(false), 2200)
  }

  const filtered = query.trim()
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.shop.toLowerCase().includes(query.toLowerCase())
      )
    : PRODUCTS

  const hotItems = filtered.filter((p) => p.sold > 2000)
  const newArrivals = filtered.filter((p) => p.badge === 'NEW' || p.id > 8)
  const recommended = filtered

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 antialiased">
      <TopBar />
      <Header cart={cart} query={query} setQuery={setQuery} />

      <main>
        {!query.trim() && (
          <>
            <Banner />
            <FlashSale onAdd={handleAdd} />
            <CategoryGrid />
            <TrustBar />
          </>
        )}

        {query.trim() ? (
          <section className="max-w-7xl mx-auto px-3 py-4">
            <div className="bg-white border border-gray-200 rounded-sm p-4 mb-3 shadow-sm">
              <p className="font-body text-gray-700 text-sm">
                {filtered.length} results for <strong className="text-gray-900">{query}</strong>
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} onAdd={handleAdd} />
              ))}
            </div>
          </section>
        ) : (
          <>
            <ProductSection
              title="🔥 Hot Items"
              products={hotItems.length ? hotItems : PRODUCTS.slice(0, 6)}
              onAdd={handleAdd}
            />
            <ProductSection
              title="✨ New Arrivals"
              products={newArrivals.length ? newArrivals : PRODUCTS.slice(4, 10)}
              onAdd={handleAdd}
            />
            <ProductSection
              title="Recommended for You"
              products={recommended.slice(0, 6)}
              onAdd={handleAdd}
            />
          </>
        )}
      </main>

      <Footer />
      <CartToast visible={toastVisible} />
    </div>
  )
}
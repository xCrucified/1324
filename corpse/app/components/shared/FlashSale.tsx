'use client'

import { useState, useEffect } from 'react'
import { FLASH_PRODUCTS } from '@/constants/products'
import { BadgePill } from '../../components/ui/BadgePill'

function useCountdown(targetSeconds: number) {
  const [secs, setSecs] = useState(targetSeconds)
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [])
  const h = String(Math.floor(secs / 3600)).padStart(2, '0')
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return { h, m, s }
}

export function FlashSale({ onAdd }: { onAdd: () => void }) {
  const { h, m, s } = useCountdown(4 * 3600 + 22 * 60 + 18)

  return (
    <section className="max-w-7xl mx-auto px-3 mb-4">
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <span className="font-display text-gray-900 font-bold" style={{ fontSize: '1.1rem' }}>
              ⚡ Flash Sale
            </span>
            <div className="flex items-center gap-1">
              <span className="font-body text-xs text-gray-500">Ends in</span>
              {[h, m, s].map((unit, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span
                    className="font-body text-gray-800 bg-gray-200 border border-gray-300 rounded px-1.5 py-0.5 tabular-nums"
                    style={{ fontSize: '0.78rem', fontWeight: 700 }}
                  >
                    {unit}
                  </span>
                  {i < 2 && <span className="text-gray-700 font-bold text-xs">:</span>}
                </span>
              ))}
            </div>
          </div>
          <button className="font-body text-orange-600 text-xs hover:text-orange-700 font-medium transition-colors">
            View all flash deals →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-200">
          {FLASH_PRODUCTS.map((p) => (
            <div key={p.id} className="bg-white p-3 group cursor-pointer flex flex-col justify-between">
              <div>
                <div className="relative overflow-hidden rounded-sm mb-2 bg-gray-100" style={{ aspectRatio: '1/1' }}>
                  <img
                    src={p.img}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
                  />
                  {p.badge && (
                    <div className="absolute top-1.5 left-1.5">
                      <BadgePill text={p.badge} />
                    </div>
                  )}
                  {p.originalPrice && (
                    <div
                      className="absolute top-1.5 right-1.5 bg-orange-600 text-white font-body rounded-sm px-1.5 py-px"
                      style={{ fontSize: '0.6rem', fontWeight: 700 }}
                    >
                      -{Math.round((1 - p.price / p.originalPrice) * 100)}%
                    </div>
                  )}
                </div>
                <p className="font-body text-gray-800 text-xs leading-snug mb-1 line-clamp-2">{p.name}</p>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="font-display text-orange-600 font-bold" style={{ fontSize: '1.05rem' }}>
                    £{p.price.toFixed(2)}
                  </span>
                  {p.originalPrice && (
                    <span className="font-body text-gray-400 line-through" style={{ fontSize: '0.72rem' }}>
                      £{p.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <button
                  onClick={onAdd}
                  className="w-full font-body text-xs py-1.5 bg-gray-50 hover:bg-orange-600 hover:text-white text-gray-700 border border-gray-300 hover:border-orange-600 transition-colors rounded-sm font-medium"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
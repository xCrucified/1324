'use client'

import { useState, useEffect } from 'react'
import { BANNER_IMGS } from '@/constants/products'

export function Banner() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % BANNER_IMGS.length), 4000)
    return () => clearInterval(t)
  }, [])

  const slides = [
    { title: 'Summer Artisan Sale', sub: 'Up to 40% off selected ceramics & homewares', cta: 'Shop Now' },
    { title: 'New Season Textiles', sub: 'Woven throws, linen runners & natural totes', cta: 'Browse Textiles' },
    { title: 'Café & Kitchen Edit', sub: "Thornfield's curated collection for the home barista", cta: 'Explore Edit' },
  ]

  return (
    <div className="flex gap-3 p-3 max-w-7xl mx-auto">
      <div className="relative flex-1 overflow-hidden rounded-sm bg-gray-900" style={{ minHeight: 240 }}>
        {BANNER_IMGS.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            style={{ opacity: i === active ? 0.75 : 0 }}
          />
        ))}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(17,24,39,0.85) 0%, rgba(17,24,39,0.2) 70%)' }}
        />
        <div className="relative p-8 flex flex-col justify-end h-full" style={{ minHeight: 240 }}>
          <p className="font-body text-orange-400 font-medium mb-1" style={{ fontSize: '0.9rem' }}>
            {slides[active].sub}
          </p>
          <h2
            className="font-display text-white leading-tight mb-4"
            style={{ fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', fontWeight: 700 }}
          >
            {slides[active].title}
          </h2>
          <button className="self-start font-body bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 text-sm font-medium transition-colors rounded-sm cursor-pointer">
            {slides[active].cta} →
          </button>
        </div>
        <div className="absolute bottom-3 right-4 flex gap-1.5">
          {BANNER_IMGS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="rounded-full transition-all cursor-pointer"
              style={{
                width: i === active ? 18 : 6,
                height: 6,
                background: i === active ? '#EA580C' : 'rgba(255,255,255,0.5)',
              }}
            />
          ))}
        </div>
      </div>

      <div className="hidden lg:flex flex-col gap-3 w-52 shrink-0">
        <div className="flex-1 rounded-sm overflow-hidden relative bg-gray-100 flex flex-col justify-end p-3 border border-gray-200" style={{ minHeight: 112 }}>
          <img src="https://images.unsplash.com/photo-1778940409463-3b241e700046?w=300&h=150&fit=crop&auto=format" alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 100%)' }} />
          <p className="relative font-display text-white text-sm font-semibold leading-tight">Vintage Shelf<br />Finds</p>
          <button className="relative font-body text-orange-400 text-xs mt-1 hover:text-orange-300 font-medium transition-colors cursor-pointer text-left">Shop →</button>
        </div>
        <div className="flex-1 rounded-sm overflow-hidden relative bg-gray-100 flex flex-col justify-end p-3 border border-gray-200" style={{ minHeight: 112 }}>
          <img src="https://images.unsplash.com/photo-1761166478873-873047335eb5?w=300&h=150&fit=crop&auto=format" alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 100%)' }} />
          <p className="relative font-display text-white text-sm font-semibold leading-tight">Free UK<br />Delivery</p>
          <button className="relative font-body text-orange-400 text-xs mt-1 hover:text-orange-300 font-medium transition-colors cursor-pointer text-left">Over £40 →</button>
        </div>
      </div>
    </div>
  )
}
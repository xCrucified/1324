'use client'

import { useState } from 'react'
import { CATEGORIES } from '@/constants/categories'

interface HeaderProps {
  cart: number
  query: string
  setQuery: (q: string) => void
}

export function Header({ cart, query, setQuery }: HeaderProps) {
  const [searchActive, setSearchActive] = useState(false)

  return (
    <header className="bg-white sticky top-0 z-40 border-b border-gray-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <a href="#" className="shrink-0 flex flex-col leading-none mr-2 group">
          <span className="font-display text-orange-600 font-bold" style={{ fontSize: '1.4rem' }}>
            Thornfield
          </span>
          <span
            className="font-body text-gray-500 uppercase tracking-widest font-medium"
            style={{ fontSize: '0.52rem' }}
          >
            Artisan Market
          </span>
        </a>

        <div
          className={`flex flex-1 border transition-colors rounded-sm overflow-hidden ${
            searchActive ? 'border-orange-600 ring-1 ring-orange-600' : 'border-gray-300'
          }`}
          style={{ maxWidth: 680 }}
        >
          <select
            className="bg-gray-50 border-r border-gray-300 text-gray-700 font-body px-3 py-2.5 text-xs outline-none shrink-0 hidden sm:block cursor-pointer"
            style={{ minWidth: 110 }}
          >
            <option>All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.label}>{c.label}</option>
            ))}
          </select>
          <input
            className="flex-1 bg-white px-4 py-2.5 font-body text-gray-900 text-sm outline-none placeholder-gray-400"
            placeholder="Search for ceramics, coffee, candles, linen…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchActive(true)}
            onBlur={() => setSearchActive(false)}
            style={{ minWidth: 0 }}
          />
          <button className="bg-orange-600 hover:bg-orange-700 transition-colors px-5 shrink-0 flex items-center justify-center cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="5" stroke="#FFFFFF" strokeWidth="1.5" />
              <path d="M10.5 10.5L14 14" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-4 ml-auto shrink-0">
          <button className="hidden md:flex flex-col items-center gap-0.5 text-gray-700 hover:text-orange-600 transition-colors cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 17S2 12 2 6.5A4.5 4.5 0 0110 4a4.5 4.5 0 018 2.5C18 12 10 17 10 17z"
                stroke="currentColor"
                strokeWidth="1.4"
                fill="none"
              />
            </svg>
            <span className="font-body" style={{ fontSize: '0.6rem' }}>
              Saved
            </span>
          </button>

          <button className="hidden md:flex flex-col items-center gap-0.5 text-gray-700 hover:text-orange-600 transition-colors cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="5" width="14" height="12" rx="1" stroke="currentColor" strokeWidth="1.4" />
              <path d="M7 5V4a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            <span className="font-body" style={{ fontSize: '0.6rem' }}>
              Orders
            </span>
          </button>

          <button className="flex flex-col items-center gap-0.5 text-gray-700 hover:text-orange-600 transition-colors relative cursor-pointer">
            <div className="relative">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path
                  d="M2 2h2l3 11h10l2-7H6"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="9" cy="17.5" r="1.2" fill="currentColor" />
                <circle cx="15" cy="17.5" r="1.2" fill="currentColor" />
              </svg>
              {cart > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white rounded-full font-body leading-none flex items-center justify-center"
                  style={{ fontSize: '0.58rem', width: 16, height: 16, fontWeight: 700 }}
                >
                  {cart}
                </span>
              )}
            </div>
            <span className="font-body" style={{ fontSize: '0.6rem' }}>
              Cart
            </span>
          </button>
        </div>
      </div>

      <div className="border-t border-gray-100 bg-gray-50 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="max-w-7xl mx-auto px-4 flex gap-0">
          {['Home', ...CATEGORIES.map((c) => c.label), 'Flash Sale', 'New Arrivals', 'Sellers'].map((item) => (
            <button
              key={item}
              className={`font-body whitespace-nowrap px-4 py-2 text-xs transition-colors border-b-2 cursor-pointer ${
                item === 'Flash Sale'
                  ? 'border-orange-600 text-orange-600 font-bold'
                  : 'border-transparent text-gray-700 hover:text-orange-600 hover:border-orange-600'
              }`}
              style={{ letterSpacing: '0.03em' }}
            >
              {item === 'Flash Sale' ? '⚡ ' + item : item}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
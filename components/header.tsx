'use client';

import { cn } from '@/lib/utils';
import React, { useState } from 'react';
import { useShopStore } from '@/store/use-shop'; // Укажи правильный путь к своему стору

interface Props {
  className?: string;
}

const CATEGORIES = [
  { label: "Ceramics", icon: "🏺", count: "2.4k items" },
  { label: "Coffee & Tea", icon: "☕", count: "5.1k items" },
  { label: "Textiles", icon: "🧵", count: "3.8k items" },
  { label: "Candles", icon: "🕯️", count: "1.9k items" },
  { label: "Woodwork", icon: "🪵", count: "2.0k items" },
  { label: "Botanicals", icon: "🌿", count: "1.3k items" },
  { label: "Stationery", icon: "📄", count: "0.8k items" },
  { label: "Kitchenware", icon: "🥄", count: "4.2k items" },
  { label: "Homeware", icon: "🏡", count: "6.5k items" },
  { label: "Gifts", icon: "🎁", count: "3.1k items" },
];

export const Header: React.FC<Props> = ({ className }) => {
  const [searchActive, setSearchActive] = useState(false);
  
  const { cart, query, setQuery } = useShopStore();

  return (
    <header
      className={cn(className, "bg-wheat sticky top-0 z-40")}
      style={{
        boxShadow: "0 1px 0 rgba(139,94,47,0.2), 0 2px 12px rgba(30,15,6,0.08)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <a href="#" className="shrink-0 flex flex-col leading-none mr-2">
          <span
            className="font-script text-caramel"
            style={{ fontSize: "1.5rem" }}
          >
            Pentu24
          </span>
          <span
            className="font-body text-oak uppercase tracking-widest"
            style={{ fontSize: "0.7rem" }}
          >
            Marketplace
          </span>
        </a>

        {/* Category selector + search */}
        <div
          className={`flex flex-1 border transition-colors rounded-sm overflow-hidden ${searchActive ? "border-oak" : "border-mist"}`}
          style={{ maxWidth: 680 }}
        >
          <select
            className="bg-parchment border-r border-oak text-bark font-body px-3 py-2.5 text-xs outline-none shrink-0 hidden sm:block"
            style={{ minWidth: 110 }}
          >
            <option>All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.label}>{c.label}</option>
            ))}
          </select>
          <input
            className="flex-1 bg-ivory px-4 py-2.5 font-body text-bark text-sm outline-none placeholder-oak"
            placeholder="Search for ceramics, coffee, candles, linen…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchActive(true)}
            onBlur={() => setSearchActive(false)}
            style={{ minWidth: 0 }}
          />
          <button className="bg-caramel hover:bg-amber transition-colors px-5 shrink-0 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle
                cx="6.5"
                cy="6.5"
                r="5"
                stroke="#FAF5EC"
                strokeWidth="1.5"
              />
              <path
                d="M10.5 10.5L14 14"
                stroke="#FAF5EC"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-4 ml-auto shrink-0">
          <button className="hidden md:flex flex-col items-center gap-0.5 text-bark hover:text-caramel transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 17S2 12 2 6.5A4.5 4.5 0 0110 4a4.5 4.5 0 018 2.5C18 12 10 17 10 17z"
                stroke="currentColor"
                strokeWidth="1.4"
                fill="none"
              />
            </svg>
            <span className="font-body" style={{ fontSize: "0.6rem" }}>Saved</span>
          </button>

          <button className="hidden md:flex flex-col items-center gap-0.5 text-bark hover:text-caramel transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="5" width="14" height="12" rx="1" stroke="currentColor" strokeWidth="1.4" />
              <path d="M7 5V4a3 3 0 016 0v1" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            <span className="font-body" style={{ fontSize: "0.6rem" }}>Orders</span>
          </button>

          <button className="flex flex-col items-center gap-0.5 text-bark hover:text-caramel transition-colors relative">
            <div className="relative">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <path d="M2 2h2l3 11h10l2-7H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="17.5" r="1.2" fill="currentColor" />
                <circle cx="15" cy="17.5" r="1.2" fill="currentColor" />
              </svg>
              {cart > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 bg-amber text-cream rounded-full font-body leading-none flex items-center justify-center"
                  style={{
                    fontSize: "0.58rem",
                    width: 16,
                    height: 16,
                    fontWeight: 700,
                  }}
                >
                  {cart}
                </span>
              )}
            </div>
            <span className="font-body" style={{ fontSize: "0.6rem" }}>Cart</span>
          </button>
        </div>
      </div>

      {/* Category nav strip */}
      <div
        className="border-t border-parchment bg-ivory overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="max-w-7xl mx-auto px-4 flex gap-0">
          {[
            "Home",
            ...CATEGORIES.map((c) => c.label),
            "Flash Sale",
            "New Arrivals",
            "Sellers",
          ].map((item) => (
            <button
              key={item}
              className={`font-body whitespace-nowrap px-4 py-2 text-xs transition-colors border-b-2 ${
                item === "Flash Sale"
                  ? "border-amber text-amber font-bold"
                  : "border-transparent text-bark hover:text-oak hover:border-oak"
              }`}
              style={{ letterSpacing: "0.03em" }}
            >
              {item === "Flash Sale" ? "⚡ " + item : item}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;
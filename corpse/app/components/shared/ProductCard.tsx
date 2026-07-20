'use client'

import { useState } from 'react'
import { Product } from '@/types/product'
import { Stars } from '../../components/ui/Stars'
import { BadgePill } from '../../components/ui/BadgePill'

export function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  const [wishlist, setWishlist] = useState(false)

  return (
    <article className="bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all rounded-sm overflow-hidden group cursor-pointer flex flex-col">
      <div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: '1/1' }}>
        <img
          src={product.img}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.badge && <BadgePill text={product.badge} />}
          {product.freeShip && (
            <span
              className="font-body bg-emerald-600 text-white px-1.5 py-px rounded-sm leading-none font-bold"
              style={{ fontSize: '0.55rem' }}
            >
              FREE POST
            </span>
          )}
        </div>
        <button
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white rounded-full p-1.5 shadow-xs cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            setWishlist(!wishlist)
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill={wishlist ? '#EA580C' : 'none'}>
            <path
              d="M7 12.5S1 8.5 1 4.5A3 3 0 017 3a3 3 0 016 1.5C13 8.5 7 12.5 7 12.5z"
              stroke={wishlist ? '#EA580C' : '#4B5563'}
              strokeWidth="1.2"
            />
          </svg>
        </button>
        {product.originalPrice && (
          <div
            className="absolute bottom-2 right-2 bg-orange-600 text-white font-body rounded-sm px-1.5 py-px font-bold"
            style={{ fontSize: '0.62rem' }}
          >
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1 justify-between">
        <div>
          <p className="font-body text-gray-800 leading-snug mb-2 flex-1" style={{ fontSize: '0.8rem', lineHeight: 1.45 }}>
            {product.name}
          </p>

          <div className="flex items-baseline gap-2 mb-1.5">
            <span className="font-display text-orange-600 font-bold" style={{ fontSize: '1.05rem' }}>
              £{product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="font-body text-gray-400 line-through" style={{ fontSize: '0.72rem' }}>
                £{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mb-2">
            <Stars rating={product.rating} />
            <span className="font-body text-gray-500" style={{ fontSize: '0.65rem' }}>
              {product.rating} ({product.reviews})
            </span>
            <span className="font-body text-gray-400 ml-auto" style={{ fontSize: '0.65rem' }}>
              {product.sold.toLocaleString()} sold
            </span>
          </div>

          <p className="font-body text-gray-500 mb-3" style={{ fontSize: '0.65rem' }}>
            🏪 {product.shop}
          </p>
        </div>

        <button
          onClick={onAdd}
          className="w-full font-body text-xs py-1.5 bg-gray-50 hover:bg-orange-600 hover:text-white text-gray-700 border border-gray-300 hover:border-orange-600 transition-colors rounded-sm font-medium cursor-pointer"
          style={{ letterSpacing: '0.04em' }}
        >
          + Add to Cart
        </button>
      </div>
    </article>
  )
}
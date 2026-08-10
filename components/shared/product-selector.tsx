'use client'

import React, { useState } from 'react'
import BuyButton from './buy-button'

interface ProductSelectorProps {
  productId: string
  price: number
  title: string
  colors: string[]
  sizes: string[]
  images: string[]
}

export default function ProductSelector({ productId, price, title, colors, sizes, images }: ProductSelectorProps) {
  // За замовчуванням обираємо перший колір і перший розмір (якщо вони є)
  const [selectedColor, setSelectedColor] = useState<string | null>(colors.length > 0 ? colors[0] : null)
  const [selectedSize, setSelectedSize] = useState<string | null>(sizes.length > 0 ? sizes[0] : null)

  return (
    <div className="mt-6 space-y-6">
      
      {/* ВИБІР КОЛЬОРУ (Фото-іконки) */}
      {colors.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-bark mb-2">
            Колір: <span className="font-bold">{selectedColor}</span>
          </h3>
          <div className="flex flex-wrap gap-3">
            {colors.map((color, index) => {
              // Беремо фото по індексу кольору. Якщо фото менше ніж кольорів - беремо перше
              const imageUrl = images[index] || images[0]; 
              const isSelected = selectedColor === color;

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                    isSelected 
                      ? 'border-black shadow-md scale-105' 
                      : 'border-transparent hover:border-gray-300 opacity-80 hover:opacity-100'
                  }`}
                  title={color}
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt={color} className="w-full h-full object-cover" />
                  ) : (
                    <span className="flex items-center justify-center w-full h-full bg-gray-100 text-xs">
                      {color}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ВИБІР РОЗМІРУ */}
      {sizes.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-bark mb-2">
            Розмір: <span className="font-bold">{selectedSize}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 text-sm font-medium rounded border transition-colors ${
                  selectedSize === size
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-800 border-gray-300 hover:border-black'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* КНОПКА КУПИТИ */}
      <div className="pt-4 border-t border-parchment">
        {/* Передаємо обраний колір та розмір у вашу кнопку */}
        <BuyButton 
          productId={productId} 
          priceInUah={price} 
          title={title}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
        />
      </div>
    </div>
  )
}
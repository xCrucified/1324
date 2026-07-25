/* eslint-disable @next/next/no-img-element */
'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import BadgePill from '../ui/badge-pill';
import Stars from '@/lib/stars';

interface Props {
  className?: string;
  product: Product;
  onAdd: () => void;
  onToggleSave: () => void;
  isSaved?: boolean;
}

type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  sold: number;
  rating: number;
  reviews: number;
  shop: string;
  img?: string;
  images?: string[];
  badge?: string;
  freeShip?: boolean;
};

export const ProductCard: React.FC<Props> = ({ className, onAdd, onToggleSave, isSaved, product }) => {
  const imagesList = product.images && product.images.length > 0 
    ? product.images 
    : product.img 
      ? [product.img] 
      : ['/placeholder.png'];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % imagesList.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className={`bg-ivory border border-parchment hover:border-oak hover:shadow-sm transition-all rounded-sm overflow-hidden group cursor-pointer flex flex-col ${className || ''}`}
      style={{ boxShadow: "0 1px 4px rgba(30,15,6,0.05)" }}
    >
      <article className="flex flex-col flex-1">
        {/* Image Container */}
        <div
          className="relative overflow-hidden bg-parchment"
          style={{ aspectRatio: "1/1" }}
        >
          <img
            src={imagesList[currentImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {imagesList.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-ivory/80 hover:bg-ivory text-bark rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs shadow-sm z-10"
                title="Предыдущее фото"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-ivory/80 hover:bg-ivory text-bark rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs shadow-sm z-10"
                title="Следующее фото"
              >
                ›
              </button>

              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10 pointer-events-none">
                {imagesList.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1 rounded-full transition-all ${
                      idx === currentImageIndex ? 'w-3 bg-bark' : 'w-1 bg-bark/40'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.badge && <BadgePill text={product.badge} />}
            {product.freeShip && (
              <span
                className="font-body bg-sage text-cream px-1.5 py-px rounded-sm leading-none"
                style={{ fontSize: "0.55rem", fontWeight: 700 }}
              >
                FREE POST
              </span>
            )}
          </div>
          
          {/* Wishlist (Сердечко) */}
          <button
            type="button"
            className="absolute top-2 right-2 bg-ivory/80 hover:bg-ivory transition-opacity rounded-full p-1.5 shadow-sm z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSave();
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill={isSaved ? "#C07630" : "none"}
            >
              <path
                d="M7 12.5S1 8.5 1 4.5A3 3 0 017 3a3 3 0 016 1.5C13 8.5 7 12.5 7 12.5z"
                stroke="#C07630"
                strokeWidth="1.2"
              />
            </svg>
          </button>

          {/* Discount badge */}
          {product.originalPrice && (
            <div
              className="absolute bottom-2 right-2 bg-amber text-cream font-body rounded-sm px-1.5 py-px z-10"
              style={{ fontSize: "0.62rem", fontWeight: 700 }}
            >
              -{Math.round((1 - product.price / product.originalPrice) * 100)}%
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1">
          <p
            className="font-body text-bark leading-snug mb-2 flex-1"
            style={{ fontSize: "0.8rem", lineHeight: 1.45 }}
          >
            {product.name}
          </p>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-1.5">
            <span
              className="font-display text-amber font-bold"
              style={{ fontSize: "1.05rem" }}
            >
              €{product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span
                className="font-body text-oak line-through"
                style={{ fontSize: "0.72rem" }}
              >
                €{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Rating + sold */}
          <div className="flex items-center gap-2 mb-2">
            <Stars rating={product.rating} />
            <span className="font-body text-oak" style={{ fontSize: "0.65rem" }}>
              {product.rating} ({product.reviews})
            </span>
            <span
              className="font-body text-oak ml-auto"
              style={{ fontSize: "0.65rem" }}
            >
              {product.sold.toLocaleString('en-US')} sold
            </span>
          </div>

          {/* Shop name */}
          <p
            className="font-body text-oak mb-2.5"
            style={{ fontSize: "0.65rem" }}
          >
            🏪 {product.shop}
          </p>

          {/* Add to cart */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAdd();
            }}
            className="w-full font-body text-xs py-1.5 bg-parchment hover:bg-caramel hover:text-cream text-oak border border-oak transition-colors rounded-sm"
            style={{ letterSpacing: "0.04em" }}
          >
            + Add to Cart
          </button>
        </div>
      </article>
    </Link>
  );
};

export default ProductCard;
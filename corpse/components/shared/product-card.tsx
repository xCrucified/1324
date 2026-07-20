/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import BadgePill from '../ui/badge-pill';
import Stars from '@/lib/stars';

interface Props {
  className?: string;
  product: Product;
  onAdd: () => void;
}

type Product = {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  sold: number;
  rating: number;
  reviews: number;
  shop: string;
  img: string;
  badge?: string;
  freeShip?: boolean;
};

export const ProductCard: React.FC<Props> = ({ className, onAdd, product }) => {
      const [wishlist, setWishlist] = useState(false);

  return (
    <article
      className="bg-ivory border border-parchment hover:border-oak hover:shadow-sm transition-all rounded-sm overflow-hidden group cursor-pointer flex flex-col"
      style={{ boxShadow: "0 1px 4px rgba(30,15,6,0.05)" }}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden bg-parchment"
        style={{ aspectRatio: "1/1" }}
      >
        <img
          src={product.img}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
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
        {/* Wishlist */}
        <button
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-ivory rounded-full p-1"
          onClick={(e) => {
            e.stopPropagation();
            setWishlist(!wishlist);
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill={wishlist ? "#C07630" : "none"}
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
            className="absolute bottom-2 right-2 bg-amber text-cream font-body rounded-sm px-1.5 py-px"
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
            £{product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span
              className="font-body text-oak line-through"
              style={{ fontSize: "0.72rem" }}
            >
              £{product.originalPrice.toFixed(2)}
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
            {product.sold.toLocaleString()} sold
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
          onClick={onAdd}
          className="w-full font-body text-xs py-1.5 bg-parchment hover:bg-caramel hover:text-cream text-oak border border-oak transition-colors rounded-sm"
          style={{ letterSpacing: "0.04em" }}
        >
          + Add to Cart
        </button>
      </div>
    </article>
  );
};
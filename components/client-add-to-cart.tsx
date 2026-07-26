'use client';

import { useState } from 'react';
import { useShopStore } from '@/store/use-shop';
import type { Product } from '@prisma/client';

interface ClientAddToCartProps {
  product: Product;
}

export default function ClientAddToCart({ product }: ClientAddToCartProps) {
  const addToCart = useShopStore((state) => state.addToCart);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart({
      id: product.id,
      name: product.title,
      price: product.price,
      originalPrice: product.price * 1.2, 
      img: product.image || '/placeholder.png',
      shop: 'Pentu Store',
      sold: 0,
      rating: 5.0,
      reviews: 0,
    });
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={added}
      className={`w-full py-3 rounded-sm font-bold transition-colors ${
        added 
          ? 'bg-green-600 text-cream cursor-default' 
          : 'bg-bark text-cream hover:bg-amber cursor-pointer'
      }`}
    >
      {added ? '✓ Added to Cart' : 'Add to Cart'}
    </button>
  );
}
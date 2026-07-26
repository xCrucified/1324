import React from "react";
import Link from "next/link";
import { ProductCard } from "./product-card";
import { useShopStore } from "@/store/use-shop";

interface Product {
  id: string;
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
}

interface Props {
  title: string;
  products: Product[];
  onAdd: (product: Product) => void;
  className?: string;
}

export const ProductSection: React.FC<Props> = ({
  title,
  products,
  onAdd,
  className,
}) => {
  const { savedItems, toggleSave } = useShopStore();
  let categoryParam = "Home";
  if (title.includes("New Arrivals")) categoryParam = "New Arrivals";
  else if (title.includes("Hot Items")) categoryParam = "Flash Sale";
  else if (title.includes("Recommended")) categoryParam = "Home";
  // Note: compute saved status per product when rendering

  return (
    <section className={`max-w-7xl mx-auto px-4 py-6 ${className || ""}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg text-bark">{title}</h2>

        <Link
          href={`/?category=${encodeURIComponent(categoryParam)}`}
          className="font-body text-xs text-caramel hover:text-amber font-bold transition-colors"
        >
          See all →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isSaved={savedItems.some((s) => s.id === product.id)}
            onAdd={() => onAdd(product)}
            onToggleSave={() =>
              toggleSave({
                id: product.id,
                name: product.name,
                price: product.price,
                img: product.img,
                shop: product.shop,
              })
            }
          />
        ))}
      </div>
    </section>
  );
};

export default ProductSection;

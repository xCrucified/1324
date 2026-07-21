import React from "react";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  title: string;
  products: Product[];
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

export const ProductSection: React.FC<Props> = ({
  className,
  title,
  products,
  onAdd,
}) => {
  return (
    <section className={cn(className,"max-w-7xl mx-auto px-3 mb-4")}>
      <div className="bg-ivory border border-parchment rounded-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-parchment bg-parchment">
          <h2
            className="font-display text-bark font-bold"
            style={{ fontSize: "1.05rem" }}
          >
            {title}
          </h2>
          <button className="font-body text-caramel text-xs hover:text-amber transition-colors">
            See all →
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-px bg-parchment p-px">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={onAdd} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;

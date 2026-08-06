'use client';

import React, { useState, useMemo } from 'react';
import { useShopStore } from '@/store/use-shop';
import { ProductCard } from '@/components/shared/product-card';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string | null;
  description?: string | null;
  categoryId?: string | null;
}

interface Props {
  initialProducts: Product[];
  initialCategory?: string;
}

const CATEGORY_TREE = [
  {
    id: 'clothing',
    name: '👗 Одяг та Взуття',
    subcategories: [
      { id: 'clothing-women', name: 'Жіночий одяг' },
      { id: 'clothing-men', name: 'Чоловічий одяг' },
      { id: 'clothing-kids', name: 'Дитячий одяг' },
      { id: 'clothing-sleep', name: 'Піжами' },
      { id: 'clothing-sport', name: 'Спортивні костюми' },
      { id: 'clothing-shoes', name: 'Взуття' },
      { id: 'clothing-other', name: 'Інше' },
    ],
  },
  {
    id: 'accessories',
    name: '🎒 Аксесуари',
    subcategories: [
      { id: 'acc-bags', name: 'Сумки та барсетки' },
      { id: 'acc-backpacks', name: 'Рюкзаки' },
      { id: 'acc-jewelry', name: 'Біжутерія' },
      { id: 'acc-[#hair]', name: 'Аксесуари для волосся' },
      { id: 'acc-smart', name: 'Смарт-годинники та браслети' },
      { id: 'acc-glasses', name: 'Окуляри' },
      { id: 'acc-other', name: 'Інше' },
    ],
  },
  {
    id: 'home',
    name: '🏠 Товари для дому',
    subcategories: [
      { id: 'home-organizers', name: 'Органайзери' },
      { id: 'home-smart-gadgets', name: 'Міні-гаджети' },
      { id: 'home-kitchen', name: 'Кухонне приладдя та посуд' },
      { id: 'home-decor', name: 'Декор' },
      { id: 'home-textile', name: 'Текстиль' },
      { id: 'home-other', name: 'Інше' },
    ],
  },
];

export default function StoreClient({ initialProducts, initialCategory }: Props) {
  const { savedItems, toggleSave, addToCart } = useShopStore();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  
  // Стан для згортання/розгортання категорій
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const defaultMaxPrice = useMemo(() => {
    if (!initialProducts || initialProducts.length === 0) return 20000;
    const max = Math.max(...initialProducts.map((p) => p.price));
    return Math.ceil(max / 1000) * 1000 || 20000;
  }, [initialProducts]);

  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(defaultMaxPrice);

  const [sortOrder, setSortOrder] = useState<'default' | 'asc' | 'desc'>('default');

  const getCategoryIdsToMatch = (selected: string) => {
    if (selected === 'all') return [];
    
    const parentCategory = CATEGORY_TREE.find(c => c.id === selected);
    if (parentCategory) {
      const subIds = parentCategory.subcategories.map(s => s.id);
      return [parentCategory.id, ...subIds];
    }
    
    return [selected];
  };

  const filteredProducts = useMemo(() => {
    const validCategoryIds = getCategoryIdsToMatch(selectedCategory);

    return (initialProducts || [])
      .filter((p) => {
        const matchesCategory = 
          selectedCategory === 'all' || 
          (p.categoryId && validCategoryIds.includes(p.categoryId));
          
        const matchesPrice = p.price >= minPrice && p.price <= maxPrice;

        return matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        if (sortOrder === 'asc') return a.price - b.price;
        if (sortOrder === 'desc') return b.price - a.price;
        return 0;
      });
  }, [initialProducts, selectedCategory, minPrice, maxPrice, sortOrder]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setMinPrice(0);
    setMaxPrice(defaultMaxPrice);
    setSortOrder('default');
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="w-full lg:w-72 bg-white border border-parchment rounded-sm p-5 h-fit shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-parchment pb-3">
          <h2 className="font-display font-bold text-sm text-bark tracking-wide uppercase">
            Фільтри
          </h2>
          <button
            onClick={resetFilters}
            className="text-xs text-caramel hover:text-amber transition-colors underline"
          >
            Скинути все
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-oak mb-2">
            Сортування
          </label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'default' | 'asc' | 'desc')}
            className="w-full border border-parchment rounded p-2 text-xs bg-ivory text-bark focus:outline-none focus:ring-1 focus:ring-bark"
          >
            <option value="default">За замовчуванням</option>
            <option value="asc">Від дешевих до дорогих</option>
            <option value="desc">Від дорогих до дешевих</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-oak mb-2">
            Ціна (₴)
          </label>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-oak">від</span>
              <input
                type="number"
                min="0"
                max={maxPrice}
                value={minPrice}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), maxPrice);
                  setMinPrice(Math.max(0, val));
                }}
                className="w-full border border-parchment rounded pl-7 pr-2 py-1.5 text-xs bg-ivory text-bark focus:outline-none focus:ring-1 focus:ring-bark"
              />
            </div>
            <span className="text-oak text-xs">—</span>
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-oak">до</span>
              <input
                type="number"
                min={minPrice}
                max={defaultMaxPrice * 2}
                value={maxPrice}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), minPrice);
                  setMaxPrice(val);
                }}
                className="w-full border border-parchment rounded pl-7 pr-2 py-1.5 text-xs bg-ivory text-bark focus:outline-none focus:ring-1 focus:ring-bark"
              />
            </div>
          </div>

          <div className="relative h-5 flex items-center">
            <div className="absolute w-full h-1 bg-parchment rounded-sm" />

            <div
              className="absolute h-1 bg-bark rounded-sm pointer-events-none"
              style={{
                left: `${defaultMaxPrice > 0 ? (minPrice / defaultMaxPrice) * 100 : 0}%`,
                right: `${defaultMaxPrice > 0 ? 100 - (maxPrice / defaultMaxPrice) * 100 : 0}%`,
              }}
            />

            <input
              type="range"
              min="0"
              max={defaultMaxPrice}
              step="1"
              value={minPrice}
              onChange={(e) => {
                const value = Math.min(Number(e.target.value), maxPrice - 1);
                setMinPrice(value);
              }}
              className="absolute w-full appearance-none bg-transparent pointer-events-none accent-bark [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-bark [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none"
            />

            <input
              type="range"
              min="0"
              max={defaultMaxPrice}
              step="1"
              value={maxPrice}
              onChange={(e) => {
                const value = Math.max(Number(e.target.value), minPrice + 1);
                setMaxPrice(value);
              }}
              className="absolute w-full appearance-none bg-transparent pointer-events-none accent-bark [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-bark [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-oak mb-3">
            Категорія / Тип
          </label>
          <div className="flex flex-col gap-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`text-left px-3 py-2 rounded text-xs transition-colors mb-2 font-medium ${
                selectedCategory === 'all'
                  ? 'bg-bark text-cream'
                  : 'bg-ivory text-bark hover:bg-parchment'
              }`}
            >
              📦 Усі категорії
            </button>

            {CATEGORY_TREE.map((category) => {
              const isExpanded = expandedCategories.includes(category.id);
              
              return (
                <div key={category.id} className="mb-2">
                  <div className={`flex items-center justify-between rounded text-xs transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-bark text-cream'
                        : 'text-bark hover:bg-parchment'
                    }`}>
                    <button
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex-1 text-left px-3 py-1.5 font-semibold"
                    >
                      {category.name}
                    </button>
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="px-3 py-1.5 text-inherit opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <svg 
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  
                  {isExpanded && (
                    <div className="flex flex-col gap-0.5 mt-1 ml-4 border-l border-parchment pl-2">
                      {category.subcategories.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => setSelectedCategory(sub.id)}
                          className={`text-left px-2 py-1.5 rounded text-xs transition-colors ${
                            selectedCategory === sub.id
                              ? 'bg-caramel/20 text-caramel font-medium'
                              : 'text-oak hover:bg-ivory hover:text-bark'
                          }`}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-4 bg-white border border-parchment p-3 rounded-sm">
          <span className="text-xs text-oak">
            Знайдено товарів: <span className="font-bold text-bark">{filteredProducts.length}</span>
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-parchment rounded p-12 text-center text-oak text-sm">
            За вашим запитом товари не знайдені. Спробуйте змінити категорію або ціну.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const isSaved = savedItems.some((item) => item.id === product.id);

              const cardProduct = {
                id: product.id,
                name: product.title,
                price: product.price,
                originalPrice: product.price * 1.2,
                sold: 0,
                rating: 5,
                reviews: 0,
                shop: 'Pentu',
                img: product.image || '/placeholder.png',
              };

              return (
                <ProductCard
                  key={product.id}
                  product={cardProduct}
                  isSaved={isSaved}
                  onToggleSave={() => {
                    toggleSave({
                      id: cardProduct.id,
                      name: cardProduct.name,
                      price: cardProduct.price,
                      img: cardProduct.img,
                      shop: cardProduct.shop,
                      sold: cardProduct.sold,
                      rating: cardProduct.rating,
                      reviews: cardProduct.reviews,
                    } as any);
                  }}
                  onAdd={() => {
                    addToCart({
                      id: cardProduct.id,
                      name: cardProduct.name,
                      price: cardProduct.price,
                      img: cardProduct.img,
                      shop: cardProduct.shop,
                      sold: cardProduct.sold,
                      rating: cardProduct.rating,
                      reviews: cardProduct.reviews,
                    } as any);
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
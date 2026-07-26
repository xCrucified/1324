import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  img: string;
  shop: string;
  sold: number;
  rating: number;
  reviews: number;
  quantity: number;
}

export interface SavedItem {
  id: string;
  name: string;
  price: number;
  img: string;
  shop: string;
}

interface ShopStore {
  query: string;
  setQuery: (query: string) => void;
  
  items: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;

  savedItems: SavedItem[];
  toggleSave: (product: SavedItem) => void;
}

export const useShopStore = create<ShopStore>()(
  persist(
    (set, get) => ({
      query: '',
      setQuery: (query) => set({ query }),

      items: [],
      addToCart: (product) => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((item) => item.id === product.id);

        if (existingIndex > -1) {
          const newItems = [...currentItems];
          newItems[existingIndex].quantity += 1;
          set({ items: newItems });
        } else {
          set({ items: [...currentItems, { ...product, quantity: 1 }] });
        }
      },
      removeFromCart: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },
      updateQuantity: (id, quantity) => {
        set({
          items: get().items.map((item) => (item.id === id ? { ...item, quantity } : item)),
        });
      },
      clearCart: () => set({ items: [] }),

      savedItems: [],
      toggleSave: (product) => {
        const saved = get().savedItems;
        const exists = saved.some((item) => item.id === product.id);
        if (exists) {
          set({ savedItems: saved.filter((item) => item.id !== product.id) });
        } else {
          set({ savedItems: [...saved, product] });
        }
      },
    }),
    {
      name: 'pentu-shop-storage',
    }
  )
);
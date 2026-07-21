import { create } from 'zustand';

interface ShopStore {
  cart: number;
  query: string;
  setQuery: (q: string) => void;
  incrementCart: () => void;
}

export const useShopStore = create<ShopStore>((set) => ({
  cart: 0,
  query: "",
  setQuery: (query) => set({ query }),
  incrementCart: () => set((state) => ({ cart: state.cart + 1 })),
}));
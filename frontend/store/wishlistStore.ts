import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { WishlistItem } from '@/types/wishlist';

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  getItemById: (id: string) => WishlistItem | undefined;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: [item, ...state.items],
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      clearAll: () => set({ items: [] }),
      getItemById: (id) => get().items.find((item) => item.id === id),
    }),
    {
      name: 'pratham-wishlist',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

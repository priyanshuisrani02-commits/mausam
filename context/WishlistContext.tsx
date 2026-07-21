"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useAuth } from "@/context/AuthContext";

import {
  getWishlist,
  toggleWishlist,
} from "@/lib/wishlist";

type WishlistContextType = {
  wishlist: string[];
  loading: boolean;
  isWishlisted: (id: string) => boolean;
  toggle: (id: string) => Promise<void>;
};

const WishlistContext =
  createContext<WishlistContextType>({
    wishlist: [],
    loading: true,
    isWishlisted: () => false,
    toggle: async () => {},
  });

export function WishlistProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  const [wishlist, setWishlist] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadWishlist() {
      if (!user) {
        setWishlist([]);
        setLoading(false);
        return;
      }

      try {
        const data = await getWishlist();

        setWishlist(
          data.map((item: any) => item.product_id)
        );
      } finally {
        setLoading(false);
      }
    }

    loadWishlist();
  }, [user]);

  function isWishlisted(id: string) {
    return wishlist.includes(id);
  }

  async function toggle(id: string) {
    const added = await toggleWishlist(id);

    if (added) {
      setWishlist((prev) => [...prev, id]);
    } else {
      setWishlist((prev) =>
        prev.filter((item) => item !== id)
      );
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        isWishlisted,
        toggle,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
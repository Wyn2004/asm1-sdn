"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

// Temporary types until Prisma client is regenerated
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CartItemWithProduct extends CartItem {
  product: Product;
}

interface CartWithItems {
  id: string;
  userId: string;
  items: CartItemWithProduct[];
  createdAt: Date;
  updatedAt: Date;
}

interface CartContextType {
  cart: CartWithItems | null;
  initialLoading: boolean;
  addingToCart: string[]; // Array of productIds being added
  updatingItems: string[]; // Array of cartItemIds being updated
  removingItems: string[]; // Array of cartItemIds being removed
  clearingCart: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartWithItems | null>(null);
  const [initialLoading, setInitialLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string[]>([]);
  const [updatingItems, setUpdatingItems] = useState<string[]>([]);
  const [removingItems, setRemovingItems] = useState<string[]>([]);
  const [clearingCart, setClearingCart] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

  // Fetch cart when user logs in
  useEffect(() => {
    if (session?.user?.id) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [session?.user?.id]);

  const refreshCart = async () => {
    if (!session?.user?.id) return;

    setInitialLoading(true);
    try {
      const response = await fetch(`${apiUrl}/cart`);
      if (response.ok) {
        const cartData = await response.json();
        setCart(cartData);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!session?.user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    setAddingToCart((prev) => [...prev, productId]);
    try {
      const response = await fetch(`${apiUrl}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }

      await refreshCart();
      toast({
        title: "Success",
        description: "Item added to cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setAddingToCart((prev) => prev.filter((id) => id !== productId));
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    if (!cart) return;

    // Optimistic update
    const optimisticCart = {
      ...cart,
      items: cart.items.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item
      ),
    };
    setCart(optimisticCart);

    setUpdatingItems((prev) => [...prev, cartItemId]);
    try {
      const response = await fetch(`${apiUrl}/cart/${cartItemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        throw new Error("Failed to update cart item");
        // Revert optimistic update on error
        await refreshCart();
      }
    } catch (error) {
      // Revert optimistic update on error
      await refreshCart();
      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive",
      });
    } finally {
      setUpdatingItems((prev) => prev.filter((id) => id !== cartItemId));
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!cart) return;

    // Optimistic update
    const optimisticCart = {
      ...cart,
      items: cart.items.filter((item) => item.id !== cartItemId),
    };
    setCart(optimisticCart);

    setRemovingItems((prev) => [...prev, cartItemId]);
    try {
      const response = await fetch(`${apiUrl}/cart/${cartItemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove item from cart");
        // Revert optimistic update on error
        await refreshCart();
      } else {
        toast({
          title: "Success",
          description: "Item removed from cart",
        });
      }
    } catch (error) {
      // Revert optimistic update on error
      await refreshCart();
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    } finally {
      setRemovingItems((prev) => prev.filter((id) => id !== cartItemId));
    }
  };

  const clearCart = async () => {
    if (!cart?.items.length) return;

    setClearingCart(true);
    try {
      const response = await fetch(`${apiUrl}/cart/clear`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear cart");
      }

      setCart({ ...cart, items: [] });
      toast({
        title: "Success",
        description: "Cart cleared",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    } finally {
      setClearingCart(false);
    }
  };

  const totalItems =
    cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalPrice =
    cart?.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    ) || 0;

  const value: CartContextType = {
    cart,
    initialLoading,
    addingToCart,
    updatingItems,
    removingItems,
    clearingCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

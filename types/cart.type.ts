import { Product } from "@/generated/prisma";

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface CartWithItems {
  id: string;
  userId: string;
  items: CartItemWithProduct[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToCartRequest {
  productId: string;
  quantity?: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartContextType {
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

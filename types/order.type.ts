import { Order, OrderItem, OrderStatus, Product } from "@/generated/prisma";

export interface OrderItemWithProduct extends OrderItem {
  product: Product;
}

export interface OrderWithItems extends Order {
  items: OrderItemWithProduct[];
}

export interface CreateOrderRequest {
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
}

export interface OrderFilters {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

export interface OrdersResponse {
  data: OrderWithItems[];
  total: number;
  page: number;
  totalPages: number;
}

export { OrderStatus };

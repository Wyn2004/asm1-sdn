import { Product } from "@/generated/prisma";

export type ProductFilters = {
  page?: number | 1;
  limit?: number | 6;
  userId?: string;
  search?: string | "";
  minPrice?: number | 0;
  maxPrice?: number | 0;
  order?: "asc" | "desc";
};

export type ProductsResponse = {
  data: Product[];
  total: number;
  page: number;
  totalProducts: number;
  totalPages: number;
};

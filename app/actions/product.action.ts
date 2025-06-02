import { Product } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { ProductFilters, ProductsResponse } from "@/types/product.type";

export async function getAllProducts(
  filters: ProductFilters = {}
): Promise<ProductsResponse> {
  const pageSize = filters.limit || 6;
  const skip = (filters.page! - 1) * pageSize || 0;
  const products = await prisma.product.findMany({
    skip,
    take: pageSize,
    where: {
      name: {
        contains: filters.search?.trim(),
        mode: "insensitive",
      },
      ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
        ? {
            price: {
              gte: filters.minPrice,
              lte: filters.maxPrice,
            },
          }
        : {}),
    },
    orderBy: {
      price: filters.order === "asc" ? "asc" : "desc",
    },
  });

  const total = await prisma.product.count();

  return {
    data: products,
    total,
    page: filters.page || 1,
    totalProducts: total,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
  });
  return product;
}

export async function getProductByUserId(userId: string): Promise<Product[]> {
  const product = await prisma.product.findMany({
    where: { userId },
  });
  return product;
}

export async function createProduct(product: Product) {
  const newProduct = await prisma.product.create({
    data: product,
  });
  return newProduct;
}

export async function updateProduct(id: string, product: Product) {
  const updatedProduct = await prisma.product.update({
    where: { id },
    data: product,
  });
  return updatedProduct;
}

export async function deleteProduct(id: string) {
  const deletedProduct = await prisma.product.delete({
    where: { id },
  });
  return deletedProduct;
}

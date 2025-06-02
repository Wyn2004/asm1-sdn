import { Suspense } from "react";
import { ProductGrid } from "@/components/product-grid";
import { SearchAndFilter } from "@/components/search-and-filter";
import { Hero } from "@/components/hero";
import { FeaturedCarousel } from "@/components/featured-carousel";

import {
  CarouselSkeleton,
  ProductGridSkeleton,
  SearchFilterSkeleton,
} from "@/components/loading-skeleton";
import { ProductFilters, ProductsResponse } from "@/types/product.type";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

async function ProductSection({
  searchParams,
}: {
  searchParams: ProductFilters;
}) {
  async function getProducts(): Promise<ProductsResponse> {
    const products = await fetch(`${apiUrl}/products?${searchParams}`);
    if (!products.ok) {
      throw new Error("Failed to fetch products");
    }
    return products.json();
  }
  const { data, totalPages, page, totalProducts } = await getProducts();

  return (
    <ProductGrid
      products={data}
      totalPages={totalPages}
      currentPage={page}
      totalProducts={totalProducts}
    />
  );
}

async function FeaturedSection() {
  async function getFeaturedProducts(limit: number): Promise<ProductsResponse> {
    const featuredProducts = await fetch(`${apiUrl}/products?limit=${limit}`);
    if (!featuredProducts.ok) {
      throw new Error("Failed to fetch featured products");
    }
    return featuredProducts.json();
  }
  const { data } = await getFeaturedProducts(6);
  return <FeaturedCarousel products={data} />;
}

export default function HomePage(searchParams: ProductFilters) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Hero />

      <Suspense fallback={<CarouselSkeleton />}>
        <FeaturedSection />
      </Suspense>

      <div className="mt-12">
        <h2 className="text-3xl font-bold text-center mb-8">Our Products</h2>

        <Suspense fallback={<SearchFilterSkeleton />}>
          <SearchAndFilter />
        </Suspense>

        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductSection searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

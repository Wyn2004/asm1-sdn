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
import { DiscountBanner } from "@/components/discount-banner";
import { NewsletterSignup } from "@/components/new-letter-signup";
import { Footer } from "@/components/footer";
import { getAllProducts } from "@/app/actions/product.action";

async function getProducts(
  searchParamsPromise: Promise<ProductFilters> | ProductFilters
): Promise<ProductsResponse> {
  const searchParams = await searchParamsPromise;

  try {
    return await getAllProducts(searchParams);
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      data: [],
      total: 0,
      totalPages: 0,
      page: 1,
      totalProducts: 0,
    };
  }
}

async function ProductSection({
  searchParams,
}: {
  searchParams: ProductFilters | Promise<ProductFilters>;
}) {
  const resolvedSearchParams = await searchParams;
  const { data, totalPages, page, totalProducts } = await getProducts(
    resolvedSearchParams
  );

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
    try {
      return await getAllProducts({ limit });
    } catch (error) {
      console.error("Error fetching featured products:", error);
      return {
        data: [],
        total: 0,
        totalPages: 0,
        page: 1,
        totalProducts: 0,
      };
    }
  }
  const { data } = await getFeaturedProducts(6);
  return <FeaturedCarousel products={data} />;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: ProductFilters;
}) {
  return (
    <>
      <DiscountBanner />
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
      <NewsletterSignup />
      <Footer />
    </>
  );
}

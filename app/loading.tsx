import { Hero } from "@/components/hero";
import {
  CarouselSkeleton,
  ProductGridSkeleton,
  SearchFilterSkeleton,
} from "@/components/loading-skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Hero />
      <CarouselSkeleton />
      <div className="mt-12">
        <div className="text-3xl font-bold text-center mb-8">Our Products</div>
        <SearchFilterSkeleton />
        <ProductGridSkeleton />
      </div>
    </div>
  );
}

import { ProductCard } from "./product-card";
import { Pagination } from "./pagination";
import { Product } from "@/generated/prisma";

interface ProductGridProps {
  products: Product[];
  totalPages: number;
  currentPage: number;
  totalProducts?: number;
}

export function ProductGrid({
  products,
  totalPages,
  currentPage,
  totalProducts,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No products found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {totalProducts !== undefined && (
        <p className="text-sm text-muted-foreground">
          Showing {products.length} of {totalProducts} products
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      )}
    </div>
  );
}

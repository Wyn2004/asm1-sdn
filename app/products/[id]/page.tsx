import { ProductDetail } from "@/components/product-detail";
import { Product } from "@/generated/prisma";
import { notFound } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  async function getProduct(id: string): Promise<Product> {
    const product = await fetch(`${apiUrl}/products/${id}`);
    if (!product.ok) {
      notFound();
    }
    return product.json();
  }

  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetail product={product} />
    </div>
  );
}

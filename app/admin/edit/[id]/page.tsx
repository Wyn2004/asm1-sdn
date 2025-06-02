import { notFound } from "next/navigation";
import { ProductForm } from "@/components/product-form";
import { Product } from "@/generated/prisma";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  async function getProductById(id: String): Promise<Product> {
    const product = await fetch(`${apiUrl}/products/${id}`);
    if (!product.ok) {
      notFound();
    }
    return product.json();
  }

  const resolvedParams = await params;
  const product = await getProductById(resolvedParams.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/admin">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to admin
        </Button>
      </Link>
      <h1 className="text-3xl font-bold mb-8">Edit Product</h1>
      <div className="max-w-2xl">
        <ProductForm product={product} />
      </div>
    </div>
  );
}

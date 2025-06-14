import { ProductDetail } from "@/components/product-detail";
import { Product } from "@/generated/prisma";
import { notFound } from "next/navigation";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

async function getProduct(id: string): Promise<Product> {
  try {
    const res = await fetch(`${apiUrl}/products/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      notFound();
    }

    return res.json();
  } catch (error) {
    console.error("Fetch error: ", error);
    notFound();
  }
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  if (!params?.id) {
    notFound();
  }

  const product = await getProduct(params.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetail product={product} />
    </div>
  );
}

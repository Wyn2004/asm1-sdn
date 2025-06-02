import { createProduct, getAllProducts } from "@/app/actions/product.action";
import { ProductFilters } from "@/types/product.type";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const filters: ProductFilters = {
      search: url.searchParams.get("search") || undefined,
      minPrice: url.searchParams.get("minPrice")
        ? Number(url.searchParams.get("minPrice"))
        : undefined,
      maxPrice: url.searchParams.get("maxPrice")
        ? Number(url.searchParams.get("maxPrice"))
        : undefined,
      page: url.searchParams.get("page")
        ? Number(url.searchParams.get("page"))
        : undefined,
      order: url.searchParams.get("order") as "asc" | "desc" | undefined,
    };
    const result = await getAllProducts(filters);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const product = await createProduct(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

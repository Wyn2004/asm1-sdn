import { getProductByUserId } from "@/app/actions/product.action";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.pathname.split("/").pop();
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }
  const products = await getProductByUserId(userId);
  return NextResponse.json(products);
}

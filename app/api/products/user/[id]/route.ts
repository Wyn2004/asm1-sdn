import { getProductByUserId } from "@/app/actions/product.action";
import { useSession } from "next-auth/react";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOption } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOption);
  const userId = session?.user.id;
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }
  const products = await getProductByUserId(userId);
  return NextResponse.json(products);
}

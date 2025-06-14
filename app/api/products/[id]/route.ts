import {
  deleteProduct,
  getProductById,
  updateProduct,
} from "@/app/actions/product.action";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { type NextRequest, NextResponse } from "next/server";
import { authOption } from "../../auth/[...nextauth]/route";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;

    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOption);

    const userId = session?.user.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const params = await context.params;
    const product = await updateProduct(params.id, body);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOption);
    const userId = session?.user.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const params = await context.params;
    const success = await deleteProduct(params.id);
    if (!success) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    await fetch(`${apiUrl}/upload?url=${success.image}`, {
      method: "DELETE",
    });
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

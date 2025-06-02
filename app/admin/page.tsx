import { Suspense } from "react";
import { ProductForm } from "@/components/product-form";
import { AdminProductList } from "@/components/admin-product-list";
import {
  AdminProductListSkeleton,
  ProductFormSkeleton,
} from "@/components/admin-loading";
import { stackServerApp } from "@/stack";
import { SignIn } from "@stackframe/stack";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

async function AdminProductSection({ userId }: { userId: string }) {
  async function getProductsByUserId() {
    const products = await fetch(`${apiUrl}/products/user/${userId}`);
    return products.json();
  }
  const products = await getProductsByUserId();
  return <AdminProductList products={products} />;
}

export default async function AdminPage() {
  const user = await stackServerApp.getUser();
  const userId = user?.id;

  return (
    <>
      {userId ? (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Product Management</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Add New Product</h2>
              <Suspense fallback={<ProductFormSkeleton />}>
                <ProductForm userId={userId} />
              </Suspense>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-4">Manage Products</h2>
              <Suspense fallback={<AdminProductListSkeleton />}>
                <AdminProductSection userId={userId} />
              </Suspense>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <SignIn />
        </div>
      )}
    </>
  );
}

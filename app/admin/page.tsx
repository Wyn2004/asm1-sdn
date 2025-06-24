"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { ProductForm } from "@/components/product-form";
import { AdminProductList } from "@/components/admin-product-list";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const userId = session?.user.id;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recall, setRecall] = useState<boolean>(false);

  useEffect(() => {
    if (userId) {
      fetch(`${apiUrl}/products/user/${userId}`)
        .then((res) => res.json())
        .then((data) => setProducts(data))
        .finally(() => setLoading(false));
    }
  }, [userId, recall]);

  if (status === "loading" || loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!userId) {
    window.location.href = "/auth";
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Product Management</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Add New Product</h2>
          <ProductForm userId={userId} setRecall={setRecall} recall={recall} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Manage Products</h2>
          <AdminProductList
            products={products}
            setRecall={setRecall}
            recall={recall}
          />
        </div>
      </div>
    </div>
  );
}

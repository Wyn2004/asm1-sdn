"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, Eye, ArrowLeft, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ProductGridSkeleton } from "@/components/loading-skeleton";

// Temporary types until Prisma client is regenerated
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
}

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

interface OrdersResponse {
  data: Order[];
  total: number;
  page: number;
  totalPages: number;
}

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  SHIPPED: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-purple-100 text-purple-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchOrders();
    }
  }, [session?.user?.id, statusFilter, pagination.page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: "10",
      });

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await fetch(`/api/orders?${params.toString()}`);
      if (response.ok) {
        const data: OrdersResponse = await response.json();
        setOrders(data.data);
        setPagination({
          page: data.page,
          totalPages: data.totalPages,
          total: data.total,
        });
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return <ProductGridSkeleton />;
  }

  if (!session) {
    return null;
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPagination({ ...pagination, page: 1 });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pending Payment";
      case "PAID":
        return "Paid";
      case "SHIPPED":
        return "Shipped";
      case "DELIVERED":
        return "Delivered";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  if (orders.length === 0 && !loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">
                You haven't placed any orders yet
              </p>
              <Link href="/">
                <Button>Start Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Order History</h1>
        </div>

        {orderId && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">
              ✅ Order <strong>#{orderId.slice(-8)}</strong> has been placed
              successfully!
            </p>
          </div>
        )}

        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order.id.slice(-8)}
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(order.createdAt)}
                      </span>
                      <span>
                        {order.items.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}{" "}
                        items
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={statusColors[order.status]}>
                      {getStatusText(order.status)}
                    </Badge>
                    <p className="text-lg font-semibold mt-1">
                      ${(order.totalAmount / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={item.id}>
                      <div className="flex items-center space-x-4">
                        <Image
                          src={
                            item.product.image ||
                            "/placeholder.svg?height=80&width=80"
                          }
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            ${(item.price / 100).toFixed(2)} x {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          ${((item.price * item.quantity) / 100).toFixed(2)}
                        </p>
                      </div>
                      {index < order.items.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                    {order.status === "DELIVERED" && (
                      <Button variant="outline" size="sm">
                        Write Review
                      </Button>
                    )}
                    {(order.status === "PAID" ||
                      order.status === "SHIPPED") && (
                      <Link href={`/orders/${order.id}/track`}>
                        <Button variant="outline" size="sm">
                          Track Order
                        </Button>
                      </Link>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-lg font-semibold">
                      ${(order.totalAmount / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page - 1 })
              }
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page + 1 })
              }
            >
              Next
            </Button>
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground mt-4">
          Total: {pagination.total} orders
        </div>
      </div>
    </div>
  );
}

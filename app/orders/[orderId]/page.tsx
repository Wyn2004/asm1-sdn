"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Truck,
  Package,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  User,
} from "lucide-react";
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

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  SHIPPED: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-purple-100 text-purple-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statusIcons = {
  PENDING: Clock,
  PAID: CreditCard,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: Clock,
};

export default function OrderDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id && orderId) {
      fetchOrderDetail();
    }
  }, [session?.user?.id, orderId]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const orderData = await response.json();
        setOrder(orderData);
      } else if (response.status === 404) {
        router.push("/orders");
      }
    } catch (error) {
      console.error("Error fetching order detail:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return <ProductGridSkeleton />;
  }

  if (!session || !order) {
    return null;
  }

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
        return "Payment Confirmed";
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

  const StatusIcon = statusIcons[order.status];

  const orderTimeline = [
    { status: "PENDING", label: "Order Placed", completed: true },
    {
      status: "PAID",
      label: "Payment Confirmed",
      completed: order.status !== "PENDING",
    },
    {
      status: "SHIPPED",
      label: "Shipped",
      completed: ["SHIPPED", "DELIVERED"].includes(order.status),
    },
    {
      status: "DELIVERED",
      label: "Delivered",
      completed: order.status === "DELIVERED",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/orders">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </Link>

        {/* Order Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  Order #{order.id.slice(-8)}
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <Badge className={`${statusColors[order.status]} mb-2`}>
                  <StatusIcon className="h-4 w-4 mr-1" />
                  {getStatusText(order.status)}
                </Badge>
                <p className="text-2xl font-bold">
                  ${(order.totalAmount / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
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
                          <h4 className="font-medium text-lg">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.product.description}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ${(item.price / 100).toFixed(2)} x {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            ${((item.price * item.quantity) / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {index < order.items.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderTimeline.map((step, index) => (
                    <div
                      key={step.status}
                      className="flex items-center space-x-4"
                    >
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          step.completed
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Clock className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-medium ${
                            step.completed ? "text-green-600" : "text-gray-500"
                          }`}
                        >
                          {step.label}
                        </p>
                        {step.completed && step.status === order.status && (
                          <p className="text-sm text-muted-foreground">
                            Updated {formatDate(order.updatedAt)}
                          </p>
                        )}
                      </div>
                      {index < orderTimeline.length - 1 && (
                        <div
                          className={`absolute left-4 top-8 w-0.5 h-8 ${
                            step.completed ? "bg-green-500" : "bg-gray-200"
                          }`}
                          style={{ marginLeft: "16px" }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Details */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>
                    Subtotal (
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                    items)
                  </span>
                  <span>${(order.totalAmount / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${((order.totalAmount * 0.1) / 100).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${((order.totalAmount * 1.1) / 100).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{session.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    123 Fashion Street
                    <br />
                    New York, NY 10001
                    <br />
                    United States
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">Credit Card</p>
                  <p className="text-sm text-muted-foreground">
                    **** **** **** 1234
                  </p>
                  {order.status === "PAID" && (
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-600"
                    >
                      ✓ Paid
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {order.status === "PAID" && (
                <Link href={`/orders/${order.id}/track`}>
                  <Button className="w-full">
                    <Truck className="h-4 w-4 mr-2" />
                    Track Order
                  </Button>
                </Link>
              )}

              {order.status === "DELIVERED" && (
                <Button variant="outline" className="w-full">
                  Write Review
                </Button>
              )}

              <Button variant="outline" className="w-full">
                Download Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

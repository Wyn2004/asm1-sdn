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
  MapPin,
  Phone,
  Mail,
  Clipboard,
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

const trackingEvents = [
  {
    status: "Order Confirmed",
    description: "Your order has been confirmed and is being prepared",
    date: "2024-01-15 10:30 AM",
    location: "Fashion Store Warehouse",
    completed: true,
  },
  {
    status: "Order Packed",
    description: "Your items have been carefully packed and ready for shipment",
    date: "2024-01-15 02:45 PM",
    location: "Fashion Store Warehouse",
    completed: true,
  },
  {
    status: "In Transit",
    description: "Your package is on its way to the delivery center",
    date: "2024-01-16 08:20 AM",
    location: "Distribution Center - NY",
    completed: true,
  },
  {
    status: "Out for Delivery",
    description: "Your package is out for delivery and will arrive today",
    date: "2024-01-17 09:15 AM",
    location: "Local Delivery Center",
    completed: false,
  },
  {
    status: "Delivered",
    description: "Package delivered successfully",
    date: "Expected: 2024-01-17 06:00 PM",
    location: "Your Address",
    completed: false,
  },
];

export default function TrackOrderPage() {
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

  const trackingNumber = `TRK${order.id.slice(-8).toUpperCase()}`;
  const estimatedDelivery = new Date(
    Date.now() + 2 * 24 * 60 * 60 * 1000
  ).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link href={`/orders/${orderId}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Order Details
          </Button>
        </Link>

        {/* Tracking Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  Track Order #{order.id.slice(-8)}
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Tracking Number:{" "}
                  <span className="font-mono">{trackingNumber}</span>
                </p>
              </div>
              <div className="text-right">
                <Badge className="bg-blue-100 text-blue-800 mb-2">
                  <Truck className="h-4 w-4 mr-1" />
                  In Transit
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Expected: {estimatedDelivery}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tracking Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {trackingEvents.map((event, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-start space-x-4">
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            event.completed
                              ? "bg-green-500 text-white"
                              : index ===
                                trackingEvents.findIndex((e) => !e.completed)
                              ? "bg-blue-500 text-white animate-pulse"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {event.completed ? (
                            <CheckCircle className="h-6 w-6" />
                          ) : index ===
                            trackingEvents.findIndex((e) => !e.completed) ? (
                            <Truck className="h-6 w-6" />
                          ) : (
                            <Clock className="h-6 w-6" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4
                              className={`font-semibold ${
                                event.completed
                                  ? "text-green-600"
                                  : index ===
                                    trackingEvents.findIndex(
                                      (e) => !e.completed
                                    )
                                  ? "text-blue-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {event.status}
                            </h4>
                            <span className="text-sm text-muted-foreground">
                              {event.date}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </p>
                        </div>
                      </div>
                      {index < trackingEvents.length - 1 && (
                        <div
                          className={`absolute left-5 top-10 w-0.5 h-12 ${
                            event.completed ? "bg-green-500" : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Package Contents */}
            <Card>
              <CardHeader>
                <CardTitle>Package Contents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={item.id}>
                      <div className="flex items-center space-x-4">
                        <Image
                          src={
                            item.product.image ||
                            "/placeholder.svg?height=60&width=60"
                          }
                          alt={item.product.name}
                          width={60}
                          height={60}
                          className="rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium">{item.product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
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
          </div>

          {/* Shipping Details */}
          <div className="space-y-6">
            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Estimated Delivery</h4>
                  <p className="text-lg font-semibold text-green-600">
                    {estimatedDelivery}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Between 9:00 AM - 6:00 PM
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Shipping Address</h4>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">
                      {session.user.name}
                    </p>
                    <p>123 Fashion Street</p>
                    <p>New York, NY 10001</p>
                    <p>United States</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Carrier Information</h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Carrier:</strong> Fashion Express
                    </p>
                    <p>
                      <strong>Service:</strong> Standard Delivery
                    </p>
                    <p>
                      <strong>Tracking:</strong> {trackingNumber}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support: 1-800-FASHION
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clipboard className="h-4 w-4 mr-2" />
                  Copy Tracking Number
                </Button>
              </CardContent>
            </Card>

            {/* Delivery Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>• Please leave package at front door if no one is home</p>
                  <p>• Signature may be required for this delivery</p>
                  <p>• Contact customer if delivery issues arise</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCart } from "@/providers/cart.provider";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ProductGridSkeleton } from "@/components/loading-skeleton";

const checkoutSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  postalCode: z.string().min(5, "Postal code must be at least 5 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  paymentMethod: z.enum(["credit_card", "paypal", "apple_pay"]),
  cardNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  cvv: z.string().optional(),
  cardName: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { cart, loading: cartLoading, refreshCart } = useCart();
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: session?.user?.email || "",
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      postalCode: "",
      country: "",
      paymentMethod: "credit_card",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardName: "",
    },
  });

  const paymentMethod = form.watch("paymentMethod");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
    }
  }, [status, router]);

  useEffect(() => {
    if (cart?.items) {
      setSelectedItems(cart.items.map((item) => item.id));
    }
  }, [cart]);

  if (status === "loading" || cartLoading) {
    return <ProductGridSkeleton />;
  }

  if (!session) {
    return null;
  }

  if (!cart || cart.items.length === 0) {
    router.push("/cart");
    return null;
  }

  const handleItemSelect = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, itemId]);
    } else {
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
    }
  };

  const selectedCartItems = cart.items.filter((item) =>
    selectedItems.includes(item.id)
  );
  const totalAmount = selectedCartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const onSubmit = async (data: CheckoutFormData) => {
    if (selectedItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one item to checkout",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedItems,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const order = await orderResponse.json();

      // Process payment
      const paymentResponse = await fetch(`/api/orders/${order.id}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethod: data.paymentMethod,
          ...data,
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || "Payment failed");
      }

      const paymentResult = await paymentResponse.json();

      // Refresh cart to remove checked out items
      await refreshCart();

      toast({
        title: "Order Placed Successfully!",
        description: `Your order has been processed. Transaction ID: ${paymentResult.transactionId}`,
      });

      // Redirect to order confirmation or orders page
      router.push(`/orders?orderId=${order.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/cart">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="credit_card"
                                  id="credit_card"
                                />
                                <Label htmlFor="credit_card">Credit Card</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="paypal" id="paypal" />
                                <Label htmlFor="paypal">PayPal</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="apple_pay"
                                  id="apple_pay"
                                />
                                <Label htmlFor="apple_pay">Apple Pay</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {paymentMethod === "credit_card" && (
                      <>
                        <FormField
                          control={form.control}
                          name="cardName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cardholder Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Card Number</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="1234 5678 9012 3456"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="expiryDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expiry Date</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="MM/YY" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="cvv"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CVV</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="123" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={loading || selectedItems.length === 0}
                      onClick={form.handleSubmit(onSubmit)}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay ${(totalAmount / 100).toFixed(2)}
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={(checked) =>
                          handleItemSelect(item.id, checked as boolean)
                        }
                      />
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
                        <h4 className="font-medium truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          ${(item.product.price / 100).toFixed(2)} x{" "}
                          {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        $
                        {((item.product.price * item.quantity) / 100).toFixed(
                          2
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span>
                    Subtotal (
                    {selectedCartItems.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    )}{" "}
                    items)
                  </span>
                  <span>${(totalAmount / 100).toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${((totalAmount * 0.1) / 100).toFixed(2)}</span>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${((totalAmount * 1.1) / 100).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

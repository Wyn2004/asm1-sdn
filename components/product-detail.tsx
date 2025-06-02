"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Product } from "@/generated/prisma";

export function ProductDetail({ product }: { product: Product }) {
  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="aspect-square overflow-hidden rounded-lg">
          <Image
            src={product.image || "/placeholder.svg?height=600&width=600"}
            alt={product.name}
            width={600}
            height={600}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <p className="text-2xl font-bold text-primary mb-4">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Button size="lg" className="w-full">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
            <Button variant="outline" size="lg" className="w-full">
              Add to Wishlist
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

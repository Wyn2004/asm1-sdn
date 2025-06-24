"use client";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product } from "@/generated/prisma";
import { useCart } from "@/providers/cart.provider";
import { Loader2 } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, addingToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product.id);
  };

  const isAddingThisProduct = addingToCart.includes(product.id);

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square overflow-hidden">
          <Image
            src={product.image || "/placeholder.svg?height=400&width=400"}
            alt={product.name}
            width={400}
            height={400}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
          {product.description}
        </p>
        <p className="text-lg font-bold">${(product.price / 100).toFixed(2)}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={isAddingThisProduct}
        >
          {isAddingThisProduct ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            "Add to Cart"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

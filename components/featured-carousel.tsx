"use client";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Product } from "@/generated/prisma";

export function FeaturedCarousel({ products }: { products: Product[] }) {
  return (
    <div className="py-10">
      <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="md:basis-1/2 lg:basis-1/3"
            >
              <div className="p-1">
                <Card className="overflow-hidden">
                  <div className="aspect-square relative">
                    <Image
                      src={
                        product.image || "/placeholder.svg?height=400&width=400"
                      }
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold mb-4">
                      ${product.price.toFixed(2)}
                    </p>
                    <Link href={`/products/${product.id}`}>
                      <Button className="w-full">View Details</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex justify-center mt-4">
          <CarouselPrevious className="relative mr-2" />
          <CarouselNext className="relative" />
        </div>
      </Carousel>
    </div>
  );
}

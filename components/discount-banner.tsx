"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";

export function DiscountBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-red-600 text-white relative">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center">
          <p className="text-center font-medium">
            🎉 Special Offer! Get 20% off on all items with code{" "}
            <span className="font-bold">SUMMER2024</span>
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 text-white hover:text-white hover:bg-red-700"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

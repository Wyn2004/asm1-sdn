"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ProductGridSkeleton } from "./loading-skeleton"

interface ProductLoadingProps {
  children: React.ReactNode
  isLoading?: boolean
}

export function ProductLoading({ children, isLoading = false }: ProductLoadingProps) {
  const [showLoading, setShowLoading] = useState(isLoading)

  useEffect(() => {
    if (isLoading) {
      setShowLoading(true)
    } else {
      // Add a small delay to prevent flashing
      const timer = setTimeout(() => setShowLoading(false), 100)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  if (showLoading) {
    return <ProductGridSkeleton />
  }

  return <>{children}</>
}

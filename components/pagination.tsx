"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const goToPage = (page: number) => {
    startTransition(() => {
      router.push(createPageURL(page), { scroll: true });
    });
  };

  // Generate page numbers to display
  const generatePagination = () => {
    // If there are 7 or fewer pages, show all pages
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always include first and last page
    const firstPage = 1;
    const lastPage = totalPages;

    // Calculate middle pages
    let middlePages = [];
    if (currentPage <= 3) {
      // Near the start
      middlePages = [2, 3, 4, 5];
    } else if (currentPage >= totalPages - 2) {
      // Near the end
      middlePages = [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
      ];
    } else {
      // Middle
      middlePages = [currentPage - 1, currentPage, currentPage + 1];
    }

    // Build the final array with ellipses
    const pages = [firstPage];
    if (middlePages[0] > 2) {
      pages.push(-1); // Represents an ellipsis
    }
    pages.push(...middlePages);
    if (middlePages[middlePages.length - 1] < totalPages - 1) {
      pages.push(-2); // Represents an ellipsis
    }
    if (lastPage !== firstPage) {
      pages.push(lastPage);
    }

    return [...new Set(pages)]; // Remove duplicates
  };

  const pages = generatePagination();

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
        {isPending && (
          <span className="ml-2 inline-flex items-center">
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
            Loading...
          </span>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1 || isPending}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="hidden md:flex space-x-1">
          {pages.map((page, i) => {
            if (page < 0) {
              // Render ellipsis
              return (
                <Button
                  key={`ellipsis-${i}`}
                  variant="ghost"
                  disabled
                  className="w-9"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              );
            }

            return (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                onClick={() => goToPage(page)}
                className="w-9"
                disabled={isPending}
              >
                {page}
              </Button>
            );
          })}
        </div>

        <div className="md:hidden">
          <Select
            value={currentPage.toString()}
            onValueChange={(value) => goToPage(Number.parseInt(value))}
            disabled={isPending}
          >
            <SelectTrigger className="w-16">
              <SelectValue placeholder={currentPage} />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <SelectItem key={page} value={page.toString()}>
                    {page}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages || isPending}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

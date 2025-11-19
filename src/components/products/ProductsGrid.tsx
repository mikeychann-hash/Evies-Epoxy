"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/Button";
import { Grid, List, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * ProductsGrid Component
 *
 * P1-8 FIX: Replaced mock data with real API calls
 * P1-10 FIX: Connected filters to URL params and API
 *
 * Features:
 * - Fetches products from /api/products with pagination
 * - Respects filter params from URL (category, price, search)
 * - Implements client-side view mode toggle
 * - Real pagination with API metadata
 */

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ApiResponse {
  products: Product[];
  pagination: PaginationMeta;
}

export function ProductsGrid() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Get current params from URL
  const page = Number(searchParams.get("page")) || 1;
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const featured = searchParams.get("featured") || "";

  // Fetch products when params change
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        // Build query string
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "12");
        if (sortBy) params.set("sortBy", sortBy);
        if (sortOrder) params.set("sortOrder", sortOrder);
        if (category) params.set("category", category);
        if (search) params.set("search", search);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);
        if (featured) params.set("featured", featured);

        const response = await fetch(`/api/products?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data: ApiResponse = await response.json();
        setProducts(data.products);
        setPagination(data.pagination);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [page, sortBy, sortOrder, category, search, minPrice, maxPrice, featured]);

  // Update URL params
  const updateParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when changing filters
    if (!newParams.page) {
      params.set("page", "1");
    }

    router.push(`/products?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    // Parse sort value (e.g., "price-low" -> sortBy=price, sortOrder=asc)
    switch (value) {
      case "featured":
        updateParams({ sortBy: "", sortOrder: "", featured: "true" });
        break;
      case "newest":
        updateParams({ sortBy: "createdAt", sortOrder: "desc", featured: "" });
        break;
      case "price-low":
        updateParams({ sortBy: "price", sortOrder: "asc", featured: "" });
        break;
      case "price-high":
        updateParams({ sortBy: "price", sortOrder: "desc", featured: "" });
        break;
      case "name":
        updateParams({ sortBy: "name", sortOrder: "asc", featured: "" });
        break;
    }
  };

  const handlePageChange = (newPage: number) => {
    updateParams({ page: String(newPage) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Derive current sort value for dropdown
  const getCurrentSortValue = () => {
    if (featured) return "featured";
    if (sortBy === "createdAt" && sortOrder === "desc") return "newest";
    if (sortBy === "price" && sortOrder === "asc") return "price-low";
    if (sortBy === "price" && sortOrder === "desc") return "price-high";
    if (sortBy === "name") return "name";
    return "newest";
  };

  if (loading) {
    return <ProductsGridSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          No products found matching your filters.
        </p>
        <Button onClick={() => router.push("/products")}>Clear Filters</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
        <p className="text-gray-600 dark:text-gray-400">
          Showing{" "}
          <span className="font-semibold">
            {pagination ? (pagination.page - 1) * pagination.limit + 1 : 1}
          </span>
          -{" "}
          <span className="font-semibold">
            {pagination
              ? Math.min(pagination.page * pagination.limit, pagination.total)
              : products.length}
          </span>{" "}
          of <span className="font-semibold">{pagination?.total || 0}</span>{" "}
          products
        </p>

        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <select
            value={getCurrentSortValue()}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${
                viewMode === "grid"
                  ? "bg-white dark:bg-gray-700 shadow-sm"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              aria-label="Grid view"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${
                viewMode === "list"
                  ? "bg-white dark:bg-gray-700 shadow-sm"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
              aria-label="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            : "flex flex-col gap-4"
        }
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(page - 1)}
              disabled={!pagination.hasPreviousPage}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = Math.max(
                1,
                Math.min(
                  page - 2 + i,
                  pagination.totalPages - 4
                )
              );

              if (pageNum > pagination.totalPages) return null;

              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "primary" : "outline"}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="outline"
              onClick={() => handlePageChange(page + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductsGridSkeleton() {
  return (
    <div>
      <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded mb-6"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

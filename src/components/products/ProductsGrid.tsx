"use client";

import { useState } from "react";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/Button";
import { Grid, List } from "lucide-react";

// Mock data - will be replaced with actual API call
const mockProducts = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1),
  name: `Product ${i + 1}`,
  slug: `product-${i + 1}`,
  description: "Beautiful handcrafted epoxy product with attention to detail",
  price: Math.floor(Math.random() * 100) + 20,
  compareAtPrice: i % 3 === 0 ? Math.floor(Math.random() * 150) + 100 : undefined,
  images: [`https://images.unsplash.com/photo-${1617360547964 + i}?w=500`],
  categoryId: String(Math.floor(Math.random() * 4) + 1),
  stock: Math.floor(Math.random() * 50) + 1,
  isActive: true,
  isFeatured: i % 4 === 0,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

export function ProductsGrid() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("featured");

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
        <p className="text-gray-600 dark:text-gray-400">
          Showing <span className="font-semibold">{mockProducts.length}</span> products
        </p>

        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
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
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product as any} />
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-12 flex justify-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled>
            Previous
          </Button>
          <Button variant="primary">1</Button>
          <Button variant="outline">2</Button>
          <Button variant="outline">3</Button>
          <Button variant="outline">Next</Button>
        </div>
      </div>
    </div>
  );
}

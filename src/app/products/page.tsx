import { Suspense } from "react";
import { ProductsGrid } from "@/components/products/ProductsGrid";
import { ProductFilters } from "@/components/products/ProductFilters";

export const metadata = {
  title: "Products - Evie's Epoxy",
  description: "Browse our complete collection of premium epoxy products",
};

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container-custom py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Our Products
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Discover our complete collection of premium epoxy products
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <ProductFilters />
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <Suspense fallback={<ProductsGridSkeleton />}>
              <ProductsGrid />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
}

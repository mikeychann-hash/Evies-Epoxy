"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

/**
 * ProductFilters Component
 *
 * P1-10 FIX: Connected filters to URL params and API
 *
 * Features:
 * - Fetches real categories from API
 * - Updates URL params when filters change
 * - Syncs with ProductsGrid via URL search params
 * - Implements price range filter
 */

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: {
    products: number;
  };
}

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Get current filter values from URL
  const selectedCategory = searchParams.get("category") || "";
  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";

  const [priceRange, setPriceRange] = useState({
    min: minPriceParam ? Number(minPriceParam) : 0,
    max: maxPriceParam ? Number(maxPriceParam) : 500,
  });

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Sync local price state with URL params
  useEffect(() => {
    if (minPriceParam) setPriceRange((prev) => ({ ...prev, min: Number(minPriceParam) }));
    if (maxPriceParam) setPriceRange((prev) => ({ ...prev, max: Number(maxPriceParam) }));
  }, [minPriceParam, maxPriceParam]);

  // Update URL params
  const updateParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== "0") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when changing filters
    params.set("page", "1");

    router.push(`/products?${params.toString()}`);
  };

  const toggleCategory = (slug: string) => {
    if (selectedCategory === slug) {
      updateParams({ category: "" });
    } else {
      updateParams({ category: slug });
    }
  };

  const applyPriceFilter = () => {
    updateParams({
      minPrice: priceRange.min > 0 ? String(priceRange.min) : "",
      maxPrice: priceRange.max < 500 ? String(priceRange.max) : "",
    });
  };

  const clearFilters = () => {
    router.push("/products");
    setPriceRange({ min: 0, max: 500 });
  };

  const hasActiveFilters =
    selectedCategory || minPriceParam || maxPriceParam;

  return (
    <Card className="p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Categories</h4>
        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"
              ></div>
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="space-y-2">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 p-2 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCategory === category.slug}
                  onChange={() => toggleCategory(category.slug)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm flex-1">{category.name}</span>
                <span className="text-xs text-gray-500">
                  ({category._count.products})
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No categories available</p>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Price Range</h4>
        <div className="space-y-4">
          {/* Min Price */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
              Min Price: ${priceRange.min}
            </label>
            <input
              type="range"
              min="0"
              max="500"
              step="10"
              value={priceRange.min}
              onChange={(e) =>
                setPriceRange((prev) => ({
                  ...prev,
                  min: Number(e.target.value),
                }))
              }
              className="w-full"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
              Max Price: ${priceRange.max}
            </label>
            <input
              type="range"
              min="0"
              max="500"
              step="10"
              value={priceRange.max}
              onChange={(e) =>
                setPriceRange((prev) => ({
                  ...prev,
                  max: Number(e.target.value),
                }))
              }
              className="w-full"
            />
          </div>

          {/* Apply Button */}
          {(priceRange.min !== Number(minPriceParam || 0) ||
            priceRange.max !== Number(maxPriceParam || 500)) && (
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={applyPriceFilter}
            >
              Apply Price Filter
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <h4 className="font-medium mb-2 text-sm">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs">
                {categories.find((c) => c.slug === selectedCategory)?.name ||
                  selectedCategory}
                <button
                  onClick={() => updateParams({ category: "" })}
                  className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {(minPriceParam || maxPriceParam) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs">
                ${minPriceParam || 0} - ${maxPriceParam || 500}
                <button
                  onClick={() =>
                    updateParams({ minPrice: "", maxPrice: "" })
                  }
                  className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

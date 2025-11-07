"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Heart } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Product } from "@/types";
import { formatPrice, getDiscount } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const discount = product.compareAtPrice
    ? getDiscount(product.price, product.compareAtPrice)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast.success("Added to cart!");
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <Card hover className="group overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="w-16 h-16 text-gray-300" />
            </div>
          )}

          {/* Discount Badge */}
          {discount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-semibold"
            >
              -{discount}%
            </motion.div>
          )}

          {/* Quick Actions */}
          <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.preventDefault();
                toast.success("Added to wishlist!");
              }}
              className="w-10 h-10 bg-white dark:bg-gray-900 rounded-lg flex items-center justify-center hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors shadow-lg"
            >
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Add to Cart */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Button
              variant="primary"
              fullWidth
              size="sm"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {product.name}
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {product.stock < 10 && product.stock > 0 && (
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
              Only {product.stock} left in stock!
            </p>
          )}

          {product.stock === 0 && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              Out of stock
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}

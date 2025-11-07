"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart, Share2, Truck, Shield, RefreshCw, Minus, Plus } from "lucide-react";
import { Product } from "@/types";
import { Button } from "@/components/ui/Button";
import { formatPrice, getDiscount } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";
import { ProductImageGallery } from "./ProductImageGallery";

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const discount = product.compareAtPrice
    ? getDiscount(product.price, product.compareAtPrice)
    : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    toast.success(`Added ${quantity} item(s) to cart!`);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-12">
      {/* Image Gallery */}
      <ProductImageGallery images={product.images} productName={product.name} />

      {/* Product Info */}
      <div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <Link href="/products" className="hover:text-primary-600 dark:hover:text-primary-400">
            Products
          </Link>
          <span>/</span>
          <Link
            href={`/products?category=${product.category.slug}`}
            className="hover:text-primary-600 dark:hover:text-primary-400"
          >
            {product.category.name}
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

        {/* Price */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <>
              <span className="text-2xl text-gray-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
              <span className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-semibold">
                Save {discount}%
              </span>
            </>
          )}
        </div>

        {/* Stock Status */}
        <div className="mb-6">
          {product.stock > 0 ? (
            <p className="text-green-600 dark:text-green-400 font-medium">
              ✓ In Stock ({product.stock} available)
            </p>
          ) : (
            <p className="text-red-600 dark:text-red-400 font-medium">
              Out of Stock
            </p>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Quantity Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Quantity</label>
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-16 text-center bg-transparent focus:outline-none"
                min="1"
                max={product.stock}
              />
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Button
            variant="primary"
            size="lg"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => toast.success("Added to wishlist!")}
          >
            <Heart className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="lg" onClick={() => toast.success("Link copied!")}>
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="flex items-start gap-3">
            <Truck className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0" />
            <div>
              <h4 className="font-medium mb-1">Free Shipping</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                On orders over $50
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0" />
            <div>
              <h4 className="font-medium mb-1">Quality Guarantee</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                100% satisfaction
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <RefreshCw className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0" />
            <div>
              <h4 className="font-medium mb-1">Easy Returns</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                30-day return policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

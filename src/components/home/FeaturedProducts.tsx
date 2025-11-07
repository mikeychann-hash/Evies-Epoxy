"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/products/ProductCard";
import { ArrowRight } from "lucide-react";

// Mock data - will be replaced with actual data from API
const mockProducts = [
  {
    id: "1",
    name: "Ocean Wave Coaster Set",
    slug: "ocean-wave-coaster-set",
    description: "Beautiful handcrafted epoxy coasters with ocean wave design",
    price: 45.99,
    compareAtPrice: 59.99,
    images: ["https://images.unsplash.com/photo-1617360547964-1078bb789e2d?w=500"],
    categoryId: "1",
    stock: 15,
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Galaxy Resin Serving Tray",
    slug: "galaxy-resin-serving-tray",
    description: "Stunning galaxy-themed serving tray with gold accents",
    price: 89.99,
    images: ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500"],
    categoryId: "1",
    stock: 8,
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Marble Effect Jewelry Box",
    slug: "marble-effect-jewelry-box",
    description: "Elegant jewelry box with marble epoxy finish",
    price: 65.00,
    compareAtPrice: 85.00,
    images: ["https://images.unsplash.com/photo-1595665593673-bf1ad72905c0?w=500"],
    categoryId: "2",
    stock: 12,
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    name: "Premium Resin Starter Kit",
    slug: "premium-resin-starter-kit",
    description: "Complete kit with everything you need to start creating",
    price: 129.99,
    images: ["https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500"],
    categoryId: "3",
    stock: 20,
    isActive: true,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export function FeaturedProducts() {
  return (
    <section className="py-20">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Hand-picked favorites from our collection
            </p>
          </div>
          <Link href="/products" className="hidden md:block">
            <Button variant="outline">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ProductCard product={product as any} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center md:hidden"
        >
          <Link href="/products">
            <Button variant="outline" size="lg">
              View All Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

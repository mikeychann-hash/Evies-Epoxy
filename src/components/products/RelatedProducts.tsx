"use client";

import { motion } from "framer-motion";
import { ProductCard } from "./ProductCard";

// Mock data
const mockRelatedProducts = Array.from({ length: 4 }, (_, i) => ({
  id: String(i + 10),
  name: `Related Product ${i + 1}`,
  slug: `related-product-${i + 1}`,
  description: "Beautiful handcrafted epoxy product",
  price: Math.floor(Math.random() * 100) + 20,
  images: [`https://images.unsplash.com/photo-${1617360547964 + i + 10}?w=500`],
  categoryId: "1",
  stock: Math.floor(Math.random() * 50) + 1,
  isActive: true,
  isFeatured: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

interface RelatedProductsProps {
  currentProductId: string;
}

export function RelatedProducts({ currentProductId }: RelatedProductsProps) {
  return (
    <section>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold mb-8">You May Also Like</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockRelatedProducts.map((product, index) => (
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
      </motion.div>
    </section>
  );
}

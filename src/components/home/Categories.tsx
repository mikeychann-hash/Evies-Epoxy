"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Palette, Home, Gift, Sparkles } from "lucide-react";

export function Categories() {
  const categories = [
    {
      name: "Art & Decor",
      description: "Beautiful epoxy art pieces and decorative items",
      icon: Palette,
      href: "/products?category=art",
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Home & Living",
      description: "Functional epoxy items for everyday use",
      icon: Home,
      href: "/products?category=home",
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Custom Gifts",
      description: "Personalized epoxy creations for special occasions",
      icon: Gift,
      href: "/products?category=gifts",
      color: "from-orange-500 to-red-500",
    },
    {
      name: "DIY Supplies",
      description: "Everything you need to create your own epoxy projects",
      icon: Sparkles,
      href: "/products?category=diy",
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore our diverse collection of epoxy products across different categories
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={category.href}>
                  <Card hover className="p-6 h-full group cursor-pointer">
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {category.description}
                    </p>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

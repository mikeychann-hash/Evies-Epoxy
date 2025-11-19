"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, Sparkles, Package, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * About Page
 *
 * P1-9 FIX: Created missing about page
 *
 * Features:
 * - Brand story and mission
 * - Value propositions
 * - Call-to-action sections
 * - Responsive layout with animations
 */

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: "Handcrafted with Love",
      description:
        "Each piece is carefully crafted by hand with attention to detail and passion for the art of epoxy resin.",
    },
    {
      icon: Sparkles,
      title: "Unique Designs",
      description:
        "No two pieces are exactly alike. Every creation is one-of-a-kind, featuring unique patterns and color combinations.",
    },
    {
      icon: Package,
      title: "Quality Materials",
      description:
        "We use only premium epoxy resin and materials to ensure durability, clarity, and long-lasting beauty.",
    },
    {
      icon: Shield,
      title: "Customer Satisfaction",
      description:
        "Your happiness is our priority. We stand behind every piece with excellent customer service and support.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-primary-500/10 dark:from-primary-500/5 dark:via-secondary-500/5 dark:to-primary-500/5 py-20 md:py-32">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
              About Evie's Epoxy
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              Welcome to Evie's Epoxy, where art meets function. We create
              stunning handcrafted epoxy resin pieces that transform ordinary
              spaces into extraordinary experiences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                <p>
                  Evie's Epoxy was born from a passion for creating beautiful,
                  functional art pieces that bring joy to everyday life. What
                  started as a hobby in a small workshop has grown into a
                  thriving business dedicated to handcrafted excellence.
                </p>
                <p>
                  Every piece we create is infused with creativity, precision,
                  and care. From custom cutting boards to decorative wall art,
                  our epoxy resin creations are designed to be both stunning
                  and practical.
                </p>
                <p>
                  We believe that art should be accessible to everyone, and that
                  functional items can be beautiful. That's why we pour our
                  hearts into every pour, ensuring each piece is a unique work
                  of art.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-24 h-24 mx-auto mb-4 text-primary-600 dark:text-primary-400" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Image placeholder for workshop/product photos
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              What Makes Us Different
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our commitment to quality, creativity, and customer satisfaction
              sets us apart in the world of epoxy resin art.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
                    <Icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Our Process
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              From concept to creation, we take pride in every step of the
              process.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Design & Planning",
                description:
                  "We carefully plan each piece, selecting colors, patterns, and materials that will create a stunning final result.",
              },
              {
                step: "2",
                title: "Handcrafted Creation",
                description:
                  "Each piece is meticulously crafted by hand, with multiple layers of resin poured and cured to perfection.",
              },
              {
                step: "3",
                title: "Finishing Touches",
                description:
                  "We sand, polish, and finish each piece to ensure it meets our high standards before it reaches you.",
              },
            ].map((process, index) => (
              <motion.div
                key={process.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-6xl font-bold text-primary-200 dark:text-primary-900/50 mb-4">
                  {process.step}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                  {process.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {process.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Find Your Perfect Piece?
            </h2>
            <p className="text-lg mb-8 text-white/90">
              Explore our collection of handcrafted epoxy art and bring beauty
              into your home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-gray-100"
                >
                  Shop Now
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

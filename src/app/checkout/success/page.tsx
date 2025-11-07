"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useCartStore } from "@/store/cartStore";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const clearCart = useCartStore((state) => state.clearCart);
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    // Clear cart on successful checkout
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <Card className="p-8 md:p-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full mb-6"
          >
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </motion.div>

          <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Thank you for your order. We&apos;ve received your payment and will start processing your order right away.
          </p>

          {orderId && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-8">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Order Number
              </p>
              <p className="text-2xl font-bold font-mono">{orderId}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start gap-3 text-left">
              <Package className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Order Confirmation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You&apos;ll receive an email confirmation with your order details shortly.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-left">
              <CheckCircle className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Estimated Delivery</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your order will be delivered within 5-7 business days.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/account/orders">
              <Button variant="primary" size="lg">
                View Order
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

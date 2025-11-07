"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { CreditCard, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, getTotal, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);

  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    email: session?.user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });

  const [billingAddress, setBillingAddress] = useState({
    firstName: "",
    lastName: "",
    email: session?.user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });

  const subtotal = getTotal();
  const shipping = subtotal > 50 ? 0 : 10;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast.error("Please sign in to continue");
      router.push("/login?redirect=/checkout");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsProcessing(true);

    try {
      // Create Stripe checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
          shippingAddress,
          billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: data.sessionId,
        });

        if (error) {
          throw error;
        }
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <Link href="/products">
            <Button variant="primary">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="container-custom">
        <Link
          href="/products"
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Continue Shopping
        </Link>

        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Address */}
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={shippingAddress.firstName}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, firstName: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Last Name"
                    value={shippingAddress.lastName}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, lastName: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={shippingAddress.email}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, email: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, phone: e.target.value })
                    }
                    required
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="Address"
                      value={shippingAddress.address}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, address: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Input
                    label="City"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="State/Province"
                    value={shippingAddress.state}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, state: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Postal Code"
                    value={shippingAddress.postalCode}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                    }
                    required
                  />
                  <Input
                    label="Country"
                    value={shippingAddress.country}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, country: e.target.value })
                    }
                    required
                  />
                </div>
              </Card>

              {/* Billing Address */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">Billing Address</h2>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm">Same as shipping</span>
                  </label>
                </div>

                {!sameAsShipping && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      value={billingAddress.firstName}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, firstName: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="Last Name"
                      value={billingAddress.lastName}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, lastName: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={billingAddress.email}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, email: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="Phone"
                      type="tel"
                      value={billingAddress.phone}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, phone: e.target.value })
                      }
                      required
                    />
                    <div className="md:col-span-2">
                      <Input
                        label="Address"
                        value={billingAddress.address}
                        onChange={(e) =>
                          setBillingAddress({ ...billingAddress, address: e.target.value })
                        }
                        required
                      />
                    </div>
                    <Input
                      label="City"
                      value={billingAddress.city}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, city: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="State/Province"
                      value={billingAddress.state}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, state: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="Postal Code"
                      value={billingAddress.postalCode}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, postalCode: e.target.value })
                      }
                      required
                    />
                    <Input
                      label="Country"
                      value={billingAddress.country}
                      onChange={(e) =>
                        setBillingAddress({ ...billingAddress, country: e.target.value })
                      }
                      required
                    />
                  </div>
                )}
              </Card>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isProcessing}
              >
                <Lock className="w-5 h-5 mr-2" />
                {isProcessing ? "Processing..." : `Pay ${formatPrice(total)}`}
              </Button>

              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                Your payment information is secure and encrypted
              </p>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                      {/* Product image would go here */}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.product.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-800">
                  <span>Total</span>
                  <span className="text-primary-600 dark:text-primary-400">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {subtotal < 50 && (
                <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-sm text-primary-700 dark:text-primary-300">
                  Add {formatPrice(50 - subtotal)} more for free shipping!
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

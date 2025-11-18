# IMPLEMENTATION ROADMAP
## Critical Fixes & Integration Improvements

---

## PHASE 1: CRITICAL FIXES (WEEK 1) - BLOCKS PRODUCTION

### Fix 1: Stripe Webhook Handler [P0-1]
**File:** Create `/src/app/api/webhooks/stripe/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Update order status
    await prisma.order.update({
      where: { paymentIntentId: session.id },
      data: { status: "PROCESSING" },
    });

    console.log(`Order updated for session: ${session.id}`);
  }

  return NextResponse.json({ received: true });
}
```

**Config Updates:**
- Add webhook endpoint to Stripe Dashboard: `https://yourdomain.com/api/webhooks/stripe`
- Events: `checkout.session.completed`
- Verify `STRIPE_WEBHOOK_SECRET` in environment

**Testing:**
```bash
npm install -g stripe
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Then trigger test event in Stripe Dashboard
```

---

### Fix 2: Protect Admin Routes [P0-2]
**File:** Create `/src/middleware.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

**Testing:**
1. Try accessing `/admin` without login → Should redirect to `/login`
2. Login as regular user → Should redirect to `/login`
3. Login as admin (first user) → Should allow access

---

### Fix 3: Inventory Management [P0-3]
**File:** Update `/src/app/api/checkout/route.ts`

```typescript
// Add after line 34 (after verification, before order creation)

// Validate products exist and have sufficient stock
const products = await prisma.product.findMany({
  where: {
    id: { in: items.map((item: any) => item.productId) },
  },
});

// Check if all products exist
if (products.length !== items.length) {
  return NextResponse.json(
    { error: "Some products no longer exist" },
    { status: 400 }
  );
}

// Check inventory for each item
for (const item of items) {
  const product = products.find((p) => p.id === item.productId);
  if (!product) {
    return NextResponse.json(
      { error: `Product ${item.productId} not found` },
      { status: 404 }
    );
  }
  if (product.stock < item.quantity) {
    return NextResponse.json(
      { error: `Only ${product.stock} of ${product.name} available` },
      { status: 400 }
    );
  }
}

// Verify prices haven't changed too much (within 5%)
for (const item of items) {
  const product = products.find((p) => p.id === item.productId)!;
  const priceDiff = Math.abs(product.price - item.price) / product.price;
  if (priceDiff > 0.05) {
    return NextResponse.json(
      { error: "Price mismatch detected. Please refresh and try again." },
      { status: 400 }
    );
  }
}
```

**And update inventory after payment:**

```typescript
// After Stripe session creation, before response
// Update inventory
await Promise.all(
  items.map((item: any) =>
    prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    })
  )
);
```

**Testing:**
1. Add 2 items to cart but only 1 in stock → Error message
2. Successfully checkout → Verify stock decremented in DB

---

## PHASE 2: HIGH PRIORITY FIXES (WEEK 2-3)

### Fix 4: Connect Frontend to Product API [P1-1]
**File:** Update `/src/components/products/ProductsGrid.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/Button";
import { Grid, List, Loader } from "lucide-react";

interface ProductsGridProps {
  category?: string;
  featured?: boolean;
}

export function ProductsGrid({ category, featured }: ProductsGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("featured");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (featured) params.append("featured", "true");
        if (category) params.append("category", category);

        const response = await fetch(`/api/products?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data.products);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, featured]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
        <p className="text-gray-600 dark:text-gray-400">
          Showing <span className="font-semibold">{products.length}</span> products
        </p>

        <div className="flex items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name</option>
          </select>

          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded ${
                viewMode === "grid"
                  ? "bg-white dark:bg-gray-700 shadow-sm"
                  : ""
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${
                viewMode === "list"
                  ? "bg-white dark:bg-gray-700 shadow-sm"
                  : ""
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            : "flex flex-col gap-4"
        }
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

**And update `/src/components/home/FeaturedProducts.tsx`:**

```typescript
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/products/ProductCard";
import { ArrowRight, Loader } from "lucide-react";
import { Product } from "@/types";

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await fetch("/api/products?featured=true");
        const data = await response.json();
        setProducts(data.products.slice(0, 4)); // Show only 4
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

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

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
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
          </>
        )}
      </div>
    </section>
  );
}
```

---

### Fix 5: Dynamic Product Details Page [P1-3]
**File:** Update `/src/app/products/[slug]/page.tsx`

```typescript
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetails } from "@/components/products/ProductDetails";
import { RelatedProducts } from "@/components/products/RelatedProducts";
import { Product } from "@/types";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  });

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: `${product.name} - Evie's Epoxy`,
    description: product.description.slice(0, 160),
    openGraph: {
      images: [product.images[0]],
    },
  };
}

export default async function ProductPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  // Type casting for component
  const productData: Product = {
    ...product,
    createdAt: new Date(product.createdAt),
    updatedAt: new Date(product.updatedAt),
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container-custom py-12">
        <ProductDetails product={productData} />
        <div className="mt-20">
          <RelatedProducts currentProductId={product.id} />
        </div>
      </div>
    </div>
  );
}
```

---

### Fix 6: Stripe Line Item Names [P1-2]
**File:** Update `/src/app/api/checkout/route.ts` lines 54-68

```typescript
// Create Stripe checkout session
const checkoutSession = await stripe.checkout.sessions.create({
  mode: "payment",
  customer_email: session.user.email || undefined,
  line_items: items.map((item: any) => {
    const product = products.find((p) => p.id === item.productId)!;
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,  // Use actual product name
          description: product.description.slice(0, 100),
          images: product.images.slice(0, 1), // Include product image
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: item.quantity,
    };
  }),
  // ... rest of config
});
```

---

## PHASE 3: MEDIUM PRIORITY (WEEK 4-6)

### Feature: Centralized API Client
**File:** Create `/src/lib/api-client.ts`

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface RequestOptions {
  timeout?: number;
  retries?: number;
}

export const apiClient = {
  async request<T>(
    url: string,
    options: RequestInit & RequestOptions = {}
  ): Promise<T> {
    const { timeout = 30000, retries = 3, ...fetchOptions } = options;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        lastError = error as Error;
        if (attempt < retries) {
          // Exponential backoff
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }

    throw lastError || new Error("Request failed");
  },

  get<T>(url: string, options?: RequestOptions) {
    return this.request<T>(url, { method: "GET", ...options });
  },

  post<T>(url: string, data?: any, options?: RequestOptions) {
    return this.request<T>(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      ...options,
    });
  },

  put<T>(url: string, data?: any, options?: RequestOptions) {
    return this.request<T>(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      ...options,
    });
  },

  delete<T>(url: string, options?: RequestOptions) {
    return this.request<T>(url, { method: "DELETE", ...options });
  },
};
```

---

### Feature: Email Integration (SendGrid)
**File:** Create `/src/lib/email.ts`

```typescript
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

export async function sendOrderConfirmation(
  to: string,
  orderId: string,
  total: number
) {
  try {
    await sgMail.send({
      to,
      from: "noreply@eviesepoxy.com",
      subject: `Order Confirmation #${orderId}`,
      html: `
        <h1>Thank you for your order!</h1>
        <p>Order ID: ${orderId}</p>
        <p>Total: $${total.toFixed(2)}</p>
        <p>We'll send you tracking information once your order ships.</p>
      `,
    });
  } catch (error) {
    console.error("Email send failed:", error);
  }
}
```

---

### Feature: Order Tracking Endpoints
**File:** Create `/src/app/api/orders/route.ts`

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
```

---

## TESTING CHECKLIST

### Phase 1 Tests
- [ ] Webhook handler receives Stripe events
- [ ] Order status updates from PENDING to PROCESSING
- [ ] Admin pages redirect unauthorized users
- [ ] Inventory decrements on successful checkout
- [ ] Stock validation prevents overselling

### Phase 2 Tests
- [ ] Products load from API in grid view
- [ ] Featured products section uses real data
- [ ] Product details page shows correct product
- [ ] Stripe line items show product names
- [ ] Price validation works

### Phase 3 Tests
- [ ] Centralized API client retries failed requests
- [ ] Email confirmations send successfully
- [ ] Order history page works for users
- [ ] Admin can view all orders

---

## DEPLOYMENT NOTES

1. **Environment Variables** - Update before deploying:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   SENDGRID_API_KEY=SG...
   ```

2. **Stripe Webhook Setup**:
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `checkout.session.completed`

3. **Database Migration**:
   - Run `npx prisma db push` before deploying
   - Ensure `stock` column exists on products table

4. **Testing**:
   - Use Stripe test mode before going live
   - Test with test card: `4242 4242 4242 4242`

---

**Estimated Timeline:**
- Phase 1: 2-3 days
- Phase 2: 3-4 days
- Phase 3: 5-7 days
- **Total: 2-3 weeks to full production readiness**

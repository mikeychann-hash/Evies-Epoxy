import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/products/ProductDetails";
import { RelatedProducts } from "@/components/products/RelatedProducts";

// Mock data - will be replaced with actual API call
const mockProduct = {
  id: "1",
  name: "Ocean Wave Coaster Set",
  slug: "ocean-wave-coaster-set",
  description:
    "Beautiful handcrafted epoxy coasters featuring stunning ocean wave designs. Each set includes 4 coasters with unique wave patterns. Perfect for protecting your furniture while adding a touch of coastal elegance to your home.\n\nKey Features:\n- Set of 4 unique coasters\n- High-quality epoxy resin\n- Heat resistant up to 200°F\n- Non-slip cork backing\n- Easy to clean\n- Handmade with care",
  price: 45.99,
  compareAtPrice: 59.99,
  images: [
    "https://images.unsplash.com/photo-1617360547964-1078bb789e2d?w=800",
    "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800",
    "https://images.unsplash.com/photo-1595665593673-bf1ad72905c0?w=800",
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800",
  ],
  categoryId: "1",
  category: {
    id: "1",
    name: "Art & Decor",
    slug: "art",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  stock: 15,
  isActive: true,
  isFeatured: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export async function generateMetadata({ params }: { params: { slug: string } }) {
  // In real app, fetch product data here
  return {
    title: `${mockProduct.name} - Evie's Epoxy`,
    description: mockProduct.description.slice(0, 160),
    openGraph: {
      images: [mockProduct.images[0]],
    },
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  // In real app, fetch product by slug
  if (!mockProduct) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container-custom py-12">
        <ProductDetails product={mockProduct as any} />
        <div className="mt-20">
          <RelatedProducts currentProductId={mockProduct.id} />
        </div>
      </div>
    </div>
  );
}

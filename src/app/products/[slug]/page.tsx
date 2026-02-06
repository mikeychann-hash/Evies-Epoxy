import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetails } from "@/components/products/ProductDetails";
import { RelatedProducts } from "@/components/products/RelatedProducts";
import { Product } from "@/types";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
  });

  if (!product) {
    return {
      title: "Product Not Found - Evie's Epoxy",
    };
  }

  return {
    title: `${product.name} - Evie's Epoxy`,
    description: product.description.slice(0, 160),
    openGraph: {
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: { category: true },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container-custom py-12">
        <ProductDetails product={product as Product} />
        <div className="mt-20">
          <RelatedProducts currentProductId={product.id} />
        </div>
      </div>
    </div>
  );
}

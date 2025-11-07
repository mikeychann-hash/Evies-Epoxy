import { Hero } from "@/components/home/Hero";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Categories } from "@/components/home/Categories";
import { Newsletter } from "@/components/home/Newsletter";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Categories />
      <FeaturedProducts />
      <Newsletter />
    </div>
  );
}

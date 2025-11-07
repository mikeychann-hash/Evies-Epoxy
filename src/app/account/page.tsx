"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { User, Package, Heart, Settings } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const menuItems = [
    {
      title: "Profile",
      description: "Manage your account information",
      icon: User,
      href: "/account/profile",
    },
    {
      title: "Orders",
      description: "View your order history",
      icon: Package,
      href: "/account/orders",
    },
    {
      title: "Wishlist",
      description: "Your saved items",
      icon: Heart,
      href: "/account/wishlist",
    },
    {
      title: "Settings",
      description: "Account preferences",
      icon: Settings,
      href: "/account/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2">My Account</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Welcome back, {session.user.name || session.user.email}!
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.a
                  key={item.title}
                  href={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card hover className="p-6 group cursor-pointer h-full">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

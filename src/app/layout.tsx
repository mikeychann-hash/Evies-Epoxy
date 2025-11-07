import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Evie's Epoxy - Premium Epoxy Products",
  description: "Discover our collection of high-quality epoxy resin products, custom creations, and DIY supplies.",
  keywords: ["epoxy", "resin", "crafts", "DIY", "custom products"],
  authors: [{ name: "Evie's Epoxy" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://evies-epoxy.com",
    siteName: "Evie's Epoxy",
    title: "Evie's Epoxy - Premium Epoxy Products",
    description: "Discover our collection of high-quality epoxy resin products, custom creations, and DIY supplies.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Evie's Epoxy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Evie's Epoxy - Premium Epoxy Products",
    description: "Discover our collection of high-quality epoxy resin products, custom creations, and DIY supplies.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

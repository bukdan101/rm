import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://automarket.co.id'),
  title: "AutoMarket - Marketplace Mobil Terpercaya | Inspeksi 160 Titik",
  description: "Marketplace jual beli mobil terpercaya dengan sistem inspeksi 160 titik. Temukan mobil bekas berkualitas dengan jaminan kualitas terbaik.",
  keywords: ["jual mobil", "beli mobil", "mobil bekas", "marketplace mobil", "inspeksi mobil", "mobil second", "mobil murah", "Toyota", "Honda", "BMW"],
  authors: [{ name: "AutoMarket Team" }],
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "AutoMarket - Marketplace Mobil Terpercaya",
    description: "Jual beli mobil dengan sistem inspeksi 160 titik",
    type: "website",
    images: ["/logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoMarket - Marketplace Mobil Terpercaya",
    description: "Jual beli mobil dengan sistem inspeksi 160 titik",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

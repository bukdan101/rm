import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ApolloProviderWrapper } from "@/lib/apollo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoMarket - Marketplace Mobil Terpercaya",
  description: "Platform jual beli mobil terpercaya di Indonesia. Temukan mobil impian Anda dengan harga terbaik.",
  keywords: ["AutoMarket", "mobil", "jual beli mobil", "marketplace mobil", "otomotif Indonesia"],
  authors: [{ name: "AutoMarket Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "AutoMarket - Marketplace Mobil Terpercaya",
    description: "Platform jual beli mobil terpercaya di Indonesia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoMarket - Marketplace Mobil Terpercaya",
    description: "Platform jual beli mobil terpercaya di Indonesia",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ApolloProviderWrapper>
          {children}
        </ApolloProviderWrapper>
        <Toaster />
      </body>
    </html>
  );
}

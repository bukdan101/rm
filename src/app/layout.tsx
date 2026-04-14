import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ApolloProviderWrapper } from "@/lib/apollo/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoMarket — Platform Jual Beli Mobil Terpercaya di Indonesia",
  description: "AutoMarket adalah platform jual beli mobil terpercaya dengan inspeksi menyeluruh, harga transparan, dan pilihan mobil terlengkap di Indonesia.",
  keywords: ["AutoMarket", "jual mobil", "beli mobil", "mobil bekas", "mobil baru", "Indonesia"],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
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
        <ApolloProviderWrapper>
          {children}
          <Toaster />
        </ApolloProviderWrapper>
      </body>
    </html>
  );
}

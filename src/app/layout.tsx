import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import BackToTop from "@/components/BackToTop";
import Toaster from "@/components/Toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e3a5f",
};

export const metadata: Metadata = {
  title: "Usha Electricals Engineering Works | Electrical & Automation Solutions",
  description:
    "Govt. contractor for electrical and automation services in Nagpur. UPS, Solar, Inverters, Panels, Stabilizers and lighting solutions for industrial, commercial and domestic clients since 2016.",
  keywords: [
    "Usha Electricals", "Nagpur electrical contractor", "UPS supplier Nagpur",
    "Solar systems Nagpur", "APFC panel", "MSEDCL approved", "Khaparkheda",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-white text-slate-900 antialiased font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
        <BackToTop />
        <Toaster />
      </body>
    </html>
  );
}

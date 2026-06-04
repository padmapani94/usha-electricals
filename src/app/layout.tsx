import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import BackToTop from "@/components/BackToTop";
import Toaster from "@/components/Toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const SITE_URL = "https://ushaelectricals.co.in";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e3a5f",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Usha Electricals Engineering Works | Electrical Contractor in Nagpur",
    template: "%s | Usha Electricals",
  },
  description:
    "Government-licensed electrical contractor in Nagpur since 2016. Metering cubicles, CT/PT repair, APFC panels, testing equipment, power tools and hand tools — for industries, MSEDCL projects and commercial sites.",
  keywords: [
    "Usha Electricals", "Nagpur electrical contractor", "Khaparkheda electrician",
    "CT PT repair Nagpur", "APFC panel Nagpur", "Metering cubicle MSEDCL",
    "Testing equipment supplier Nagpur", "Power tools Nagpur",
    "Electrical licensing MSEDCL",
  ],
  authors: [{ name: "Usha Electricals Engineering Works" }],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Usha Electricals",
    title: "Usha Electricals Engineering Works | Electrical Contractor in Nagpur",
    description:
      "Government-licensed electrical contractor in Nagpur since 2016. CT/PT, APFC, testing equipment, power tools.",
    images: [{ url: `${SITE_URL}/logo/logo-horizontal-1500.png`, width: 1500, height: 384, alt: "Usha Electricals" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Usha Electricals Engineering Works",
    description: "Electrical contractor & supplier in Nagpur. Industrial · Commercial · Domestic.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

// JSON-LD structured data for Google's Knowledge Graph
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE_URL}#organization`,
  name: "Usha Electricals Engineering Works",
  alternateName: "Usha Electricals",
  url: SITE_URL,
  logo: `${SITE_URL}/logo/logo-mark-512.png`,
  image: `${SITE_URL}/logo/logo-horizontal-1500.png`,
  description:
    "Government-licensed electrical contractor and supplier in Nagpur. Established 2016. M.L. No. 34090.",
  foundingDate: "2016",
  telephone: "+91-9356913565",
  email: "ushaelectrical99@gmail.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Main Road Khaparkheda-Dahegaon, Jay Bhole Nagar",
    addressLocality: "Khaparkheda",
    addressRegion: "Maharashtra",
    postalCode: "441102",
    addressCountry: "IN",
  },
  areaServed: { "@type": "State", name: "Maharashtra" },
  taxID: "27BRGPD5535F1ZY",
  identifier: [
    { "@type": "PropertyValue", name: "MSEDCL Electrical License", value: "M.L. No. 34090" },
    { "@type": "PropertyValue", name: "GSTIN", value: "27BRGPD5535F1ZY" },
  ],
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-9356913565",
    contactType: "Sales & Service",
    areaServed: "IN",
    availableLanguage: ["English", "Hindi", "Marathi"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
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

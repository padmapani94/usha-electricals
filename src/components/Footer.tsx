import Link from "next/link";
import { MapPin, Phone, Mail, Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 py-10 md:py-12 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-white rounded-md p-1.5"><Zap className="text-brand-orange" size={18} /></div>
            <span className="font-bold">Usha Electricals</span>
          </div>
          <p className="text-sm text-navy-100">
            Govt. Contractor for Electrical Services — Industrial, Commercial &amp; Domestic. Founded 2016.
          </p>
          <p className="text-xs text-navy-200 mt-3">M.L.No. 34090 · GSTIN 27BRGPD5535F1ZY</p>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm text-navy-100">
            <li><Link href="/products" className="hover:text-brand-orange">All Products</Link></li>
            <li><Link href="/about" className="hover:text-brand-orange">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-brand-orange">Contact</Link></li>
            <li><Link href="/account/orders" className="hover:text-brand-orange">Track Order</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Categories</h4>
          <ul className="space-y-2 text-sm text-navy-100">
            <li><Link href="/products?category=ups-systems" className="hover:text-brand-orange">UPS Systems</Link></li>
            <li><Link href="/products?category=solar-systems" className="hover:text-brand-orange">Solar Systems</Link></li>
            <li><Link href="/products?category=electrical-panels" className="hover:text-brand-orange">Electrical Panels</Link></li>
            <li><Link href="/products?category=stabilizers-transformers" className="hover:text-brand-orange">Stabilizers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Reach Us</h4>
          <ul className="space-y-2 text-sm text-navy-100">
            <li className="flex gap-2"><MapPin size={16} className="shrink-0 mt-0.5 text-brand-orange" /> Main Road Khaparkheda-Dahegaon, Jay Bhole Nagar, Khaparkheda, Nagpur</li>
            <li className="flex gap-2"><Phone size={16} className="shrink-0 mt-0.5 text-brand-orange" /> 93569 13565</li>
            <li className="flex gap-2"><Mail size={16} className="shrink-0 mt-0.5 text-brand-orange" /> ushaelectrical99@gmail.com</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between text-xs text-navy-200">
          <span>© {new Date().getFullYear()} Usha Electricals Engineering Works. All rights reserved.</span>
          <span>Industrial · Commercial · Domestic</span>
        </div>
      </div>
    </footer>
  );
}

import type { CartItem, ShippingAddress } from "./types";

export const ENQUIRY_PHONE = "919356913565"; // WhatsApp E.164 (India + 9356913565)
export const ENQUIRY_EMAIL = "ushaelectrical99@gmail.com";

export function buildEnquiryMessage(items: CartItem[], total: number, addr?: Partial<ShippingAddress> | null) {
  const lines: string[] = [];
  lines.push("Hello Usha Electricals,");
  lines.push("");
  lines.push("I would like to enquire about the following products:");
  lines.push("");
  items.forEach((i, idx) => {
    lines.push(`${idx + 1}. ${i.name}`);
    lines.push(`   Qty: ${i.quantity}  ·  ₹${i.price.toLocaleString("en-IN")} each  ·  Subtotal ₹${(i.price * i.quantity).toLocaleString("en-IN")}`);
  });
  lines.push("");
  lines.push(`Estimated Total: ₹${total.toLocaleString("en-IN")}`);
  if (addr && (addr.fullName || addr.phone || addr.email || addr.line1)) {
    lines.push("");
    lines.push("My details:");
    if (addr.fullName) lines.push(`Name: ${addr.fullName}`);
    if (addr.phone) lines.push(`Phone: ${addr.phone}`);
    if (addr.email) lines.push(`Email: ${addr.email}`);
    const addrParts = [addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean);
    if (addrParts.length) lines.push(`Delivery address: ${addrParts.join(", ")}`);
    if (addr.notes) lines.push(`Notes: ${addr.notes}`);
  }
  lines.push("");
  lines.push("Please share availability, final pricing and any installation/AMC options.");
  lines.push("");
  lines.push("Thank you!");
  return lines.join("\n");
}

export function whatsappLink(message: string) {
  return `https://wa.me/${ENQUIRY_PHONE}?text=${encodeURIComponent(message)}`;
}

export function mailtoLink(message: string, subject = "Product Enquiry from website") {
  return `mailto:${ENQUIRY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
}

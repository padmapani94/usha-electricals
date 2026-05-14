import { MessageCircle } from "lucide-react";

const PHONE = "919356913565"; // India country code + number
const MESSAGE = "Hello Usha Electricals, I have an enquiry.";

export default function WhatsAppButton() {
  const href = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 group"
    >
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-navy text-white text-xs font-semibold whitespace-nowrap px-3 py-1.5 rounded shadow opacity-0 group-hover:opacity-100 transition pointer-events-none">
        Chat with us
      </span>
      <span className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#1ebe5b] hover:scale-105 transition relative">
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" aria-hidden />
        <svg viewBox="0 0 32 32" className="w-7 h-7" fill="currentColor" aria-hidden>
          <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.745.315-.688.645-1.032 1.318-1.06 2.247v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.477-1.318.13-.33.158-.746.158-1.05 0-.114 0-.114-.014-.158-.05-.222-1.418-.96-1.605-1.06l.0.0zm-2.92 7.93c-1.69 0-3.337-.46-4.794-1.318l-3.467 1.117 1.103-3.337A8.954 8.954 0 0 1 7.247 16.1c0-4.945 4.04-8.985 8.985-8.985s8.985 4.04 8.985 8.985c-.014 4.945-4.06 8.985-9.014 8.985l-.014.05zm0-19.66c-5.92 0-10.732 4.81-10.732 10.732 0 1.876.487 3.71 1.418 5.328L5 27.06l5.6-1.804a10.79 10.79 0 0 0 5.083 1.304h.014c5.92 0 10.732-4.81 10.732-10.732C26.42 10.288 22.124 5.475 16.176 5.475z" />
        </svg>
      </span>
    </a>
  );
}

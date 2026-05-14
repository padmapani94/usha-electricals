"use client";
import { CheckCircle2, Info, XCircle, X } from "lucide-react";
import { useToasts } from "@/store/toasts";

export default function Toaster() {
  const toasts = useToasts((s) => s.toasts);
  const remove = useToasts((s) => s.remove);

  return (
    <div className="fixed bottom-5 left-5 z-[60] flex flex-col gap-2 max-w-xs pointer-events-none">
      {toasts.map((t) => {
        const palette =
          t.kind === "error"
            ? "bg-red-50 border-red-200 text-red-800"
            : t.kind === "info"
            ? "bg-blue-50 border-blue-200 text-blue-800"
            : "bg-green-50 border-green-200 text-green-800";
        const Icon = t.kind === "error" ? XCircle : t.kind === "info" ? Info : CheckCircle2;
        return (
          <div
            key={t.id}
            className={`pointer-events-auto card flex items-start gap-2 px-3 py-2.5 text-sm border ${palette} animate-fade-up shadow-lg`}
          >
            <Icon size={18} className="shrink-0 mt-0.5" />
            <div className="flex-1">{t.message}</div>
            <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100"><X size={14} /></button>
          </div>
        );
      })}
    </div>
  );
}

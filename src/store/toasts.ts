"use client";
import { create } from "zustand";

export type Toast = {
  id: number;
  message: string;
  kind?: "success" | "info" | "error";
};

type ToastState = {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  remove: (id: number) => void;
};

export const useToasts = create<ToastState>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = Date.now() + Math.random();
    set({ toasts: [...get().toasts, { id, kind: "success", ...t }] });
    setTimeout(() => get().remove(id), 3000);
  },
  remove: (id) => set({ toasts: get().toasts.filter((x) => x.id !== id) }),
}));

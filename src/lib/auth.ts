"use client";
import { account } from "./appwrite";

export async function login(email: string, password: string) {
  // If a session already exists (e.g. switching accounts), tear it down first
  try { await account.deleteSession("current"); } catch {}
  await account.createEmailPasswordSession(email, password);
  return await account.get();
}

export async function logout() {
  try {
    await account.deleteSession("current");
  } catch {}
}

export async function getCurrentUser() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}

function emailListIncludes(envVar: string | undefined, email?: string) {
  if (!email) return false;
  const list = (envVar ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return list.includes(email.toLowerCase());
}

export function isAdmin(user: { email?: string } | null) {
  return emailListIncludes(process.env.NEXT_PUBLIC_ADMIN_EMAILS, user?.email);
}

export function isEditor(user: { email?: string } | null) {
  return emailListIncludes(process.env.NEXT_PUBLIC_EDITOR_EMAILS, user?.email);
}

export function canEdit(user: { email?: string } | null) {
  return isAdmin(user) || isEditor(user);
}

export type Role = "admin" | "editor" | "none";
export function roleOf(user: { email?: string } | null): Role {
  if (isAdmin(user)) return "admin";
  if (isEditor(user)) return "editor";
  return "none";
}

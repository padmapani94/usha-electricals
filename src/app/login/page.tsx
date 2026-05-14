"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/lib/auth";

function LoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try { await login(email, password); router.replace(next); }
    catch (e: any) { setErr(e?.message ?? "Login failed"); setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="card p-7">
      <h1 className="text-2xl font-bold text-navy">Welcome back</h1>
      <p className="text-sm text-slate-500 mb-6">Sign in to manage orders &amp; AMC.</p>
      <label className="label">Email</label>
      <input className="input mb-3" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <label className="label">Password</label>
      <input className="input mb-4" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      {err && <div className="text-red-600 text-sm mb-3">{err}</div>}
      <button className="btn-primary w-full" disabled={busy}>{busy ? "Signing in…" : "Sign In"}</button>
      <p className="text-sm text-slate-500 mt-4 text-center">
        New here? <Link href="/register" className="text-brand-orange font-semibold hover:underline">Create an account</Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Suspense fallback={null}><LoginInner /></Suspense>
    </div>
  );
}

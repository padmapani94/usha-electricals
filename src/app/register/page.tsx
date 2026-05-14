"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try { await register(email, password, name); router.replace("/account"); }
    catch (e: any) { setErr(e?.message ?? "Could not register"); setBusy(false); }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <form onSubmit={submit} className="card p-7">
        <h1 className="text-2xl font-bold text-navy">Create your account</h1>
        <p className="text-sm text-slate-500 mb-6">It only takes a minute.</p>
        <label className="label">Full name</label>
        <input className="input mb-3" required value={name} onChange={(e) => setName(e.target.value)} />
        <label className="label">Email</label>
        <input className="input mb-3" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="label">Password (min 8 characters)</label>
        <input className="input mb-4" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <div className="text-red-600 text-sm mb-3">{err}</div>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? "Creating…" : "Create Account"}</button>
        <p className="text-sm text-slate-500 mt-4 text-center">
          Already a member? <Link href="/login" className="text-brand-orange font-semibold hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

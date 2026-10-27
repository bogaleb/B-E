"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <form className="grid gap-4" onSubmit={async (e) => {
      e.preventDefault(); setBusy(true); setError(null);
      const { error } = await createBrowserSupabase().auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) { setError("That email and password don't match an admin account."); return; }
      router.replace("/admin"); router.refresh();
    }}>
      <div className="grid gap-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="grid gap-1.5"><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      {error && <p role="alert" className="rounded-lg bg-red/10 px-3 py-2 text-sm text-red">{error}</p>}
      <Button type="submit" size="lg" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
    </form>
  );
}

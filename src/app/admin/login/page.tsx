import Image from "next/image";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const configured = isSupabaseConfigured();
  if (configured && (await getAdmin())) redirect("/admin");
  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-8 shadow-[0_30px_60px_-40px_rgba(16,63,45,.5)]">
        <Image src="/images/logo-color.webp" alt="ETHIO" width={120} height={53} className="mb-6" />
        <h1 className="mb-1 font-display text-2xl text-deep">Admin sign in</h1>
        <p className="mb-6 text-sm text-muted">For the ETHIO Foods team only.</p>
        {configured ? <LoginForm /> : (
          <div className="rounded-lg bg-gold/15 p-4 text-sm text-[#5E4A14]">
            The dashboard needs a Supabase project. Add <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> to your environment, then follow the README to create the first admin.
          </div>
        )}
      </div>
    </div>
  );
}

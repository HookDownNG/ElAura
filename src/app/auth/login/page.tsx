"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email.trim() || !password) {
      setError("Please fill in your email and password.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile?.role === "brand") {
        router.push("/dashboard");
      } else {
        router.push("/creator/dashboard");
      }
    }
  }

  return (
    <div className="min-h-screen bg-surface-50/70 flex flex-col items-center justify-center px-4 py-8 sm:py-12 select-none overflow-y-auto">
      <div className="w-full max-w-md space-y-5 my-auto">
        {/* App Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1.5 shadow-2xs border border-surface-200">
              <Image
                src="/icon.png"
                alt="ElAura Logo"
                width={40}
                height={40}
                className="h-7 w-7 rounded-lg object-contain"
                priority
              />
            </div>
            <span className="text-xl font-black tracking-tight text-surface-900">
              ElAura
            </span>
          </Link>
        </div>

        {/* Main Log In Card */}
        <div className="rounded-3xl border border-surface-200 bg-white p-6 sm:p-8 shadow-xl shadow-surface-200/40 space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <LogIn className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-surface-900">
              Welcome Back
            </h1>
            <p className="text-xs text-surface-500">
              Log in to your Creator Studio or Brand Dashboard
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 font-medium border border-red-200">
              {error}
            </div>
          )}

          {/* Google Sign-In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-surface-950 hover:bg-black active:scale-[0.98] text-white rounded-full px-6 py-3.5 text-sm font-bold transition-all disabled:opacity-60 shadow-lg shadow-surface-950/20 min-h-12 border border-surface-800"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200" />
            </div>
            <span className="relative bg-white px-3 text-[11px] font-bold text-surface-400 uppercase tracking-wider">
              Or Log In with Email
            </span>
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-700 block">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full rounded-xl border border-surface-200 bg-white px-3.5 py-2.5 text-xs font-medium outline-none focus:border-brand-400 transition-colors min-h-11"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-700 block">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-surface-200 bg-white px-3.5 py-2.5 text-xs font-medium outline-none focus:border-brand-400 transition-colors min-h-11"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-full py-3 text-xs transition-all shadow-md shadow-brand-100/50 min-h-11"
            >
              {loading ? "Signing in..." : "Log In"}
            </button>
          </form>

          {/* Sign Up Redirect Footer */}
          <div className="text-center pt-2 border-t border-surface-100">
            <p className="text-xs text-surface-500">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="font-bold text-brand-600 hover:text-brand-700">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

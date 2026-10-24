"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import ThemeToggle from "@/components/ThemeToggle";
import { Store, ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (res.error) {
        setErrorMsg(res.error.message || "Invalid credentials. Please verify and try again.");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to sign in. Please verify your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoOwner = () => {
    setEmail("owner@retailpos.com");
    setPassword("Owner@123456");
    setErrorMsg("");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 selection:bg-brand-500 selection:text-white transition-colors duration-200">
      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-brand-600/15 dark:bg-brand-600/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 right-10 h-[400px] w-[400px] rounded-full bg-emerald-600/10 dark:bg-emerald-600/15 blur-[140px]" />

      <div className="relative w-full max-w-md">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-400 p-0.5 shadow-xl shadow-brand-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white dark:bg-slate-950/80 backdrop-blur-sm">
              <Store className="h-8 w-8 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Retail<span className="text-brand-600 dark:text-brand-400">POS</span>
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Intelligent Point of Sale & Inventory Platform
          </p>
        </div>

        {/* Login Glass Card */}
        <div className="glass-panel relative rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
          {errorMsg && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-600 dark:text-rose-300">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-500 dark:text-rose-400" />
              <p className="text-xs font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700/70 bg-white dark:bg-slate-900/80 py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700/70 bg-white dark:bg-slate-900/80 py-3 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all hover:shadow-brand-500/40 hover:brightness-110 active:scale-[0.99] disabled:opacity-70"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Sign In to Terminal</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Button */}
          <div className="mt-6 border-t border-slate-200 dark:border-slate-800/80 pt-6">
            <button
              type="button"
              onClick={fillDemoOwner}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-slate-100/70 dark:bg-slate-900/40 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors hover:border-brand-500/50 hover:bg-slate-200/70 dark:hover:bg-slate-800/60 hover:text-brand-600 dark:hover:text-white"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Fill Initial Owner Credentials</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            <span>Multi-document Transaction Secure</span>
          </div>
          <span>•</span>
          <span>Currency: BDT (৳)</span>
        </div>
      </div>
    </div>
  );
}

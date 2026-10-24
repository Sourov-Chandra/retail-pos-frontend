"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Show manual fallback if taking more than 2.5 seconds
    const fallbackTimer = setTimeout(() => {
      if (isMounted) setShowFallback(true);
    }, 2500);

    async function checkAuth() {
      try {
        // Enforce a strict 2-second timeout so it never hangs
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Auth check timeout")), 2000)
        );

        const session = await Promise.race([
          authClient.getSession(),
          timeoutPromise,
        ]);

        if (!isMounted) return;

        if (session?.data?.user) {
          router.replace("/dashboard");
        } else {
          router.replace("/login");
        }
      } catch (err) {
        if (!isMounted) return;
        // On offline or timeout, immediately route to login
        router.replace("/login");
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      <div className="flex flex-col items-center gap-4 text-center px-4">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-500/20 border-t-brand-600 dark:border-t-brand-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Launching Retail POS...
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Preparing secure workspace
          </p>
        </div>

        {showFallback && (
          <div className="mt-2 animate-fadeIn">
            <Link
              href="/login"
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-brand-600 dark:text-brand-400 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Continue to Sign In →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

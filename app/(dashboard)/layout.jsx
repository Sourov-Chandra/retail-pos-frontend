"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  Boxes,
  LogOut,
  Store,
  User,
  Shield,
  Menu,
  X,
  CreditCard,
  Users,
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const [currentUser, setCurrentUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const NAV_ITEMS = [
    {
      name: t("nav.dashboard", "Dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: t("nav.pos", "POS Terminal"),
      href: "/pos",
      icon: ShoppingCart,
      badge: t("nav.register", "Register"),
    },
    {
      name: t("nav.products", "Products"),
      href: "/products",
      icon: Package,
    },
    {
      name: t("nav.sales", "Sales History"),
      href: "/sales",
      icon: Receipt,
    },
    {
      name: t("nav.inventory", "Inventory & Audit"),
      href: "/inventory",
      icon: Boxes,
    },
    {
      name: t("nav.staff", "Staff & Cashiers"),
      href: "/staff",
      icon: Users,
      ownerOnly: true,
    },
  ];

  useEffect(() => {
    let isMounted = true;

    async function fetchSession() {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Session check timeout")), 2500)
        );

        const session = await Promise.race([
          authClient.getSession(),
          timeoutPromise,
        ]);

        if (!isMounted) return;

        if (!session || !session.data) {
          window.location.replace("/login");
          return;
        }
        setCurrentUser(session.data.user);
      } catch {
        if (isMounted) window.location.replace("/login");
      } finally {
        if (isMounted) setIsLoadingAuth(false);
      }
    }
    fetchSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      window.location.replace("/login");
    } catch (err) {
      console.error("Sign out error:", err);
      window.location.replace("/login");
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {t("verifyingSession", "Verifying session...")}
          </p>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.role === "owner";

  // Current page title mapping
  const getPageTitle = () => {
    if (pathname.startsWith("/dashboard")) return t("nav.dashboard", "Dashboard");
    if (pathname.startsWith("/pos")) return t("nav.pos", "POS Terminal");
    if (pathname.startsWith("/products")) return t("nav.products", "Products");
    if (pathname.startsWith("/sales")) return t("nav.sales", "Sales History");
    if (pathname.startsWith("/inventory")) return t("nav.inventory", "Inventory & Audit");
    if (pathname.startsWith("/staff")) return t("nav.staff", "Staff & Cashiers");
    return t("appName", "Dokandari");
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800/80">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-md shadow-brand-500/20">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              {language === "bn" ? (
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-bengali">
                  দোকান<span className="text-brand-600 dark:text-brand-400">দারি</span>
                </span>
              ) : (
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  Dokan<span className="text-brand-600 dark:text-brand-400">dari</span>
                </span>
              )}
              <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {t("appSubtitle", "Bangladesh Edition (৳)")}
              </span>
            </div>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t("operations", "Operations")}
          </div>
          {NAV_ITEMS.filter((item) => !item.ownerOnly || isOwner).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-500/10 text-brand-600 border border-brand-500/30 shadow-sm dark:bg-brand-500/15 dark:text-brand-300 dark:border-brand-500/30 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      isActive
                        ? "text-brand-600 dark:text-brand-400"
                        : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="rounded-md bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold text-brand-600 border border-brand-500/20 dark:bg-brand-500/20 dark:text-brand-300 dark:border-brand-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Card & Actions */}
        <div className="border-t border-slate-200 dark:border-slate-800/80 p-4 space-y-3">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <User className="h-5 w-5" />
                </div>
                <div className="truncate">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {currentUser?.name || t("shopUser", "Shop User")}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {currentUser?.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800/80 pt-2.5">
              <div className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
                {isOwner ? (
                  <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                    <Shield className="h-3 w-3" />
                    <span>{t("owner", "Owner")}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <span>{t("cashier", "Cashier")}</span>
                  </span>
                )}
              </div>

              <button
                onClick={handleSignOut}
                title={t("logout", "Sign Out")}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{t("logout", "Logout")}</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar for mobile header & quick shortcuts */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 px-4 sm:px-6 backdrop-blur-md lg:h-20 transition-colors duration-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white capitalize lg:text-xl">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          {/* Quick Action Pill, Language Switcher & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageToggle />
            <ThemeToggle />

            <Link
              href="/pos"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:brightness-110 active:scale-95"
            >
              <CreditCard className="h-4 w-4" />
              <span>{t("openPos", "Open POS Register")}</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Page Outlet */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}

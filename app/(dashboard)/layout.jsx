"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
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
  PlusCircle,
} from "lucide-react";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "POS Terminal",
    href: "/pos",
    icon: ShoppingCart,
    badge: "Register",
  },
  {
    name: "Products",
    href: "/products",
    icon: Package,
  },
  {
    name: "Sales History",
    href: "/sales",
    icon: Receipt,
  },
  {
    name: "Inventory & Audit",
    href: "/inventory",
    icon: Boxes,
  },
];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const session = await authClient.getSession();
        if (!session || !session.data) {
          router.replace("/login");
          return;
        }
        setCurrentUser(session.data.user);
      } catch {
        router.replace("/login");
      } finally {
        setIsLoadingAuth(false);
      }
    }
    fetchSession();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.replace("/login");
    } catch (err) {
      console.error("Sign out error:", err);
      router.replace("/login");
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className="text-sm font-medium text-slate-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.role === "owner";

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-slate-800/80">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-md shadow-brand-500/20">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">
                Retail<span className="text-brand-400">POS</span>
              </span>
              <span className="block text-[11px] font-medium text-slate-400">
                Bangladesh Edition (৳)
              </span>
            </div>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Operations
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-sm"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      isActive ? "text-brand-400" : "text-slate-400 group-hover:text-slate-300"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="rounded-md bg-brand-500/20 px-2 py-0.5 text-[10px] font-semibold text-brand-300 border border-brand-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Card & Actions */}
        <div className="border-t border-slate-800/80 p-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
                  <User className="h-5 w-5" />
                </div>
                <div className="truncate">
                  <p className="truncate text-sm font-semibold text-white">
                    {currentUser?.name || "Shop User"}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {currentUser?.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5">
              <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
                {isOwner ? (
                  <span className="flex items-center gap-1 text-indigo-400">
                    <Shield className="h-3 w-3" />
                    <span>Owner</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span>Cashier</span>
                  </span>
                )}
              </div>

              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar for mobile header & quick shortcuts */}
        <header className="flex h-16 items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-6 backdrop-blur-md lg:h-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-white capitalize lg:text-xl">
                {pathname.replace("/", "").replace("-", " ") || "Dashboard"}
              </h2>
            </div>
          </div>

          {/* Quick Action Pill */}
          <div className="flex items-center gap-3">
            <Link
              href="/pos"
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/20 transition-all hover:brightness-110 active:scale-95"
            >
              <CreditCard className="h-4 w-4" />
              <span>Open POS Register</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Page Outlet */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

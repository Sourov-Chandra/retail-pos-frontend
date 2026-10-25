"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { formatBDT } from "@/lib/money";
import { useLanguage } from "@/context/LanguageContext";
import {
  TrendingUp,
  CreditCard,
  Package,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { t, isBengali, toBengaliDigits } = useLanguage();

  const fetchSummary = async () => {
    try {
      setError(null);
      const res = await apiClient("/api/dashboard/summary");
      if (res.success) {
        setData(res.summary);
      }
    } catch (err) {
      setError(err.message || "Failed to load dashboard metrics.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSummary();
  };

  const num = (n) => (isBengali ? toBengaliDigits(n) : n);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-28 w-full animate-pulse rounded-3xl bg-slate-200/60 dark:bg-slate-900/60" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-3xl bg-slate-200/60 dark:bg-slate-900/60" />
          ))}
        </div>
      </div>
    );
  }

  const { today, inventory, bestSellingProducts = [], recentSales = [] } = data || {};

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel relative overflow-hidden rounded-3xl p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {t("dashboard.liveRegister", "Register Open • Live System")}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              {t("dashboard.title", "Retail Intelligence Hub")}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("dashboard.overviewFor", "Overview for today")} ({today?.date}) • {t("dashboard.timezone", "Business Timezone")}:{" "}
              <span className="text-slate-700 dark:text-slate-300 font-medium">{today?.timezone}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/60 px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white shadow-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-brand-500" : ""}`} />
              <span>{t("dashboard.refresh", "Refresh Stats")}</span>
            </button>
            <Link
              href="/pos"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand-500/25 transition-all hover:brightness-110 active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>{t("dashboard.startCheckout", "Start New Checkout")}</span>
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-600 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Revenue */}
        <div className="glass-card group relative overflow-hidden rounded-3xl p-6 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("dashboard.todayRevenue", "Today's Revenue")}
            </span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl font-mono">
              {formatBDT(today?.totalRevenue || 0)}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{t("dashboard.netRevenue", "Net recognized revenue")}</span>
          </div>
        </div>

        {/* Today's Sales Count */}
        <div className="glass-card group relative overflow-hidden rounded-3xl p-6 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("dashboard.salesCompleted", "Sales Completed")}
            </span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/30 group-hover:scale-110 transition-transform">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl font-mono">
              {num(today?.salesCount || 0)}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span>{t("dashboard.allCounters", "Across all counters today")}</span>
          </div>
        </div>

        {/* Active Products */}
        <div className="glass-card group relative overflow-hidden rounded-3xl p-6 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("dashboard.activeCatalog", "Active Catalog")}
            </span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 group-hover:scale-110 transition-transform">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl font-mono">
              {num(inventory?.activeProductsCount || 0)}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span>{t("dashboard.availableInPos", "Available for sale in POS")}</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-card group relative overflow-hidden rounded-3xl p-6 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t("dashboard.stockWarnings", "Stock Warnings")}
            </span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 group-hover:scale-110 transition-transform">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl font-mono">
              {num(inventory?.lowStockCount || 0)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{t("dashboard.itemsBelowThreshold", "items below threshold")}</span>
          </div>
          <div className="mt-3">
            <Link
              href="/inventory"
              className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline"
            >
              <span>{t("dashboard.reviewInventory", "Review inventory")}</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Two-Column Matrix: Top Sellers & Recent Transactions */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Top Selling Products */}
        <div className="glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-400">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{t("dashboard.bestSelling", "Best Selling Items")}</h2>
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("dashboard.allTimeVolume", "All-time volume")}</span>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/60">
            {bestSellingProducts.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                {t("dashboard.noTransactions", "No transaction data recorded yet.")}
              </div>
            ) : (
              bestSellingProducts.map((item, index) => (
                <div key={item._id || index} className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800">
                      #{num(index + 1)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.productName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{item.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatBDT(item.totalRevenue)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {num(item.quantitySold)} {t("dashboard.unitsSold", "units sold")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                <Clock className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{t("dashboard.recentTransactions", "Recent Transactions")}</h2>
            </div>
            <Link
              href="/sales"
              className="text-xs font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
            >
              {t("dashboard.viewFullHistory", "View Full History →")}
            </Link>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/60">
            {recentSales.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                {t("dashboard.noRecentSales", "No recent sales recorded.")}
              </div>
            ) : (
              recentSales.map((sale) => (
                <div key={sale._id} className="flex items-center justify-between py-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                        {sale.saleNumber}
                      </span>
                      <span className="rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 text-[10px] font-semibold uppercase">
                        {sale.paymentMethod}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {sale.cashierName} • {num(sale.itemsCount)} {t("dashboard.items", "items")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatBDT(sale.totalAmount)}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {new Date(sale.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import {
  Boxes,
  Plus,
  Minus,
  AlertCircle,
  X,
  History,
  ArrowUp,
  ArrowDown,
  CheckCircle,
} from "lucide-react";

export default function InventoryAuditPage() {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 30, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Stock Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [adjustType, setAdjustType] = useState("increase"); // "increase" | "decrease"
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [modalError, setModalError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async (page = 1) => {
    setIsLoading(true);
    try {
      const [movementsRes, productsRes] = await Promise.all([
        apiClient(`/api/inventory/movements?page=${page}&limit=30`),
        apiClient(`/api/products?limit=100`),
      ]);

      if (movementsRes.success) {
        setMovements(movementsRes.movements || []);
        setPagination(movementsRes.pagination);
      }
      if (productsRes.success) {
        setProducts(productsRes.products || []);
      }
    } catch (err) {
      console.error("Failed to load inventory data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!selectedProductId) {
      setModalError("Please select a product to adjust.");
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setModalError("Please enter a valid positive quantity.");
      return;
    }

    if (!reason.trim()) {
      setModalError("A mandatory audit reason is required.");
      return;
    }

    const quantityChange = adjustType === "increase" ? qty : -qty;

    setIsSaving(true);
    try {
      const res = await apiClient("/api/inventory/adjustments", {
        method: "POST",
        body: {
          productId: selectedProductId,
          quantityChange,
          reason: reason.trim(),
        },
      });

      if (res.success) {
        setIsAdjustModalOpen(false);
        setSelectedProductId("");
        setQuantity("1");
        setReason("");
        loadData(1);
      }
    } catch (err) {
      setModalError(err.message || "Failed to adjust stock.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper mapping for product names in movements table
  const productMap = new Map(products.map((p) => [p._id, p]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">Inventory & Stock Audit</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Append-only audit trail of sales deductions, initial stocks, and manual adjustments.
          </p>
        </div>

        <button
          onClick={() => setIsAdjustModalOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-amber-500/20 transition-all hover:brightness-110 active:scale-95"
        >
          <Boxes className="h-4 w-4" />
          <span>Manual Stock Adjustment</span>
        </button>
      </div>

      {/* Movements Table */}
      <div className="glass-panel overflow-hidden rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-900/60 uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              <tr>
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-4">Product</th>
                <th className="py-4 px-4 text-center">Movement Type</th>
                <th className="py-4 px-4 text-center">Change</th>
                <th className="py-4 px-4 text-center">Stock (Before → After)</th>
                <th className="py-4 px-6">Audit Reason / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="h-14 bg-slate-200/40 dark:bg-slate-900/30" />
                  </tr>
                ))
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No stock movements recorded yet.
                  </td>
                </tr>
              ) : (
                movements.map((m) => {
                  const product = productMap.get(m.productId);
                  const isPositive = m.quantityChange > 0;

                  return (
                    <tr key={m._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                        {new Date(m.createdAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">
                        {product ? product.name : `ID: ${m.productId}`}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            m.movementType === "sale"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : m.movementType === "initial_stock"
                              ? "bg-brand-500/15 text-brand-600 dark:text-brand-400"
                              : m.movementType === "adjustment_increase"
                              ? "bg-teal-500/15 text-teal-600 dark:text-teal-400"
                              : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {m.movementType.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-bold font-mono">
                        <span className={isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                          {isPositive ? `+${m.quantityChange}` : m.quantityChange}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-mono text-slate-600 dark:text-slate-300">
                        {m.stockBefore} → <span className="font-bold text-slate-900 dark:text-white">{m.stockAfter}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium max-w-xs truncate">
                        {m.note || "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800/80 px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} movements recorded)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => loadData(pagination.page - 1)}
                className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadData(pagination.page + 1)}
                className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ADJUST STOCK MODAL */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Boxes className="h-5 w-5" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Manual Stock Adjustment</h2>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Select Product *
                </label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2.5 px-3.5 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none"
                >
                  <option value="">-- Choose a product --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.sku}) — Available: {p.stockQuantity}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAdjustType("increase")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                      adjustType === "increase"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Stock In (+)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustType("decrease")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                      adjustType === "decrease"
                        ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Minus className="h-4 w-4" />
                    <span>Damage / Deduction (−)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2.5 px-3.5 text-xs text-slate-900 dark:text-white font-mono focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Mandatory Audit Reason *
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Broken in transit, Supplier replenishment, Stock count fix"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2.5 px-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-500 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-60"
                >
                  {isSaving ? "Applying..." : "Confirm Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

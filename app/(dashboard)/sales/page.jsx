"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { formatBDT } from "@/lib/money";
import { useLanguage } from "@/context/LanguageContext";
import {
  Receipt,
  Search,
  Calendar,
  CreditCard,
  Printer,
  X,
  CheckCircle,
  Eye,
} from "lucide-react";

export default function SalesHistoryPage() {
  const [sales, setSales] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { t, isBengali, toBengaliDigits } = useLanguage();

  // Receipt Modal
  const [selectedSale, setSelectedSale] = useState(null);

  const num = (n) => (isBengali ? toBengaliDigits(n) : n);

  const fetchSales = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (paymentMethod) params.append("paymentMethod", paymentMethod);

      const res = await apiClient(`/api/sales?${params.toString()}`);
      if (res.success) {
        setSales(res.sales || []);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Failed to load sales history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchSales(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            {t("sales.title", "Sales History")}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t("sales.subtitle", "View completed transactions, reprint receipts, and track audit records.")}
          </p>
        </div>
      </div>

      {/* Date & Filter Bar */}
      <div className="glass-panel rounded-2xl p-4">
        <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t("sales.from", "From:")}</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 px-3 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t("sales.to", "To:")}</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 px-3 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t("sales.payment", "Payment:")}</span>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 px-3 text-xs text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none shadow-sm"
            >
              <option value="">{t("sales.allMethods", "All Methods")}</option>
              <option value="cash">{t("pos.cash", "Cash")}</option>
              <option value="card">{t("pos.card", "Card")}</option>
              <option value="mobile_payment">{t("pos.mobilePay", "Mobile Pay")}</option>
            </select>
          </div>

          <button
            type="submit"
            className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-500 transition-colors shadow-sm"
          >
            {t("sales.filterButton", "Filter")}
          </button>
        </form>
      </div>

      {/* Sales Table */}
      <div className="glass-panel overflow-hidden rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-100/70 dark:bg-slate-900/60 uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              <tr>
                <th className="py-4 px-6">{t("sales.tableReceipt", "Receipt / Sale #")}</th>
                <th className="py-4 px-4">{t("sales.tableDateTime", "Date & Time")}</th>
                <th className="py-4 px-4">{t("sales.tableCashier", "Cashier")}</th>
                <th className="py-4 px-4 text-center">{t("sales.tableItems", "Items")}</th>
                <th className="py-4 px-4 text-center">{t("sales.tablePayment", "Payment")}</th>
                <th className="py-4 px-6 text-right">{t("sales.tableTotal", "Total Amount")}</th>
                <th className="py-4 px-4 text-center">{t("sales.tableAction", "Action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="h-14 bg-slate-200/40 dark:bg-slate-900/30" />
                  </tr>
                ))
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    {t("sales.noSales", "No sales records found for this period.")}
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-6 font-bold font-mono text-slate-900 dark:text-white">
                      {sale.saleNumber}
                    </td>
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                      {new Date(sale.createdAt).toLocaleString([], {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {sale.cashierName}
                    </td>
                    <td className="py-4 px-4 text-center text-slate-500 dark:text-slate-400">
                      {num(sale.items?.length || 0)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {formatBDT(sale.totalAmount)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => setSelectedSale(sale)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>{t("sales.viewReceipt", "Receipt")}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800/80 px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
            <span>
              {t("page", "Page")} {num(pagination.page)} {t("of", "of")} {num(pagination.totalPages)} ({num(pagination.total)} {t("total", "total sales")})
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchSales(pagination.page - 1)}
                className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                {t("previous", "Previous")}
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchSales(pagination.page + 1)}
                className="rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                {t("next", "Next")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RECEIPT VIEW MODAL */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                {selectedSale.saleNumber}
              </span>
              <button
                onClick={() => setSelectedSale(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Thermal Receipt Body */}
            <div
              id="thermal-receipt"
              className="my-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white p-5 text-black font-mono text-xs shadow-inner"
            >
              <div className="text-center pb-3 border-b border-dashed border-neutral-400">
                <h2 className="text-base font-black tracking-wider uppercase">{t("pos.receiptTitle", "DOKANDARI BANGLADESH")}</h2>
                <p className="text-[10px] text-neutral-600">{t("pos.receiptSubtitle", "Smart Retail & POS Platform")}</p>
                <p className="mt-1 text-[10px] text-neutral-500">{t("pos.city", "Dhaka, Bangladesh")}</p>
              </div>

              <div className="py-2.5 border-b border-dashed border-neutral-400 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-600">{t("pos.receiptNo", "Receipt #:")}</span>
                  <span className="font-bold">{selectedSale.saleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">{t("pos.date", "Date:")}</span>
                  <span>{new Date(selectedSale.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">{t("pos.cashierLabel", "Cashier:")}</span>
                  <span>{selectedSale.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">{t("pos.paymentLabel", "Payment:")}</span>
                  <span className="uppercase font-bold">{selectedSale.paymentMethod}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="py-3 border-b border-dashed border-neutral-400 space-y-2">
                {selectedSale.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-[11px]">
                    <div className="pr-2">
                      <p className="font-bold">{item.productName}</p>
                      <p className="text-[10px] text-neutral-600">
                        {num(item.quantity)} × {formatBDT(item.unitPrice)}
                      </p>
                    </div>
                    <span className="font-bold font-mono">{formatBDT(item.lineTotal)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="pt-3 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-600">{t("pos.subtotal", "Subtotal")}:</span>
                  <span>{formatBDT(selectedSale.subtotal)}</span>
                </div>
                {selectedSale.discount?.amount > 0 && (
                  <div className="flex justify-between text-neutral-700">
                    <span>{t("pos.discountDeduction", "Discount")}:</span>
                    <span>- {formatBDT(selectedSale.discount.amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black pt-1 border-t border-dashed border-neutral-400">
                  <span>{t("pos.totalPaid", "TOTAL PAID:")}</span>
                  <span>{formatBDT(selectedSale.totalAmount)}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-dashed border-neutral-400 text-center">
                <p className="text-[10px] uppercase font-bold text-neutral-700">{t("pos.thankYou", "*** THANK YOU FOR SHOPPING ***")}</p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 py-3 text-xs font-semibold text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              <Printer className="h-4 w-4" />
              <span>{t("sales.printReceipt", "Print This Receipt")}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

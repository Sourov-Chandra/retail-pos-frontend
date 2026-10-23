"use client";

import { useEffect, useState, useMemo } from "react";
import { apiClient } from "@/lib/api-client";
import { formatBDT } from "@/lib/money";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Tag,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  Printer,
  Sparkles,
  AlertCircle,
  X,
  Package,
} from "lucide-react";

export default function POSTerminalPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Cart state
  const [cart, setCart] = useState([]);
  const [discountType, setDiscountType] = useState("none"); // "none" | "percentage" | "fixed"
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash"); // "cash" | "card" | "mobile_payment"
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // Completed sale receipt modal state
  const [completedSale, setCompletedSale] = useState(null);

  // Fetch active products
  const loadProducts = async () => {
    try {
      const res = await apiClient("/api/products?isActive=true&limit=100");
      if (res.success) {
        setProducts(res.products || []);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Unique categories list
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return ["ALL", ...Array.from(set)];
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "ALL" || p.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Cart operations
  const addToCart = (product) => {
    if (product.stockQuantity <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          return prev; // cannot exceed available stock
        }
        return prev.map((item) =>
          item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product._id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stockQuantity) return item; // capped at stock
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.product._id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountType("none");
    setDiscountValue(0);
    setCheckoutError("");
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.sellingPrice * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (discountType === "percentage") {
      const pct = Math.min(100, Math.max(0, parseFloat(discountValue) || 0));
      return Math.round((subtotal * pct) / 100);
    }
    if (discountType === "fixed") {
      const fixed = Math.max(0, Math.round(parseFloat(discountValue) || 0) * 100); // converting entered BDT to minor units
      return Math.min(subtotal, fixed);
    }
    return 0;
  }, [subtotal, discountType, discountValue]);

  const finalTotal = Math.max(0, subtotal - discountAmount);

  // Execute Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setIsCheckingOut(true);
    setCheckoutError("");

    try {
      const payload = {
        items: cart.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
        paymentMethod,
        idempotencyKey: `pos-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      };

      if (discountType !== "none" && discountAmount > 0) {
        payload.discount = {
          type: discountType,
          value:
            discountType === "percentage"
              ? parseFloat(discountValue)
              : Math.round(parseFloat(discountValue) * 100),
        };
      }

      const res = await apiClient("/api/sales/checkout", {
        method: "POST",
        body: payload,
      });

      if (res.success && res.sale) {
        setCompletedSale(res.sale);
        clearCart();
        loadProducts(); // refresh available product stock
      }
    } catch (err) {
      setCheckoutError(err.message || "Checkout failed. Please check product stock.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col gap-6 lg:flex-row">
      {/* LEFT COLUMN: Product Catalog & Search */}
      <div className="flex flex-1 flex-col overflow-hidden glass-panel rounded-3xl p-6">
        {/* Search & Categories Bar */}
        <div className="space-y-4 pb-4 border-b border-slate-800/80">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, SKU, or category..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                  selectedCategory === cat
                    ? "bg-brand-600 text-white shadow-md shadow-brand-500/30"
                    : "border border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pt-4 pr-1">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-900/60" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <Package className="h-10 w-10 text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-400">No products found</p>
              <p className="text-xs text-slate-500">Try adjusting your search or category filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stockQuantity <= 0;
                const isLowStock = product.stockQuantity <= product.lowStockThreshold && !isOutOfStock;

                return (
                  <button
                    key={product._id}
                    onClick={() => addToCart(product)}
                    disabled={isOutOfStock}
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-3 text-left transition-all ${
                      isOutOfStock
                        ? "border-slate-800/40 bg-slate-900/20 opacity-50 cursor-not-allowed"
                        : "border-slate-800/80 bg-slate-900/50 hover:border-brand-500/50 hover:bg-slate-900 hover:shadow-xl hover:shadow-brand-500/5 active:scale-[0.98]"
                    }`}
                  >
                    <div>
                      {/* Product Image Thumbnail */}
                      <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-center">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <Package className="h-8 w-8 text-slate-700" />
                        )}
                        <div className="absolute top-2 left-2">
                          <span className="rounded-md bg-slate-950/85 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-slate-300 font-mono">
                            {product.sku}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          {isOutOfStock ? (
                            <span className="rounded-full bg-rose-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                              Out
                            </span>
                          ) : isLowStock ? (
                            <span className="rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-slate-950 shadow-sm animate-pulse">
                              {product.stockQuantity} left
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                              {product.stockQuantity}
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="line-clamp-1 text-sm font-bold text-white group-hover:text-brand-300">
                        {product.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-400">{product.category}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-800/60 pt-2.5">
                      <span className="text-base font-black text-emerald-400 font-mono">
                        {formatBDT(product.sellingPrice)}
                      </span>
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                        <Plus className="h-4 w-4" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Sticky Digital Cash Register (Cart) */}
      <div className="flex w-full flex-col overflow-hidden glass-panel rounded-3xl p-6 lg:w-96 xl:w-[420px]">
        {/* Cart Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Current Cart</h2>
              <span className="text-xs text-slate-400 font-medium">
                {cart.reduce((a, c) => a + c.quantity, 0)} items selected
              </span>
            </div>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="rounded-lg p-1.5 text-xs text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Error banner */}
        {checkoutError && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{checkoutError}</span>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
          {cart.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center">
              <ShoppingCart className="h-10 w-10 text-slate-700 mb-2" />
              <p className="text-sm font-semibold text-slate-400">Your cart is empty</p>
              <p className="text-xs text-slate-500">Tap items on the left to add them to register.</p>
            </div>
          ) : (
            cart.map(({ product, quantity }) => (
              <div
                key={product._id}
                className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 p-3"
              >
                <div className="flex-1 pr-3">
                  <p className="text-xs font-bold text-white line-clamp-1">{product.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {formatBDT(product.sellingPrice)} × {quantity}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg border border-slate-700/80 bg-slate-800/80 p-0.5">
                    <button
                      onClick={() => updateQuantity(product._id, -1)}
                      className="rounded p-1 text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-white font-mono">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product._id, 1)}
                      disabled={quantity >= product.stockQuantity}
                      className="rounded p-1 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <span className="w-16 text-right text-xs font-bold text-emerald-400 font-mono">
                    {formatBDT(product.sellingPrice * quantity)}
                  </span>

                  <button
                    onClick={() => removeFromCart(product._id)}
                    className="p-1 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Breakdown & Controls */}
        <div className="border-t border-slate-800/80 pt-4 space-y-4">
          {/* Discount controls */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-brand-400" />
                <span>Apply Discount</span>
              </span>
              <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-0.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setDiscountType("none")}
                  className={`px-2 py-0.5 rounded ${discountType === "none" ? "bg-brand-600 text-white font-bold" : "text-slate-400"}`}
                >
                  None
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType("percentage")}
                  className={`px-2 py-0.5 rounded ${discountType === "percentage" ? "bg-brand-600 text-white font-bold" : "text-slate-400"}`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType("fixed")}
                  className={`px-2 py-0.5 rounded ${discountType === "fixed" ? "bg-brand-600 text-white font-bold" : "text-slate-400"}`}
                >
                  ৳
                </button>
              </div>
            </div>

            {discountType !== "none" && (
              <div className="relative mt-2">
                <input
                  type="number"
                  min="0"
                  max={discountType === "percentage" ? "100" : undefined}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === "percentage" ? "Enter % (e.g. 10)" : "Enter ৳ amount"}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 py-1.5 px-3 text-xs text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "cash", label: "Cash", icon: Banknote },
                { id: "card", label: "Card", icon: CreditCard },
                { id: "mobile_payment", label: "Mobile Pay", icon: Smartphone },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPaymentMethod(id)}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                    paymentMethod === id
                      ? "border-brand-500 bg-brand-500/15 text-white shadow-sm"
                      : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${paymentMethod === id ? "text-brand-400" : "text-slate-400"}`} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Totals */}
          <div className="space-y-1.5 text-xs border-t border-slate-800/60 pt-3">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono text-slate-200">{formatBDT(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-amber-400">
                <span>Discount Deduction</span>
                <span className="font-mono">- {formatBDT(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-800 text-sm font-bold">
              <span className="text-white">Final Total</span>
              <span className="text-xl font-black text-emerald-400 font-mono">
                {formatBDT(finalTotal)}
              </span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={cart.length === 0 || isCheckingOut}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 py-4 text-sm font-bold text-white shadow-xl shadow-emerald-500/20 transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isCheckingOut ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Complete Checkout • {formatBDT(finalTotal)}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* THERMAL RECEIPT MODAL */}
      {completedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-bold">Payment Confirmed</span>
              </div>
              <button
                onClick={() => setCompletedSale(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Printable Thermal Receipt Card */}
            <div
              id="thermal-receipt"
              className="my-4 rounded-xl border border-dashed border-slate-700 bg-white p-5 text-black font-mono text-xs shadow-inner"
            >
              <div className="text-center pb-3 border-b border-dashed border-neutral-400">
                <h2 className="text-base font-black tracking-wider uppercase">RETAIL POS BANGLADESH</h2>
                <p className="text-[10px] text-neutral-600">Smart Retail Management</p>
                <p className="mt-1 text-[10px] text-neutral-500">Dhaka, Bangladesh</p>
              </div>

              <div className="py-2.5 border-b border-dashed border-neutral-400 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Receipt #:</span>
                  <span className="font-bold">{completedSale.saleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Date:</span>
                  <span>{new Date(completedSale.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Cashier:</span>
                  <span>{completedSale.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Payment:</span>
                  <span className="uppercase font-bold">{completedSale.paymentMethod}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="py-3 border-b border-dashed border-neutral-400 space-y-2">
                {completedSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-[11px]">
                    <div className="pr-2">
                      <p className="font-bold">{item.productName}</p>
                      <p className="text-[10px] text-neutral-600">
                        {item.quantity} × {formatBDT(item.unitPrice)}
                      </p>
                    </div>
                    <span className="font-bold font-mono">{formatBDT(item.lineTotal)}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="pt-3 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal:</span>
                  <span>{formatBDT(completedSale.subtotal)}</span>
                </div>
                {completedSale.discount?.amount > 0 && (
                  <div className="flex justify-between text-neutral-700">
                    <span>Discount:</span>
                    <span>- {formatBDT(completedSale.discount.amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black pt-1 border-t border-dashed border-neutral-400">
                  <span>TOTAL PAID:</span>
                  <span>{formatBDT(completedSale.totalAmount)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-dashed border-neutral-400 text-center">
                <p className="text-[10px] uppercase font-bold text-neutral-700">*** THANK YOU FOR SHOPPING ***</p>
                <p className="text-[9px] text-neutral-500 mt-0.5">Please retain this receipt for warranty</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-3 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
              >
                <Printer className="h-4 w-4" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setCompletedSale(null)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-xs font-bold text-white hover:bg-brand-500 transition-colors shadow-lg shadow-brand-500/25"
              >
                <span>New Sale</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

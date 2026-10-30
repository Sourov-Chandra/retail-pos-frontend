"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { formatBDT } from "@/lib/money";
import { authClient } from "@/lib/auth-client";
import { useLanguage } from "@/context/LanguageContext";
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  KeyRound,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Receipt,
  BadgeDollarSign,
  User,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";

export default function StaffPage() {
  const { t, isBengali, toBengaliDigits } = useLanguage();
  const [currentUser, setCurrentUser] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [toast, setToast] = useState(null);

  // Add Cashier Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "cashier",
  });
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);
  const [addError, setAddError] = useState("");

  // Reset Password Modal State
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [targetStaff, setTargetStaff] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isSubmittingReset, setIsSubmittingReset] = useState(false);
  const [resetError, setResetError] = useState("");

  // Edit Staff Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    role: "cashier",
    banned: false,
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete Staff Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  const num = (val) => (isBengali ? toBengaliDigits(val) : val);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const fetchSessionAndStaff = async () => {
    setIsLoading(true);
    try {
      const session = await authClient.getSession();
      if (session?.data?.user) {
        setCurrentUser(session.data.user);
      }

      if (session?.data?.user?.role === "owner") {
        const res = await apiClient("/api/staff");
        if (res?.success) {
          setStaffList(res.data || []);
        }
      }
    } catch (err) {
      console.error("Failed to load staff list:", err);
      showToast("error", err.message || "Failed to fetch staff data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionAndStaff();
  }, []);

  // Filter staff by search and role
  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "all" || s.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Calculate high-level metrics
  const totalStaffCount = staffList.length;
  const activeCashiersCount = staffList.filter(
    (s) => s.role === "cashier" && !s.banned
  ).length;
  const totalSalesProcessed = staffList.reduce(
    (sum, s) => sum + (s.totalSalesCount || 0),
    0
  );
  const totalVolumePoisha = staffList.reduce(
    (sum, s) => sum + (s.totalSalesAmountPoisha || 0),
    0
  );

  // Handle Add Cashier Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError("");

    if (!addForm.name.trim()) {
      setAddError(
        isBengali ? "অনুগ্রহ করে কর্মীর পূর্ণ নাম লিখুন।" : "Please enter the staff member's full name."
      );
      return;
    }
    if (!addForm.email.trim() || !addForm.email.includes("@")) {
      setAddError(
        isBengali ? "সঠিক ইমেইল ঠিকানা প্রদান করুন।" : "Please enter a valid email address."
      );
      return;
    }
    if (!addForm.password || addForm.password.length < 6) {
      setAddError(
        isBengali ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।" : "Password must be at least 6 characters long."
      );
      return;
    }

    setIsSubmittingAdd(true);
    try {
      const res = await apiClient("/api/staff", {
        method: "POST",
        body: addForm,
      });

      if (res?.success) {
        showToast("success", t("staff.successCreated", "New staff member added successfully!"));
        setIsAddOpen(false);
        setAddForm({ name: "", email: "", password: "", role: "cashier" });
        fetchSessionAndStaff();
      }
    } catch (err) {
      setAddError(err.message || "Failed to create staff account.");
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (staff) => {
    setTargetStaff(staff);
    setEditForm({
      name: staff.name,
      role: staff.role,
      banned: staff.banned,
    });
    setEditError("");
    setIsEditOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError("");

    if (!editForm.name.trim()) {
      setEditError(
        isBengali ? "অনুগ্রহ করে পূর্ণ নাম লিখুন।" : "Please enter a valid full name."
      );
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const res = await apiClient(`/api/staff/${targetStaff.id}`, {
        method: "PATCH",
        body: editForm,
      });

      if (res?.success) {
        showToast("success", t("staff.successUpdated", "Staff member updated successfully!"));
        setIsEditOpen(false);
        fetchSessionAndStaff();
      }
    } catch (err) {
      setEditError(err.message || "Failed to update staff member.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Open Reset Password Modal
  const openResetModal = (staff) => {
    setTargetStaff(staff);
    setNewPassword("");
    setResetError("");
    setIsResetOpen(true);
  };

  // Handle Reset Password Submit
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetError("");

    if (!newPassword || newPassword.length < 6) {
      setResetError(
        isBengali ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।" : "New password must be at least 6 characters."
      );
      return;
    }

    setIsSubmittingReset(true);
    try {
      const res = await apiClient(`/api/staff/${targetStaff.id}/password`, {
        method: "POST",
        body: { password: newPassword },
      });

      if (res?.success) {
        showToast("success", t("staff.successPasswordReset", "Password has been reset successfully!"));
        setIsResetOpen(false);
      }
    } catch (err) {
      setResetError(err.message || "Failed to reset password.");
    } finally {
      setIsSubmittingReset(false);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (staff) => {
    setTargetStaff(staff);
    setIsDeleteOpen(true);
  };

  // Handle Delete Submit
  const handleDeleteSubmit = async () => {
    setIsSubmittingDelete(true);
    try {
      const res = await apiClient(`/api/staff/${targetStaff.id}`, {
        method: "DELETE",
      });

      if (res?.success) {
        showToast("success", t("staff.successDeleted", "Staff account deleted successfully!"));
        setIsDeleteOpen(false);
        fetchSessionAndStaff();
      }
    } catch (err) {
      showToast("error", err.message || "Failed to delete staff member.");
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  // Format joined date nicely
  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    const dateFormatted = d.toLocaleDateString("en-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    return isBengali ? toBengaliDigits(dateFormatted) : dateFormatted;
  };

  // Non-Owner Access Guard
  if (!isLoading && currentUser?.role !== "owner") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-lg shadow-amber-500/10">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t("staff.ownerOnlyWarning", "Access restricted to Store Owners only.")}
        </h2>
        <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
          {t(
            "staff.ownerOnlySub",
            "Cashier accounts do not have permission to manage store staff. Please contact the store owner."
          )}
        </p>
        <Link
          href="/pos"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:brightness-110"
        >
          <ShoppingCart className="h-4 w-4" />
          <span>{t("staff.goToPos", "Go to POS Terminal")}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-top-4 border ${
            toast.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("staff.title", "Staff & Cashiers Management")}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t(
              "staff.subtitle",
              "Manage your store's sales team, assign cashiers, and reset passwords."
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchSessionAndStaff}
            title="Refresh list"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-brand-500" : ""}`} />
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <UserPlus className="h-4 w-4" />
            <span>{t("staff.addCashier", "Add New Cashier")}</span>
          </button>
        </div>
      </div>

      {/* Metric Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Staff */}
        <div className="glass-panel flex items-center gap-4 rounded-2xl p-4.5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t("staff.totalStaff", "Total Staff")}
            </p>
            <p className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">
              {num(totalStaffCount)}
            </p>
          </div>
        </div>

        {/* Active Cashiers */}
        <div className="glass-panel flex items-center gap-4 rounded-2xl p-4.5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t("staff.activeCashiers", "Active Cashiers")}
            </p>
            <p className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">
              {num(activeCashiersCount)}
            </p>
          </div>
        </div>

        {/* Total Sales Processed */}
        <div className="glass-panel flex items-center gap-4 rounded-2xl p-4.5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Receipt className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t("staff.totalSalesCompleted", "Sales Processed")}
            </p>
            <p className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">
              {num(totalSalesProcessed)}
            </p>
          </div>
        </div>

        {/* Total Store Volume */}
        <div className="glass-panel flex items-center gap-4 rounded-2xl p-4.5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <BadgeDollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t("staff.tableVolume", "Total Volume")}
            </p>
            <p className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">
              {num(formatBDT(totalVolumePoisha))}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Role Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("staff.searchPlaceholder", "Search staff by name or email...")}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-sm">
          <button
            onClick={() => setRoleFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              roleFilter === "all"
                ? "bg-brand-500 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {t("staff.filterAll", "All Roles")}
          </button>
          <button
            onClick={() => setRoleFilter("cashier")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              roleFilter === "cashier"
                ? "bg-brand-500 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {t("staff.filterCashiers", "Cashiers")}
          </button>
          <button
            onClick={() => setRoleFilter("owner")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              roleFilter === "owner"
                ? "bg-brand-500 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {t("staff.filterOwners", "Owners")}
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="glass-panel overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-5 py-4">{t("staff.tableStaff", "Staff Member")}</th>
                <th className="px-5 py-4">{t("staff.tableRole", "Role & Permissions")}</th>
                <th className="px-5 py-4">{t("staff.tableStatus", "Account Status")}</th>
                <th className="px-5 py-4">{t("staff.tableSales", "Sales Performed")}</th>
                <th className="px-5 py-4">{t("staff.tableJoined", "Joined Date")}</th>
                <th className="px-5 py-4 text-right">{t("staff.tableActions", "Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                      <span className="text-xs font-medium">{t("loading", "Loading...")}</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <p className="text-sm font-medium">
                      {t("staff.noStaffFound", "No staff members matching your filter.")}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => {
                  const isCurrent = staff.id === currentUser?.id;
                  const isOwner = staff.role === "owner";

                  return (
                    <tr
                      key={staff.id}
                      className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/40"
                    >
                      {/* Name & Email */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${
                              isOwner
                                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                : "bg-brand-500/10 text-brand-600 dark:text-brand-400"
                            }`}
                          >
                            {staff.name ? staff.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {staff.name}
                              </span>
                              {isCurrent && (
                                <span className="rounded-md bg-slate-200 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                  {isBengali ? "আপনি" : "You"}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {staff.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        {isOwner ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 border border-purple-500/20">
                            <Shield className="h-3.5 w-3.5" />
                            <span>{t("staff.badgeOwner", "Store Owner")}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300 border border-sky-500/20">
                            <User className="h-3.5 w-3.5" />
                            <span>{t("staff.badgeCashier", "Cashier")}</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {staff.banned ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            <span>{t("staff.badgeBanned", "Suspended")}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>{t("staff.badgeActive", "Active")}</span>
                          </span>
                        )}
                      </td>

                      {/* Sales Performed */}
                      <td className="px-5 py-4">
                        <div className="text-xs">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {num(staff.totalSalesCount || 0)}
                          </span>{" "}
                          <span className="text-slate-500">
                            {t("staff.salesCount", "sales")}
                          </span>
                          <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                            {num(formatBDT(staff.totalSalesAmountPoisha || 0))}
                          </p>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="px-5 py-4 text-xs text-slate-500">
                        {formatDate(staff.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reset Password */}
                          <button
                            onClick={() => openResetModal(staff)}
                            title={t("staff.resetTitle", "Reset Password")}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500 transition-colors"
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => openEditModal(staff)}
                            title={t("staff.editTitle", "Edit Staff Member")}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-500 transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {/* Delete (Cannot delete oneself) */}
                          {!isCurrent && (
                            <button
                              onClick={() => openDeleteModal(staff)}
                              title={t("staff.deleteTitle", "Delete Staff Account")}
                              className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================= */}
      {/* 1. ADD NEW CASHIER MODAL */}
      {/* ========================================= */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {t("staff.createTitle", "Add New Cashier")}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t("staff.createSubtitle", "Create credentials for your counter staff.")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {addError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t("staff.nameLabel", "Full Name *")}
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder={t("staff.namePlaceholder", "e.g. Arif Hossain")}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3.5 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t("staff.emailLabel", "Email Address *")}
                </label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder={t("staff.emailPlaceholder", "e.g. arif@dokandari.com")}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3.5 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t("staff.passwordLabel", "Initial Password *")}
                </label>
                <div className="relative">
                  <input
                    type={showAddPassword ? "text" : "password"}
                    required
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder={t("staff.passwordPlaceholder", "At least 6 characters")}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-3.5 pr-10 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    {showAddPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t("staff.roleLabel", "Role *")}
                </label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3.5 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="cashier">{t("staff.roleCashier", "Cashier (POS & Sales only)")}</option>
                  <option value="owner">{t("staff.roleOwner", "Co-Owner (Full Admin Access)")}</option>
                </select>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  {t("cancel", "Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:brightness-110 disabled:opacity-50"
                >
                  {isSubmittingAdd
                    ? t("staff.creatingSubmit", "Creating Account...")
                    : t("staff.createSubmit", "Create Cashier Account")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* 2. RESET PASSWORD MODAL */}
      {/* ========================================= */}
      {isResetOpen && targetStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {t("staff.resetTitle", "Reset Password")}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t("staff.resetSubtitle", "Set a new login password for")}{" "}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{targetStaff.name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsResetOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {resetError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t("staff.newPasswordLabel", "New Password *")}
                </label>
                <div className="relative">
                  <input
                    type={showResetPassword ? "text" : "password"}
                    required
                    autoFocus
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t("staff.passwordPlaceholder", "At least 6 characters")}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-3.5 pr-10 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsResetOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  {t("cancel", "Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReset}
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-amber-500/20 disabled:opacity-50"
                >
                  {isSubmittingReset
                    ? t("staff.resetting", "Updating...")
                    : t("staff.confirmReset", "Update Password")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* 3. EDIT STAFF MEMBER MODAL */}
      {/* ========================================= */}
      {isEditOpen && targetStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
                  <Edit2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {t("staff.editTitle", "Edit Staff Member")}
                  </h3>
                  <p className="text-xs text-slate-500">{targetStaff.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {editError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t("staff.nameLabel", "Full Name *")}
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3.5 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t("staff.roleLabel", "Role *")}
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  disabled={targetStaff.id === currentUser?.id}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3.5 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
                >
                  <option value="cashier">{t("staff.roleCashier", "Cashier (POS & Sales only)")}</option>
                  <option value="owner">{t("staff.roleOwner", "Co-Owner (Full Admin Access)")}</option>
                </select>
                {targetStaff.id === currentUser?.id && (
                  <p className="mt-1 text-[11px] text-slate-400">
                    {t("staff.cannotDemoteSelf", "You cannot demote your own account.")}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t("staff.statusLabel", "Account Status")}
                </label>
                <select
                  value={editForm.banned ? "banned" : "active"}
                  onChange={(e) => setEditForm({ ...editForm, banned: e.target.value === "banned" })}
                  disabled={targetStaff.id === currentUser?.id}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3.5 text-sm text-slate-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
                >
                  <option value="active">{t("staff.statusActive", "Active (Allowed to sign in)")}</option>
                  <option value="banned">{t("staff.statusSuspended", "Suspended (Locked out)")}</option>
                </select>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  {t("cancel", "Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="rounded-xl bg-brand-600 hover:bg-brand-700 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/20 disabled:opacity-50"
                >
                  {isSubmittingEdit
                    ? t("staff.savingChanges", "Saving...")
                    : t("staff.saveChanges", "Save Changes")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* 4. CONFIRM DELETE MODAL */}
      {/* ========================================= */}
      {isDeleteOpen && targetStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {t("staff.deleteTitle", "Delete Staff Account")}
                </h3>
                <p className="text-xs text-slate-500">{targetStaff.name} ({targetStaff.email})</p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {t(
                "staff.deleteConfirmMsg",
                "Are you sure you want to permanently remove this staff member? Their past sales history will remain preserved in audit records."
              )}
            </p>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                {t("cancel", "Cancel")}
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={isSubmittingDelete}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-rose-500/20 disabled:opacity-50"
              >
                {isSubmittingDelete
                  ? t("staff.deletingSubmit", "Deleting...")
                  : t("staff.deleteSubmit", "Yes, Delete Account")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Heart,
  Users,
  Plus,
  RefreshCw,
  Layers,
} from "lucide-react";
import {
  getVolunteerCategories,
  deleteVolunteerCategory,
  updateVolunteerCategory,
  getVolunteerApplications,
  updateVolunteerApplicationStatus,
  deleteVolunteerApplication,
  VolunteerCategory,
  VolunteerApplication,
  ApplicationStatus,
  FormType,
} from "@/app/api/volunteer";

import { VolunteersStats } from "./components/VolunteersStats";
import { ApplicationsTable } from "./components/ApplicationsTable";
import { ApplicationDetailModal } from "./components/ApplicationDetailModal";
import { CategoriesGrid } from "./components/CategoriesGrid";
import { CategoryFormModal } from "./components/CategoryFormModal";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";

const FORM_TYPES: { id: FormType; label: string }[] = [
  { id: "volunteer", label: "Volunteers" },
  { id: "corporate", label: "Corporate & CSR" },
  { id: "career", label: "Careers & Jobs" },
  { id: "support", label: "Ways to Give / Support" },
];

export default function VolunteersDashboardPage() {
  const [activeTab, setActiveTab] = useState<"applications" | "categories">("applications");
  const [activeFormType, setActiveFormType] = useState<FormType>("volunteer");

  // State: Categories
  const [categories, setCategories] = useState<VolunteerCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // State: Applications
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Category Modal State (Create / Edit)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<VolunteerCategory | null>(null);

  // Application Detail Modal
  const [selectedApplication, setSelectedApplication] = useState<VolunteerApplication | null>(null);
  const [isUpdatingStatusId, setIsUpdatingStatusId] = useState<string | null>(null);

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "category" | "application";
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch Data ──────────────────────────────────────────────────
  const fetchAllData = async () => {
    setIsLoadingCategories(true);
    setIsLoadingApplications(true);
    try {
      const [cats, apps] = await Promise.all([
        getVolunteerCategories(activeFormType).catch(() => []),
        getVolunteerApplications(activeFormType).catch(() => []),
      ]);
      setCategories(cats);
      setApplications(apps);
    } catch (err) {
      console.error("Error loading volunteer data:", err);
    } finally {
      setIsLoadingCategories(false);
      setIsLoadingApplications(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [activeFormType]);

  // ── Filtered Applications ───────────────────────────────────────
  const filteredApplications = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return applications.filter((app) => {
      const matchesSearch =
        q === "" ||
        app.name?.toLowerCase().includes(q) ||
        app.email?.toLowerCase().includes(q) ||
        app.phone?.toLowerCase().includes(q) ||
        app.city?.toLowerCase().includes(q) ||
        app.companyName?.toLowerCase().includes(q) ||
        app.contactPerson?.toLowerCase().includes(q) ||
        app.positionAppliedFor?.toLowerCase().includes(q) ||
        app.selectedAreaTitle?.toLowerCase().includes(q) ||
        app.industry?.toLowerCase().includes(q) ||
        (typeof app.category === "object" &&
          app.category?.title?.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "all" || app.status === statusFilter;

      const catId = typeof app.category === "object" ? app.category?._id : app.category;
      const matchesCategory =
        categoryFilter === "all" || catId === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [applications, searchQuery, statusFilter, categoryFilter]);

  // ── Stats ───────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === "pending").length;
    const contacted = applications.filter((a) => a.status === "contacted").length;
    const approved = applications.filter((a) => a.status === "approved").length;
    return { total, pending, contacted, approved, totalRoles: categories.length };
  }, [applications, categories]);

  // ── Category Handlers ───────────────────────────────────────────
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: VolunteerCategory) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const handleCategorySaved = (savedCategory: VolunteerCategory, isNew: boolean) => {
    if (isNew) {
      setCategories((prev) => [savedCategory, ...prev]);
    } else {
      setCategories((prev) =>
        prev.map((c) => (c._id === savedCategory._id ? savedCategory : c))
      );
    }
  };

  const handleToggleCategoryActive = async (cat: VolunteerCategory) => {
    try {
      const nextActive = !cat.isActive;
      await updateVolunteerCategory(cat._id, {
        isActive: nextActive,
      });
      setCategories((prev) =>
        prev.map((c) => (c._id === cat._id ? { ...c, isActive: nextActive } : c))
      );
    } catch (err) {
      console.error("Failed to toggle category active status:", err);
    }
  };

  // ── Application Status Update Handler ───────────────────────────
  const handleUpdateAppStatus = async (
    appId: string,
    newStatus: ApplicationStatus
  ) => {
    setIsUpdatingStatusId(appId);
    try {
      await updateVolunteerApplicationStatus(appId, newStatus);
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
      );
      if (selectedApplication?._id === appId) {
        setSelectedApplication((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setIsUpdatingStatusId(null);
    }
  };

  // ── Delete Handler ──────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === "category") {
        await deleteVolunteerCategory(deleteTarget.id);
        setCategories((prev) => prev.filter((c) => c._id !== deleteTarget.id));
      } else {
        await deleteVolunteerApplication(deleteTarget.id);
        setApplications((prev) => prev.filter((a) => a._id !== deleteTarget.id));
        if (selectedApplication?._id === deleteTarget.id) {
          setSelectedApplication(null);
        }
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete item:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="p-2 bg-black text-white rounded-xl shadow-sm">
                <Heart size={18} />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-black">
                Volunteer Management
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Review volunteer applications and configure role categories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllData}
              title="Refresh Data"
              className="p-2.5 border border-slate-200 hover:border-slate-400 text-slate-700 rounded-xl transition-colors"
            >
              <RefreshCw
                size={16}
                className={isLoadingApplications || isLoadingCategories ? "animate-spin" : ""}
              />
            </button>
            <button
              onClick={handleOpenCreateCategory}
              className="flex items-center gap-2 bg-black hover:bg-slate-800 text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all shadow-sm"
            >
              <Plus size={16} strokeWidth={2.5} />
              Add Role Category
            </button>
          </div>
        </div>

        {/* ── Stats Overview ── */}
        <VolunteersStats stats={stats} />

        {/* ── Form Type Switcher ── */}
        <div className="flex items-center gap-2 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
          {FORM_TYPES.map((ft) => (
            <button
              key={ft.id}
              onClick={() => setActiveFormType(ft.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeFormType === ft.id
                  ? "bg-white text-black shadow-sm"
                  : "text-slate-500 hover:text-black"
              }`}
            >
              {ft.label}
            </button>
          ))}
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex border-b border-slate-200 mb-6 gap-2 sm:gap-6">
          <button
            onClick={() => setActiveTab("applications")}
            className={`flex items-center gap-2 pb-3.5 px-2 text-sm font-bold transition-all relative ${
              activeTab === "applications"
                ? "text-black border-b-2 border-black"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <Users size={16} />
            Applications
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                activeTab === "applications"
                  ? "bg-black text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {applications.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`flex items-center gap-2 pb-3.5 px-2 text-sm font-bold transition-all relative ${
              activeTab === "categories"
                ? "text-black border-b-2 border-black"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <Layers size={16} />
            Role Categories
            <span
              className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                activeTab === "categories"
                  ? "bg-black text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {categories.length}
            </span>
          </button>
        </div>

        {/* ── TAB 1: VOLUNTEER APPLICATIONS ── */}
        {activeTab === "applications" && (
          <ApplicationsTable
            applications={filteredApplications}
            categories={categories}
            isLoading={isLoadingApplications}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            isUpdatingStatusId={isUpdatingStatusId}
            onUpdateStatus={handleUpdateAppStatus}
            onViewDetails={setSelectedApplication}
            onDeleteRequest={(app) =>
              setDeleteTarget({
                type: "application",
                id: app._id,
                title: app.name,
              })
            }
          />
        )}

        {/* ── TAB 2: ROLE CATEGORIES (CRUD) ── */}
        {activeTab === "categories" && (
          <CategoriesGrid
            categories={categories}
            isLoading={isLoadingCategories}
            onOpenCreate={handleOpenCreateCategory}
            onOpenEdit={handleOpenEditCategory}
            onToggleActive={handleToggleCategoryActive}
            onDeleteRequest={(cat) =>
              setDeleteTarget({
                type: "category",
                id: cat._id,
                title: cat.title,
              })
            }
          />
        )}

        {/* ── CREATE / EDIT CATEGORY MODAL ── */}
        <CategoryFormModal
          isOpen={isCategoryModalOpen}
          category={editingCategory}
          formType={activeFormType}
          onClose={() => setIsCategoryModalOpen(false)}
          onSaved={handleCategorySaved}
        />

        {/* ── VIEW APPLICATION DETAIL MODAL ── */}
        <ApplicationDetailModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onUpdateStatus={handleUpdateAppStatus}
          onDeleteRequest={(app) =>
            setDeleteTarget({
              type: "application",
              id: app._id,
              title: app.name,
            })
          }
        />

        {/* ── DELETE CONFIRMATION MODAL ── */}
        <DeleteConfirmModal
          target={deleteTarget}
          isDeleting={isDeleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  );
}

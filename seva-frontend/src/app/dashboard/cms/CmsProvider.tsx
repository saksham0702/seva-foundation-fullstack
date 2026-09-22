"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CmsContentType, CmsForm, CmsItem, initialCmsForm } from "@/types/cms";
import { cmsAPI } from "@/app/api/cms";
import { CMS_SEED_MAP } from "./cms-data";
import { useToast } from "@/lib/toast";
import { extractErrorMessage } from "@/lib/api-error";

type Tab = "meta" | "content";

interface CmsContextType {
  contentType: CmsContentType;
  form: CmsForm;
  set: (key: keyof CmsForm, value: unknown) => void;
  tab: Tab;
  setTab: (tab: Tab) => void;
  metaComplete: boolean;
  contentComplete: boolean;
  isEditMode: boolean;
  editingId: string | null;
  items: CmsItem[];
  isLoading: boolean;
  saveItem: () => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleStatus: (id: string, currentStatus: string) => Promise<void>;
  refreshItems: () => Promise<void>;
}

const CmsContext = createContext<CmsContextType | undefined>(undefined);

export function CmsProvider({
  contentType,
  children,
}: {
  contentType: CmsContentType;
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<div className="p-6 text-white text-sm">Loading CMS module...</div>}>
      <CmsProviderContent contentType={contentType}>{children}</CmsProviderContent>
    </Suspense>
  );
}

function CmsProviderContent({
  contentType,
  children,
}: {
  contentType: CmsContentType;
  children: ReactNode;
}) {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const editingId = searchParams.get("id");

  const [items, setItems] = useState<CmsItem[]>([]);
  const [form, setForm] = useState<CmsForm>(initialCmsForm);
  const [tab, setTab] = useState<Tab>("meta");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load items strictly from MongoDB API
  const refreshItems = async () => {
    setIsLoading(true);
    try {
      const fetched = await cmsAPI.getItems(contentType);
      setItems(fetched);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshItems();
  }, [contentType]);

  // Load editing item if in edit mode
  useEffect(() => {
    if (isEditMode && editingId) {
      cmsAPI.getItemById(contentType, editingId).then((item) => {
        if (item) {
          setForm({
            title: item.title || "",
            slug: item.slug || "",
            metaTitle: item.metaTitle || item.title || "",
            metaDescription: item.metaDescription || item.excerpt || "",
            featuredImage: item.featuredImage || "",
            content: item.content || "",
            category: item.category || "General",
            faqs: item.faqs || [],
            status: item.status || "draft",
            scheduledAt: item.scheduledAt || "",
            eventDate: item.eventDate || "",
            eventLocation: item.eventLocation || "",
            eventOrganizer: item.eventOrganizer || "",
            newsSource: item.newsSource || "",
            authorName: item.authorName || "",
            readTime: item.readTime || "3 min read",
          });
        }
      });
    }
  }, [isEditMode, editingId, contentType]);

  function set(key: keyof CmsForm, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const saveItem = async () => {
    try {
      if (isEditMode && editingId) {
        const updated = await cmsAPI.updateItem(contentType, editingId, form);
        setItems((prev) => prev.map((item) => (item.id === editingId ? updated : item)));
        toast.success(`${contentType.toUpperCase()} updated successfully!`);
      } else {
        const created = await cmsAPI.createItem(contentType, form);
        setItems((prev) => [created, ...prev]);
        toast.success(`${contentType.toUpperCase()} created successfully!`);
      }
      const redirectPath =
        contentType === "blog"
          ? "/dashboard/blogs"
          : contentType === "news"
          ? "/dashboard/news"
          : "/dashboard/events";
      router.push(redirectPath);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, `Failed to save ${contentType}.`));
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await cmsAPI.deleteItem(contentType, id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success(`${contentType.toUpperCase()} deleted successfully.`);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, `Failed to delete ${contentType}.`));
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const nextStatus = await cmsAPI.toggleStatus(contentType, id, currentStatus);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: nextStatus as CmsItem["status"] } : item
        )
      );
      toast.success(`Status updated to ${nextStatus}.`);
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, "Failed to update status."));
    }
  };

  const metaComplete = !!(form.title && form.metaDescription);
  const contentComplete = !!form.content;

  return (
    <CmsContext.Provider
      value={{
        contentType,
        form,
        set,
        tab,
        setTab,
        metaComplete,
        contentComplete,
        isEditMode,
        editingId,
        items,
        isLoading,
        saveItem,
        deleteItem,
        toggleStatus,
        refreshItems,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
}

export function useCms() {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error("useCms must be used within a CmsProvider");
  }
  return context;
}

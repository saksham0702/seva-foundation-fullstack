"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BlogForm, initialBlogForm, DUMMY_BLOGS } from "./utils";

type Tab = "meta" | "content";

interface BlogContextType {
  form: BlogForm;
  set: (key: keyof BlogForm, value: unknown) => void;
  tab: Tab;
  setTab: (tab: Tab) => void;
  metaComplete: boolean;
  contentComplete: boolean;
  isEditMode: boolean;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export function BlogProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<BlogForm>(initialBlogForm);
  const [tab, setTab] = useState<Tab>("meta");

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BlogProviderContent
        form={form}
        setForm={setForm}
        tab={tab}
        setTab={setTab}
      >
        {children}
      </BlogProviderContent>
    </Suspense>
  );
}

function BlogProviderContent({
  children,
  form,
  setForm,
  tab,
  setTab,
}: {
  children: ReactNode;
  form: BlogForm;
  setForm: React.Dispatch<React.SetStateAction<BlogForm>>;
  tab: Tab;
  setTab: (tab: Tab) => void;
}) {
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const blogId = searchParams.get("id");

  useEffect(() => {
    if (isEditMode && blogId) {
      // Mock API call to fetch blog data
      const blog = DUMMY_BLOGS.find((b) => b.id === blogId);
      if (blog) {
        setForm({
          title: blog.title,
          slug: blog.slug,
          metaTitle: "", // Mocking meta data
          metaDescription: blog.excerpt,
          featuredImage: blog.featuredImage,
          content: "Mock content for editing...",
          faqs: [],
          status: blog.status,
          scheduledAt: "",
        });
      }
    }
  }, [isEditMode, blogId, setForm]);

  function set(key: keyof BlogForm, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const metaComplete = !!(form.title && form.metaDescription);
  const contentComplete = !!form.content;

  return (
    <BlogContext.Provider
      value={{
        form,
        set,
        tab,
        setTab,
        metaComplete,
        contentComplete,
        isEditMode,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
}

export function useBlog() {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error("useBlog must be used within a BlogProvider");
  }
  return context;
}

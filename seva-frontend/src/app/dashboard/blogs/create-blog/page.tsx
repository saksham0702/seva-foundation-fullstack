"use client";

import { CmsProvider } from "@/app/dashboard/cms/CmsProvider";
import { CmsEditorLayout } from "@/app/dashboard/cms/components/CmsEditorLayout";

export default function CreateBlogPage() {
  return (
    <CmsProvider contentType="blog">
      <CmsEditorLayout />
    </CmsProvider>
  );
}
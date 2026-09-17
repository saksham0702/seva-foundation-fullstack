"use client";

import { CmsProvider } from "@/app/dashboard/cms/CmsProvider";
import { CmsListPageLayout } from "@/app/dashboard/cms/components/CmsListPageLayout";

export default function BlogsPage() {
  return (
    <CmsProvider contentType="blog">
      <CmsListPageLayout />
    </CmsProvider>
  );
}
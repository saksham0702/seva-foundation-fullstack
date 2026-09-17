"use client";

import { CmsProvider } from "@/app/dashboard/cms/CmsProvider";
import { CmsListPageLayout } from "@/app/dashboard/cms/components/CmsListPageLayout";

export default function NewsPage() {
  return (
    <CmsProvider contentType="news">
      <CmsListPageLayout />
    </CmsProvider>
  );
}

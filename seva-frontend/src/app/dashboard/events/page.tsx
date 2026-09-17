"use client";

import { CmsProvider } from "@/app/dashboard/cms/CmsProvider";
import { CmsListPageLayout } from "@/app/dashboard/cms/components/CmsListPageLayout";

export default function EventsPage() {
  return (
    <CmsProvider contentType="event">
      <CmsListPageLayout />
    </CmsProvider>
  );
}

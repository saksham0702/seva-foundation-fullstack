"use client";

import { useEffect } from "react";
import { recordEntityView, TrackEntityType } from "@/app/api/analytics";

interface ViewTrackerProps {
  entityType?: string;
  entityId?: string;
}

export function ViewTracker({ entityType, entityId }: ViewTrackerProps) {
  useEffect(() => {
    if (entityType && entityId) {
      recordEntityView(entityType as TrackEntityType, entityId);
    }
  }, [entityType, entityId]);

  return null;
}

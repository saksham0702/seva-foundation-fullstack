import axiosInstance from "./index";
import { endpoint } from "./endpoints";

export type TrackEntityType = "campaign" | "blog" | "news" | "event";

export interface RecordViewResponse {
  success: boolean;
  counted: boolean;
  viewsCount?: number;
  message?: string;
}

export const recordEntityView = async (
  entityType: TrackEntityType,
  entityId: string
): Promise<RecordViewResponse> => {
  try {
    const response = await axiosInstance.post(endpoint.analytics.recordView, {
      entityType,
      entityId,
    });
    return response.data || { success: true, counted: false };
  } catch (error) {
    // Fail silently so view tracking never blocks UX
    console.debug("[Analytics] Failed to record view:", error);
    return { success: false, counted: false };
  }
};

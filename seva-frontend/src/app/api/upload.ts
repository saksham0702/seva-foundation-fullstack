import axiosInstance from "./index";
import { endpoint } from "./endpoints";
import { getImageUrl } from "@/lib/image";

export async function uploadEditorImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await axiosInstance.post(endpoint.upload.editor, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const rawUrl = res.data?.data?.url || res.data?.url;
  if (!rawUrl) {
    throw new Error(res.data?.message || "Failed to upload image");
  }

  return getImageUrl(rawUrl);
}
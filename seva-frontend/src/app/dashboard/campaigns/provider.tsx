import { useState, useMemo, useCallback } from "react";
import { CampaignForm, initialCampaignForm } from "./utils";
import { useToast } from "@/lib/toast";
import { extractErrorMessage } from "@/lib/api-error";
import { useRouter } from "next/navigation";
import generateContext from "@/lib/generateContext";
import { createCampaign, updateCampaign, type Campaign } from "@/app/api/campaign";

function toDateInputValue(val: unknown): string {
  if (!val) return "";
  if (typeof val === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const match = val.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split("T")[0];
    }
  }
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString().split("T")[0];
  }
  return "";
}

const useProvider = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CampaignForm>(initialCampaignForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();
  const router = useRouter();

  function set(key: keyof CampaignForm, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const populateFromCampaign = useCallback((campaign: Campaign) => {
    let parsedContent: Record<string, unknown> = {};
    try {
      parsedContent = JSON.parse(campaign.content || "{}");
    } catch {}

    const categoryId =
      typeof campaign.category === "object" && campaign.category
        ? (campaign.category as { _id?: string })._id || ""
        : (campaign.category as string) || "";

    const rawGoal =
      parsedContent.goal !== undefined && parsedContent.goal !== null && parsedContent.goal !== ""
        ? String(parsedContent.goal)
        : campaign.goal !== undefined && campaign.goal !== null
        ? String(campaign.goal)
        : "";

    const rawStartDate = parsedContent.startDate || campaign.startDate;
    const rawEndDate = parsedContent.endDate || campaign.endDate;

    setForm({
      title: campaign.name || "",
      slug: campaign.slug || "",
      metaTitle: (parsedContent.metaTitle as string) || "",
      metaDescription: (parsedContent.metaDescription as string) || "",
      category: categoryId,
      image: campaign.images?.[0] || null,
      goal: rawGoal,
      startDate: toDateInputValue(rawStartDate),
      endDate: toDateInputValue(rawEndDate),
      minDonation: String(parsedContent.minDonation || "500"),
      allowRecurring: Boolean(parsedContent.allowRecurring),
      products: Array.isArray(parsedContent.products) ? parsedContent.products : [],
      gatewayCharges: String(parsedContent.gatewayCharges || "0"),
      youtubeUrl: (parsedContent.youtubeUrl as string) || "",
      description: campaign.description || "",
      faqs: Array.isArray(parsedContent.faqs) ? parsedContent.faqs : [],
    });
  }, []);

  const buildPayload = useCallback((targetStatus?: "draft" | "active") => {
    const formData = new FormData();

    formData.append("name", form.title);
    formData.append("slug", form.slug);
    formData.append("description", form.description);

    if (targetStatus) {
      formData.append("status", targetStatus);
    }

    formData.append(
      "content",
      JSON.stringify({
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        goal: form.goal,
        startDate: form.startDate,
        endDate: form.endDate,
        minDonation: form.minDonation,
        allowRecurring: form.allowRecurring,
        products: form.products,
        gatewayCharges: form.gatewayCharges,
        youtubeUrl: form.youtubeUrl,
        faqs: form.faqs,
      })
    );

    formData.append("location", "India");
    formData.append("category", form.category);

    if (form.image instanceof File) {
      formData.append("images", form.image);
    } else if (typeof form.image === "string" && form.image) {
      formData.append("images", form.image);
    }

    return formData;
  }, [form]);

  const handleDraft = useCallback(async () => {
    setIsSubmitting(true);
    const payload = buildPayload("draft");
    try {
      if (editId) {
        await updateCampaign(editId, payload);
        toast.success("Campaign updated as draft!");
      } else {
        await createCampaign(payload);
        toast.success("Campaign saved as draft!");
      }
      router.push("/dashboard/campaigns");
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, "Failed to save draft."));
    } finally {
      setIsSubmitting(false);
    }
  }, [buildPayload, editId, router, toast]);

  const handlePublish = useCallback(async () => {
    setIsSubmitting(true);
    const payload = buildPayload("active");
    try {
      if (editId) {
        await updateCampaign(editId, payload);
        toast.success("Campaign updated successfully!");
      } else {
        await createCampaign(payload);
        toast.success("Campaign published successfully!");
      }
      router.push("/dashboard/campaigns");
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, "Failed to publish campaign."));
    } finally {
      setIsSubmitting(false);
    }
  }, [buildPayload, editId, router, toast]);

  return useMemo(() => {
    return {
      form,
      setForm,
      set,
      step,
      setStep,
      editId,
      setEditId,
      isEditing: Boolean(editId),
      populateFromCampaign,
      handleDraft,
      handlePublish,
      isSubmitting,
    };
  }, [form, step, editId, isSubmitting, populateFromCampaign, handleDraft, handlePublish]);
};

export const [PageProvider, usePageProvider] = generateContext(useProvider);

// Export backward-compatible alias
export const useCampaign = usePageProvider;


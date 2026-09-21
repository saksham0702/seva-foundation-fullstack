import type { Campaign } from "@/app/api/campaign";
import type { Donation } from "@/app/api/donation";
import type { CampaignCardData } from "@/components/shared/CampaignCard";
import { getPlaceholderImage } from "@/lib/placeholder";

/**
 * Donation.campaign / Donation.donor can come back either as a raw
 * ObjectId string or a populated object depending on the endpoint.
 * This normalizes both.
 */
export function getEntityId(
  value: string | { _id: string } | null | undefined
): string {
  if (!value) return "";
  return typeof value === "string" ? value : value._id || "";
}

export interface CampaignStats {
  raised: number;
  donorsCount: number;
}

/**
 * Computes "raised amount" and "unique paying donors" for a campaign
 * using ONLY getDonations() — there is no dedicated stats endpoint,
 * and none is invented here. This filters client-side.
 *
 * Only counts donations with paymentStatus === "SUCCESS".
 */
export function computeCampaignStats(
  campaignId: string,
  donations: Donation[]
): CampaignStats {
  if (!campaignId || !Array.isArray(donations)) {
    return { raised: 0, donorsCount: 0 };
  }

  const successful = donations.filter(
    (d) =>
      d &&
      getEntityId(d.campaign) === campaignId &&
      d.paymentStatus === "SUCCESS"
  );

  const raised = successful.reduce((sum, d) => sum + (d.amount || 0), 0);

  const donorIds = new Set(
    successful.map((d) => getEntityId(d.donor)).filter(Boolean)
  );

  return { raised, donorsCount: donorIds.size };
}

/**
 * Adapts a real Campaign (+ its computed stats) into the exact
 * CampaignCardData shape defined in components/shared/CampaignCard.tsx.
 *
 * IMPORTANT — fields NOT present on the real Campaign API type:
 *   - goal        → no source anywhere yet. Defaults to 0 below, so the
 *                    progress bar/% will show as 0% until this exists.
 *   - daysLeft    → no deadline field on Campaign. Defaults to 0
 *                    ("Completed" is shown by the card in that case).
 *   - urgent      → no flag on Campaign. Defaults to false.
 *   - status      → no field on Campaign. Defaults to "active".
 *
 * raised / donors ARE real, computed from getDonations().
 *
 * Once you add a `goal` (and optionally `endsAt`/`urgent`) field on the
 * backend Campaign model, replace the defaults below — do not guess a
 * fake number for goal, since it directly drives the progress bar %.
 */
export function toCampaignCardData(
  campaign: Campaign,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _donations?: Donation[]
): CampaignCardData {
  const categoryName =
    typeof campaign.category === "string"
      ? campaign.category
      : (campaign.category as { name?: string } | undefined)?.name ||
        "General";

  let parsedContent: Record<string, unknown> = {};
  try {
    parsedContent = JSON.parse(campaign.content || "{}");
  } catch {}

  // Use DB goal field first (set on create/update), fallback to parsed content
  const goal = campaign.goal > 0 ? campaign.goal : (Number(parsedContent.goal) || 0);

  let daysLeft = 0;
  const endDateSrc = campaign.endDate || parsedContent.endDate;
  if (endDateSrc) {
    const end = new Date(endDateSrc as string).getTime();
    const now = Date.now();
    daysLeft = Math.max(0, Math.ceil((end - now) / 86400000));
  }

  const image =
    typeof campaign.images?.[0] === "string" && campaign.images[0].trim()
      ? campaign.images[0]
      : getPlaceholderImage(campaign._id);

  // Use authoritative DB fields — these are updated on every successful payment
  const raised = campaign.raisedAmount ?? 0;
  const donors = campaign.donorCount ?? 0;
  const productsCount = Array.isArray(parsedContent.products)
    ? parsedContent.products.length
    : 0;

  return {
    _id: campaign._id,
    slug: campaign.slug,
    name: campaign.name,
    image,
    category: categoryName,
    goal,
    raised,
    donors,
    daysLeft,
    status: campaign.status || "active",
    urgent: campaign.urgent ?? false,
    productsCount,
  };
}
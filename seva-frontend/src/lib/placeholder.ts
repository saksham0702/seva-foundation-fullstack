/**
 * TEMPORARY placeholder image helper.
 *
 * Use this only when a campaign has no real uploaded image yet
 * (campaign.images is empty). Once campaigns have real images this
 * function should just stop being called — nothing else depends on it.
 *
 * Seeded by an id/slug so the SAME campaign always gets the SAME
 * placeholder image (no flicker/reshuffling on every render).
 */
export function getPlaceholderImage(
  seed: string,
  width = 800,
  height = 600
): string {
  const safeSeed = encodeURIComponent(seed || "campaign");
  return `https://picsum.photos/seed/${safeSeed}/${width}/${height}`;
}
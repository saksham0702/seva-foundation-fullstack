// lib/prose.ts

/**
 * Shared class string for rendering Tiptap-generated HTML (blog/news/event content).
 * Explicit [&_tag] overrides so this works regardless of whether
 * @tailwindcss/typography is installed/configured correctly.
 *
 * accentColor: hex/CSS color used for links + blockquote accent
 * headingColor: hex/CSS color used for h2/h3
 */
export function richProseClass() {
  return [
    "prose prose-slate max-w-none text-[15px] leading-relaxed text-gray-600",
    "[&_p]:mb-4 [&_p]:leading-relaxed",

    "[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-9 [&_h2]:mb-3 [&_h2]:leading-snug [&_h2]:text-[color:var(--heading)]",
    "[&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:leading-snug [&_h3]:text-[color:var(--heading)]",

    "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ul]:space-y-1.5 [&_ul]:marker:text-[color:var(--accent)]",
    "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_ol]:space-y-1.5 [&_ol]:marker:text-[color:var(--accent)] [&_ol]:marker:font-semibold",
    "[&_li]:pl-1",

    "[&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-2 [&_a]:text-[color:var(--accent)] hover:[&_a]:opacity-80",

    "[&_img]:rounded-2xl [&_img]:shadow-md [&_img]:my-6 [&_img]:mx-auto [&_img]:block",
    "[&_img]:max-h-[440px] [&_img]:w-auto [&_img]:max-w-full [&_img]:object-cover",

    "[&_blockquote]:border-l-4 [&_blockquote]:border-[color:var(--accent)] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-500 [&_blockquote]:my-5",
    "[&_hr]:my-8 [&_hr]:border-gray-200",

    "[&_strong]:text-gray-800 [&_strong]:font-bold",
  ].join(" ");
}
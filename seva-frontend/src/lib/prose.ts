// lib/prose.ts

/**
 * Shared class string for rendering Tiptap-generated HTML (campaign / blog / news / event content).
 * Explicit [&_tag] overrides so this works regardless of whether
 * @tailwindcss/typography is installed/configured correctly.
 *
 * Uses CSS variables --accent and --heading with robust defaults:
 * - --heading: defaults to #0f2347 (deep navy)
 * - --accent: defaults to #E8542A (brand orange)
 */
export function richProseClass() {
  return [
    "prose prose-slate max-w-none text-[15px] leading-relaxed text-gray-700",

    // Paragraphs & Gaps
    "[&_p]:mb-4 [&_p]:leading-relaxed last:[&_p]:mb-0",

    // Headings
    "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-3 [&_h1]:leading-tight [&_h1]:text-[color:var(--heading,#0f2347)]",
    "[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:leading-snug [&_h2]:text-[color:var(--heading,#0f2347)]",
    "[&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:leading-snug [&_h3]:text-[color:var(--heading,#0f2347)]",
    "[&_h4]:text-lg [&_h4]:font-semibold [&_h4]:mt-4 [&_h4]:mb-2 [&_h4]:leading-snug [&_h4]:text-[color:var(--heading,#0f2347)]",

    // Lists (Unordered & Ordered)
    "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ul]:space-y-2 [&_ul]:marker:text-[color:var(--accent,#E8542A)]",
    "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_ol]:space-y-2 [&_ol]:marker:text-[color:var(--accent,#E8542A)] [&_ol]:marker:font-semibold",
    "[&_li]:pl-1.5 [&_li]:leading-relaxed [&_li]:text-gray-700",
    "[&_li>p]:my-0 [&_li>p]:leading-relaxed",

    // Nested Lists
    "[&_ul_ul]:list-[circle] [&_ul_ul]:pl-5 [&_ul_ul]:my-1.5",
    "[&_ol_ol]:list-[lower-alpha] [&_ol_ol]:pl-5 [&_ol_ol]:my-1.5",
    "[&_ul_ol]:list-decimal [&_ul_ol]:pl-5 [&_ul_ol]:my-1.5",
    "[&_ol_ul]:list-disc [&_ol_ul]:pl-5 [&_ol_ul]:my-1.5",

    // Inline formatting: Bold, Italic, Underline, Strikethrough
    "[&_strong]:text-gray-900 [&_strong]:font-bold [&_b]:text-gray-900 [&_b]:font-bold",
    "[&_em]:italic [&_i]:italic",
    "[&_u]:underline [&_u]:underline-offset-4 [&_u]:decoration-1 [&_u]:decoration-[color:var(--accent,#E8542A)]/60",
    "[&_s]:line-through [&_s]:text-gray-400 [&_del]:line-through [&_del]:text-gray-400 [&_strike]:line-through [&_strike]:text-gray-400",

    // Text Alignment (TipTap support)
    "[&_.has-text-align-center]:text-center [&_.has-text-align-right]:text-right [&_.has-text-align-left]:text-left [&_.has-text-align-justify]:text-justify",

    // Links
    "[&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-2 [&_a]:decoration-[color:var(--accent,#E8542A)]/40 hover:[&_a]:decoration-[color:var(--accent,#E8542A)] [&_a]:text-[color:var(--accent,#E8542A)] hover:[&_a]:opacity-85 transition-colors",

    // Images
    "[&_img]:rounded-2xl [&_img]:shadow-md [&_img]:my-6 [&_img]:mx-auto [&_img]:block",
    "[&_img]:max-h-[520px] [&_img]:w-auto [&_img]:max-w-full [&_img]:object-cover",

    // Blockquotes
    "[&_blockquote]:border-l-4 [&_blockquote]:border-[color:var(--accent,#E8542A)] [&_blockquote]:pl-4 [&_blockquote]:py-2.5 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:bg-orange-50/40 [&_blockquote]:rounded-r-xl [&_blockquote]:my-5 [&_blockquote_p]:mb-0",

    // Horizontal Rule
    "[&_hr]:my-8 [&_hr]:border-t [&_hr]:border-gray-200",

    // Code & Pre
    "[&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-gray-100 [&_code]:text-red-600 [&_code]:text-xs [&_code]:font-mono",
    "[&_pre]:bg-gray-900 [&_pre]:text-gray-100 [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:text-xs [&_pre]:my-4 [&_pre]:font-mono",
  ].join(" ");
}
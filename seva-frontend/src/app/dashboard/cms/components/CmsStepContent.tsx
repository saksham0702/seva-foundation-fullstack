"use client";

import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { RichTextEditor } from "@/components/dashboard/richtexteditor/RichTextEditor";
import { Field, inputCls } from "@/components/dashboard/field/Field";
import { useCms } from "../CmsProvider";
import { CmsFAQ } from "@/types/cms";

export function CmsStepContent() {
  const { form, set, contentType } = useCms();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function addFaq() {
    const updated = [...form.faqs, { question: "", answer: "" }];
    set("faqs", updated);
    setOpenFaq(updated.length - 1);
  }

  function removeFaq(i: number) {
    set("faqs", form.faqs.filter((_, idx) => idx !== i));
    if (openFaq === i) setOpenFaq(null);
  }

  function updateFaq(i: number, key: keyof CmsFAQ, value: string) {
    set(
      "faqs",
      form.faqs.map((f, idx) => (idx === i ? { ...f, [key]: value } : f))
    );
  }

  const typeLabel = contentType === "blog" ? "Post" : contentType === "news" ? "News Article" : "Event Description";

  return (
    <div className="space-y-7">
      {/* Rich Text Editor */}
      <Field
        label={`${typeLabel} Content`}
        required
        hint="Write your full content here. Use the toolbar to add headings, lists, links, and formatted text."
      >
        <RichTextEditor
          value={form.content}
          onChange={(val) => set("content", val)}
          placeholder={`Start writing your ${typeLabel.toLowerCase()} content…`}
        />
      </Field>

      {/* FAQ Builder */}
      <div className="border-t border-border pt-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-white uppercase tracking-wider">
              Frequently Asked Questions (FAQs)
            </p>
            <p className="text-[11px] text-muted mt-0.5">
              Add FAQs shown at the bottom of the page and structured schema data.
            </p>
          </div>
          <button
            type="button"
            onClick={addFaq}
            className="flex items-center gap-1.5 text-xs font-semibold text-gold hover:text-gold-light border border-gold/20 hover:border-gold/40 bg-gold/10 hover:bg-gold/20 px-3 py-1.5 rounded-lg transition-all"
          >
            <Plus size={12} /> Add FAQ
          </button>
        </div>

        {form.faqs.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl px-4 py-8 text-center bg-bg/50">
            <p className="text-xs text-muted">No FAQs added yet.</p>
            <p className="text-[11px] text-muted/50 mt-1">
              FAQs help answer user questions directly on the page.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {form.faqs.map((faq, i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden bg-bg">
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition-all select-none overflow-hidden"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-medium text-white max-w-md flex-1 min-w-0 mr-3">
                    {faq.question || <span className="text-muted italic">Question {i + 1}</span>}
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFaq(i);
                      }}
                      className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                    {openFaq === i ? (
                      <ChevronUp size={14} className="text-muted" />
                    ) : (
                      <ChevronDown size={14} className="text-muted" />
                    )}
                  </div>
                </div>

                {openFaq === i && (
                  <div className="px-4 pb-4 pt-3 border-t border-border space-y-3">
                    <Field label="Question" required>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFaq(i, "question", e.target.value)}
                        placeholder="e.g. How do I register or participate?"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Answer" required>
                      <textarea
                        value={faq.answer}
                        onChange={(e) => updateFaq(i, "answer", e.target.value)}
                        placeholder="Provide a clear, concise answer..."
                        rows={3}
                        className={inputCls + " resize-none"}
                      />
                    </Field>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

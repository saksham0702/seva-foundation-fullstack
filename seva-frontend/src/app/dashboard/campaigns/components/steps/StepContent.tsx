"use client";

import {
  ChevronLeft,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { RichTextEditor } from "@/components/dashboard/richtexteditor/RichTextEditor";
import { Field, inputCls } from "@/components/dashboard/field/Field";
import { useCampaign } from "../../provider";
import { type FAQ } from "../../utils";
import { useState } from "react";

export function StepContent() {
  const {
    form,
    set,
    setStep,
    handleDraft,
    handlePublish,
    isSubmitting,
    isEditing,
  } = useCampaign();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function addFaq() {
    const updated = [...form.faqs, { question: "", answer: "" }];
    set("faqs", updated);
    setOpenFaq(updated.length - 1);
  }

  function removeFaq(i: number) {
    set(
      "faqs",
      form.faqs.filter((_, idx) => idx !== i),
    );
    setOpenFaq(null);
  }

  function updateFaq(i: number, key: keyof FAQ, value: string) {
    set(
      "faqs",
      form.faqs.map((f, idx) => (idx === i ? { ...f, [key]: value } : f)),
    );
  }

  const canPublish = !!form.description && !isSubmitting;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black text-text-primary mb-8">Content & FAQs</h2>

      {/* Rich Text Editor */}
      <Field
        label="Campaign Description"
        required
        hint="Describe who it helps, how funds are used. Supports rich formatting and images."
      >
        <RichTextEditor
          value={form.description}
          onChange={(val) => set("description", val)}
          placeholder="Describe the campaign, who it helps, and how funds will be used..."
        />
      </Field>

      {/* FAQs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              FAQs
            </p>
            <p className="text-[11px] text-faint mt-0.5">
              Common questions donors may have
            </p>
          </div>
          <button
            type="button"
            onClick={addFaq}
            className="flex items-center gap-2 text-xs font-bold text-text-primary border border-border hover:border-blueaccent/60 bg-panel px-4 py-2 rounded-xl transition-all"
          >
            <Plus size={14} /> Add FAQ
          </button>
        </div>

        {form.faqs.length === 0 ? (
          <div className="border border-dashed border-border rounded-lg px-4 py-6 text-center text-xs text-muted">
            No FAQs yet. Click &ldquo;Add FAQ&rdquo; to help donors understand
            your campaign.
          </div>
        ) : (
          <div className="space-y-2">
            {form.faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-border rounded-lg overflow-hidden bg-panel"
              >
                {/* FAQ Header */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-bg transition-all"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-bold text-text-primary truncate flex-1 mr-3">
                    {faq.question || (
                      <span className="text-faint font-medium italic">
                        Question {i + 1}
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFaq(i);
                      }}
                      className="p-1 rounded text-red-400 hover:bg-red-50 transition-all"
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

                {/* FAQ Body */}
                {openFaq === i && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                    <Field label="Question" required>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) =>
                          updateFaq(i, "question", e.target.value)
                        }
                        placeholder="e.g. How will the funds be used?"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Answer" required>
                      <textarea
                        value={faq.answer}
                        onChange={(e) => updateFaq(i, "answer", e.target.value)}
                        placeholder="Provide a clear, honest answer..."
                        rows={4}
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

      {/* Actions */}
      <div className="flex gap-4 pt-6 border-t border-border mt-10">
        <button
          type="button"
          onClick={() => setStep(2)}
          disabled={isSubmitting}
          className="flex items-center gap-2 border border-border text-muted text-sm font-bold px-6 py-3 rounded-xl hover:bg-panel transition-all disabled:opacity-50"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          type="button"
          onClick={handleDraft}
          disabled={isSubmitting}
          className="border border-border text-text-primary text-sm font-bold px-6 py-3 rounded-xl hover:bg-panel transition-all ml-auto disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
          Save Draft
        </button>
        <button
          type="button"
          onClick={handlePublish}
          disabled={!canPublish}
          className="bg-blueaccent hover:bg-blue-dark disabled:bg-panel disabled:text-faint text-white text-sm font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-blueaccent/20 flex items-center gap-2"
        >
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
          {isEditing ? "Update Campaign" : "Publish Campaign"}
        </button>
      </div>
    </div>
  );
}

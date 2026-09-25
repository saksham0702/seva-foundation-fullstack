"use client";

import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  ImageIcon,
  Undo,
  Redo,
  Minus,
  Loader2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { uploadEditorImage } from "@/app/api/upload";
import { useToast } from "@/lib/toast";
import { extractErrorMessage } from "@/lib/api-error";

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  hideImageUpload?: boolean;
}

/* ---------- Resizable image NodeView ---------- */

function ImageResizeComponent({ node, updateAttributes, selected }: any) {
  const { src, alt, title, width, height } = node.attrs;
  const imgRef = useRef<HTMLImageElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  const startResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!imgRef.current) return;

      setIsResizing(true);
      const startX = e.clientX;
      const startWidth = imgRef.current.offsetWidth;
      const aspect = imgRef.current.naturalWidth
        ? imgRef.current.naturalHeight / imgRef.current.naturalWidth
        : 0;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - startX;
        const newWidth = Math.max(60, Math.round(startWidth + delta));
        updateAttributes({
          width: newWidth,
          height: aspect ? Math.round(newWidth * aspect) : null,
        });
      };

      const onMouseUp = () => {
        setIsResizing(false);
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [updateAttributes]
  );

  return (
    <NodeViewWrapper
      as="span"
      className="relative inline-block align-bottom my-3"
      style={{ width: width ? `${width}px` : "auto", lineHeight: 0 }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        title={title}
        draggable={false}
        style={{
          width: width ? `${width}px` : "100%",
          height: height ? `${height}px` : "auto",
        }}
        className={`rounded-xl max-w-full transition-shadow ${selected ? "ring-2 ring-blue-400" : ""
          } ${isResizing ? "select-none" : ""}`}
      />
      {selected && (
        <span
          onMouseDown={startResize}
          className="absolute bottom-0 right-0 w-3.5 h-3.5 translate-x-1/2 translate-y-1/2 bg-blue-500 rounded-full border-2 border-white shadow cursor-nwse-resize"
          title="Drag to resize"
        />
      )}
    </NodeViewWrapper>
  );
}

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attributes) =>
          attributes.width ? { width: attributes.width } : {},
      },
      height: {
        default: null,
        renderHTML: (attributes) =>
          attributes.height ? { height: attributes.height } : {},
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageResizeComponent);
  },
});

/* ---------- Editor ---------- */

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  hideImageUpload = false,
}: RichTextEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const handleImageUpload = useCallback(
    async (file: File): Promise<string> => {
      setIsUploading(true);
      try {
        const url = await uploadEditorImage(file);
        toast.success("Image uploaded successfully!");
        return url;
      } catch (err) {
        toast.error(extractErrorMessage(err, "Failed to upload image."));
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [toast]
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      ResizableImage.configure({ inline: false, allowBase64: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-blue-600 underline font-medium decoration-blue-400 hover:text-blue-700",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Start writing...",
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[280px] px-4 py-3 focus:outline-none text-slate-800 " +
          "[&_img]:rounded-xl [&_img]:max-w-full [&_img]:my-3 " +
          "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-slate-900 " +
          "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-2 [&_h3]:text-slate-900 " +
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ul]:space-y-1 " +
          "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_ol]:space-y-1 " +
          "[&_li]:my-0.5 " +
          "[&_a]:text-blue-600 [&_a]:underline [&_a]:font-medium hover:[&_a]:text-blue-700",
      },
    },
  });

  // Sync external value changes when not focused
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  // Handle paste & drop of image files
  useEffect(() => {
    const el = dropzoneRef.current;
    if (!el || !editor) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files || []);
      const images = files.filter((f) => f.type.startsWith("image/"));
      if (!images.length) return;

      e.preventDefault();
      for (const file of images) {
        try {
          const url = await handleImageUpload(file);
          editor.chain().focus().setImage({ src: url }).run();
        } catch {
          // Toast handled in handleImageUpload
        }
      }
    };

    const handleDrop = async (e: DragEvent) => {
      const files = Array.from(e.dataTransfer?.files || []);
      const images = files.filter((f) => f.type.startsWith("image/"));
      if (!images.length) return;

      e.preventDefault();
      for (const file of images) {
        try {
          const url = await handleImageUpload(file);
          editor.chain().focus().setImage({ src: url }).run();
        } catch {
          // Toast handled in handleImageUpload
        }
      }
    };

    el.addEventListener("paste", handlePaste);
    el.addEventListener("drop", handleDrop);

    return () => {
      el.removeEventListener("paste", handlePaste);
      el.removeEventListener("drop", handleDrop);
    };
  }, [editor, handleImageUpload]);

  const insertImageUrl = useCallback(() => {
    const url = window.prompt("Enter image URL:");
    if (url?.trim() && editor) {
      editor.chain().focus().setImage({ src: url.trim() }).run();
    }
  }, [editor]);

  const insertImageFile = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !editor) return;
      try {
        const url = await handleImageUpload(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch {
        // Handled
      }
    };
    input.click();
  }, [editor, handleImageUpload]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter URL:");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const btn = (active: boolean, disabled = false) =>
    `p-1.5 rounded transition-all text-xs ${active
      ? "bg-slate-100 text-slate-800"
      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`;

  return (
    <div className="border border-slate-200 dark:border-border rounded-xl bg-white dark:bg-panel relative">
      {/* Sticky Fixed Toolbar */}
      <div className="sticky top-0 z-30 flex flex-wrap items-center gap-0.5 px-3 py-2.5 border-b border-slate-200 dark:border-border bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md rounded-t-xl shadow-xs">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className={btn(false)}
          title="Undo"
        >
          <Undo size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className={btn(false)}
          title="Redo"
        >
          <Redo size={14} />
        </button>
        <div className="w-px h-4 bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={btn(editor.isActive("paragraph"))}
          title="Paragraph / Normal Text"
        >
          <Pilcrow size={14} />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={btn(editor.isActive("heading", { level: 2 }))}
          title="Heading 2"
        >
          <Heading2 size={14} />
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={btn(editor.isActive("heading", { level: 3 }))}
          title="Heading 3"
        >
          <Heading3 size={14} />
        </button>
        <div className="w-px h-4 bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btn(editor.isActive("bold"))}
          title="Bold"
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btn(editor.isActive("italic"))}
          title="Italic"
        >
          <Italic size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btn(editor.isActive("underline"))}
          title="Underline"
        >
          <UnderlineIcon size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={btn(editor.isActive("strike"))}
          title="Strikethrough"
        >
          <Strikethrough size={14} />
        </button>
        <div className="w-px h-4 bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={btn(editor.isActive({ textAlign: "left" }))}
          title="Align Left"
        >
          <AlignLeft size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={btn(editor.isActive({ textAlign: "center" }))}
          title="Center"
        >
          <AlignCenter size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={btn(editor.isActive({ textAlign: "right" }))}
          title="Align Right"
        >
          <AlignRight size={14} />
        </button>
        <div className="w-px h-4 bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btn(editor.isActive("bulletList"))}
          title="Bullet List"
        >
          <List size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btn(editor.isActive("orderedList"))}
          title="Ordered List"
        >
          <ListOrdered size={14} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={btn(false)}
          title="Divider"
        >
          <Minus size={14} />
        </button>
        <div className="w-px h-4 bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={setLink}
          className={btn(editor.isActive("link"))}
          title="Insert Link"
        >
          <LinkIcon size={14} />
        </button>

        {!hideImageUpload && (
          <>
            <button
              type="button"
              onClick={insertImageFile}
              disabled={isUploading}
              className={btn(false, isUploading)}
              title="Upload Image"
            >
              {isUploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ImageIcon size={14} />
              )}
            </button>

            <button
              type="button"
              onClick={insertImageUrl}
              className={`${btn(false)} text-[10px] font-semibold px-2`}
              title="Image from URL"
            >
              IMG URL
            </button>
          </>
        )}
      </div>

      {/* Editor area with upload overlay */}
      <div ref={dropzoneRef} className="relative">
        {isUploading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Loader2 size={14} className="animate-spin" />
              Uploading image...
            </div>
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
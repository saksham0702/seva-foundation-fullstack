import React from "react";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteConfirmModalProps {
  target: {
    type: "category" | "application";
    id: string;
    title: string;
  } | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  target,
  isDeleting,
  onCancel,
  onConfirm,
}) => {
  if (!target) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-auto">
        <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <Trash2 size={20} />
        </div>
        <h3 className="font-bold text-center text-slate-900 text-base mb-1">
          Confirm Deletion
        </h3>
        <p className="text-xs text-center text-slate-500 leading-relaxed mb-5">
          Are you sure you want to delete{" "}
          <span className="font-bold text-slate-800">&ldquo;{target.title}&rdquo;</span>
          ? This action cannot be undone.
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onCancel}
            className="py-2 px-3 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5 shadow-sm"
          >
            {isDeleting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Yes, Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

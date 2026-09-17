"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, PenLine, Trash2, Loader2, CheckCircle2, X } from "lucide-react";
import PageHeader from "@/components/dashboard/certificates/PageHeader";
import {
  getActiveSignatures,
  getAllSignatures,
  uploadSignature,
  deleteSignature,
  Signature,
  SignatureType,
  ActiveSignatures,
} from "@/app/api/signature";

// ─── Upload Modal ─────────────────────────────────────────────────────────────

function UploadModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [type, setType] = useState<SignatureType>("PRESIDENT");
  const [label, setLabel] = useState("");
  const [signatoryName, setSignatoryName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("Please select an image file"); return; }
    if (!label.trim()) { setError("Label is required"); return; }
    setLoading(true);
    setError(null);
    try {
      await uploadSignature(type, label.trim(), file, signatoryName.trim() || undefined);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-faint focus:outline-none focus:border-blueaccent transition-colors";

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="panel p-6 w-full max-w-md relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-faint hover:text-text-primary"
          >
            <X size={18} />
          </button>
          <p className="font-display text-lg font-bold mb-5">Upload Signature</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="label-eyebrow block mb-2">
                Signature Type <span className="text-red-400">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as SignatureType)}
                className={inputCls}
              >
                <option value="PRESIDENT">President</option>
                <option value="SECRETARY">Secretary</option>
                <option value="SEAL">Seal / Stamp</option>
              </select>
            </div>

            <div>
              <label className="label-eyebrow block mb-2">
                Label <span className="text-red-400">*</span>
              </label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. President Signature"
                className={inputCls}
                required
              />
            </div>

            <div>
              <label className="label-eyebrow block mb-2">Signatory Name</label>
              <input
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
                placeholder="e.g. Dr. Kavita Rao"
                className={inputCls}
              />
            </div>

            <div>
              <label className="label-eyebrow block mb-2">
                Image File <span className="text-red-400">*</span>
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                className="border border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-blueaccent transition-colors"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="mx-auto max-h-24 object-contain"
                  />
                ) : (
                  <p className="text-sm text-faint">
                    Click to select image (PNG/SVG recommended)
                  </p>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blueaccent text-white text-sm font-semibold px-5 py-2.5 rounded-lg disabled:opacity-60"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Upload Signature
              </button>
              <button
                type="button"
                onClick={onClose}
                className="border border-border text-sm text-muted px-5 py-2.5 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ─── Signature Card ───────────────────────────────────────────────────────────

const TYPE_LABELS: Record<SignatureType, string> = {
  PRESIDENT: "President",
  SECRETARY: "Secretary",
  SEAL: "Seal / Stamp",
};

function SignatureCard({
  sig,
  isActive,
  apiBaseUrl,
  onDelete,
}: {
  sig: Signature;
  isActive: boolean;
  apiBaseUrl: string;
  onDelete: (id: string) => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete this ${TYPE_LABELS[sig.type]} signature?`)) return;
    setDeleting(true);
    await onDelete(sig._id);
    setDeleting(false);
  };

  return (
    <div className="panel p-5">
      {/* Signature image */}
      <div className="w-full h-20 rounded-lg bg-bg border border-border flex items-center justify-center mb-4 overflow-hidden">
        {sig.imageUrl ? (
          <img
            src={`${apiBaseUrl}${sig.imageUrl}`}
            alt={sig.label}
            className="max-h-full max-w-full object-contain p-1"
          />
        ) : (
          <PenLine size={20} className="text-faint" />
        )}
      </div>

      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold">{sig.label}</p>
        {isActive && (
          <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full">
            Active
          </span>
        )}
      </div>

      {sig.signatoryName && (
        <p className="text-xs text-faint mb-1">{sig.signatoryName}</p>
      )}
      <p className="text-xs text-muted mb-4">{TYPE_LABELS[sig.type]}</p>

      <div className="flex items-center justify-between text-xs text-muted border-t border-border pt-3">
        <span>
          {new Date(sig.createdAt || "").toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1 text-red-400 hover:text-red-300 disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Trash2 size={12} />
          )}
          Delete
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const API_BASE ="http://localhost:5000"


export default function DigitalSignaturesPage() {
  const [allSigs, setAllSigs] = useState<Signature[]>([]);
  const [active, setActive] = useState<ActiveSignatures>({
    president: null,
    secretary: null,
    seal: null,
  });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sigs, act] = await Promise.all([
        getAllSignatures(),
        getActiveSignatures(),
      ]);
      setAllSigs(sigs);
      setActive(act);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (id: string) => {
    await deleteSignature(id);
    await fetchAll();
  };

  const handleUploadSuccess = async () => {
    setModalOpen(false);
    setSuccessMsg("Signature uploaded — previous one of that type deactivated.");
    await fetchAll();
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const activeIds = new Set(
    [active.president, active.secretary, active.seal]
      .filter(Boolean)
      .map((s) => s!._id)
  );

  return (
    <div>
      <PageHeader
        title="Digital Signatures"
        subtitle="Manage authorized signatories for certificate issuance"
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-blueaccent text-white text-sm font-semibold px-4 py-2.5 rounded-lg"
          >
            <Plus size={15} /> Add Signature
          </button>
        }
      />

      {successMsg && (
        <div className="flex items-center gap-2 mb-5 bg-green-400/10 border border-green-400/20 text-green-400 text-sm px-4 py-3 rounded-xl">
          <CheckCircle2 size={15} />
          {successMsg}
        </div>
      )}

      {/* Active summary */}
      <div className="panel p-4 mb-6">
        <p className="label-eyebrow mb-3">Currently Active Signatures</p>
        <div className="grid grid-cols-3 gap-4">
          {(["president", "secretary", "seal"] as const).map((k) => {
            const sig = active[k];
            return (
              <div
                key={k}
                className="flex items-center gap-3 bg-bg rounded-lg border border-border px-3 py-2.5"
              >
                <div className="w-8 h-8 rounded-md bg-panel border border-border flex items-center justify-center overflow-hidden shrink-0">
                  {sig?.imageUrl ? (
                    <img
                      src={`${API_BASE}${sig.imageUrl}`}
                      alt=""
                      className="max-h-full object-contain"
                    />
                  ) : (
                    <PenLine size={14} className="text-faint" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold capitalize">{k}</p>
                  <p className="text-[10px] text-faint">
                    {sig ? sig.signatoryName || sig.label : "Not set"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All signatures grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-faint">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Loading signatures…</span>
        </div>
      ) : allSigs.length === 0 ? (
        <div className="panel p-10 text-center">
          <PenLine size={32} className="text-faint mx-auto mb-3" />
          <p className="text-sm text-muted">
            No signatures uploaded yet. Click{" "}
            <button
              onClick={() => setModalOpen(true)}
              className="text-blueaccent underline"
            >
              Add Signature
            </button>{" "}
            to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {allSigs.map((sig) => (
            <SignatureCard
              key={sig._id}
              sig={sig}
              isActive={activeIds.has(sig._id)}
              apiBaseUrl={API_BASE}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <UploadModal
          onClose={() => setModalOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}

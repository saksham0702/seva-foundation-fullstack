"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Images,
  Upload,
  X,
  Eye,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  FileImage,
  FolderOpen,
  Pencil,
} from "lucide-react";
import {
  GalleryItem,
  getAdminGallery,
  uploadGalleryImages,
  toggleGalleryStatus,
  deleteGalleryImage,
  updateGalleryItem,
} from "@/app/api/gallery";
import { getImageUrl } from "@/lib/image";
import { useToast } from "@/lib/toast";
import { PermissionGuard } from "@/components/dashboard/PermissionGuard";
import { Portal } from "@/components/shared/Portal";

const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024; // 3MB maximum per image

export default function GalleryDashboardPage() {
  const toast = useToast();

  // ── States ──
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(50); // 50 items per page
  const [total, setTotal] = useState(0);
  const [totalPage, setTotalPage] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  // Bulk Upload state (only image name & alt tag as requested)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ url: string; size: string; name: string }[]>([]);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadAlt, setUploadAlt] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit image modal state
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAlt, setEditAlt] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Lightbox preview
  const [lightboxImage, setLightboxImage] = useState<GalleryItem | null>(null);

  // Delete modal
  const [deletingItem, setDeletingItem] = useState<GalleryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toggle loading tracking
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // ── Load Gallery Items ──
  const fetchGallery = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAdminGallery({
        page,
        limit,
        status: statusFilter,
        search: activeSearch || undefined,
      });
      setImages(res.data);
      setTotal(res.meta.total);
      setTotalPage(res.meta.totalPage);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load gallery images");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, statusFilter, activeSearch, toast]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  // ── Search submit ──
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveSearch("");
    setPage(1);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // ── File Selection with 3MB Limit ──
  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    const newPreviews: { url: string; size: string; name: string }[] = [];
    const rejectedOverSize: string[] = [];
    const rejectedNotImage: string[] = [];

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        rejectedNotImage.push(file.name);
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        rejectedOverSize.push(`${file.name} (${formatFileSize(file.size)})`);
        return;
      }
      validFiles.push(file);
      newPreviews.push({
        url: URL.createObjectURL(file),
        size: formatFileSize(file.size),
        name: file.name,
      });
    });

    if (rejectedOverSize.length > 0) {
      toast.error(
        `${rejectedOverSize.length} image(s) exceed the 3MB limit: ${rejectedOverSize.slice(0, 3).join(", ")}${
          rejectedOverSize.length > 3 ? "..." : ""
        }`
      );
    }

    if (rejectedNotImage.length > 0) {
      toast.error(`${rejectedNotImage.length} non-image file(s) ignored.`);
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      setFilePreviews((prev) => [...prev, ...newPreviews]);
      toast.success(`${validFiles.length} image(s) added to upload staging.`);
    }
  };

  const handleRemoveSelectedFile = (index: number) => {
    URL.revokeObjectURL(filePreviews[index].url);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAllFiles = () => {
    filePreviews.forEach((item) => URL.revokeObjectURL(item.url));
    setSelectedFiles([]);
    setFilePreviews([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Total staging size
  const totalStagingBytes = selectedFiles.reduce((acc, f) => acc + f.size, 0);

  // ── Bulk Upload Action ──
  const handleBulkUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select images to upload.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });
      if (uploadTitle.trim()) formData.append("title", uploadTitle.trim());
      if (uploadAlt.trim()) formData.append("alt", uploadAlt.trim());

      await uploadGalleryImages(formData);
      toast.success(`Successfully uploaded ${selectedFiles.length} image(s) to gallery!`);
      handleClearAllFiles();
      setUploadTitle("");
      setUploadAlt("");
      fetchGallery();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to upload images.");
    } finally {
      setIsUploading(false);
    }
  };

  // ── Edit Image Action ──
  const handleStartEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setEditTitle(item.title || "");
    setEditAlt(item.alt || "");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setIsSavingEdit(true);
    try {
      const updated = await updateGalleryItem(editingItem._id, {
        title: editTitle.trim(),
        alt: editAlt.trim(),
      });
      setImages((prev) =>
        prev.map((img) =>
          img._id === editingItem._id
            ? { ...img, title: updated.title, alt: updated.alt }
            : img
        )
      );
      toast.success("Image details updated successfully!");
      setEditingItem(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update image details.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // ── Toggle Status ──
  const handleToggleStatus = async (item: GalleryItem) => {
    setTogglingId(item._id);
    try {
      const updated = await toggleGalleryStatus(item._id, !item.isActive);
      setImages((prev) =>
        prev.map((img) => (img._id === item._id ? { ...img, isActive: updated.isActive } : img))
      );
      toast.success(`Image visibility set to ${updated.isActive ? "Live" : "Inactive"}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update image visibility.");
    } finally {
      setTogglingId(null);
    }
  };

  // ── Delete Image ──
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await deleteGalleryImage(deletingItem._id);
      toast.success("Image removed from gallery.");
      setDeletingItem(null);
      fetchGallery();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete image.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PermissionGuard module="gallery">
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Gallery Management
            </h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Upload, organize, and curate photos for the public website gallery.
            </p>
          </div>

          <button
            onClick={fetchGallery}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-panel hover:bg-white/5 border border-border rounded-xl transition-all shadow-sm self-start sm:self-auto"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* ── KPI Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-panel rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider">Total Photos</p>
                <p className="text-2xl font-bold text-white mt-1">{total}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-border text-gold flex items-center justify-center">
                <Images size={20} />
              </div>
            </div>
          </div>

          <div className="bg-panel rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider">Live On Website</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  {images.filter((i) => i.isActive).length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
            </div>
          </div>

          <div className="bg-panel rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider">Hidden / Inactive</p>
                <p className="text-2xl font-bold text-faint mt-1">
                  {images.filter((i) => !i.isActive).length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-border text-faint flex items-center justify-center">
                <AlertCircle size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Bulk Uploader Card ── */}
        <div className="bg-panel rounded-xl border border-border p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Bulk Photo Uploader
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Select or drag multiple images (max 3MB per image, up to 50 at once)
              </p>
            </div>

            {selectedFiles.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllFiles}
                className="text-xs font-semibold text-muted hover:text-red-400 transition-colors"
              >
                Clear All ({selectedFiles.length})
              </button>
            )}
          </div>

          {/* Drag & Drop Target Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              handleFileChange(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragOver
                ? "border-gold bg-gold/5"
                : "border-border hover:border-gold/50 bg-navy/40 hover:bg-navy/60"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileChange(e.target.files)}
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              className="hidden"
            />
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gold/10 text-gold flex items-center justify-center border border-gold/20">
              <Upload size={22} />
            </div>
            <p className="text-sm font-semibold text-white">
              Click to browse or drop images here
            </p>
            <p className="text-xs text-muted mt-1">
              PNG, JPG, JPEG, WEBP, or SVG · Maximum 3MB per image
            </p>
          </div>

          {/* Staged Files Preview Grid */}
          {selectedFiles.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">
                  Staged Images: {selectedFiles.length} files ({formatFileSize(totalStagingBytes)})
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-gold hover:underline flex items-center gap-1"
                >
                  <FolderOpen size={13} />
                  Add More Files
                </button>
              </div>

              {/* Thumbnail Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-64 overflow-y-auto p-1">
                {filePreviews.map((preview, i) => (
                  <div
                    key={i}
                    className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-navy/80"
                  >
                    <img
                      src={preview.url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSelectedFile(i);
                      }}
                      className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-red-600 text-white rounded-md transition-colors"
                      title="Remove file"
                    >
                      <X size={12} />
                    </button>
                    <span className="absolute bottom-1 left-1 right-1 px-1 py-0.5 text-[9px] truncate bg-black/80 text-white rounded text-center">
                      {preview.size}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bulk Metadata Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">
                    Image Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Health camp in Tehri"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full text-xs font-medium px-3.5 py-2.5 bg-navy/60 text-white border border-border rounded-xl placeholder:text-muted/60 focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted mb-1.5">
                    Image Alt Tag (SEO & Accessibility)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Medical team providing free checkups"
                    value={uploadAlt}
                    onChange={(e) => setUploadAlt(e.target.value)}
                    className="w-full text-xs font-medium px-3.5 py-2.5 bg-navy/60 text-white border border-border rounded-xl placeholder:text-muted/60 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Upload Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleBulkUpload}
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gold hover:bg-gold-light text-navy text-xs font-bold rounded-xl transition-all shadow-md shadow-gold/10 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Uploading {selectedFiles.length} Images...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      <span>
                        Upload {selectedFiles.length} Images ({formatFileSize(totalStagingBytes)})
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Toolbar: Search & Status Filters ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-panel p-4 rounded-xl border border-border">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              placeholder="Search by image name or alt..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 text-xs bg-navy/60 text-white border border-border rounded-xl placeholder:text-muted/60 focus:outline-none focus:border-gold"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </form>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-navy/60 border border-border p-1 rounded-xl self-start sm:self-auto">
            {(
              [
                { key: "all", label: "All Photos" },
                { key: "active", label: "Live on Site" },
                { key: "inactive", label: "Inactive" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setStatusFilter(tab.key);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === tab.key
                    ? "bg-panel text-gold border border-gold/30 shadow-sm"
                    : "text-muted hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Gallery Images Grid (50 per page) ── */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="bg-panel rounded-xl border border-border overflow-hidden shadow-sm animate-pulse"
              >
                <div className="aspect-[4/3] bg-navy/80" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-2/3" />
                  <div className="h-2.5 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="bg-panel rounded-xl border border-border p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-border text-muted mx-auto mb-3 flex items-center justify-center">
              <FileImage size={24} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">
              No images found
            </h3>
            <p className="text-xs text-muted max-w-sm mx-auto mb-4">
              {activeSearch
                ? `No photos matched "${activeSearch}". Try clearing your search.`
                : "Upload photos using the bulk uploader above."}
            </p>
            {activeSearch && (
              <button
                onClick={handleClearSearch}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-lg transition-colors border border-border"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((item) => {
              const isLive = item.isActive;
              const fullUrl = getImageUrl(item.imageUrl);

              return (
                <div
                  key={item._id}
                  className="group bg-panel rounded-xl border border-border overflow-hidden shadow-sm hover:border-gold/40 transition-all duration-200 flex flex-col"
                >
                  {/* Image Thumbnail */}
                  <div className="relative aspect-[4/3] bg-navy/80 overflow-hidden">
                    <img
                      src={fullUrl}
                      alt={item.title || "Gallery"}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Status Tag on Top-Left */}
                    <div className="absolute top-2 left-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          isLive
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-black/70 text-muted backdrop-blur-sm border border-white/10"
                        }`}
                      >
                        {isLive ? "Live" : "Inactive"}
                      </span>
                    </div>

                    {/* Quick Hover Controls */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setLightboxImage(item)}
                        title="Preview"
                        className="p-1.5 bg-black/80 hover:bg-black text-white rounded-lg backdrop-blur-sm transition-colors"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={() => handleStartEdit(item)}
                        title="Edit Image Details"
                        className="p-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg backdrop-blur-sm transition-colors"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => setDeletingItem(item)}
                        title="Delete"
                        className="p-1.5 bg-red-600/80 hover:bg-red-600 text-white rounded-lg backdrop-blur-sm transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold text-white truncate">
                        {item.title || "Untitled Image"}
                      </p>
                      <p className="text-[10px] text-muted mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-[11px] text-muted font-medium truncate mt-1" title={item.alt || ""}>
                        <span className="font-semibold text-white/70">Alt:</span> {item.alt || "None"}
                      </p>
                    </div>

                    {/* Card Footer: Quick Edit & Live Status Switch */}
                    <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(item)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-gold hover:text-gold-light transition-colors"
                      >
                        <Pencil size={11} />
                        Edit
                      </button>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-medium text-muted">
                          {isLive ? "Active" : "Hidden"}
                        </span>
                        <button
                          type="button"
                          disabled={togglingId === item._id}
                          onClick={() => handleToggleStatus(item)}
                          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            isLive ? "bg-gold" : "bg-white/10"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-navy shadow transition duration-200 ease-in-out ${
                              isLive ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPage > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-panel p-4 rounded-xl border border-border">
            <p className="text-xs text-muted">
              Page <span className="font-semibold text-white">{page}</span> of{" "}
              <span className="font-semibold text-white">{totalPage}</span> ({total} total photos)
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-navy/60 hover:bg-navy text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-border"
              >
                <ChevronLeft size={14} />
                Previous
              </button>

              {Array.from({ length: totalPage }).map((_, idx) => {
                const pageNum = idx + 1;
                if (
                  pageNum === 1 ||
                  pageNum === totalPage ||
                  Math.abs(pageNum - page) <= 1
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                        page === pageNum
                          ? "bg-gold text-navy font-bold shadow-sm"
                          : "bg-navy/60 hover:bg-navy text-white border border-border"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
                if (
                  (pageNum === 2 && page > 3) ||
                  (pageNum === totalPage - 1 && page < totalPage - 2)
                ) {
                  return (
                    <span key={pageNum} className="text-xs text-muted px-1">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
                disabled={page === totalPage}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-navy/60 hover:bg-navy text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-border"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Lightbox Preview ── */}
        {lightboxImage && (
          <Portal>
            <div
              className="fixed inset-0 z-[99999] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setLightboxImage(null)}
            >
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <div
                className="max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={getImageUrl(lightboxImage.imageUrl)}
                  alt={lightboxImage.title || "Preview"}
                  className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl border border-white/10"
                />
                <div className="mt-4 text-center text-white">
                  <h3 className="text-base font-semibold">
                    {lightboxImage.title || "Photo Preview"}
                  </h3>
                  {lightboxImage.caption && (
                    <p className="text-xs text-muted mt-1 max-w-xl">
                      {lightboxImage.caption}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Portal>
        )}

        {/* ── Edit Image Modal ── */}
        {editingItem && (
          <Portal>
            <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-panel rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-white border border-border animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center border border-gold/20">
                    <Pencil size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Edit Image Details
                    </h3>
                    <p className="text-[11px] text-muted">
                      Update image name and SEO alt tag.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="p-1 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Image Preview */}
              <div className="flex items-center gap-4 p-3 bg-navy/60 rounded-xl border border-border">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-navy flex-shrink-0 border border-border">
                  <img
                    src={getImageUrl(editingItem.imageUrl)}
                    alt={editingItem.title || "Preview"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {editingItem.title || "Untitled Image"}
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">
                    Created: {new Date(editingItem.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-muted mt-0.5">
                    Status:{" "}
                    <span className={editingItem.isActive ? "text-emerald-400 font-semibold" : "text-faint font-semibold"}>
                      {editingItem.isActive ? "Live" : "Inactive"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted mb-1.5">
                    Image Name
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="e.g. Health camp in Tehri"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-navy/60 text-xs font-medium text-white placeholder:text-muted/60 focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted mb-1.5">
                    Alt Tag (SEO & Accessibility)
                  </label>
                  <input
                    type="text"
                    value={editAlt}
                    onChange={(e) => setEditAlt(e.target.value)}
                    placeholder="e.g. Medical team providing free checkups"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-navy/60 text-xs font-medium text-white placeholder:text-muted/60 focus:outline-none focus:border-gold"
                  />
                  <p className="text-[10px] text-muted mt-1">
                    Read by screen readers and displayed if the image fails to load.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    disabled={isSavingEdit}
                    className="px-4 py-2 text-xs font-semibold text-muted hover:text-white rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-navy bg-gold hover:bg-gold-light rounded-xl transition-all disabled:opacity-50 shadow-sm"
                  >
                    {isSavingEdit ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
        )}

        {/* ── Delete Confirmation Modal ── */}
        {deletingItem && (
          <Portal>
            <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-panel rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white border border-border my-auto">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Delete Photo from Gallery?
                  </h3>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    This photo will be soft-deleted and immediately hidden from the public website gallery.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                  <button
                    onClick={() => setDeletingItem(null)}
                    disabled={isDeleting}
                    className="px-4 py-2 text-xs font-semibold text-muted hover:text-white rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isDeleting ? "Deleting..." : "Delete Photo"}
                  </button>
                </div>
              </div>
            </div>
          </Portal>
        )}
      </div>
    </PermissionGuard>
  );
}

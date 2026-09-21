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
      <div className="min-h-screen bg-slate-50/50 text-slate-900 rounded-2xl p-2 sm:p-4">
        <div className="w-full px-6 py-8 max-w-7xl mx-auto space-y-8">
          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                Gallery Management
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Upload and curate photos for the public website gallery.
              </p>
            </div>

            <button
              onClick={fetchGallery}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm self-start sm:self-auto"
            >
              <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* ── Clean KPI Stats ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Photos</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{total}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-200/60 text-slate-700 flex items-center justify-center">
                  <Images size={20} />
                </div>
              </div>
            </div>

            <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Live On Website</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {images.filter((i) => i.isActive).length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100/60 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 size={20} />
                </div>
              </div>
            </div>

            <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Hidden / Inactive</p>
                  <p className="text-2xl font-bold text-slate-600 mt-1">
                    {images.filter((i) => !i.isActive).length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-200/60 text-slate-600 flex items-center justify-center">
                  <AlertCircle size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Bulk Uploader Card ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Bulk Photo Uploader
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select or drag multiple images (max 3MB per image, up to 50 at once)
                </p>
              </div>

              {selectedFiles.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllFiles}
                  className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors"
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
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
                isDragOver
                  ? "border-slate-800 bg-slate-100"
                  : "border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50"
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
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-200/70 text-slate-700 flex items-center justify-center">
                <Upload size={22} />
              </div>
              <p className="text-sm font-semibold text-slate-900">
                Click to browse or drop images here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PNG, JPG, JPEG, WEBP, or SVG · Maximum 3MB per image
              </p>
            </div>

            {/* Staged Files Preview Grid */}
            {selectedFiles.length > 0 && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    Staged Images: {selectedFiles.length} files ({formatFileSize(totalStagingBytes)})
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold text-slate-900 hover:underline flex items-center gap-1"
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
                      className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
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
                        className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-red-600 text-white rounded-md transition-colors"
                        title="Remove file"
                      >
                        <X size={12} />
                      </button>
                      <span className="absolute bottom-1 left-1 right-1 px-1 py-0.5 text-[9px] truncate bg-black/70 text-white rounded text-center">
                        {preview.size}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bulk Metadata Options - Only Image Name and Alt Tag */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Image Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Health camp in Tehri"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full text-xs font-medium px-3.5 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl placeholder:text-slate-400 focus:outline-none focus:border-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Image Alt Tag (SEO & Accessibility)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Medical team providing free checkups"
                      value={uploadAlt}
                      onChange={(e) => setUploadAlt(e.target.value)}
                      className="w-full text-xs font-medium px-3.5 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl placeholder:text-slate-400 focus:outline-none focus:border-slate-800"
                    />
                  </div>
                </div>

                {/* Upload Button */}
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleBulkUpload}
                    disabled={isUploading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-slate-900/10 disabled:opacity-50"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search by image name or alt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 text-xs bg-white text-slate-900 border border-slate-300 rounded-xl placeholder:text-slate-400 focus:outline-none focus:border-slate-800"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </form>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
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
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
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
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-pulse"
                >
                  <div className="aspect-[4/3] bg-slate-100" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-2/3" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 mx-auto mb-3 flex items-center justify-center">
                <FileImage size={24} />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                No images found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                {activeSearch
                  ? `No photos matched "${activeSearch}". Try clearing your search.`
                  : "Upload photos using the bulk uploader above."}
              </p>
              {activeSearch && (
                <button
                  onClick={handleClearSearch}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
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
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
                  >
                    {/* Image Thumbnail */}
                    <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
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
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                              : "bg-slate-900/70 text-white backdrop-blur-sm"
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
                          className="p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg backdrop-blur-sm transition-colors"
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
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {item.title || "Untitled Image"}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-[11px] text-slate-600 font-medium truncate mt-1" title={item.alt || ""}>
                          <span className="font-semibold text-slate-800">Alt:</span> {item.alt || "None"}
                        </p>
                      </div>

                      {/* Card Footer: Quick Edit & Live Status Switch */}
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Pencil size={11} />
                          Edit
                        </button>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-medium text-slate-500">
                            {isLive ? "Active" : "Hidden"}
                          </span>
                          <button
                            type="button"
                            disabled={togglingId === item._id}
                            onClick={() => handleToggleStatus(item)}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isLive ? "bg-slate-900" : "bg-slate-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500">
                Page <span className="font-semibold text-slate-900">{page}</span> of{" "}
                <span className="font-semibold text-slate-900">{totalPage}</span> ({total} total photos)
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                            ? "bg-slate-900 text-white shadow-sm"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700"
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
                      <span key={pageNum} className="text-xs text-slate-400 px-1">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
                  disabled={page === totalPage}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ── Lightbox Preview ── */}
          {lightboxImage && (
            <div
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setLightboxImage(null)}
            >
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
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
                  className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl"
                />
                <div className="mt-4 text-center text-white">
                  <h3 className="text-base font-semibold">
                    {lightboxImage.title || "Photo Preview"}
                  </h3>
                  {lightboxImage.caption && (
                    <p className="text-xs text-slate-300 mt-1 max-w-xl">
                      {lightboxImage.caption}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Edit Image Modal ── */}
          {editingItem && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-slate-900 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Pencil size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Edit Image Details
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Update image name and SEO alt tag.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Image Preview */}
                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
                    <img
                      src={getImageUrl(editingItem.imageUrl)}
                      alt={editingItem.title || "Preview"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {editingItem.title || "Untitled Image"}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Created: {new Date(editingItem.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Status:{" "}
                      <span className={editingItem.isActive ? "text-emerald-600 font-semibold" : "text-slate-500 font-semibold"}>
                        {editingItem.isActive ? "Live" : "Inactive"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Image Name
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="e.g. Health camp in Tehri"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Alt Tag (SEO & Accessibility)
                    </label>
                    <input
                      type="text"
                      value={editAlt}
                      onChange={(e) => setEditAlt(e.target.value)}
                      placeholder="e.g. Medical team providing free checkups"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Read by screen readers and displayed if the image fails to load.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      disabled={isSavingEdit}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingEdit}
                      className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all disabled:opacity-50 shadow-sm"
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
          )}

          {/* ── Delete Confirmation Modal ── */}
          {deletingItem && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Delete Photo from Gallery?
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    This photo will be soft-deleted and immediately hidden from the public website gallery.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setDeletingItem(null)}
                    disabled={isDeleting}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                    className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Delete Photo"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
}

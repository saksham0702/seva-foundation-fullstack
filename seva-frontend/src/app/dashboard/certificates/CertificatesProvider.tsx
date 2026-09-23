"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  getCertificates,
  getCertificateStats,
  revokeCertificate as apiRevoke,
  reactivateCertificate as apiReactivate,
  deleteCertificate as apiDelete,
  createCertificate as apiCreate,
  Certificate,
  CertificateStats,
  CertificateStatus,
  RecipientType,
  CreateCertificatePayload,
} from "@/app/api/certificate";

// ─── Re-exports ───────────────────────────────────────────────────────────────
export type { Certificate, CertificateStats, CertificateStatus, RecipientType };

// ─── Context shape ─────────────────────────────────────────────────────────────
interface CertificatesContextType {
  certificates: Certificate[];
  stats: CertificateStats | null;
  loading: boolean;
  statsLoading: boolean;
  error: string | null;
  refetch: () => void;

  // Filters
  search: string;
  setSearch: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  recipientTypeFilter: string;
  setRecipientTypeFilter: (v: string) => void;

  // Pagination
  page: number;
  setPage: (p: number) => void;
  filtered: Certificate[];
  paginated: Certificate[];
  totalPages: number;
  PAGE_SIZE: number;

  // Selection / detail drawer
  selectedCert: Certificate | null;
  setSelectedCert: (c: Certificate | null) => void;

  // Revoke / reactivate / delete
  revokeCert: (id: string, reason: string) => Promise<void>;
  reactivateCert: (id: string) => Promise<void>;
  deleteCert: (id: string) => Promise<void>;
  actionLoading: boolean;
  actionError: string | null;

  // Create modal
  createModalOpen: boolean;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  createCert: (payload: CreateCertificatePayload) => Promise<void>;
  creating: boolean;
  createError: string | null;
}

const CertificatesContext = createContext<CertificatesContextType | null>(null);

const PAGE_SIZE = 10;

// ─── Provider ─────────────────────────────────────────────────────────────────
export function CertificatesProvider({ children }: { children: ReactNode }) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<CertificateStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearchRaw] = useState("");
  const [statusFilter, setStatusFilterRaw] = useState("All");
  const [recipientTypeFilter, setRecipientTypeFilterRaw] = useState("All");
  const [page, setPageRaw] = useState(1);

  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCertificates();
      setCertificates(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load certificates");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await getCertificateStats();
      setStats(data);
    } catch {
      // stats are non-critical
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertificates();
    fetchStats();
  }, [fetchCertificates, fetchStats]);

  // ── Filter helpers ────────────────────────────────────────────────────────────
  function setSearch(v: string) {
    setSearchRaw(v);
    setPageRaw(1);
  }
  function setStatusFilter(v: string) {
    setStatusFilterRaw(v);
    setPageRaw(1);
  }
  function setRecipientTypeFilter(v: string) {
    setRecipientTypeFilterRaw(v);
    setPageRaw(1);
  }

  const filtered = certificates.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.recipientName.toLowerCase().includes(q) ||
      c.certificateNo.toLowerCase().includes(q) ||
      (c.programName || "").toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === "All" || c.status === statusFilter;
    const matchesType =
      recipientTypeFilter === "All" ||
      c.recipientType === recipientTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const revokeCert = async (id: string, reason: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await apiRevoke(id, reason);
      await fetchCertificates();
      await fetchStats();
      setSelectedCert((prev) =>
        prev && prev._id === id ? { ...prev, status: "REVOKED", revokedReason: reason } : prev
      );
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err?.message || "Failed to revoke");
    } finally {
      setActionLoading(false);
    }
  };

  const reactivateCert = async (id: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await apiReactivate(id);
      await fetchCertificates();
      await fetchStats();
      setSelectedCert((prev) =>
        prev && prev._id === id ? { ...prev, status: "ACTIVE", revokedReason: undefined } : prev
      );
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err?.message || "Failed to reactivate");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteCert = async (id: string) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await apiDelete(id);
      await fetchCertificates();
      await fetchStats();
      setSelectedCert(null);
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err?.message || "Failed to delete");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Create ───────────────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setCreateError(null);
    setCreateModalOpen(true);
  };
  const closeCreateModal = () => {
    setCreateModalOpen(false);
    setCreateError(null);
  };

  const createCert = async (payload: CreateCertificatePayload) => {
    setCreating(true);
    setCreateError(null);
    try {
      await apiCreate(payload);
      await fetchCertificates();
      await fetchStats();
      closeCreateModal();
    } catch (err: any) {
      setCreateError(
        err?.response?.data?.message || err?.message || "Failed to create certificate"
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <CertificatesContext.Provider
      value={{
        certificates,
        stats,
        loading,
        statsLoading,
        error,
        refetch: fetchCertificates,

        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        recipientTypeFilter,
        setRecipientTypeFilter,

        page,
        setPage: setPageRaw,
        filtered,
        paginated,
        totalPages,
        PAGE_SIZE,

        selectedCert,
        setSelectedCert,

        revokeCert,
        reactivateCert,
        deleteCert,
        actionLoading,
        actionError,

        createModalOpen,
        openCreateModal,
        closeCreateModal,
        createCert,
        creating,
        createError,
      }}
    >
      {children}
    </CertificatesContext.Provider>
  );
}

export function useCertificates() {
  const ctx = useContext(CertificatesContext);
  if (!ctx)
    throw new Error("useCertificates must be used inside CertificatesProvider");
  return ctx;
}

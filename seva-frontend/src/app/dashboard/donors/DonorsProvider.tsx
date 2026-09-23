"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  getDonors,
  createDonor as apiCreateDonor,
  Donor as APIDonor,
  CreateDonorPayload,
  DonorStatus,
} from "@/app/api/donor";

// ─── Types ────────────────────────────────────────────────────────────────────

export type { DonorStatus };

export interface Donor extends APIDonor {}

export type DonorSortKey = "name" | "status" | "createdAt" | "totalPaid";

export const STATUS_CONFIG: Record<
  DonorStatus,
  { label: string; className: string }
> = {
  FILLED_NOT_PAID: {
    label: "Not Paid",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  PAYMENT_FAILED: {
    label: "Failed",
    className: "bg-rose-50 text-rose-700 border border-rose-200",
  },
  PAID: {
    label: "Paid",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface DonorsContextType {
  donors: Donor[];
  loading: boolean;
  error: string | null;
  refetch: () => void;

  search: string;
  setSearch: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  sortKey: DonorSortKey;
  sortDir: "asc" | "desc";
  toggleSort: (key: DonorSortKey) => void;
  page: number;
  setPage: (p: number) => void;

  selectedDonor: Donor | null;
  setSelectedDonor: (d: Donor | null) => void;

  filtered: Donor[];
  paginated: Donor[];
  totalPages: number;
  PAGE_SIZE: number;

  // Create donor modal
  createModalOpen: boolean;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  createDonor: (payload: CreateDonorPayload) => Promise<void>;
  creating: boolean;
  createError: string | null;
}

const DonorsContext = createContext<DonorsContextType | null>(null);

const PAGE_SIZE = 10;

export function DonorsProvider({ children }: { children: ReactNode }) {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearchRaw] = useState("");
  const [statusFilter, setStatusFilterRaw] = useState("All");
  const [sortKey, setSortKey] = useState<DonorSortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPageRaw] = useState(1);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // ── Fetch & Grouping ──────────────────────────────────────────────────────

  const fetchDonors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rawData = await getDonors();

      // Group / Deduplicate donors with the same email or phone number
      const groupedMap = new Map<string, Donor>();

      for (const donor of rawData) {
        const emailKey = donor.email ? donor.email.toLowerCase().trim() : "";
        const phoneKey = donor.phone ? donor.phone.replace(/\D/g, "").trim() : "";
        const groupKey = emailKey || (phoneKey ? `phone_${phoneKey}` : donor._id);

        if (!groupedMap.has(groupKey)) {
          groupedMap.set(groupKey, {
            ...donor,
            donations: donor.donations ? [...donor.donations] : [],
            totalPaid: donor.totalPaid || 0,
            donationCount: donor.donationCount || (donor.status === "PAID" ? 1 : 0),
          });
        } else {
          const existing = groupedMap.get(groupKey)!;
          // Merge donations
          const mergedDonations = [
            ...(existing.donations || []),
            ...(donor.donations || []),
          ];

          // Recompute totalPaid and count
          const successfulDonations = mergedDonations.filter(
            (d) => d.paymentStatus === "SUCCESS"
          );
          const computedTotalPaid = successfulDonations.reduce(
            (sum, d) => sum + (d.amount || 0),
            0
          );

          // Status promotion (PAID > FILLED_NOT_PAID > PAYMENT_FAILED)
          let finalStatus = existing.status;
          if (donor.status === "PAID" || existing.status === "PAID") {
            finalStatus = "PAID";
          } else if (
            donor.status === "FILLED_NOT_PAID" ||
            existing.status === "FILLED_NOT_PAID"
          ) {
            finalStatus = "FILLED_NOT_PAID";
          }

          groupedMap.set(groupKey, {
            ...existing,
            name: existing.name || donor.name,
            email: existing.email || donor.email,
            phone: existing.phone || donor.phone,
            pan: existing.pan || donor.pan,
            status: finalStatus,
            donations: mergedDonations,
            totalPaid: computedTotalPaid > 0 ? computedTotalPaid : (existing.totalPaid || 0) + (donor.totalPaid || 0),
            donationCount:
              successfulDonations.length > 0
                ? successfulDonations.length
                : (existing.donationCount || 0) + (donor.donationCount || 0),
            createdAt:
              new Date(existing.createdAt || 0) > new Date(donor.createdAt || 0)
                ? existing.createdAt
                : donor.createdAt,
          });
        }
      }

      setDonors(Array.from(groupedMap.values()));
    } catch (err: any) {
      setError(err?.message || "Failed to load donors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  // ── Sort / Filter helpers ──────────────────────────────────────────────────

  function setSearch(v: string) {
    setSearchRaw(v);
    setPageRaw(1);
  }
  function setStatusFilter(v: string) {
    setStatusFilterRaw(v);
    setPageRaw(1);
  }
  function toggleSort(key: DonorSortKey) {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const filtered = donors
    .filter((d) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        (d.name || "").toLowerCase().includes(q) ||
        (d.email || "").toLowerCase().includes(q) ||
        (d.phone || "").includes(q);
      const matchesStatus =
        statusFilter === "All" || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const mul = sortDir === "desc" ? -1 : 1;
      if (sortKey === "createdAt")
        return (
          mul *
          (new Date(a.createdAt || 0).getTime() -
            new Date(b.createdAt || 0).getTime())
        );
      if (sortKey === "name")
        return mul * (a.name || "").localeCompare(b.name || "");
      if (sortKey === "status")
        return mul * (a.status || "").localeCompare(b.status || "");
      if (sortKey === "totalPaid")
        return mul * ((a.totalPaid || 0) - (b.totalPaid || 0));
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Create donor ──────────────────────────────────────────────────────────

  const openCreateModal = () => {
    setCreateError(null);
    setCreateModalOpen(true);
  };
  const closeCreateModal = () => {
    setCreateModalOpen(false);
    setCreateError(null);
  };

  const createDonor = async (payload: CreateDonorPayload) => {
    setCreating(true);
    setCreateError(null);
    try {
      await apiCreateDonor(payload);
      await fetchDonors();
      closeCreateModal();
    } catch (err: any) {
      setCreateError(
        err?.response?.data?.message || err?.message || "Failed to create donor"
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <DonorsContext.Provider
      value={{
        donors,
        loading,
        error,
        refetch: fetchDonors,

        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        sortKey,
        sortDir,
        toggleSort,
        page,
        setPage: setPageRaw,

        selectedDonor,
        setSelectedDonor,

        filtered,
        paginated,
        totalPages,
        PAGE_SIZE,

        createModalOpen,
        openCreateModal,
        closeCreateModal,
        createDonor,
        creating,
        createError,
      }}
    >
      {children}
    </DonorsContext.Provider>
  );
}

export function useDonors() {
  const ctx = useContext(DonorsContext);
  if (!ctx) throw new Error("useDonors must be used inside DonorsProvider");
  return ctx;
}

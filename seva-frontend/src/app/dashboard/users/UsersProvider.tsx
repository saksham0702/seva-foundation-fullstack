"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authAPI } from "@/app/api/auth";
import { PermissionModule } from "@/context/AuthContext";

// ── Types ─────────────────────────────────────────────────────────────────────

export type { PermissionModule };

export type UserRole = "admin" | "user";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: {
    _id: string;
    name: string;
    slug?: string;
    permissions?: string[];
  } | string;
  permissions: PermissionModule[];
  createdAt?: string;
  updatedAt?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const ROLES: UserRole[] = ["admin", "user"];

export const PERMISSION_MODULES: { key: PermissionModule; label: string; description: string }[] = [
  { key: "campaigns", label: "Campaigns", description: "Create, edit & manage campaigns" },
  { key: "donations", label: "Donors & Donations", description: "Access donor records and payments" },
  { key: "volunteers", label: "Volunteers", description: "Manage categories and review applications" },
  { key: "gallery", label: "Gallery", description: "Upload and manage website gallery images" },
  { key: "marketing", label: "Marketing", description: "Email & WhatsApp marketing tools" },
  { key: "cms", label: "CMS / Blogs", description: "Manage blogs and content pages" },
  { key: "users", label: "User Management", description: "View and manage system users" },
  { key: "certificates", label: "Certificates", description: "Issue and manage certificates" },
  { key: "departments", label: "Departments", description: "Manage organisational departments" },
  { key: "crm", label: "CRM", description: "Leads, contacts and relationship management" },
  { key: "signatures", label: "Signatures", description: "Upload and manage signing authorities" },
];

// Default permissions per role
export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, PermissionModule[]> = {
  admin: [
    "campaigns",
    "donations",
    "volunteers",
    "gallery",
    "marketing",
    "cms",
    "users",
    "certificates",
    "departments",
    "crm",
    "signatures",
  ],
  user: ["campaigns"],
};

export const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-violet-100 text-violet-700",
  user: "bg-slate-100 text-slate-700",
};

// ── Context ───────────────────────────────────────────────────────────────────

export type DrawerMode = "create" | "edit" | null;

interface UsersContextType {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  search: string;
  setSearch: (v: string) => void;
  roleFilter: "All" | UserRole;
  setRoleFilter: (v: "All" | UserRole) => void;
  drawerMode: DrawerMode;
  drawerUser: User | null;
  openCreate: () => void;
  openEdit: (user: User) => void;
  closeDrawer: () => void;
  refreshUsers: (showLoading?: boolean) => Promise<void>;
  loading: boolean;
}

const UsersContext = createContext<UsersContextType | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearchRaw] = useState("");
  const [roleFilter, setRoleFilterRaw] = useState<"All" | UserRole>("All");
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [drawerUser, setDrawerUser] = useState<User | null>(null);

  async function refreshUsers(showLoading = true) {
    try {
      if (showLoading) setLoading(true);
      const res = await authAPI.getUsers();
      if (res?.success && Array.isArray(res.data)) {
        setUsers(res.data);
      } else if (Array.isArray(res)) {
        setUsers(res);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await authAPI.getUsers();
        if (active) {
          if (res?.success && Array.isArray(res.data)) {
            setUsers(res.data);
          } else if (Array.isArray(res)) {
            setUsers(res);
          }
        }
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function setSearch(v: string) { setSearchRaw(v); }
  function setRoleFilter(v: "All" | UserRole) { setRoleFilterRaw(v); }

  function openCreate() {
    setDrawerUser(null);
    setDrawerMode("create");
  }
  function openEdit(user: User) {
    setDrawerUser(user);
    setDrawerMode("edit");
  }
  function closeDrawer() {
    setDrawerMode(null);
    setDrawerUser(null);
  }

  return (
    <UsersContext.Provider
      value={{
        users,
        setUsers,
        search,
        setSearch,
        roleFilter,
        setRoleFilter,
        drawerMode,
        drawerUser,
        openCreate,
        openEdit,
        closeDrawer,
        refreshUsers,
        loading,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers must be used inside UsersProvider");
  return ctx;
}

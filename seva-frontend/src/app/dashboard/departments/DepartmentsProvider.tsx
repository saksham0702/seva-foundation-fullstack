"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface Department {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
}

interface DepartmentsContextType {
  departments: Department[];
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  drawerOpen: boolean;
  drawerDept: Department | null;
  openCreate: () => void;
  openEdit: (dept: Department) => void;
  closeDrawer: () => void;
}

const DepartmentsContext = createContext<DepartmentsContextType | null>(null);

const MOCK_DEPARTMENTS: Department[] = [
  {
    id: "dept1",
    name: "Management",
    description: "Leadership and overall operations",
    memberCount: 2,
    createdAt: "1 Jan 2024",
  },
  {
    id: "dept2",
    name: "Marketing",
    description: "Email, WhatsApp and campaign outreach",
    memberCount: 1,
    createdAt: "15 Mar 2024",
  },
  {
    id: "dept3",
    name: "Content",
    description: "Website content and CMS management",
    memberCount: 1,
    createdAt: "20 Apr 2024",
  },
  {
    id: "dept4",
    name: "Finance",
    description: "Donations, reports and accounting",
    memberCount: 1,
    createdAt: "5 May 2024",
  },
  {
    id: "dept5",
    name: "Customer Support",
    description: "Donor queries and support tickets",
    memberCount: 1,
    createdAt: "10 Jun 2025",
  },
];

export function DepartmentsProvider({ children }: { children: ReactNode }) {
  const [departments, setDepartments] =
    useState<Department[]>(MOCK_DEPARTMENTS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDept, setDrawerDept] = useState<Department | null>(null);

  function openCreate() {
    setDrawerDept(null);
    setDrawerOpen(true);
  }
  function openEdit(dept: Department) {
    setDrawerDept(dept);
    setDrawerOpen(true);
  }
  function closeDrawer() {
    setDrawerOpen(false);
    setDrawerDept(null);
  }

  return (
    <DepartmentsContext.Provider
      value={{
        departments,
        setDepartments,
        drawerOpen,
        drawerDept,
        openCreate,
        openEdit,
        closeDrawer,
      }}
    >
      {children}
    </DepartmentsContext.Provider>
  );
}

export function useDepartments() {
  const ctx = useContext(DepartmentsContext);
  if (!ctx)
    throw new Error("useDepartments must be used inside DepartmentsProvider");
  return ctx;
}

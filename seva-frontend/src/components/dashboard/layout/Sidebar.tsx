"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  LayoutDashboard,
  Users,
  Briefcase,
  ClipboardList,
  Heart,
  Package,
  Wallet,
  FileText,
  Building2,
  Receipt,
  GraduationCap,
  ShieldCheck,
  Award,
  BarChart3,
  MessageSquare,
  Mail,
  Phone,
  PhoneCall,
  Globe,
  Images,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, PermissionModule } from "@/context/AuthContext";

// ── Types ─────────────────────────────────────────────────────────
interface NavChild {
  label: string;
  href?: string;
  children?: NavChild[];
  comingSoon?: boolean;
}

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: NavChild[];
  /** If set, user must have this permission (or be admin) to see this item */
  permission?: PermissionModule;
  comingSoon?: boolean;
}

interface NavSection {
  section?: string;
  items: NavItem[];
  /** If set, user must have at least one of these permissions to see this section */
  anyPermission?: PermissionModule[];
}

// ── Navigation Configuration ──────────────────────────────────────
const NAV_CONFIG: NavSection[] = [
  {
    section: "CORE OPERATIONS",
    items: [
      {
        label: "Command Center",
        href: "/dashboard",
        icon: LayoutDashboard,
        // Dashboard is visible to all authenticated users
      },
      {
        label: "Campaigns",
        href: "/dashboard/campaigns",
        icon: ClipboardList,
        permission: "campaigns",
      },
      {
        label: "Media Center",
        icon: FileText,
        permission: "cms",
        children: [
          { label: "Blogs", href: "/dashboard/blogs" },
          { label: "News", href: "/dashboard/news" },
          { label: "Events", href: "/dashboard/events" },
        ],
      },
      {
        label: "Website CMS",
        href: "/dashboard/cms",
        icon: Globe,
        permission: "cms",
      },
      {
        label: "Departments",
        href: "/dashboard/departments",
        icon: Building2,
        permission: "departments",
      },
      {
        label: "Donors",
        href: "/dashboard/donors",
        icon: Wallet,
        permission: "donations",
      },
      {
        label: "Volunteers",
        href: "/dashboard/volunteers",
        icon: Heart,
        permission: "volunteers",
      },
      {
        label: "Gallery",
        href: "/dashboard/gallery",
        icon: Images,
        permission: "gallery",
      },
      {
        label: "Marketing Outreach",
        icon: MessageSquare,
        permission: "marketing",
        children: [
          { label: "Email / Mail Logs", href: "/dashboard/marketing/email" },
          { label: "Mail Templates", href: "/dashboard/marketing/email/templates" },
          { label: "WhatsApp Marketing", comingSoon: true },
        ],
      },
      {
        label: "Users & Team",
        href: "/dashboard/users",
        icon: Users,
        permission: "users",
      },
    ],
  },
  {
    section: "DONATIONS & FINANCE",
    anyPermission: ["donations"],
    items: [
      {
        label: "Donor Vault",
        href: "/dashboard/donors",
        icon: Wallet,
        permission: "donations",
      },
      {
        label: "Initiative Donations",
        href: "/dashboard/donors/initiatives",
        icon: Heart,
        permission: "donations",
      },
    ],
  },
  {
    section: "CRM & LEADS",
    anyPermission: ["crm"],
    items: [
      {
        label: "Leads & Follow-ups",
        icon: PhoneCall,
        permission: "crm",
        children: [
          { label: "Dashboard", href: "/dashboard/leads/dashboard" },
          { label: "Lead Pipeline", href: "/dashboard/leads/all" },
          { label: "Follow-up Tasks", href: "/dashboard/leads/followups" },
          { label: "Follow-up Configs", href: "/dashboard/leads/configs" },
        ],
      },
    ],
  },
  {
    section: "CERTIFICATES",
    anyPermission: ["certificates"],
    items: [
      {
        label: "Certificates",
        icon: Award,
        permission: "certificates",
        children: [
          { label: "Dashboard", href: "/dashboard/certificates/dashboard" },
          { label: "Manage Certificates", href: "/dashboard/certificates/manage" },
          { label: "Generate Certificate", href: "/dashboard/certificates/generate" },
          { label: "Verification Registry", href: "/dashboard/certificates/verification-registry" },
          { label: "Digital Signatures", href: "/dashboard/certificates/digital-signatures" },
        ],
      },
    ],
  },
];

// ── Grandchild (level 3) ─────────────────────────────────────────
function GrandchildItem({ item }: { item: NavChild }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  return (
    <Link
      href={item.href!}
      className={cn(
        "flex items-center gap-2 pl-4 pr-3 py-1.5 rounded-md text-[11.5px] font-medium transition-all duration-200",
        isActive
          ? "text-gold bg-white/[0.06]"
          : "text-white/50 hover:text-white hover:bg-white/[0.04]"
      )}
    >
      <span
        className={cn(
          "w-1 h-1 rounded-full bg-current transition-all duration-300",
          isActive ? "opacity-100 scale-125" : "opacity-40"
        )}
      />
      {item.label}
    </Link>
  );
}

// ── Child (level 2) ──────────────────────────────────────────────
function ChildItem({ item }: { item: NavChild }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const hasGrandchildren = item.children && item.children.length > 0;
  const isParentActive =
    hasGrandchildren && item.children!.some((g) => pathname === g.href);
  const [open, setOpen] = useState(isParentActive);

  if (hasGrandchildren) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "w-full flex items-center justify-between pl-3 pr-3 py-2 rounded-md text-xs font-medium transition-all duration-200",
            isParentActive
              ? "text-gold"
              : "text-white/60 hover:text-white hover:bg-white/[0.04]"
          )}
        >
          <span>{item.label}</span>
          {open ? (
            <ChevronDown className="w-3 h-3 opacity-60" />
          ) : (
            <ChevronRight className="w-3 h-3 opacity-60" />
          )}
        </button>
        {open && (
          <div className="ml-3 mt-1 space-y-1 border-l border-white/10 pl-2">
            {item.children!.map((g) => (
              <GrandchildItem key={g.href} item={g} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (item.comingSoon) {
    return (
      <div
        className="flex items-center justify-between pl-3 pr-3 py-2 rounded-md text-xs font-medium text-white/35 cursor-not-allowed select-none"
        title="Coming Soon"
      >
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <span>{item.label}</span>
        </div>
        <span className="text-[9.5px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/25">
          Soon
        </span>
      </div>
    );
  }

  return (
    <Link
      href={item.href!}
      className={cn(
        "flex items-center gap-2 pl-3 pr-3 py-2 rounded-md text-xs font-medium transition-all duration-200",
        isActive
          ? "text-gold bg-white/[0.06] font-semibold"
          : "text-white/60 hover:text-white hover:bg-white/[0.04]"
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full transition-all duration-300",
          isActive ? "bg-gold scale-110" : "bg-white/20"
        )}
      />
      {item.label}
    </Link>
  );
}

// ── Top-level nav item (level 1) ─────────────────────────────────
function NavItemRow({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;

  const isDirectActive = item.href && pathname === item.href;
  const isParentActive =
    hasChildren &&
    item.children!.some(
      (c) => pathname === c.href || c.children?.some((g) => pathname === g.href)
    );
  const isActive = isDirectActive || isParentActive;

  const [open, setOpen] = useState(!!isParentActive);

  if (hasChildren) {
    return (
      <div className="px-2">
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group",
            isActive
              ? "bg-gold text-navy shadow-lg shadow-gold/20 font-bold"
              : "text-white/85 hover:bg-white/[0.05] hover:text-white"
          )}
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 opacity-60 transition-transform duration-300",
              open && "rotate-180"
            )}
          />
        </button>
        {open && (
          <div className="mt-1 ml-5 space-y-1 border-l border-white/10 pl-3">
            {item.children!.map((child) => (
              <ChildItem key={child.href ?? child.label} item={child} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-2">
      <Link
        href={item.href!}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group",
          isActive
            ? "bg-gold text-navy shadow-lg shadow-gold/20 font-bold"
            : "text-white/85 hover:bg-white/[0.05] hover:text-white"
        )}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1">{item.label}</span>
        {isActive && <ChevronRight className="w-3.5 h-3.5" />}
      </Link>
    </div>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────
export default function Sidebar() {
  const { hasPermission, user } = useAuth();

  // Filter a nav item based on the current user's permissions
  const canSeeItem = (item: NavItem): boolean => {
    if (!item.permission) return true; // no restriction
    return hasPermission(item.permission);
  };

  return (
    <aside className="w-64 bg-navy text-white flex flex-col h-screen flex-shrink-0 border-r border-white/5 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-20 flex-shrink-0 border-b border-white/5">
        <div className="relative w-9 h-9 flex-shrink-0">
          <Image
            src="/assets/seva-logo.png"
            alt="SEVA Foundation"
            fill
            className="object-contain brightness-0 invert opacity-90"
            priority
          />
        </div>
        <div className="min-w-0">
          <p className="font-serif font-bold text-[15px] leading-tight tracking-wide truncate">
            SEVA CONSOLE
          </p>
          <p className="text-[10px] font-semibold text-gold/80 uppercase tracking-[0.2em]">
            System Node V2.0.5
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto pt-4 pb-6 space-y-6">
        {NAV_CONFIG.map((section, si) => {
          // Filter items the user has permission to see
          const visibleItems = section.items.filter(canSeeItem);

          // If section has anyPermission constraint and no items are visible, hide whole section
          if (
            section.anyPermission &&
            !section.anyPermission.some((p) => hasPermission(p))
          ) {
            return null;
          }

          // Hide section if all items are hidden
          if (visibleItems.length === 0) return null;

          return (
            <div key={si} className="space-y-1.5">
              {section.section && (
                <p className="px-6 mb-2 text-[10.5px] text-gold/70 font-bold uppercase tracking-[0.2em]">
                  {section.section}
                </p>
              )}
              <div className="space-y-1">
                {visibleItems.map((item) => (
                  <NavItemRow key={item.label} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-5 mt-auto border-t border-white/5">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:bg-white/[0.05] transition-all duration-300 group border border-transparent hover:border-white/10"
        >
          <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          <span>Back to Website</span>
        </Link>
      </div>
    </aside>
  );
}
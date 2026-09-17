// src/constants/navigation.ts
import {
  LayoutDashboard,
  Megaphone,
  HeartHandshake,
  Users,
  UserCog,
  Mail,
  MessageCircle,
  Settings,
  BarChart3,
  type LucideIcon,
  FileText,
  Briefcase,
  Building,
  UserCheck,
} from "lucide-react";

export type NavChild = {
  label: string;
  href: string;
  children?: NavChild[]; // grandchildren
};

export type NavItem = {
  label: string;
  href?: string;
  icon: LucideIcon;
  children?: NavChild[];
};

export type NavSection = {
  section?: string; // undefined = no label
  items: NavItem[];
};

export const NAV_CONFIG: NavSection[] = [
  // {
  //   items: [
  //     {
  //       label: "Overview",
  //       href: "/dashboard",
  //       icon: LayoutDashboard,
  //     },
  //   ],
  // },
  {
    section: "Management",
    items: [
      {
        label: "Campaigns",
        icon: Megaphone,
        children: [
          { label: "All Campaigns", href: "/dashboard/campaigns" },
          { label: "Create Campaign", href: "/dashboard/campaigns/create-campaign" },
          { label: "Campaign Category", href: "/dashboard/campaigns/category" },
        ],
      },
      {
        label: "Volunteers",
        href: "/dashboard/volunteers",
        icon: HeartHandshake,
      },
      {
        label: "Website CMS",
        href: "/dashboard/cms",
        icon: Briefcase,
      },
      {
        label: "Blogs",
        icon: FileText,
        children: [
          { label: "All Blogs", href: "/dashboard/blogs" },
          { label: "Create Blog", href: "/dashboard/blogs/create-blog" },
        ],
      },
      {
        label: "Departments",
        href: "/dashboard/departments",
        icon: Building,
      },
      {
        label: "Donors & CRM",
        href: "/dashboard/donors",
        icon: Users,
      },
      {
        label: "Leads Management",
        href: "/dashboard/leads",
        icon: UserCheck,
      },
      {
        label: "Certificates",
        href: "/dashboard/certificates",
        icon: FileText,
      },
      {
        label: "Users & Staff",
        href: "/dashboard/users",
        icon: UserCog,
      },
    ],
  },
  {
    section: "Marketing",
    items: [
      {
        label: "Email Campaigns",
        href: "/dashboard/marketing/email",
        icon: Mail,
      },
      {
        label: "WhatsApp Tools",
        href: "/dashboard/marketing/whatsapp",
        icon: MessageCircle,
      },
    ],
  },
  {
    section: "Reports",
    items: [
      {
        label: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
      },
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];
import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";

import { connectDB } from "../database/db";
import { VolunteerCategoryModel, FormType } from "../modules/volunteer/volunteercategories.model";

dotenv.config();

const SYSTEM_USER = new Types.ObjectId();

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

interface SeedCategory {
  formType: FormType;
  title: string;
  color: string;
  description: string;
  badge?: string;
}

const CATEGORIES: SeedCategory[] = [
  // ── CORPORATE & CSR ─────────────────────────────────────────
  {
    formType: "corporate",
    title: "CSR Projects",
    color: "#2563eb",
    description: "Direct implementation of high-impact social projects aligned with CSR mandates.",
  },
  {
    formType: "corporate",
    title: "Employee Engagement",
    color: "#059669",
    description: "Tailored volunteer programs and giving campaigns for your workforce.",
  },
  {
    formType: "corporate",
    title: "Impact Reporting",
    color: "#0891b2",
    description: "Detailed data-driven reports and audits for your corporate CSR compliance.",
  },
  {
    formType: "corporate",
    title: "Global Standards",
    color: "#4f46e5",
    description: "Projects strategically aligned with UN Sustainable Development Goals (SDGs).",
  },

  // ── VOLUNTEERS ──────────────────────────────────────────────
  {
    formType: "volunteer",
    title: "Direct Impact",
    color: "#E8542A",
    description: "Work directly with communities on the ground across health, hunger, and education.",
  },
  {
    formType: "volunteer",
    title: "Skill Sharing",
    color: "#1a3a6b",
    description: "Use your professional skills in teaching, design, technology, or counseling for social good.",
  },
  {
    formType: "volunteer",
    title: "Community Action",
    color: "#059669",
    description: "Join a passionate network of like-minded change-makers on the ground.",
  },
  {
    formType: "volunteer",
    title: "Flexible Engagement",
    color: "#d97706",
    description: "Choose opportunities and time commitments that fit your personal schedule.",
  },
  {
    formType: "volunteer",
    title: "Teach & Mentor",
    color: "#1a3a6b",
    description: "Run tuition classes, help with homework, or teach digital literacy to children.",
  },
  {
    formType: "volunteer",
    title: "Community Kitchen",
    color: "#E8542A",
    description: "Help prepare and serve meals at our Annadaan kitchen. Every hand matters.",
  },
  {
    formType: "volunteer",
    title: "Health Camp Support",
    color: "#059669",
    description: "Assist doctors during rural health camps. Help with registration & follow-ups.",
  },

  // ── CAREERS ─────────────────────────────────────────────────
  {
    formType: "career",
    title: "Program Manager",
    color: "#d97706",
    badge: "MULTIPLE LOCATIONS • FULL-TIME",
    description: "Lead grassroots community programs, manage field teams, and oversee project execution.",
  },
  {
    formType: "career",
    title: "Fundraising Lead",
    color: "#d97706",
    badge: "DELHI / REMOTE • FULL-TIME",
    description: "Drive corporate partnerships, high-value donor engagement, and grant proposals.",
  },
  {
    formType: "career",
    title: "Communications Officer",
    color: "#d97706",
    badge: "DELHI / NCR • FULL-TIME",
    description: "Craft impactful social media campaigns, donor newsletters, and field stories.",
  },

  // ── WAYS TO GIVE / SUPPORT ──────────────────────────────────
  {
    formType: "support",
    title: "Sponsorship",
    color: "#2563eb",
    description: "Support a child's education or an elder's medical care on a structured basis.",
  },
  {
    formType: "support",
    title: "Monthly Giving",
    color: "#059669",
    description: "Provide consistent recurring support for our long-term grassroots projects.",
  },
  {
    formType: "support",
    title: "One-Time Gift",
    color: "#E8542A",
    description: "Make an immediate impact where emergency or seasonal relief is needed most.",
  },
  {
    formType: "support",
    title: "Legacy Giving",
    color: "#7c3aed",
    description: "Create a lasting philanthropic endowment and impact for future generations.",
  },
];

async function seed() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    let inserted = 0;
    let skipped = 0;
    let updated = 0;

    for (const cat of CATEGORIES) {
      const slug = `${cat.formType}-${slugify(cat.title)}`;
      const exists = await VolunteerCategoryModel.findOne({ slug });

      if (exists) {
        await VolunteerCategoryModel.updateOne(
          { _id: exists._id },
          {
            formType: cat.formType,
            description: cat.description,
            color: cat.color,
            badge: cat.badge || "",
          }
        );
        updated++;
        continue;
      }

      await VolunteerCategoryModel.create({
        formType: cat.formType,
        title: cat.title,
        slug,
        description: cat.description,
        color: cat.color,
        badge: cat.badge || "",
        icon: `https://api.iconify.design/lucide/hand-heart.svg?color=${encodeURIComponent(cat.color)}`,
        isActive: true,
        isDeleted: false,
        createdBy: SYSTEM_USER,
        updatedBy: SYSTEM_USER,
      });

      console.log(`Inserted: [${cat.formType}] ${cat.title}`);
      inserted++;
    }

    console.log(`\nDone — ${inserted} inserted, ${updated} updated, ${skipped} skipped.`);
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

seed();

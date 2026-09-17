import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";

import { connectDB } from "../database/db";
import { VolunteerCategoryModel } from "../modules/volunteer/volunteercategories.model";

dotenv.config();

const SYSTEM_USER = new Types.ObjectId();

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * These categories match the VOLUNTEER_ROLES displayed on the "Get Involved"
 * frontend page. Seeding them here means the role grid and form dropdown are
 * driven entirely by the API — no static fallback in the frontend.
 */
const CATEGORIES = [
  {
    title: "Teach & Mentor",
    color: "#1a3a6b",
    description:
      "Run tuition classes, help with homework, or teach digital literacy to children.",
  },
  {
    title: "Community Kitchen",
    color: "#E8542A",
    description:
      "Help prepare and serve meals at our Annadaan kitchen. Every hand matters.",
  },
  {
    title: "Health Camp Support",
    color: "#059669",
    description:
      "Assist doctors during rural health camps. Help with registration & follow-ups.",
  },
  {
    title: "Green Initiative",
    color: "#0d9488",
    description:
      "Join tree plantation drives, river clean-ups, and waste management workshops.",
  },
  {
    title: "Shelter & Relief",
    color: "#7c3aed",
    description:
      "Help at our winter night shelter or assist in home-building projects.",
  },
  {
    title: "Creative & Media",
    color: "#db2777",
    description:
      "Capture stories through photos/videos, design posters, or write content.",
  },
  {
    title: "Event & Fundraising",
    color: "#ea580c",
    description:
      "Help organise fundraising events, donor meets, and community gatherings.",
  },
  {
    title: "Tech & Operations",
    color: "#2563eb",
    description:
      "Help maintain our website, manage databases, or build internal tools.",
  },
];

async function seed() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    let inserted = 0;
    let skipped = 0;

    for (const cat of CATEGORIES) {
      const slug = slugify(cat.title);
      const exists = await VolunteerCategoryModel.findOne({ slug });

      if (exists) {
        console.log(`Skipped (already exists): ${cat.title}`);
        skipped++;
        continue;
      }

      await VolunteerCategoryModel.create({
        title: cat.title,
        slug,
        description: cat.description,
        color: cat.color,
        // Placeholder icon URL — update with real SVG via the admin panel
        icon: `https://api.iconify.design/lucide/hand-heart.svg?color=${encodeURIComponent(cat.color)}`,
        isActive: true,
        isDeleted: false,
        createdBy: SYSTEM_USER,
        updatedBy: SYSTEM_USER,
      });

      console.log(`Inserted: ${cat.title}`);
      inserted++;
    }

    console.log(`\nDone — ${inserted} inserted, ${skipped} skipped.`);
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

seed();

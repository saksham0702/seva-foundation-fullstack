import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";

import { connectDB } from "../database/db";
import { CategoryModel } from "../modules/campaignCategory/campaignCategory.model";
import { CampaignModel } from "../modules/campaigns/campaigns.model";

dotenv.config();

const SYSTEM_USER = new Types.ObjectId();

async function seed() {
  try {
    await connectDB();

    console.log("Connected to MongoDB");

    // Clear existing data
    await CampaignModel.deleteMany({});
    await CategoryModel.deleteMany({});

    // ------------------------
    // Categories
    // ------------------------

    const categories = await CategoryModel.insertMany([
      {
        name: "Disaster Relief",
        slug: "disaster-relief",
        createdBy: SYSTEM_USER,
        updatedBy: SYSTEM_USER,
      },
      {
        name: "Education",
        slug: "education",
        createdBy: SYSTEM_USER,
        updatedBy: SYSTEM_USER,
      },
      {
        name: "Healthcare",
        slug: "healthcare",
        createdBy: SYSTEM_USER,
        updatedBy: SYSTEM_USER,
      },
      {
        name: "Women Empowerment",
        slug: "women-empowerment",
        createdBy: SYSTEM_USER,
        updatedBy: SYSTEM_USER,
      },
      {
        name: "Animal Welfare",
        slug: "animal-welfare",
        createdBy: SYSTEM_USER,
        updatedBy: SYSTEM_USER,
      },
    ]);

    console.log(`${categories.length} categories inserted.`);

    // ------------------------
    // Campaigns
    // ------------------------

    await CampaignModel.insertMany([
      {
        name: "Kerala Flood Relief — Wayanad & Thrissur",
        slug: "kerala-flood-relief",
        images: ["/uploads/campaigns/kerala-flood.jpg"],
        description:
          "Provide emergency food kits, drinking water, and essential medicines to displaced families in flood-affected regions.",
        content:
          "<p>Relentless monsoon floods have impacted thousands across Wayanad and Thrissur. Seva India Foundation is providing critical relief kits, safe drinking water, and hygiene support.</p>",
        location: "Wayanad, Kerala",
        category: categories[0]._id,
        status: "active",
        goal: 5000000,
        raisedAmount: 1258500,
        donorCount: 1483,
        urgent: true,
        startDate: new Date("2026-08-01"),
        endDate: new Date("2026-11-30"),
        createdBy: SYSTEM_USER,
        updatedBy: SYSTEM_USER,
      },
      {
        name: "Sponsor Rural Himalayan Education",
        slug: "sponsor-rural-education",
        images: ["/uploads/campaigns/rural-education.jpg"],
        description:
          "Fund bridge schools, textbooks, and scholarships for 200 children across remote mountain hamlets in Uttarakhand.",
        content:
          "<p>Geography should never be a barrier to dreams. We establish learning centers, train village teachers, and provide school supplies to first-generation learners.</p>",
        location: "Tehri Garhwal, Uttarakhand",
        category: categories[1]._id,
        status: "active",
        goal: 1500000,
        raisedAmount: 642000,
        donorCount: 824,
        urgent: false,
        startDate: new Date("2026-07-15"),
        endDate: new Date("2026-12-31"),
        createdBy: SYSTEM_USER,
        updatedBy: SYSTEM_USER,
      },
      {
        name: "Emergency Medical & Cancer Aid",
        slug: "cancer-treatment-support",
        images: ["/uploads/campaigns/cancer-aid.jpg"],
        description:
          "Provide life-saving chemotherapy, post-op care, and subsidized medicines for underprivileged cancer patients.",
        content:
          "<p>A medical diagnosis shouldn't push a family into generational poverty. Our medical aid fund directly offsets treatment and medication costs at partner hospitals.</p>",
        location: "AIIMS, New Delhi",
        category: categories[2]._id,
        status: "active",
        goal: 2500000,
        raisedAmount: 1890000,
        donorCount: 1912,
        urgent: true,
        startDate: new Date("2026-06-01"),
        endDate: new Date("2026-10-31"),
        createdBy: SYSTEM_USER,
        updatedBy: SYSTEM_USER,
      },
    ]);

    console.log("3 active campaigns inserted.");
    console.log("Seeding completed.");

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
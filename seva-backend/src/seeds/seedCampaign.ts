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
        name: "Kerala Flood Relief",
        slug: "kerala-flood-relief",
        images: ["/uploads/demo/campaign1.jpg"],
        description:
          "Support families affected by severe floods in Kerala.",
        content:
          "<p>This campaign provides emergency food, medicine and shelter.</p>",
        location: "Kerala",
        category: categories[0]._id,
        createdBy: SYSTEM_USER,
        updatedBy: SYSTEM_USER,
      },
      {
        name: "Sponsor Rural Education",
        slug: "sponsor-rural-education",
        images: ["/uploads/demo/campaign2.jpg"],
        description:
          "Help children from rural villages continue their education.",
        content:
          "<p>Your donation funds books, uniforms and school fees.</p>",
        location: "Uttarakhand",
        category: categories[1]._id,
        createdBy: SYSTEM_USER,
        updatedBy: SYSTEM_USER,
      },
      {
        name: "Cancer Treatment Support",
        slug: "cancer-treatment-support",
        images: ["/uploads/demo/campaign3.jpg"],
        description:
          "Help underprivileged patients receive life-saving treatment.",
        content:
          "<p>Funds will be used for medicines and hospital expenses.</p>",
        location: "Delhi",
        category: categories[2]._id,
        createdBy: SYSTEM_USER,
        updatedBy: SYSTEM_USER,
      },
      {
        name: "Women Skill Development",
        slug: "women-skill-development",
        images: ["/uploads/demo/campaign4.jpg"],
        description:
          "Provide vocational training to women for financial independence.",
        content:
          "<p>Training includes tailoring, computer literacy and entrepreneurship.</p>",
        location: "Jaipur",
        category: categories[3]._id,
        createdBy: SYSTEM_USER,
        updatedBy: SYSTEM_USER,
      },
      {
        name: "Street Animal Rescue",
        slug: "street-animal-rescue",
        images: ["/uploads/demo/campaign5.jpg"],
        description:
          "Provide food, shelter and medical care for rescued animals.",
        content:
          "<p>Support rescue operations and rehabilitation.</p>",
        location: "Mumbai",
        category: categories[4]._id,
        createdBy: SYSTEM_USER,
        updatedBy: SYSTEM_USER,
      },
    ]);

    console.log("5 campaigns inserted.");

    console.log("Seeding completed.");

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
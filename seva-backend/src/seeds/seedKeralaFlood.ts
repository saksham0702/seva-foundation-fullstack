import { Types } from "mongoose";
import dotenv from "dotenv";

import { connectDB } from "../database/db";
import { CategoryModel } from "../modules/campaignCategory/campaignCategory.model";
import { CampaignModel } from "../modules/campaigns/campaigns.model";

dotenv.config();

const SYSTEM_USER = new Types.ObjectId();

/* ─────────────────────────────────────────────────────────────────
   Rich HTML description for the campaign detail page
───────────────────────────────────────────────────────────────── */
const KERALA_DESCRIPTION = `<p>On August 14, 2026, relentless monsoon rains triggered devastating floods across Kerala's Wayanad, Idukki, and Thrissur districts. Thousands of families were displaced overnight, losing their homes, livelihoods, and everything they had worked for.</p>

<h2>The Ground Reality</h2>
<p>As of today, over <strong>42,000 people</strong> have been moved into relief camps. Roads remain washed out, cutting off 120+ villages from basic supplies. Landslides have buried entire settlements. Children have missed weeks of school. Elderly residents with medical conditions have no access to medicines or care.</p>

<h2>How Your Donation Helps</h2>
<p>Seva India Foundation is on the ground in Wayanad and Thrissur, working with local panchayats and district authorities. Every rupee you give goes directly to:</p>
<ul>
  <li><strong>Emergency food kits</strong> — 5 kg rice, 2 kg dal, 1 L cooking oil, spices, and dry rations for a family of four for one week.</li>
  <li><strong>Clean drinking water</strong> — 20-litre water cans delivered to camps where tap water is contaminated.</li>
  <li><strong>Hygiene kits</strong> — Soap, sanitary pads, toothbrush, toothpaste, and hand sanitiser for every family.</li>
  <li><strong>Medical support</strong> — Doctor camps, medicines for fever, diarrhoea, and skin infections prevalent in flood-hit areas.</li>
  <li><strong>Temporary shelter repair</strong> — Tarpaulins, cement bags, and tools for families returning to partially damaged homes.</li>
</ul>

<h2>Our Track Record</h2>
<p>During the 2018 Kerala floods, Seva India Foundation delivered relief to <strong>8,400+ families</strong> across 6 districts within 72 hours. In 2021, we supported 3,200 households in Kottayam. Your trust in us is backed by over a decade of verified, transparent relief work.</p>

<h2>Transparency Commitment</h2>
<p>100% of public donations go to relief materials. Administrative costs are covered by our institutional donors. We publish weekly impact reports and geo-tagged photos of every distribution. You will receive a personal update about how your donation was used within 30 days.</p>`;

/* ─────────────────────────────────────────────────────────────────
   JSON content blob — parsed by the frontend for extra sections
   (goal, FAQs, YouTube video, and product sponsorship list)
───────────────────────────────────────────────────────────────── */
const KERALA_CONTENT = JSON.stringify({
  goal: "5000000", // ₹50,00,000 goal — stored as string per existing usage

  youtubeUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0", // placeholder — replace with real video

  faqs: [
    {
      question: "Where exactly will my money be spent?",
      answer:
        "100% of public donations go toward food kits, water, hygiene supplies, medicines, and shelter materials. We publish weekly field reports with photos at sevaindiafoundation.org/reports. Administrative costs are separately funded by institutional donors.",
    },
    {
      question: "Is my donation tax-deductible under 80G?",
      answer:
        "Yes. Seva India Foundation is registered under Section 80G of the Income Tax Act. You will receive a digitally signed 80G certificate within 7 working days of your donation.",
    },
    {
      question: "How do I know the relief has reached the right people?",
      answer:
        "We maintain a beneficiary register with names, aadhaar-linked IDs, and GPS-tagged photos for every distribution. This data is available for public audit on our transparency portal.",
    },
    {
      question: "Can I choose which type of relief my donation funds?",
      answer:
        "Yes — use the 'Sponsor Items' tab in the donate panel to select specific items like food kits, water cans, or hygiene packs. Your donation will be earmarked for exactly those items.",
    },
    {
      question: "How quickly does the relief reach affected families?",
      answer:
        "Our ground teams are already operational. Donations received before 3 PM are dispatched the same day. Remote villages receive relief within 48–72 hours depending on road accessibility.",
    },
  ],

  products: [
    {
      product: "Emergency Food Kit (Family of 4, 1 Week)",
      requiredUnit: "Kits",
      totalPrice: "850",
      unitPrice: "850",
    },
    {
      product: "20-Litre Clean Drinking Water Can",
      requiredUnit: "Cans",
      totalPrice: "120",
      unitPrice: "120",
    },
    {
      product: "Hygiene Kit (Soap, Sanitary Pads, Sanitiser)",
      requiredUnit: "Kits",
      totalPrice: "350",
      unitPrice: "350",
    },
    {
      product: "Child Nutrition Pack (Biscuits, Milk, Chikki)",
      requiredUnit: "Packs",
      totalPrice: "200",
      unitPrice: "200",
    },
    {
      product: "Medicines Kit (Fever, Diarrhoea, Skin)",
      requiredUnit: "Kits",
      totalPrice: "650",
      unitPrice: "650",
    },
    {
      product: "Tarpaulin Sheet (20x30 ft, Heavy-Duty)",
      requiredUnit: "Pieces",
      totalPrice: "1800",
      unitPrice: "1800",
    },
    {
      product: "Blanket (for displaced elderly/child)",
      requiredUnit: "Pieces",
      totalPrice: "450",
      unitPrice: "450",
    },
  ],
});

async function seed() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // ── 1. Wipe all existing campaigns and categories ──────────────
    const delC = await CampaignModel.deleteMany({});
    const delCat = await CategoryModel.deleteMany({});
    console.log(`Deleted ${delC.deletedCount} campaigns, ${delCat.deletedCount} categories.`);

    // ── 2. Create the Disaster Relief category ─────────────────────
    const category = await CategoryModel.create({
      name: "Disaster Relief",
      slug: "disaster-relief",
      description: "Emergency response campaigns for flood, cyclone, earthquake, and drought victims across India.",
      createdBy: SYSTEM_USER,
      updatedBy: SYSTEM_USER,
    });
    console.log(`Category created: ${category.name} (${category._id})`);

    // ── 3. Create the Kerala Flood Relief campaign ─────────────────
    const campaign = await CampaignModel.create({
      name: "Kerala Flood Relief 2026 — Wayanad & Thrissur",
      slug: "kerala-flood-relief-2026",
      category: category._id,
      status: "active",
      urgent: true,
      location: "Wayanad & Thrissur, Kerala",
      goal: 5000000, // ₹50,00,000

      // Real Kerala flood/relief imagery from Unsplash
      images: [
        "https://images.unsplash.com/photo-1603642923882-5c73b6e4e2f9?w=1200&q=85",
        "https://images.unsplash.com/photo-1583345237708-add35a664d63?w=1200&q=85",
        "https://images.unsplash.com/photo-1601758064893-3e3e1e84b4e5?w=1200&q=85",
        "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=1200&q=85",
      ],

      description: KERALA_DESCRIPTION,
      content: KERALA_CONTENT,

      startDate: new Date("2026-08-15"),
      endDate: new Date("2026-11-30"),

      raisedAmount: 1247500, // ₹12,47,500 already raised (realistic seed data)
      donorCount: 1483,

      createdBy: SYSTEM_USER,
      updatedBy: SYSTEM_USER,
    });

    console.log(`\nCampaign created: ${campaign.name}`);
    console.log(`  Slug      : ${campaign.slug}`);
    console.log(`  Category  : ${category.name}`);
    console.log(`  Goal      : ₹${campaign.goal.toLocaleString("en-IN")}`);
    console.log(`  Raised    : ₹${campaign.raisedAmount.toLocaleString("en-IN")}`);
    console.log(`  Donors    : ${campaign.donorCount}`);
    console.log(`  Products  : 7 sponsorship items`);
    console.log(`\nVisit: /campaigns/kerala-flood-relief-2026`);
    console.log("\nDone.");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

seed();

import { WhatsAppTemplateModel, WhatsAppConfigModel } from "./marketing.model";
import { IWhatsAppTemplate } from "./marketing.types";

export const defaultWhatsAppTemplates: Partial<IWhatsAppTemplate>[] = [
  {
    name: "Urgent Relief & Disaster Appeal",
    category: "DONATION",
    body: "Namaste {{name}} ji,\n\nWe urgently need your support for *{{campaign}}*. Hundreds of families are in critical need of immediate food rations, clean water, and emergency medical aid.\n\nEvery small contribution creates a life-changing impact.\n\n👉 *Donate securely now:* https://sevafoundation.org\n\nThank you for standing with those in crisis.\n— *Seva Foundation Emergency Response Team*",
    headerType: "NONE",
    sampleVariables: { name: "Rajesh Sharma", campaign: "Assam & Bihar Flood Relief" },
    isSystem: true,
    isActive: true,
  },
  {
    name: "Donation Confirmation & 80G Tax Exemption",
    category: "DONATION",
    body: "Dear {{name}},\n\nThank you with all our hearts for your generous contribution of *₹{{amount}}* towards *{{campaign}}* on {{date}}.\n\nYour support enables us to continue serving underprivileged communities. Your official 80G tax exemption receipt is ready.\n\n👉 *Download Certificate:* https://sevafoundation.org/donor-vault\n\nWarm regards,\n*Seva Foundation Finance Desk*",
    headerType: "NONE",
    sampleVariables: {
      name: "Pooja Verma",
      amount: "5,000",
      campaign: "Girl Child Education & Nutrition",
      date: "24 Sep 2026",
    },
    isSystem: true,
    isActive: true,
  },
  {
    name: "Incomplete Payment / Recovery Reminder",
    category: "DONATION",
    body: "Namaste {{name}},\n\nWe noticed your recent attempt to support *{{campaign}}* could not be processed completely.\n\nIf you experienced any network issue or payment gateway error, you can safely retry your contribution here:\n👉 *Retry Donation:* https://sevafoundation.org/donate\n\nEvery single rupee directly reaches families in need.\n\nBest regards,\n*Seva Foundation Support*",
    headerType: "NONE",
    sampleVariables: { name: "Amit Kumar", campaign: "Elderly Healthcare Mission" },
    isSystem: true,
    isActive: true,
  },
  {
    name: "Monthly Supporter Impact Report",
    category: "DONATION",
    body: "Dear {{name}},\n\nBecause of committed supporters like you, this month we provided hot meals to over 12,500 children and conducted 18 mobile health camps across rural districts!\n\nHere is your Monthly Impact Summary:\n• Patients Treated: 3,420+\n• School Kits Distributed: 1,800+\n• Direct Beneficiary Families: 850+\n\nThank you for making sustainable change possible every single month. 🙏\n— *Team Seva Foundation*",
    headerType: "NONE",
    sampleVariables: { name: "Dr. Arvind Mehta" },
    isSystem: true,
    isActive: true,
  },
  {
    name: "Volunteer Drive & Orientation Invite",
    category: "VOLUNTEER",
    body: "Hello {{name}}! 🌟\n\nThank you for registering to volunteer with Seva Foundation.\n\nWe are hosting our upcoming field orientation and grassroots distribution drive this weekend in your zone.\n\n📅 Date: Saturday & Sunday\n📍 Location: Seva Community Center\n\nReply *YES* to this message to confirm your attendance, or check details on your volunteer portal.\n\nTogether, let's create lasting change!\n*Seva Volunteer Coordination Team*",
    headerType: "NONE",
    sampleVariables: { name: "Sneha Patel" },
    isSystem: true,
    isActive: true,
  },
  {
    name: "Volunteer Certificate of Appreciation",
    category: "VOLUNTEER",
    body: "Heartiest Congratulations {{name}}! 🎓\n\nIn recognition of your dedicated service and selfless hours during our recent community initiatives, your *Official Volunteer Certificate of Appreciation* has been issued!\n\n👉 *View & Download Certificate:* https://sevafoundation.org/certificates\n\nWe are immensely proud to have you in the Seva family.\n— *Seva Foundation Leadership*",
    headerType: "NONE",
    sampleVariables: { name: "Kunal Singhal" },
    isSystem: true,
    isActive: true,
  },
  {
    name: "New Healthcare & Free Camp Announcement",
    category: "CAMPAIGN",
    body: "Namaste {{name}},\n\nWe are delighted to announce our upcoming Mega Health & Eye Checkup Camp for underserved communities in rural areas.\n\nServices Provided Free of Cost:\n🩺 General Physician Consultation\n👁️ Free Eye Checkups & Spectacles\n💊 Essential Medicines Distribution\n\nSpread the word or join us as a donor/volunteer:\n👉 https://sevafoundation.org/campaigns\n\n*Seva Foundation Healthcare Mission*",
    headerType: "NONE",
    sampleVariables: { name: "Sunil Verma" },
    isSystem: true,
    isActive: true,
  },
  {
    name: "Birthday & Special Day Goodwill Blessing",
    category: "GENERAL",
    body: "Wishing you a very Happy Birthday, {{name}}! 🎂✨\n\nMay your year ahead be blessed with good health, joy, and prosperity.\n\nOn your special day, you can choose to share your joy by sponsoring a meal for orphan children or planting a tree in their name:\n👉 https://sevafoundation.org/celebrate-with-seva\n\nWith warm wishes and prayers,\n*Seva India Foundation*",
    headerType: "NONE",
    sampleVariables: { name: "Vikram Malhotra" },
    isSystem: true,
    isActive: true,
  },
  {
    name: "Festival Greetings & Community Blessings",
    category: "GENERAL",
    body: "Namaste {{name}} ji,\n\nWishing you and your loved ones joyous festival greetings filled with light, peace, and abundance! 🪔✨\n\nAs we celebrate, let us extend our blessings to underprivileged families by bringing warmth and smiles to their homes.\n\nDiscover how you can light up a life today:\n👉 https://sevafoundation.org\n\nWarmest regards,\n*The Seva Foundation Family*",
    headerType: "NONE",
    sampleVariables: { name: "Anjali Gupta" },
    isSystem: true,
    isActive: true,
  },
  {
    name: "Annual Transparency & Impact Newsletter",
    category: "NEWSLETTER",
    body: "Dear {{name}},\n\nOur Annual Transparency & Social Impact Report is now published!\n\nKey Highlights from the Past Year:\n✔️ 100% Audited Financials & 80G / FCRA Compliance\n✔️ 150,000+ Lives Impacted across 12 States\n✔️ 88% Direct Program Expenditure Ratio\n\nRead the complete interactive report here:\n👉 https://sevafoundation.org/annual-report\n\nThank you for placing your trust in our mission!\n— *Seva Foundation Board*",
    headerType: "NONE",
    sampleVariables: { name: "Harish Iyer" },
    isSystem: true,
    isActive: true,
  },
];

export async function seedWhatsAppDefaults(): Promise<void> {
  try {
    // 1. Ensure WhatsAppConfig exists
    const configExists = await WhatsAppConfigModel.findOne();
    if (!configExists) {
      await WhatsAppConfigModel.create({
        activeProvider: "BAILEYS",
        baileys: {
          sessionName: "seva_whatsapp_session",
          status: "DISCONNECTED",
        },
        officialApi: {
          apiVersion: "v20.0",
          isConfigured: false,
        },
        antiBanDefaults: {
          minDelaySeconds: 3,
          maxDelaySeconds: 20,
          maxMessagesIn20Seconds: 5,
          batchSize: 50,
          batchPauseSeconds: 45,
        },
      });
      console.log("[WhatsApp Seed] Initialized default WhatsApp Config.");
    }

    // 2. Ensure default templates exist
    for (const tpl of defaultWhatsAppTemplates) {
      const exists = await WhatsAppTemplateModel.findOne({ name: tpl.name });
      if (!exists) {
        await WhatsAppTemplateModel.create(tpl);
      }
    }
    console.log("[WhatsApp Seed] Seeded default WhatsApp templates.");
  } catch (err) {
    console.error("[WhatsApp Seed] Error seeding defaults:", err);
  }
}

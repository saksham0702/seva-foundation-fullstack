// ─── Campaign types ──────────────────────────────────────────────────────────

export interface Product {
  product: string;
  requiredUnit: string;
  totalPrice: string;
  image?: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface CampaignForm {
  // Step 1
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  image: File | string | null;
  // Step 2
  goal: string;
  startDate: string;
  endDate: string;
  minDonation: string;
  allowRecurring: boolean;
  products: Product[];
  gatewayCharges: string;
  youtubeUrl: string;
  // Step 3
  description: string;
  faqs: FAQ[];
}

export const initialCampaignForm: CampaignForm = {
  title: "",
  slug: "",
  metaTitle: "",
  metaDescription: "",
  category: "",
  image: null,
  goal: "",
  startDate: "",
  endDate: "",
  minDonation: "500",
  allowRecurring: false,
  products: [],
  gatewayCharges: "0",
  youtubeUrl: "",
  description: "",
  faqs: [],
};

import { CmsPageModel, ICmsPage } from "./cms.model";

const DEFAULT_PAGES: Partial<ICmsPage>[] = [
  {
    pageSlug: "about",
    pageName: "About Us",
    title: "OUR LEGACY",
    subtitle: "A promise made in the streets of Dehradun, now echoing across India: No soul shall be forgotten, no hunger shall go unanswered.",
    bannerImage: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&q=80",
    sections: [
      {
        key: "sacred_promise",
        name: "The Sacred Promise",
        title: "The Sacred Promise",
        description: "In 2026, when we were just school students, something powerful and life-changing happened...",
        image: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=1200&q=80",
        extra: {
          year: "2026",
          badgeText: "Born of Student Empathy",
        },
      },
      {
        key: "vision_mission",
        name: "Vision & Mission",
        title: "Our Vision & Mission",
        extra: {
          vision: "Seva India Foundation envisions a Uttarakhand where poverty is eradicated, and every individual, especially women, senior citizens, and youth, is an empowered and respected member of society.",
          mission: "Aligned with the vision of a poverty-free India, Seva India Foundation is committed to empowering women, senior citizens, and youth through comprehensive education and welfare programs.",
        },
      },
      {
        key: "transparency",
        name: "Transparency & Governance",
        title: "100% TRANSPARENT & ACCOUNTABLE",
        description: "At Seva India Foundation, trust isn't a promise—it's a practice.",
        extra: {
          darpanId: "UK/2026/0993905",
          cin: "U88900UT2026NPL020825",
          taxExemption: "80G & 12A",
          legalStatus: "Section 8 Company",
        },
      },
    ],
  },
  {
    pageSlug: "our-work",
    pageName: "Our Work & Impact",
    title: "OUR WORK & IMPACT",
    subtitle: "Transforming communities through dedicated grassroots initiatives across Uttarakhand and beyond.",
    bannerImage: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=1200&q=80",
    sections: [
      {
        key: "focus_areas",
        name: "Core Focus Areas",
        title: "Core Areas of Impact",
        items: [
          { title: "Women Empowerment", description: "Skill development and economic opportunities." },
          { title: "Senior Citizen Welfare", description: "Essential healthcare and social support." },
          { title: "Youth Development", description: "Education and vocational training." },
          { title: "Rural Transformation", description: "Infrastructure and community well-being." },
          { title: "Leprosy Support", description: "Ration distribution and medical care." },
        ],
      },
    ],
  },
  {
    pageSlug: "header-footer",
    pageName: "Header & Footer Settings",
    title: "Global Site Layout & Contact Information",
    settings: {
      phone: "+91 94565 17577",
      email: "info@sevaindiafoundation.org",
      address: "20, Sahastradhara Road, Upper Adhoiwala, Dehradun, UK – 248001",
      darpanId: "UK/2026/0993905",
      cin: "U88900UT2026NPL020825",
      taxExemption: "80G & 12A REGISTERED",
      socialLinks: {
        facebook: "https://facebook.com",
        twitter: "https://twitter.com",
        instagram: "https://instagram.com",
        youtube: "https://youtube.com",
      },
      announcementBanner: {
        enabled: true,
        text: "80G Tax Exemption available on all donations. Claim 50% deduction on your income tax.",
      },
    },
  },
  {
    pageSlug: "privacy",
    pageName: "Privacy Policy",
    title: "Privacy Policy",
    subtitle: "How we safeguard your information and uphold transparency.",
    content: "Seva India Foundation is committed to protecting the privacy and confidentiality of our donors, volunteers, and website visitors.",
  },
  {
    pageSlug: "terms",
    pageName: "Terms & Conditions",
    title: "Terms & Conditions",
    subtitle: "Terms of service for Seva India Foundation.",
    content: "By accessing and using the Seva India Foundation platform, you agree to comply with our terms and policies.",
  },
];

const seedDefaultsIfEmpty = async () => {
  const count = await CmsPageModel.countDocuments({ isDeleted: false });
  if (count === 0) {
    for (const page of DEFAULT_PAGES) {
      await CmsPageModel.create({
        ...page,
        isPublished: true,
        isDeleted: false,
      });
    }
  }
};

const getAllPages = async () => {
  await seedDefaultsIfEmpty();
  return CmsPageModel.find({ isDeleted: false })
    .populate("updatedBy", "name email")
    .sort({ createdAt: 1 });
};

const getPageBySlug = async (slug: string) => {
  const cleanSlug = slug.toLowerCase().trim();
  let page = await CmsPageModel.findOne({ pageSlug: cleanSlug, isDeleted: false });

  if (!page) {
    const template = DEFAULT_PAGES.find((p) => p.pageSlug === cleanSlug);
    if (template) {
      page = await CmsPageModel.create({
        ...template,
        pageSlug: cleanSlug,
        pageName: template.pageName || cleanSlug,
        isPublished: true,
        isDeleted: false,
      });
    }
  }

  return page;
};

const savePage = async (slug: string, payload: Partial<ICmsPage>, userId?: string) => {
  const cleanSlug = slug.toLowerCase().trim();

  const updateData: Record<string, any> = {
    ...payload,
    pageSlug: cleanSlug,
    pageName: payload.pageName || cleanSlug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
  };

  if (userId) {
    updateData.updatedBy = userId;
  }

  const result = await CmsPageModel.findOneAndUpdate(
    { pageSlug: cleanSlug, isDeleted: false },
    { $set: updateData },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return result;
};

const deletePage = async (slug: string) => {
  return CmsPageModel.findOneAndUpdate(
    { pageSlug: slug.toLowerCase().trim() },
    { $set: { isDeleted: true } },
    { new: true }
  );
};

export const CmsService = {
  getAllPages,
  getPageBySlug,
  savePage,
  deletePage,
};

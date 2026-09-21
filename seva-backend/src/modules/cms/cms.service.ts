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
        key: "vidhya",
        name: "VIDHYA (EDUCATION)",
        title: "VIDHYA (EDUCATION)",
        subtitle: "Rural children often leave school to support their families after a single medical emergency. We provide 'Bridge Schools' and scholarships to ensure their dreams don't die.",
        description: "The 'Vidhya (Education)' Program is a robust, nationwide initiative dedicated to democratizing access to quality education. We recognize that education is the single most powerful tool for social and economic mobility. Yet, for millions of children in rural and marginalized communities, geographical isolation, poverty, and lack of infrastructure make learning an impossible dream. Vidhya aims to completely eradicate these barriers.",
        image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1000&q=80",
        extra: {
          eyebrow: "OUR INITIATIVES",
          alt: "Children in rural bridge school smiling and studying",
          features: ["RURAL BRIDGE SCHOOLS", "TEACHER TRAINING", "SCHOLARSHIPS", "RESOURCE SUPPORT"],
          faqs: [
            {
              question: "WHAT IS A BRIDGE SCHOOL?",
              answer: "Bridge schools are transitional educational centres set up in underserved rural and semi-urban communities to help dropouts and first-generation learners attain age-appropriate academic proficiency before integrating into mainstream schools."
            }
          ],
          impactMetrics: [
            { value: "100,000+", label: "STUDENTS ENROLLED" },
            { value: "1,000+", label: "SCHOOLS SUPPORTED" },
            { value: "5,000+", label: "TEACHERS TRAINED" },
            { value: "15,000+", label: "SCHOLARSHIPS AWARDED" }
          ]
        }
      },
      {
        key: "arogya",
        name: "AROGYA (HEALTHCARE)",
        title: "AROGYA (HEALTHCARE)",
        subtitle: "A simple infection can bankrupt a rural family. Our mobile clinics reach the most remote hamlets across India, providing primary care and life-saving medicines.",
        description: "Arogya (Healthcare) is SEVA's vanguard healthcare initiative, driven by the philosophy that healthcare is a fundamental human right, not a luxury. In rural India, the absence of medical facilities means that a simple, preventable infection can escalate into a fatal tragedy or bankrupt an entire family. Arogya acts as a lifeline, bringing high-quality medical intervention directly to the doorsteps of the most isolated and vulnerable communities.",
        image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1000&q=80",
        extra: {
          eyebrow: "OUR INITIATIVES",
          alt: "Compassionate medical caregiver holding hands with patient",
          features: ["MOBILE HEALTH CLINICS", "FREE MEDICINES & LABS", "PREVENTIVE HEALTH CAMPS", "MATERNAL & CHILD CARE"],
          faqs: [
            {
              question: "HOW DO MOBILE MEDICAL CLINICS OPERATE?",
              answer: "Our mobile medical units travel to remote mountain hamlets weekly, equipped with diagnostic kits, essential medicines, and trained doctors to conduct checkups and provide urgent interventions."
            }
          ],
          impactMetrics: [
            { value: "50,000+", label: "PATIENTS TREATED" },
            { value: "150+", label: "MOBILE CLINIC CAMPS" },
            { value: "10,000+", label: "FREE HEALTH KITS" },
            { value: "25+", label: "REMOTE VILLAGES SERVED" }
          ]
        }
      },
      {
        key: "sammaan",
        name: "SAMMAAN (ELDERLY CARE)",
        title: "SAMMAAN (ELDERLY CARE)",
        subtitle: "Dignity and respect for our elders who have given their lives to our society. We provide nutrition, healthcare, and emotional companionship.",
        description: "Sammaan (Elderly Care) is dedicated to safeguarding the health, welfare, and self-respect of destitute senior citizens. Through geriatric health camps, monthly sustenance support, and community companionship circles, we ensure no elder is left alone or uncared for.",
        image: "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=1000&q=80",
        extra: {
          eyebrow: "OUR INITIATIVES",
          alt: "Elderly individuals receiving care and affection",
          features: ["GERIATRIC HEALTHCARE", "MONTHLY RATION SUPPORT", "COMPANIONSHIP CENTRES", "EMERGENCY AID"],
          faqs: [
            {
              question: "HOW DOES SAMMAAN REACH ISOLATED ELDERS?",
              answer: "Volunteers and healthcare workers conduct weekly doorstep visits, providing essential medicines, hot meals, and emotional companionship to abandoned or isolated seniors."
            }
          ],
          impactMetrics: [
            { value: "10,000+", label: "ELDERS CARED FOR" },
            { value: "80+", label: "ELDERLY CLUBS" },
            { value: "50,000+", label: "MEALS DELIVERED" },
            { value: "100%", label: "REGULAR VISITS" }
          ]
        }
      },
      {
        key: "shakti",
        name: "SHAKTI (WOMEN)",
        title: "SHAKTI (WOMEN)",
        subtitle: "Empowering women with vocational training, financial independence, and self-help collectives to break generational cycles of poverty.",
        description: "Shakti (Women) focuses on empowering rural women through vocational skills, digital literacy, self-help groups, and micro-entrepreneurship. When you empower a woman, you empower an entire family and transform a community.",
        image: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=1000&q=80",
        extra: {
          eyebrow: "OUR INITIATIVES",
          alt: "Rural women participating in vocational empowerment program",
          features: ["SKILL & VOCATIONAL TRAINING", "MICRO-ENTERPRISE SUPPORT", "LEGAL & HEALTH RIGHTS", "SHG EMPOWERMENT"],
          faqs: [
            {
              question: "WHAT VOCATIONAL SKILLS ARE PROVIDED?",
              answer: "We offer tailoring, handicrafts, organic food processing, and digital bookkeeping, linked directly to market channels for sustainable independent income."
            }
          ],
          impactMetrics: [
            { value: "25,000+", label: "WOMEN EMPOWERED" },
            { value: "120+", label: "SHG GROUPS FORMED" },
            { value: "3,500+", label: "MICRO-BUSINESSES" },
            { value: "95%", label: "SUSTAINABILITY RATE" }
          ]
        }
      },
      {
        key: "annapurna",
        name: "ANNAPURNA (HUNGER)",
        title: "ANNAPURNA (HUNGER)",
        subtitle: "No child or vulnerable individual should sleep on an empty stomach. Nutritious, hygienic meals delivered daily to those in greatest need.",
        description: "Annapurna (Hunger Relief) operates daily community kitchens and food distribution drives across slums, migrant settlements, and distress zones, guaranteeing food security and fighting chronic malnutrition.",
        image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1000&q=80",
        extra: {
          eyebrow: "OUR INITIATIVES",
          alt: "Distribution of nutritious warm meals to hungry children and families",
          features: ["COMMUNITY KITCHENS", "DAILY HOT MEALS", "DRY RATION KITS", "CHILD NUTRITION"],
          faqs: [
            {
              question: "WHERE DOES THE FOOD COME FROM?",
              answer: "Our food is cooked daily in certified hygienic community kitchens using fresh, locally sourced ingredients to guarantee balanced nutrition."
            }
          ],
          impactMetrics: [
            { value: "500,000+", label: "MEALS SERVED" },
            { value: "25,000+", label: "RATION KITS" },
            { value: "10+", label: "COMMUNITY KITCHENS" },
            { value: "365", label: "DAYS ACTIVE" }
          ]
        }
      },
      {
        key: "gramodaya",
        name: "GRAMODAYA (RURAL)",
        title: "GRAMODAYA (RURAL)",
        subtitle: "Revitalizing rural infrastructure, solar lighting, clean drinking water, and sanitation to create self-reliant village ecosystems.",
        description: "Gramodaya (Rural Development) fosters sustainable development in remote villages of the Himalayan belt through solar power installations, clean water filtration plants, organic farming support, and community development centres.",
        image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1000&q=80",
        extra: {
          eyebrow: "OUR INITIATIVES",
          alt: "Rural Himalayan community development and clean water infrastructure",
          features: ["CLEAN DRINKING WATER", "SOLAR STREET LIGHTS", "SANITATION FACILITIES", "FARMER SUPPORT"],
          faqs: [
            {
              question: "HOW DO YOU ENSURE VILLAGE SELF-RELIANCE?",
              answer: "We establish local village development committees and train youth to maintain solar panels, water filters, and sanitation systems independently."
            }
          ],
          impactMetrics: [
            { value: "65+", label: "VILLAGES ADOPTED" },
            { value: "200+", label: "SOLAR LIGHTS" },
            { value: "45+", label: "WATER FILTERS" },
            { value: "40,000+", label: "LIVES IMPACTED" }
          ]
        }
      },
      {
        key: "rakshak",
        name: "RAKSHAK (DISASTER)",
        title: "RAKSHAK (DISASTER)",
        subtitle: "First responders on the ground during floods, landslides, and natural calamities with immediate rescue, food, and rebuilding aid.",
        description: "Rakshak (Disaster Relief) is SEVA's rapid response task force trained to deploy within hours during cloudbursts, earthquakes, and landslides in Uttarakhand, providing emergency rescue, medical aid, and sustainable home rehabilitation.",
        image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1000&q=80",
        extra: {
          eyebrow: "OUR INITIATIVES",
          alt: "Disaster relief workers providing emergency assistance in affected areas",
          features: ["24/7 RAPID RESCUE", "EMERGENCY RELIEF KITS", "TEMPORARY SHELTER", "POST-DISASTER REBUILD"],
          faqs: [
            {
              question: "HOW QUICKLY CAN RAKSHAK TEAMS DEPLOY?",
              answer: "Our trained local ground volunteers are stationed across high-risk districts in Uttarakhand and deploy within 3 to 6 hours of any major calamity."
            }
          ],
          impactMetrics: [
            { value: "15,000+", label: "RESCUES & EVACUATIONS" },
            { value: "75+", label: "DISASTER ZONES REACHED" },
            { value: "30,000+", label: "BLANKETS & TENTS" },
            { value: "100%", label: "COMMUNITY REBUILD" }
          ]
        }
      }
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
  } else if (
    cleanSlug === "our-work" &&
    page.sections &&
    page.sections.length === 1 &&
    page.sections[0]?.key === "focus_areas"
  ) {
    const template = DEFAULT_PAGES.find((p) => p.pageSlug === "our-work");
    if (template) {
      page.sections = template.sections as any;
      page.title = template.title || page.title;
      page.subtitle = template.subtitle || page.subtitle;
      await page.save();
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

const deleteSection = async (slug: string, sectionKey: string, userId?: string) => {
  const cleanSlug = slug.toLowerCase().trim();
  const page = await CmsPageModel.findOne({ pageSlug: cleanSlug, isDeleted: false });
  if (!page) {
    return null;
  }

  page.sections = (page.sections || []).filter(
    (sec: any) => sec.key?.toLowerCase() !== sectionKey.toLowerCase()
  );

  if (userId) {
    page.updatedBy = userId as any;
  }

  await page.save();
  return page;
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
  deleteSection,
  deletePage,
};

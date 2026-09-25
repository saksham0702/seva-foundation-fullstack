import { CmsPageModel, ICmsPage } from "./cms.model";

const DEFAULT_PAGES: Partial<ICmsPage>[] = [
  {
    pageSlug: "home",
    pageName: "Home Page",
    title: "Seva India Foundation - Transforming Lives at Grassroots",
    subtitle: "A registered Section 8 NGO empowering marginalized families across Uttarakhand and India.",
    sections: [
      {
        key: "featured_in",
        name: "Featured In Media Marquee",
        title: "Featured In",
        items: [
          { name: "THE BETTER INDIA", color: "#e11d48", logo: "" },
          { name: "THE INDIAN EXPRESS", color: "#000000", logo: "" },
          { name: "YOURSTORY", color: "#dc2626", logo: "" },
          { name: "ANI", color: "#f97316", logo: "" },
          { name: "NDTV", color: "#ef4444", logo: "" },
          { name: "TIMES OF INDIA", color: "#1e293b", logo: "" }
        ],
        extra: {
          speed: 30,
        }
      },
      {
        key: "patron_samiti",
        name: "Principal Patron (Dev Bhoomi Samiti)",
        title: "DEV BHOOMI SAMITI",
        subtitle: "Dev Bhoomi Samiti is our spiritual and strategic cornerstone. Deeply interwoven with the social fabric of Uttarakhand, the Samiti provides the visionary leadership and structural backbone that makes our mission possible.",
        extra: {
          badgeText: "PRINCIPAL PATRON",
          buttonText: "Learn More",
          buttonLink: "/about",
          cardEyebrow: "OUR VISIONARY BACKBONE",
          cardTitle: "Spiritual & Social Support",
          cardQuote: "Uttarakhand, the land of gods, teaches us that service to humanity is the highest form of worship. Seva India Foundation carries this torch forward."
        }
      },
      {
        key: "excellence_awards",
        name: "Honors & Global Recognition",
        title: "EXCELLENCE IN HUMAN SERVICE",
        subtitle: "HONORS & GLOBAL RECOGNITION",
        items: [
          { category: "OVERALL EXCELLENCE", title: "BEST NGO OF THE YEAR", year: "2026" },
          { category: "SOCIAL WELFARE", title: "BEST NGO FOR ELDERS", year: "2026" },
          { category: "HEALTHCARE", title: "BEST NGO FOR LEPROSY CARE", year: "2026" },
          { category: "MEDICAL OUTREACH", title: "EXCELLENCE IN HEALTHCARE", year: "2026" },
          { category: "GOVERNANCE", title: "TRANSPARENCY AWARD", year: "2026" },
          { category: "INNOVATION", title: "SOCIAL IMPACT PIONEER", year: "2026" }
        ],
        extra: {
          watermarkText: "2026"
        }
      },
      {
        key: "integrity_compliance",
        name: "Integrity & Compliance",
        title: "INTEGRITY & COMPLIANCE",
        description: "At Seva India Foundation, trust isn't a promise—it's a practice. As a registered Section 8 NGO, we protect your trust through meticulous accountability and radical transparency.",
        extra: {
          programSupportPercent: "90%",
          programSupportLabel: "DIRECT PROGRAM SUPPORT",
          adminPercent: "10%",
          adminLabel: "FUNDRAISING & ADMIN",
          darpanId: "UK/2026/0993905",
          cin: "U88900UT2026NPL020825",
          licenseNo: "No. 179973",
          panNumber: "ABSCS7219M",
          tanNumber: "MRTS38379F",
          officeTitle: "REGISTERED OFFICE",
          officeAddress: "20, Sahastradhara Road, Rishinagar Upper Adhoiwala, Dehradun, Uttarakhand - 248001",
          complianceDocLink: "/about"
        }
      }
    ]
  },
  {
    pageSlug: "about",
    pageName: "About Us",
    title: "OUR LEGACY",
    subtitle: "A promise made in the streets of Dehradun, now echoing across India: No soul shall be forgotten, no hunger shall go unanswered.",
    bannerImage: "",
    sections: [
      {
        key: "sacred_promise",
        name: "The Sacred Promise",
        title: "The Sacred Promise",
        description: "In 2026, when we were just school students, something powerful and life-changing happened. We witnessed a heart-wrenching sight — a poor man, desperately trying to feed himself by eating scraps from a garbage heap. That moment changed us forever. We couldn't just stand by and watch the world go on as if nothing was wrong. In that instant, we made a promise to ourselves — we would never let another soul go hungry, no matter what.",
        image: "",
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
          vision: "Seva India Foundation envisions a Uttarakhand where poverty is eradicated, and every individual, especially women, senior citizens, and youth, is an empowered and respected member of society. We aspire to a state where inclusive development is deeply rooted, ensuring a dignified life for all citizens.",
          mission: "Aligned with the vision of a poverty-free India, Seva India Foundation is committed to empowering women, senior citizens, and youth. Our mission is to integrate these marginalized groups into the mainstream of society through comprehensive programs, education, vocational training, and support.",
        },
      },
      {
        key: "areas_of_focus",
        name: "Areas of Focus",
        title: "AREAS OF FOCUS",
        subtitle: "Our organization's efforts are concentrated on these key areas.",
        items: [
          {
            title: "WOMEN EMPOWERMENT",
            desc: "We strive to enhance women's status through education, skill development, and economic opportunities, enabling financial independence."
          },
          {
            title: "SENIOR CITIZEN WELFARE",
            desc: "Dedicated to improving the quality of life for senior citizens by providing essential support services, healthcare, and social security."
          },
          {
            title: "YOUTH DEVELOPMENT",
            desc: "Focusing on holistic development through education, vocational training, and mentorship to empower youth."
          },
          {
            title: "RURAL DEVELOPMENT",
            desc: "Comprehensive development of rural areas through infrastructure, healthcare, agriculture, and educational programs."
          },
          {
            title: "LEPROSY SUPPORT",
            desc: "Aiding leprosy patients with essential rations, medical support coordination, and challenging societal stigma."
          }
        ],
        extra: {}
      },
      {
        key: "leadership",
        name: "Stewards & Leadership",
        title: "STEWARDS OF THE MISSION",
        subtitle: "Our leadership is a blend of seasoned social architects and corporate experts, all united by a singular commitment to ethical service.",
        items: [
          {
            name: "PRAVESH UNIYAL",
            role: "FOUNDER & CHAIRMAN",
            initials: "PU",
            image: ""
          },
          {
            name: "SWATI",
            role: "CO-FOUNDER & DIRECTOR",
            initials: "S",
            image: ""
          },
          {
            name: "DR. RAJESH KUMAR",
            role: "MEDICAL ADVISOR",
            initials: "RK",
            image: ""
          }
        ],
        extra: {}
      },
      {
        key: "trust_stewardship",
        name: "Stewardship of Your Trust",
        title: "THE STEWARDSHIP OF YOUR TRUST",
        description: "At Seva India Foundation, trust isn't a promise—it's a practice. Your donation is 100% safe with us, and we ensure it reaches the ground where it is needed most, with 100% updates sent to you via WhatsApp and email.",
        extra: {
          programSupportPercent: "90%",
          programSupportTitle: "DIRECT PROGRAM SUPPORT",
          programSupportDesc: "Goes directly to funding our on-the-ground projects, resources, and beneficiary aid.",
          adminPercent: "10%",
          adminTitle: "ADMIN & FUNDRAISING",
          adminDesc: "Essential operations, technology, and compliance to ensure radical transparency."
        }
      },
      {
        key: "awards_recognition",
        name: "Awards & Recognition",
        title: "Awards & Recognition",
        subtitle: "Honors and accolades recognizing our ground-level transparency and humanitarian impact.",
        items: [
          { title: "BEST NGO FOR EDUCATION" },
          { title: "EXCELLENCE IN HEALTHCARE DELIVERY" },
          { title: "TRANSPARENCY IN GOVERNANCE AWARD" },
          { title: "SOCIAL IMPACT PIONEER" }
        ],
        extra: {}
      },
      {
        key: "allies_in_impact",
        name: "Allies in Impact",
        title: "ALLIES IN IMPACT",
        subtitle: "Powered by organizations that prioritize direct, ground-level action over corporate lip-service.",
        extra: {
          partnerName: "DEV BHOOMI SAMITI",
          partnerPillar: "Strategic Pillar: The immense contribution of Dev Bhoomi Samiti is what makes our mission possible. As our principal patron, they provide the visionary leadership and total support that fuels every project, every camp, and every life we touch.",
          partnerWebsiteUrl: "https://devbhoomisamiti.org",
          coreStrengthTitle: "FOUNDATION'S CORE STRENGTH",
          coreStrengthDesc: "Our operational model is built on the immense contribution and full visionary backing of Dev Bhoomi Samiti. This unique alliance allows us to focus 100% of our energy on ground-level implementation, ensuring that every resource is utilized for maximum social impact.",
          partnershipStatusLabel: "PARTNERSHIP STATUS",
          partnershipStatusValue: "CORE STRATEGIC ALLIANCE"
        }
      },
      {
        key: "transparency",
        name: "Transparency & Governance",
        title: "100% TRANSPARENT & ACCOUNTABLE",
        description: "At Seva India Foundation, trust isn't a promise—it's a practice. As a registered Section 8 NGO, we protect your trust through meticulous accountability and radical transparency.",
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
    bannerImage: "",
    sections: [
      {
        key: "vidhya",
        name: "VIDHYA (EDUCATION)",
        title: "VIDHYA (EDUCATION)",
        subtitle: "Rural children often leave school to support their families after a single medical emergency. We provide 'Bridge Schools' and scholarships to ensure their dreams don't die.",
        description: "The 'Vidhya (Education)' Program is a robust, nationwide initiative dedicated to democratizing access to quality education. We recognize that education is the single most powerful tool for social and economic mobility. Yet, for millions of children in rural and marginalized communities, geographical isolation, poverty, and lack of infrastructure make learning an impossible dream. Vidhya aims to completely eradicate these barriers.",
        image: "",
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
        image: "",
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
        image: "",
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
        image: "",
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
        image: "",
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
        image: "",
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
        image: "",
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
    pageSlug: "get-involved",
    pageName: "Get Involved / Volunteers",
    title: "Your time is the most valuable thing you can give",
    subtitle: "We do not need your money. We need your hands, your mind, and your heart. Whether you have 2 hours or 2 years — there is a place for you here.",
    bannerImage: "",
    sections: [
      {
        key: "impact_numbers",
        name: "Impact Numbers",
        title: "Impact by the Numbers",
        items: [
          { number: "200+", label: "Active Volunteers", sub: "Across Uttarakhand" },
          { number: "45,000+", label: "Hours Contributed", sub: "In the last 12 months" },
          { number: "12,000+", label: "Lives Touched", sub: "Through volunteer efforts" },
          { number: "8", label: "Cities Represented", sub: "Volunteers from across India" }
        ]
      },
      {
        key: "why_volunteer",
        name: "Why Volunteer With Us",
        title: "This is not charity. This is community.",
        items: [
          {
            title: "Work where you live",
            description: "Our centres are in Dehradun, Rajpur, Jakhan, and Dalanwala. Serve your own neighbourhood."
          },
          {
            title: "Flexible commitment",
            description: "2 hours a week or 20. Weekends only or weekdays. We build around your schedule."
          },
          {
            title: "Real skills, real growth",
            description: "The field teaches you what no classroom can."
          },
          {
            title: "A family, not an organisation",
            description: "When you join Seva India, you join a family."
          }
        ]
      },
      {
        key: "faqs",
        name: "Frequently Asked Questions",
        title: "Everything you need to know",
        items: [
          {
            q: "Do I need to be from Dehradun to volunteer?",
            a: "Not at all. We have volunteers from Delhi, Mumbai, Bangalore, and even abroad who visit for week-long intensives. Remote roles like design, content, and tech are fully location-independent."
          },
          {
            q: "How much time do I need to commit?",
            a: "As little as 2 hours a week or as much as full-time. Teaching roles need 4-6 hours weekly. Kitchen shifts are 2-3 hours. Health camps are full-day commitments. You choose what fits your life."
          },
          {
            q: "Is there any training provided?",
            a: "Yes. Every volunteer attends a 2-hour orientation at our Rajpur Road office. Field roles get additional safety briefings. Teaching volunteers receive our curriculum guide and mentor support."
          },
          {
            q: "Can I volunteer as a group or company?",
            a: "Absolutely. We regularly host corporate CSR days, college groups, and family volunteering weekends. Contact us at corporate@sevaindia.org for group bookings."
          },
          {
            q: "Will I get a certificate?",
            a: "Yes. All volunteers receive a digital certificate after 20 hours of service. Long-term volunteers (6+ months) get a recommendation letter and are invited to our annual volunteer meet."
          },
          {
            q: "What if I can only help remotely?",
            a: "We have plenty of remote roles — content writing, graphic design, social media, website maintenance, data entry, and fundraising. You can make a real impact from your laptop."
          }
        ]
      }
    ]
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
  {
    pageSlug: "refund-policy",
    pageName: "Refund & Cancellation Policy",
    title: "Refund & Cancellation Policy",
    subtitle: "Seva India Foundation is committed to transparency and ethical governance. This policy outlines guidelines regarding donations, cancellations, and refund requests.",
    content: "<h2>1. General Donation Policy</h2><p>Seva India Foundation is a registered Section 8 non-profit organisation dedicated to social welfare, education, healthcare, and rural empowerment. All donations made through our website, UPI, net banking, or debit/credit cards are considered voluntary contributions toward humanitarian causes.</p><h2>2. Tax Exemption & Receipts</h2><p>Donations made to Seva India Foundation are eligible for tax deduction benefits under Section 80G of the Income Tax Act, 1961. Once an 80G tax receipt has been generated and filed with the Income Tax Department, the donation amount cannot be refunded as per regulatory norms.</p><h2>3. Refund Request Conditions</h2><p>In exceptional cases of unauthorized transactions or technical payment errors, refund requests must be submitted within 7 calendar days of the transaction along with transaction reference details.</p>",
  },
];

const seedDefaultsIfEmpty = async () => {
  for (const page of DEFAULT_PAGES) {
    const existing = await CmsPageModel.findOne({ pageSlug: page.pageSlug, isDeleted: false });
    if (!existing) {
      await CmsPageModel.create({
        ...page,
        isPublished: true,
        isDeleted: false,
      });
    } else if (page.sections && page.sections.length > 0) {
      let modified = false;
      const existingSections = existing.sections || [];
      for (const defSec of page.sections) {
        const found = existingSections.some((s) => s.key === defSec.key);
        if (!found) {
          existingSections.push(defSec as any);
          modified = true;
        }
      }
      if (modified) {
        existing.sections = existingSections;
        await existing.save();
      }
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
    await seedDefaultsIfEmpty();
    page = await CmsPageModel.findOne({ pageSlug: cleanSlug, isDeleted: false });
  } else {
    // Check if missing default sections
    const defaultPage = DEFAULT_PAGES.find((p) => p.pageSlug === cleanSlug);
    if (defaultPage?.sections && defaultPage.sections.length > 0) {
      let modified = false;
      const existingSections = page.sections || [];
      for (const defSec of defaultPage.sections) {
        const found = existingSections.some((s) => s.key === defSec.key);
        if (!found) {
          existingSections.push(defSec as any);
          modified = true;
        }
      }
      if (modified) {
        page.sections = existingSections;
        await page.save();
      }
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

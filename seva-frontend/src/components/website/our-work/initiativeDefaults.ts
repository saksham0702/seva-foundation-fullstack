import { InitiativeData } from "./InitiativeCard";

export const DEFAULT_INITIATIVES: InitiativeData[] = [
  {
    key: "vidhya",
    name: "VIDHYA (EDUCATION)",
    title: "VIDHYA (EDUCATION)",
    subtitle:
      "Rural children often leave school to support their families after a single medical emergency. We provide 'Bridge Schools' and scholarships to ensure their dreams don't die.",
    description:
      "The 'Vidhya (Education)' Program is a robust, nationwide initiative dedicated to democratizing access to quality education. We recognize that education is the single most powerful tool for social and economic mobility. Yet, for millions of children in rural and marginalized communities, geographical isolation, poverty, and lack of infrastructure make learning an impossible dream. Vidhya aims to completely eradicate these barriers.",
    image: "",
    extra: {
      eyebrow: "OUR INITIATIVES",
      alt: "Children in rural bridge school smiling and studying",
      features: [
        "RURAL BRIDGE SCHOOLS",
        "TEACHER TRAINING",
        "SCHOLARSHIPS",
        "RESOURCE SUPPORT",
      ],
      faqs: [
        {
          question: "WHAT IS A BRIDGE SCHOOL?",
          answer:
            "Bridge schools are transitional educational centres set up in underserved rural and semi-urban communities to help dropouts and first-generation learners attain age-appropriate academic proficiency before integrating into mainstream schools.",
        },
        {
          question: "HOW ARE SCHOLARSHIPS DISTRIBUTED?",
          answer:
            "Scholarships are awarded through transparent merit-cum-means assessments to students at risk of dropping out due to acute financial distress.",
        },
      ],
      impactMetrics: [
        { value: "100,000+", label: "STUDENTS ENROLLED" },
        { value: "1,000+", label: "SCHOOLS SUPPORTED" },
        { value: "5,000+", label: "TEACHERS TRAINED" },
        { value: "15,000+", label: "SCHOLARSHIPS AWARDED" },
      ],
    },
  },
  {
    key: "arogya",
    name: "AROGYA (HEALTHCARE)",
    title: "AROGYA (HEALTHCARE)",
    subtitle:
      "A simple infection can bankrupt a rural family. Our mobile clinics reach the most remote hamlets across India, providing primary care and life-saving medicines.",
    description:
      "Arogya (Healthcare) is SEVA's vanguard healthcare initiative, driven by the philosophy that healthcare is a fundamental human right, not a luxury. In rural India, the absence of medical facilities means that a simple, preventable infection can escalate into a fatal tragedy or bankrupt an entire family. Arogya acts as a lifeline, bringing high-quality medical intervention directly to the doorsteps of the most isolated and vulnerable communities.",
    image: "",
    extra: {
      eyebrow: "OUR INITIATIVES",
      alt: "Compassionate medical caregiver holding hands with patient",
      features: [
        "MOBILE HEALTH CLINICS",
        "FREE MEDICINES & LABS",
        "PREVENTIVE HEALTH CAMPS",
        "MATERNAL & CHILD CARE",
      ],
      faqs: [
        {
          question: "HOW DO MOBILE MEDICAL CLINICS OPERATE?",
          answer:
            "Our mobile medical units travel to remote mountain hamlets weekly, equipped with diagnostic kits, essential medicines, and trained doctors to conduct checkups and provide urgent interventions.",
        },
        {
          question: "ARE MEDICINES PROVIDED FREE OF COST?",
          answer:
            "Yes, all prescribed essential medicines and basic diagnostic screenings at our medical camps are completely free of charge.",
        },
      ],
      impactMetrics: [
        { value: "50,000+", label: "PATIENTS TREATED" },
        { value: "150+", label: "MOBILE CLINIC CAMPS" },
        { value: "10,000+", label: "FREE HEALTH KITS" },
        { value: "25+", label: "REMOTE VILLAGES SERVED" },
      ],
    },
  },
  {
    key: "sammaan",
    name: "SAMMAAN (ELDERLY CARE)",
    title: "SAMMAAN (ELDERLY CARE)",
    subtitle:
      "Dignity and respect for our elders who have given their lives to our society. We provide nutrition, healthcare, and emotional companionship.",
    description:
      "Sammaan (Elderly Care) is dedicated to safeguarding the health, welfare, and self-respect of destitute senior citizens. Through geriatric health camps, monthly sustenance support, and community companionship circles, we ensure no elder is left alone or uncared for.",
    image: "",
    extra: {
      eyebrow: "OUR INITIATIVES",
      alt: "Elderly individuals receiving care and affection",
      features: [
        "GERIATRIC HEALTHCARE",
        "MONTHLY RATION SUPPORT",
        "COMPANIONSHIP CENTRES",
        "EMERGENCY AID",
      ],
      faqs: [
        {
          question: "HOW DOES SAMMAAN REACH ISOLATED ELDERS?",
          answer:
            "Volunteers and healthcare workers conduct weekly doorstep visits, providing essential medicines, hot meals, and emotional companionship to abandoned or isolated seniors.",
        },
      ],
      impactMetrics: [
        { value: "10,000+", label: "ELDERS CARED FOR" },
        { value: "80+", label: "ELDERLY CLUBS" },
        { value: "50,000+", label: "MEALS DELIVERED" },
        { value: "100%", label: "REGULAR VISITS" },
      ],
    },
  },
  {
    key: "shakti",
    name: "SHAKTI (WOMEN)",
    title: "SHAKTI (WOMEN)",
    subtitle:
      "Empowering women with vocational training, financial independence, and self-help collectives to break generational cycles of poverty.",
    description:
      "Shakti (Women) focuses on empowering rural women through vocational skills, digital literacy, self-help groups, and micro-entrepreneurship. When you empower a woman, you empower an entire family and transform a community.",
    image: "",
    extra: {
      eyebrow: "OUR INITIATIVES",
      alt: "Rural women participating in vocational empowerment program",
      features: [
        "SKILL & VOCATIONAL TRAINING",
        "MICRO-ENTERPRISE SUPPORT",
        "LEGAL & HEALTH RIGHTS",
        "SHG EMPOWERMENT",
      ],
      faqs: [
        {
          question: "WHAT VOCATIONAL SKILLS ARE PROVIDED?",
          answer:
            "We offer tailoring, handicrafts, organic food processing, and digital bookkeeping, linked directly to market channels for sustainable independent income.",
        },
      ],
      impactMetrics: [
        { value: "25,000+", label: "WOMEN EMPOWERED" },
        { value: "120+", label: "SHG GROUPS FORMED" },
        { value: "3,500+", label: "MICRO-BUSINESSES" },
        { value: "95%", label: "SUSTAINABILITY RATE" },
      ],
    },
  },
  {
    key: "annapurna",
    name: "ANNAPURNA (HUNGER)",
    title: "ANNAPURNA (HUNGER)",
    subtitle:
      "No child or vulnerable individual should sleep on an empty stomach. Nutritious, hygienic meals delivered daily to those in greatest need.",
    description:
      "Annapurna (Hunger Relief) operates daily community kitchens and food distribution drives across slums, migrant settlements, and distress zones, guaranteeing food security and fighting chronic malnutrition.",
    image: "",
    extra: {
      eyebrow: "OUR INITIATIVES",
      alt: "Distribution of nutritious warm meals to hungry children and families",
      features: [
        "COMMUNITY KITCHENS",
        "DAILY HOT MEALS",
        "DRY RATION KITS",
        "CHILD NUTRITION",
      ],
      faqs: [
        {
          question: "WHERE DOES THE FOOD COME FROM?",
          answer:
            "Our food is cooked daily in certified hygienic community kitchens using fresh, locally sourced ingredients to guarantee balanced nutrition.",
        },
      ],
      impactMetrics: [
        { value: "500,000+", label: "MEALS SERVED" },
        { value: "25,000+", label: "RATION KITS" },
        { value: "10+", label: "COMMUNITY KITCHENS" },
        { value: "365", label: "DAYS ACTIVE" },
      ],
    },
  },
  {
    key: "gramodaya",
    name: "GRAMODAYA (RURAL)",
    title: "GRAMODAYA (RURAL)",
    subtitle:
      "Revitalizing rural infrastructure, solar lighting, clean drinking water, and sanitation to create self-reliant village ecosystems.",
    description:
      "Gramodaya (Rural Development) fosters sustainable development in remote villages of the Himalayan belt through solar power installations, clean water filtration plants, organic farming support, and community development centres.",
    image: "",
    extra: {
      eyebrow: "OUR INITIATIVES",
      alt: "Rural Himalayan community development and clean water infrastructure",
      features: [
        "CLEAN DRINKING WATER",
        "SOLAR STREET LIGHTS",
        "SANITATION FACILITIES",
        "FARMER SUPPORT",
      ],
      faqs: [
        {
          question: "HOW DO YOU ENSURE VILLAGE SELF-RELIANCE?",
          answer:
            "We establish local village development committees and train youth to maintain solar panels, water filters, and sanitation systems independently.",
        },
      ],
      impactMetrics: [
        { value: "65+", label: "VILLAGES ADOPTED" },
        { value: "200+", label: "SOLAR LIGHTS" },
        { value: "45+", label: "WATER FILTERS" },
        { value: "40,000+", label: "LIVES IMPACTED" },
      ],
    },
  },
  {
    key: "rakshak",
    name: "RAKSHAK (DISASTER)",
    title: "RAKSHAK (DISASTER)",
    subtitle:
      "First responders on the ground during floods, landslides, and natural calamities with immediate rescue, food, and rebuilding aid.",
    description:
      "Rakshak (Disaster Relief) is SEVA's rapid response task force trained to deploy within hours during cloudbursts, earthquakes, and landslides in Uttarakhand, providing emergency rescue, medical aid, and sustainable home rehabilitation.",
    image: "",
    extra: {
      eyebrow: "OUR INITIATIVES",
      alt: "Disaster relief workers providing emergency assistance in affected areas",
      features: [
        "24/7 RAPID RESCUE",
        "EMERGENCY RELIEF KITS",
        "TEMPORARY SHELTER",
        "POST-DISASTER REBUILD",
      ],
      faqs: [
        {
          question: "HOW QUICKLY CAN RAKSHAK TEAMS DEPLOY?",
          answer:
            "Our trained local ground volunteers are stationed across high-risk districts in Uttarakhand and deploy within 3 to 6 hours of any major calamity.",
        },
      ],
      impactMetrics: [
        { value: "15,000+", label: "RESCUES & EVACUATIONS" },
        { value: "75+", label: "DISASTER ZONES REACHED" },
        { value: "30,000+", label: "BLANKETS & TENTS" },
        { value: "100%", label: "COMMUNITY REBUILD" },
      ],
    },
  },
];

/**
 * Robust matching for initiatives:
 * Matches by key, name, title, or partial slug
 */
export function findInitiativeBySlug(
  initiatives: InitiativeData[],
  rawSlug: string
): InitiativeData | null {
  if (!rawSlug) return null;
  const slug = decodeURIComponent(rawSlug).toLowerCase().trim();

  // 1. Exact key match
  let found = initiatives.find(
    (i) => (i.key || "").toLowerCase().trim() === slug
  );
  if (found) return found;

  // 2. Exact match against name or title
  found = initiatives.find((i) => {
    const k = (i.key || "").toLowerCase().trim();
    const n = (i.name || "").toLowerCase().trim();
    const t = (i.title || "").toLowerCase().trim();
    return k === slug || n === slug || t === slug;
  });
  if (found) return found;

  // 3. Partial or prefix match (e.g. "vidhya-education" or "vidhya")
  found = initiatives.find((i) => {
    const k = (i.key || "").toLowerCase().trim();
    if (!k) return false;
    return slug.startsWith(k) || k.startsWith(slug) || slug.includes(k);
  });
  if (found) return found;

  // 4. Word in title match
  found = initiatives.find((i) => {
    const t = (i.title || i.name || "").toLowerCase();
    return t.includes(slug) || slug.includes(t);
  });

  return found || null;
}

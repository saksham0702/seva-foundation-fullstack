import React from "react";
import { ICmsSection } from "@/types/cms";

import SacredPromise from "./sections/SacredPromise";
import VisionMission from "./sections/VisionMission";
import AreasOfFocus from "./sections/AreaOfFocus";
import Leadership from "./sections/Leadership";
import TrustStewardship from "./sections/TrustStewardship";
import AwardsRecognition from "./sections/AwardsRecognition";
import AlliesInImpact from "./sections/AlliesInImpact";
import Transparency from "./sections/Transparency";

type SectionComponent = React.ComponentType<{ section: ICmsSection }>;

const REGISTRY: Record<string, SectionComponent> = {
  sacred_promise: SacredPromise,
  vision_mission: VisionMission,
  areas_of_focus: AreasOfFocus,
  areas: AreasOfFocus,
  leadership: Leadership,
  stewards: Leadership,
  trust_stewardship: TrustStewardship,
  trust: TrustStewardship,
  awards_recognition: AwardsRecognition,
  awards: AwardsRecognition,
  allies_in_impact: AlliesInImpact,
  allies: AlliesInImpact,
  transparency: Transparency,
};

export function SectionRenderer({ sections }: { sections: ICmsSection[] }) {
  if (!sections || !Array.isArray(sections)) return null;

  return (
    <>
      {sections
        .filter((s) => s.extra?.hidden !== true) // admin can toggle visibility
        .map((section, idx) => {
          const Comp = REGISTRY[section.key?.toLowerCase()];
          if (!Comp) return null; // unknown key -> skip, don't crash
          return <Comp key={section.key || idx} section={section} />;
        })}
    </>
  );
}
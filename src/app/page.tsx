import { ScrollStage } from "@/components/three/ScrollStage";
import { ComparisonArgument } from "@/components/sections/home/ComparisonArgument";
import { Industries } from "@/components/sections/home/Industries";
import { TechEcosystem } from "@/components/sections/home/TechEcosystem";

// The homepage is the pinned story stage (§5), then the accessible comparison
// fallback (§6, sr-only on desktop), then the normal-scroll post-stage sections.
export default function Home() {
  return (
    <>
      <ScrollStage />
      <ComparisonArgument />
      <Industries />
      <TechEcosystem />
    </>
  );
}

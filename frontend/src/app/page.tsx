import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Hero } from "@/components/marketing/hero";
import { LiveTicker } from "@/components/marketing/live-ticker";
import { Features } from "@/components/marketing/features";
import { PlatformShowcase } from "@/components/marketing/platform-showcase";
import { MarketsShowcase } from "@/components/marketing/markets-showcase";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { MovementBand } from "@/components/marketing/movement-band";
import { CtaSection } from "@/components/marketing/cta-section";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <Hero />
        <LiveTicker />
        <Features />
        <PlatformShowcase />
        <MarketsShowcase />
        <HowItWorks />
        <MovementBand />
        <CtaSection />
      </main>
      <PublicFooter />
    </div>
  );
}

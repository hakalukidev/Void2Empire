import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { HomeSidebar } from "@/components/home/home-sidebar";
import { WelcomeBand } from "@/components/home/welcome-band";
import { MarketPanel } from "@/components/home/market-panel";
import { QuickTrade } from "@/components/home/quick-trade";
import { CtaBand } from "@/components/home/cta-band";
import { MarketWatch, TopGainers } from "@/components/home/market-watch";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />

      <div className="flex flex-1 items-start">
        <HomeSidebar />

        <main className="min-w-0 flex-1 space-y-4 p-4">
          <WelcomeBand />
          <MarketPanel />
          <QuickTrade />
          <CtaBand />

          {/* The rails move into the column below the chart on narrower viewports. */}
          <div className="grid gap-4 sm:grid-cols-2 xl:hidden">
            <MarketWatch />
            <TopGainers />
          </div>
        </main>

        <aside className="hidden w-80 shrink-0 space-y-4 border-l border-border p-4 xl:block">
          <MarketWatch />
          <TopGainers />
        </aside>
      </div>

      <PublicFooter />
    </div>
  );
}

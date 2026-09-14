"use client";

import dynamic from "next/dynamic";

const HeroGlobe = dynamic(() => import("@/components/marketing/hero-globe").then((mod) => mod.HeroGlobe), {
  ssr: false,
  loading: () => (
    <div className="aspect-square w-full max-w-[420px] animate-pulse rounded-full bg-white/5" />
  ),
});

export function HeroGlobeLazy() {
  return <HeroGlobe />;
}

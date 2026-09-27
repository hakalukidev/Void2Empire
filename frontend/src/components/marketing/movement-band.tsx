import { LogoMark } from "@/components/ui/logo";

export function MovementBand() {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-[var(--brand-night)] py-20 text-white">
      <svg
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 w-full"
        aria-hidden="true"
      >
        <path
          d="M0 200 L0 150 L140 90 L260 145 L400 70 L520 140 L660 60 L800 135 L940 80 L1080 145 L1200 100 L1200 200 Z"
          fill="var(--brand-gold-500)"
          fillOpacity="0.06"
        />
        <path
          d="M0 200 L0 175 L180 130 L320 172 L470 118 L620 168 L780 126 L930 170 L1080 134 L1200 168 L1200 200 Z"
          fill="var(--brand-gold-500)"
          fillOpacity="0.1"
        />
      </svg>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55 sm:text-sm">
          More than a platform
          <span className="mx-3 text-brand-gold-500">—</span>
          it&apos;s a movement
        </p>
        <LogoMark size={56} />
      </div>
    </section>
  );
}

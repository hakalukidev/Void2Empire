import { useLocaleStore } from "@/store/locale-store";

/**
 * Every panel on the home page that shows a price has to carry this. There is
 * no market-data feed until DR-023 is decided, so the figures are layout
 * samples, not quotes.
 */
export function SampleBadge({ className = "" }: { className?: string }) {
  const { t } = useLocaleStore();
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary ${className}`}
    >
      {t("home.illustrative")}
    </span>
  );
}

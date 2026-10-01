import Image from "next/image";
import { cn } from "@/lib/utils/cn";

// SVG flags from country-flag-icons (MIT), served from public/flags. Emoji
// flags are not used because Windows renders them as two plain letters.
export function CountryFlag({ iso2, className }: { iso2: string; className?: string }) {
  return (
    <Image
      src={`/flags/${iso2.toLowerCase()}.svg`}
      alt=""
      width={20}
      height={14}
      unoptimized
      className={cn("h-3.5 w-5 shrink-0 rounded-[2px] object-cover ring-1 ring-border", className)}
    />
  );
}

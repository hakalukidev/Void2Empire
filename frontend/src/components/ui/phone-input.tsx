"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { countries, type Country } from "@/config/countries";
import { CountryFlag } from "@/components/ui/country-flag";
import { useLocaleStore } from "@/store/locale-store";
import { cn } from "@/lib/utils/cn";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  // Fires when the country changes, by picking from the list or by typing or
  // pasting a number that starts with "+<dial code>".
  onCountryChange?: (country: Country) => void;
  defaultCountryIso2?: string;
  hasError?: boolean;
  id?: string;
}

export function findCountry(iso2: string): Country {
  return countries.find((c) => c.iso2 === iso2) ?? countries[0];
}

// Longest dial code that prefixes `digits`. Codes shared by several countries
// (+1, +7) keep the current country when it is one of them.
function matchDialCode(digits: string, current: Country): Country | undefined {
  let best: Country | undefined;
  for (const c of countries) {
    if (!digits.startsWith(c.dialCode)) continue;
    if (!best || c.dialCode.length > best.dialCode.length) best = c;
  }
  if (best && current.dialCode === best.dialCode) return current;
  return best;
}

export function PhoneInput({
  value,
  onChange,
  onBlur,
  onCountryChange,
  defaultCountryIso2 = "BD",
  hasError,
  id,
}: PhoneInputProps) {
  const { t } = useLocaleStore();
  const [country, setCountry] = useState<Country>(() => findCountry(defaultCountryIso2));
  const [nationalNumber, setNationalNumber] = useState(() =>
    value.startsWith(`+${findCountry(defaultCountryIso2).dialCode}`)
      ? value.slice(findCountry(defaultCountryIso2).dialCode.length + 1)
      : ""
  );
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dialCode.includes(q)
    );
  }, [query]);

  function selectCountry(c: Country) {
    setCountry(c);
    setOpen(false);
    setQuery("");
    onChange(nationalNumber ? `+${c.dialCode}${nationalNumber}` : "");
    onCountryChange?.(c);
  }

  function handleNumberChange(raw: string) {
    const digits = raw.replace(/[^0-9]/g, "");

    // "+8801712..." typed or pasted in full: switch country, keep the rest.
    if (raw.trimStart().startsWith("+")) {
      const matched = matchDialCode(digits, country);
      if (matched) {
        const national = digits.slice(matched.dialCode.length);
        setCountry(matched);
        setNationalNumber(national);
        onChange(national ? `+${matched.dialCode}${national}` : "");
        if (matched.iso2 !== country.iso2) onCountryChange?.(matched);
        return;
      }
    }

    setNationalNumber(digits);
    onChange(digits ? `+${country.dialCode}${digits}` : "");
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex rounded-lg border border-input bg-background/60 transition-[border-color,box-shadow] hover:border-muted-foreground/40 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15",
        hasError && "border-destructive focus-within:border-destructive focus-within:ring-destructive/15"
      )}
      onKeyDown={(event) => {
        // Escape closes the list only, not a surrounding dialog.
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          setOpen(false);
          setQuery("");
        }
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${t("common.country_code")} ${country.name} +${country.dialCode}`}
        className="flex h-11 shrink-0 items-center gap-1.5 rounded-l-lg border-r border-input pl-3.5 pr-2.5 text-sm transition-colors hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:outline-none"
      >
        <CountryFlag iso2={country.iso2} />
        <span className="font-medium tabular-nums text-foreground/90">+{country.dialCode}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>

      <input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={nationalNumber}
        onChange={(e) => handleNumberChange(e.target.value)}
        onBlur={onBlur}
        placeholder="1700 000000"
        aria-invalid={hasError || undefined}
        className="auth-input h-11 w-full min-w-0 rounded-r-lg bg-transparent px-3.5 text-sm tabular-nums outline-none placeholder:text-muted-foreground/60"
      />

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-30 w-full min-w-72 overflow-hidden rounded-lg border border-border bg-card shadow-2xl shadow-black/40 animate-modal-in">
          <div className="border-b border-border p-2">
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("common.search_country")}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground">{t("common.no_matches")}</li>
            )}
            {filtered.map((c) => (
              <li key={c.iso2}>
                <button
                  type="button"
                  role="option"
                  aria-selected={c.iso2 === country.iso2}
                  onClick={() => selectCountry(c)}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                    c.iso2 === country.iso2 && "bg-primary/10 text-primary"
                  )}
                >
                  <CountryFlag iso2={c.iso2} />
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="tabular-nums text-muted-foreground">+{c.dialCode}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

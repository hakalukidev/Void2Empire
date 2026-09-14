"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { countries, flagEmoji, type Country } from "@/config/countries";
import { cn } from "@/lib/utils/cn";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  defaultCountryIso2?: string;
  hasError?: boolean;
  id?: string;
}

function findCountry(iso2: string): Country {
  return countries.find((c) => c.iso2 === iso2) ?? countries[0];
}

export function PhoneInput({
  value,
  onChange,
  onBlur,
  defaultCountryIso2 = "BD",
  hasError,
  id,
}: PhoneInputProps) {
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
  }

  function handleNumberChange(raw: string) {
    const digits = raw.replace(/[^0-9]/g, "");
    setNationalNumber(digits);
    onChange(digits ? `+${country.dialCode}${digits}` : "");
  }

  return (
    <div ref={containerRef} className="relative flex">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-10 shrink-0 items-center gap-1 rounded-l-md border border-r-0 border-input bg-background px-3 text-sm",
          hasError && "border-destructive"
        )}
      >
        <span className="text-base leading-none">{flagEmoji(country.iso2)}</span>
        <span className="text-muted-foreground">+{country.dialCode}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
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
        className={cn(
          "h-10 w-full rounded-r-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring",
          hasError && "border-destructive"
        )}
      />

      {open && (
        <div className="absolute left-0 top-11 z-20 w-72 overflow-hidden rounded-md border border-border bg-card shadow-lg">
          <div className="border-b border-border p-2">
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code"
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <ul role="listbox" className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground">No matches</li>
            )}
            {filtered.map((c) => (
              <li key={c.iso2}>
                <button
                  type="button"
                  role="option"
                  aria-selected={c.iso2 === country.iso2}
                  onClick={() => selectCountry(c)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent",
                    c.iso2 === country.iso2 && "bg-accent"
                  )}
                >
                  <span className="text-base leading-none">{flagEmoji(c.iso2)}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-muted-foreground">+{c.dialCode}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

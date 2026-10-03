"use client";

import { Input } from "@/components/ui/input";
import { isPositiveDecimal } from "@/lib/utils/decimal";

/**
 * Decimal-string input for every money, quantity and price field.
 * `type="number"` is deliberately avoided: browsers let it emit exponent
 * notation ("1e5"), which is not a valid decimal string and would be silently
 * rejected by the validators. Keys are filtered on the way in so a malformed
 * value can never reach state (Sec46 rule #40).
 */
export function DecimalField({
  id,
  label,
  value,
  onChange,
  invalidText,
  optional = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  invalidText: string;
  /** Optional fields (Stop Loss / Take Profit) are valid while empty. */
  optional?: boolean;
}) {
  const invalid = value !== "" && !isPositiveDecimal(value);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        placeholder={optional ? "—" : "0.00"}
        value={value}
        onChange={(event) => {
          if (event.target.value === "" || /^\d*\.?\d*$/.test(event.target.value)) {
            onChange(event.target.value);
          }
        }}
        aria-invalid={invalid}
        className="bg-secondary/30"
      />
      {invalid && <p className="mt-1 text-xs text-danger">{invalidText}</p>}
    </div>
  );
}

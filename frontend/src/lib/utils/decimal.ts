// Decimal helpers for money values represented as strings.
// Money must never be handled as float32/float64 (Sec46 rule #40).

const DECIMAL_RE = /^-?\d+(\.\d+)?$/;

function split(value: string): { neg: boolean; int: string; frac: string } {
  const neg = value.startsWith("-");
  const abs = neg ? value.slice(1) : value;
  const [int, frac = ""] = abs.split(".");
  return { neg, int, frac };
}

function format(total: bigint, scale: number): string {
  const neg = total < BigInt(0);
  let digits = (neg ? -total : total).toString().padStart(scale + 1, "0");
  if (scale > 0) {
    digits = `${digits.slice(0, digits.length - scale)}.${digits.slice(digits.length - scale)}`;
  }
  return `${neg ? "-" : ""}${digits}`;
}

/** Sum any number of decimal strings, returning a decimal string. Non-numeric inputs are treated as zero. */
export function addDecimalStrings(...values: string[]): string {
  let scale = 0;
  const parsed = values.filter((v) => DECIMAL_RE.test(v)).map((v) => {
    const { neg, int, frac } = split(v);
    scale = Math.max(scale, frac.length);
    return { neg, int, frac };
  });

  let total = BigInt(0);
  for (const { neg, int, frac } of parsed) {
    const scaled = BigInt(int + frac.padEnd(scale, "0"));
    total += neg ? -scaled : scaled;
  }

  return format(total, scale);
}

/**
 * Multiply a decimal string by an integer factor, exactly (no float).
 * Used for the funding 10× live computation (REQ-099). Returns "0" for
 * non-numeric input so the UI can render a placeholder while typing.
 */
export function multiplyDecimalByInteger(value: string, factor: number): string {
  if (!DECIMAL_RE.test(value) || !Number.isInteger(factor)) return "0";
  const { neg, int, frac } = split(value);
  const scale = frac.length;
  const scaled = BigInt(int + frac.padEnd(scale, "0"));
  const product = scaled * BigInt(factor);
  return format(neg ? -product : product, scale);
}

/**
 * Multiply two decimal strings exactly (no float). Returns "0" for non-numeric
 * input so the UI can render a placeholder while typing.
 */
export function multiplyDecimalStrings(a: string, b: string): string {
  if (!DECIMAL_RE.test(a) || !DECIMAL_RE.test(b)) return "0";
  const pa = split(a);
  const pb = split(b);
  const scale = pa.frac.length + pb.frac.length;
  const magA = BigInt(pa.int + pa.frac);
  const magB = BigInt(pb.int + pb.frac);
  const product = magA * magB;
  const neg = pa.neg !== pb.neg;
  return format(neg ? -product : product, scale);
}

/**
 * Presentation only: pad or truncate a decimal string to `places` fractional
 * digits WITHOUT rounding, so a preview never shows more precision than it
 * holds. The amount actually charged is computed and rounded server-side
 * (DR-047), so this must never feed a calculation.
 */
export function clampDecimalPlaces(value: string, places: number): string {
  if (!DECIMAL_RE.test(value) || !Number.isInteger(places) || places < 0) return value;
  const { neg, int, frac } = split(value);
  const kept = frac.slice(0, places).padEnd(places, "0");
  return `${neg ? "-" : ""}${places > 0 ? `${int}.${kept}` : int}`;
}

/**
 * Presentation only: clampDecimalPlaces plus thousands separators. The comma is
 * not a valid decimal character, so this output is for reading, never for input
 * fields or for anything that gets parsed again.
 */
export function groupDecimalString(value: string): string {
  const neg = value.startsWith("-");
  const [int, frac] = (neg ? value.slice(1) : value).split(".");
  if (!/^\d+$/.test(int ?? "")) return value;
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${neg ? "-" : ""}${frac === undefined ? grouped : `${grouped}.${frac}`}`;
}

/** clampDecimalPlaces + groupDecimalString, for displaying a money amount. */
export function formatDecimalString(value: string, places: number): string {
  return groupDecimalString(clampDecimalPlaces(value, places));
}

/** True when the string is a well-formed, strictly positive decimal amount. */
export function isPositiveDecimal(value: string): boolean {
  if (!DECIMAL_RE.test(value)) return false;
  const { neg, int, frac } = split(value);
  return !neg && BigInt(int + frac) > BigInt(0);
}

/** Compare two decimal strings: returns -1, 0, or 1 (a < b, a == b, a > b). */
export function compareDecimalStrings(a: string, b: string): number {
  const parse = (v: string) => {
    const { neg, int, frac } = split(v);
    const scale = frac.length;
    return { neg, mag: BigInt(int + frac), scale };
  };
  const pa = parse(DECIMAL_RE.test(a) ? a : "0");
  const pb = parse(DECIMAL_RE.test(b) ? b : "0");
  const scale = Math.max(pa.scale, pb.scale);
  const va = pa.mag * BigInt(10) ** BigInt(scale - pa.scale);
  const vb = pb.mag * BigInt(10) ** BigInt(scale - pb.scale);
  const sa = pa.neg ? -va : va;
  const sb = pb.neg ? -vb : vb;
  return sa < sb ? -1 : sa > sb ? 1 : 0;
}


function trimZeros(value: string): string {
  if (!value.includes(".")) return value;
  const trimmed = value.replace(/0+$/, "");
  return trimmed.endsWith(".") ? trimmed.slice(0, -1) : trimmed;
}

/**
 * Divide a decimal string by an integer, exactly, keeping up to 8 extra
 * fractional digits (trailing zeros trimmed). Used for the 50% loss threshold
 * (REQ-102). Returns "0" for invalid input or a zero divisor.
 */
export function divideDecimalByInteger(value: string, divisor: number): string {
  if (!DECIMAL_RE.test(value) || !Number.isInteger(divisor) || divisor === 0) return "0";
  const { neg, int, frac } = split(value);
  const scale = frac.length;
  const EXTRA = 8;
  const numerator = BigInt(int + frac + "0".repeat(EXTRA));
  const quotient = numerator / BigInt(Math.abs(divisor));
  const signed = neg !== (divisor < 0) ? -quotient : quotient;
  return trimZeros(format(signed, scale + EXTRA));
}

/** Subtract b from a, exactly (no float). a - b. */
export function subtractDecimalStrings(a: string, b: string): string {
  const negated = b.startsWith("-") ? b.slice(1) : `-${b}`;
  return addDecimalStrings(a, negated);
}

/** Absolute value of a decimal string. */
export function absDecimalString(value: string): string {
  return value.startsWith("-") ? value.slice(1) : value;
}

/**
 * Divide a by b, exactly, truncated to `scale` fractional digits (default 8,
 * trailing zeros trimmed). Returns "0" for invalid input or a zero divisor.
 */
export function divideDecimalStrings(a: string, b: string, scale = 8): string {
  if (!DECIMAL_RE.test(a) || !DECIMAL_RE.test(b) || !Number.isInteger(scale) || scale < 0) return "0";
  const pa = split(a);
  const pb = split(b);
  const magB = BigInt(pb.int + pb.frac);
  if (magB === BigInt(0)) return "0";
  const magA = BigInt(pa.int + pa.frac);
  const numerator = magA * BigInt(10) ** BigInt(scale + pb.frac.length);
  const denominator = magB * BigInt(10) ** BigInt(pa.frac.length);
  const quotient = numerator / denominator;
  const neg = pa.neg !== pb.neg;
  return trimZeros(format(neg ? -quotient : quotient, scale));
}



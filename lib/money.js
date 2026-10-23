/**
 * Money utilities for Bangladeshi Taka (BDT, ৳)
 * Internal prices are stored in minor units (100 poisha = 1 BDT).
 */

export function toMajorUnits(minorUnits = 0) {
  if (typeof minorUnits !== "number" || isNaN(minorUnits)) return 0;
  return minorUnits / 100;
}

export function toMinorUnits(majorUnits = 0) {
  const numeric = typeof majorUnits === "string" ? parseFloat(majorUnits) : majorUnits;
  if (isNaN(numeric) || numeric < 0) return 0;
  return Math.round(numeric * 100);
}

export function formatBDT(minorUnits = 0) {
  const major = toMajorUnits(minorUnits);
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(major)
    .replace("BDT", "৳")
    .trim();
}

/**
 * Clean and normalize an Indian phone number.
 * Returns a 12-digit number with 91 prefix, or null if invalid.
 */
export function cleanPhone(raw: string): string | null {
  // Strip spaces, dashes, brackets, dots
  let num = raw.replace(/[\s\-\(\)\.]/g, "");
  // Remove leading +
  if (num.startsWith("+")) num = num.slice(1);

  // 10 digits starting with 6-9 → add 91 prefix
  if (/^[6-9]\d{9}$/.test(num)) {
    return "91" + num;
  }

  // Already 91 + 10 digits
  if (/^91[6-9]\d{9}$/.test(num)) {
    return num;
  }

  return null;
}

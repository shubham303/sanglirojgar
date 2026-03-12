import type { Language } from "./i18n/translations";

const MARATHI_MONTHS = [
  "जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून",
  "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर",
];

const ENGLISH_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatLocation(taluka: string, district: string): string {
  const d = district || "सांगली";
  if (!taluka || taluka === d) return d;
  return `${taluka}, ${d}`;
}

export function formatDateMarathi(dateString: string, lang: Language = "mr"): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const months = lang === "en" ? ENGLISH_MONTHS : MARATHI_MONTHS;
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatExperience(years: string, lang: Language = "mr"): string {
  if (years === "0") return lang === "en" ? "No experience" : "अनुभव नाही";
  return lang === "en" ? `${years} years experience` : `${years} वर्षे अनुभव`;
}

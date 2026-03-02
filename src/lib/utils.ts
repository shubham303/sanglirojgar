const MARATHI_MONTHS = [
  "जानेवारी",
  "फेब्रुवारी",
  "मार्च",
  "एप्रिल",
  "मे",
  "जून",
  "जुलै",
  "ऑगस्ट",
  "सप्टेंबर",
  "ऑक्टोबर",
  "नोव्हेंबर",
  "डिसेंबर",
];

export function formatLocation(taluka: string, district: string): string {
  const d = district || "सांगली";
  if (!taluka || taluka === d) return d;
  return `${taluka}, ${d}`;
}

export function formatDateMarathi(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = MARATHI_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatExperience(years: string): string {
  return years === "0" ? "अनुभव नाही" : `${years} वर्षे अनुभव`;
}

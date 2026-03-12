"use client";

import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function LanguageToggle() {
  const { lang, setLang, t } = useTranslation();

  return (
    <button
      onClick={() => setLang(lang === "mr" ? "en" : "mr")}
      className="text-sm font-medium px-2.5 py-1 rounded-lg transition"
      style={{ color: "#FF6B00", backgroundColor: "#FFF7ED" }}
    >
      {t("lang.switch")}
    </button>
  );
}

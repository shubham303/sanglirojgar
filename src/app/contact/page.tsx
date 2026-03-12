"use client";

import { ADMIN_PHONE } from "@/lib/constants";
import { useTranslation } from "@/lib/i18n/LanguageContext";

const WA_MESSAGE = encodeURIComponent("नमस्कार, मला mahajob.in बद्दल माहिती हवी आहे.");

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-4">{t("contact.title")}</h1>

      <div
        className="bg-white rounded-xl p-5 mb-5"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          <span className="font-semibold" style={{ color: "#FF6B00" }}>{t("nav.brand")}</span> {t("contact.aboutDesc")}
        </p>
        <ul className="text-sm text-gray-600 space-y-1.5 mb-3">
          <li>- {t("contact.feature1")}</li>
          <li>- {t("contact.feature2")}</li>
          <li>- {t("contact.feature3")}</li>
          <li>- {t("contact.feature4")}</li>
        </ul>
        <p className="text-sm text-gray-500">
          {t("contact.helpText")}
        </p>
      </div>

      <div
        className="bg-white rounded-xl p-5"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <p className="text-sm font-semibold text-gray-700 mb-3">{t("contact.contactLabel")}</p>
        <div className="flex gap-3">
          <a
            href={`tel:${ADMIN_PHONE}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition"
            style={{ backgroundColor: "#16a34a", color: "#ffffff" }}
          >
            <span style={{ fontSize: 18 }}>📞</span>
            {t("contact.call")}
          </a>
          <a
            href={`https://wa.me/91${ADMIN_PHONE}?text=${WA_MESSAGE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition"
            style={{ backgroundColor: "#25D366", color: "#ffffff" }}
          >
            <span style={{ fontSize: 18 }}>💬</span>
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

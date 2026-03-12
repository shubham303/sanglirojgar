"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function MyAds() {
  const [phone, setPhone] = useState("");
  const router = useRouter();
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length === 10) {
      router.push(`/employer/${phone}`);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-8">
      <h1 className="text-xl font-bold text-gray-800 mb-1.5 text-center">
        {t("myAds.title")}
      </h1>
      <p className="text-sm text-gray-400 mb-5 text-center">
        {t("myAds.subtitle")}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            if (val.length <= 10) setPhone(val);
          }}
          placeholder={t("form.phonePlaceholder")}
          className="border border-gray-200 rounded-xl px-4 py-3 text-base text-center focus:outline-none focus:border-[#FF6B00]"
          autoFocus
        />
        <button
          type="submit"
          disabled={phone.length !== 10}
          className="text-base font-semibold py-3 rounded-xl transition disabled:opacity-50"
          style={{ backgroundColor: "#FF6B00", color: "#ffffff" }}
        >
          {t("myAds.viewAds")}
        </button>
      </form>
    </div>
  );
}

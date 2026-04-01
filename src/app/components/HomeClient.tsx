"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function HomeClient() {
  const { t, lang } = useTranslation();

  const cities = [
    // Featured 5 first
    { mr: "सांगली", en: "Sangli", slug: "sangli" },
    { mr: "कोल्हापूर", en: "Kolhapur", slug: "kolhapur" },
    { mr: "पुणे", en: "Pune", slug: "pune" },
    { mr: "मुंबई", en: "Mumbai", slug: "mumbai" },
    { mr: "नागपूर", en: "Nagpur", slug: "nagpur" },
    // Remaining districts
    { mr: "नाशिक", en: "Nashik", slug: "nashik" },
    { mr: "औरंगाबाद", en: "Aurangabad", slug: "aurangabad" },
    { mr: "सोलापूर", en: "Solapur", slug: "solapur" },
    { mr: "सातारा", en: "Satara", slug: "satara" },
    { mr: "अहमदनगर", en: "Ahmednagar", slug: "ahmednagar" },
    { mr: "रत्नागिरी", en: "Ratnagiri", slug: "ratnagiri" },
    { mr: "ठाणे", en: "Thane", slug: "thane" },
    { mr: "रायगड", en: "Raigad", slug: "raigad" },
    { mr: "सिंधुदुर्ग", en: "Sindhudurg", slug: "sindhudurg" },
    { mr: "पालघर", en: "Palghar", slug: "palghar" },
    { mr: "धुळे", en: "Dhule", slug: "dhule" },
    { mr: "जळगाव", en: "Jalgaon", slug: "jalgaon" },
    { mr: "नंदुरबार", en: "Nandurbar", slug: "nandurbar" },
    { mr: "अमरावती", en: "Amravati", slug: "amravati" },
    { mr: "अकोला", en: "Akola", slug: "akola" },
    { mr: "बुलढाणा", en: "Buldhana", slug: "buldhana" },
    { mr: "यवतमाळ", en: "Yavatmal", slug: "yavatmal" },
    { mr: "वाशीम", en: "Washim", slug: "washim" },
    { mr: "वर्धा", en: "Wardha", slug: "wardha" },
    { mr: "भंडारा", en: "Bhandara", slug: "bhandara" },
    { mr: "गोंदिया", en: "Gondia", slug: "gondia" },
    { mr: "चंद्रपूर", en: "Chandrapur", slug: "chandrapur" },
    { mr: "गडचिरोली", en: "Gadchiroli", slug: "gadchiroli" },
    { mr: "जालना", en: "Jalna", slug: "jalna" },
    { mr: "बीड", en: "Beed", slug: "beed" },
    { mr: "लातूर", en: "Latur", slug: "latur" },
    { mr: "उस्मानाबाद", en: "Osmanabad", slug: "osmanabad" },
    { mr: "नांदेड", en: "Nanded", slug: "nanded" },
    { mr: "परभणी", en: "Parbhani", slug: "parbhani" },
    { mr: "हिंगोली", en: "Hingoli", slug: "hingoli" },
  ];

  const categories = [
    { mr: "ट्रान्सपोर्ट", en: "Transport", search: "driver", icon: "🚛" },
    { mr: "सेल्स", en: "Sales", search: "sales", icon: "🛒" },
    { mr: "हॉस्पिटल", en: "Hospital", search: "hospital", icon: "🏥" },
    { mr: "ऑफिस", en: "Office", search: "office", icon: "💼" },
    { mr: "वर्क फ्रॉम होम", en: "Work from Home", search: "work from home", icon: "🏠" },
    { mr: "एअरपोर्ट", en: "Airport", search: "airport", icon: "✈️" },
    { mr: "हेल्पर", en: "Helper", search: "helper", icon: "🤝" },
    { mr: "अकाउंटंट", en: "Accountant", search: "accountant", icon: "🧾" },
  ];

  const testimonials = [
    { name: "राजेश पाटील", location: "सांगली", text: "महा जॉब वरून 2 दिवसात ड्रायव्हर मिळाला. खूप सोपं आहे!", accent: "#FF6B00" },
    { name: "सुनीता जाधव", location: "कोल्हापूर", text: "मला स्वयंपाकाची नोकरी लगेच मिळाली. रजिस्ट्रेशन नाही, थेट फोन केला.", accent: "#16a34a" },
    { name: "अमित शिंदे", location: "पुणे", text: "आमच्या दुकानासाठी सेल्समन शोधत होतो. एका दिवसात 5 कॉल आले!", accent: "#2563eb" },
    { name: "प्रिया कुलकर्णी", location: "मिरज", text: "कोणतेही चार्जेस नाहीत. अकाउंटंटची जागा भरली गेली.", accent: "#9333ea" },
    { name: "विकास माळी", location: "सातारा", text: "इलेक्ट्रिशियनचं काम मिळालं. WhatsApp वर लगेच संपर्क झाला.", accent: "#FF6B00" },
  ];

  const steps = [
    { step: "1", title: t("home.step1Title"), desc: t("home.step1Desc") },
    { step: "2", title: t("home.step2Title"), desc: t("home.step2Desc") },
    { step: "3", title: t("home.step3Title"), desc: t("home.step3Desc") },
  ];

  return (
    <div className="flex flex-col items-center text-center px-2">
      {/* Hero */}
      <div className="mt-6 mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "#FF6B00" }}>
          {t("nav.brand")}
        </h1>
        <p className="text-base sm:text-lg text-gray-500 mt-2">
          {t("home.tagline")}
        </p>
      </div>

      {/* Post Job CTA */}
      <Link
        href="/job/new"
        className="w-full max-w-md mb-5 flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-lg transition-transform active:scale-[0.98]"
        style={{ backgroundColor: "#FF6B00", boxShadow: "0 4px 14px rgba(255,107,0,0.35)" }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        {t("home.postJobBtn")}
      </Link>

      {/* Browse Jobs link */}
      <Link
        href="/jobs"
        className="w-full max-w-md mb-6 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-base transition-colors"
        style={{ backgroundColor: "#FFF3E6", color: "#FF6B00", border: "1.5px solid #FF6B00" }}
      >
        {t("home.browseJobsBtn")}
      </Link>

      {/* City Cards — horizontal scroll */}
      <div className="w-full max-w-md mb-5">
        <h2 className="text-sm font-semibold text-gray-400 mb-3 text-left">{t("home.browseByCity")}</h2>
        <div
          className="flex gap-2.5 overflow-x-auto pb-2"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        >
          {cities.map((city, i) => (
            <Link
              key={city.slug}
              href={`/jobs?district=${city.slug}`}
              className="shrink-0 bg-white rounded-xl px-4 py-3 flex items-center gap-2 hover:shadow-md transition-shadow"
              style={{
                scrollSnapAlign: "start",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                border: i < 5 ? "1.5px solid #FF6B00" : "1.5px solid transparent",
              }}
            >
              <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                {lang === "mr" ? city.mr : city.en}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Category Cards — horizontal scroll */}
      <div className="w-full max-w-md mb-5">
        <h2 className="text-sm font-semibold text-gray-400 mb-3 text-left">{t("home.browseByCategory")}</h2>
        <div
          className="flex gap-2.5 overflow-x-auto pb-2"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.search}
              href={`/jobs?search=${encodeURIComponent(cat.search)}`}
              className="shrink-0 bg-white rounded-xl px-3 py-3 flex flex-col items-center gap-1.5 hover:shadow-md transition-shadow"
              style={{ scrollSnapAlign: "start", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", minWidth: "88px" }}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs font-semibold text-gray-800 whitespace-nowrap">
                {lang === "mr" ? cat.mr : cat.en}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Value props */}
      <div
        className="bg-white rounded-xl p-4 w-full max-w-md mb-5"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <p className="text-base text-gray-700 leading-relaxed">
          {t("home.employerPitch")} <span className="font-semibold" style={{ color: "#FF6B00" }}>{t("home.employerTime")}</span> {t("home.employerFree")}
        </p>
        <p className="text-base text-gray-700 leading-relaxed mt-1.5">
          {t("home.seekerPitch")} <span className="font-semibold" style={{ color: "#FF6B00" }}>{t("home.seekerAction")}</span>.
        </p>
        <p className="text-sm text-gray-500 mt-2.5 font-medium">
          {t("home.noReg")}
        </p>
      </div>

      {/* Testimonials — horizontal scroll */}
      <div className="w-full max-w-md mt-2 mb-5">
        <h2 className="text-sm font-semibold text-gray-400 mb-3 text-left">{t("home.testimonials")}</h2>
        <div
          className="flex gap-3 overflow-x-auto pb-2"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        >
          {testimonials.map((item, i) => (
            <div
              key={i}
              className="rounded-xl p-4 shrink-0"
              style={{
                width: "260px",
                scrollSnapAlign: "start",
                backgroundColor: `${item.accent}10`,
                borderLeft: `3px solid ${item.accent}`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                &ldquo;{item.text}&rdquo;
              </p>
              <p className="text-xs font-semibold" style={{ color: item.accent }}>{item.name}</p>
              <p className="text-xs text-gray-500">{item.location}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="w-full max-w-md mt-2 mb-5">
        <h2 className="text-sm font-semibold text-gray-400 mb-3 text-left">{t("home.howItWorks")}</h2>
        <div className="flex flex-col gap-2.5">
          {steps.map((s) => (
            <div
              key={s.step}
              className="bg-white rounded-xl p-3.5 flex items-start gap-3 text-left"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <span
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: "#FF6B00" }}
              >
                {s.step}
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Facebook links */}
      <div className="w-full max-w-md mt-2 mb-5">
        <div
          className="bg-white rounded-xl p-4 flex flex-col gap-2.5"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderLeft: "3px solid #1877F2" }}
        >
          <p className="text-sm font-semibold text-gray-700">{t("home.fbConnect")}</p>
          <a
            href="https://www.facebook.com/profile.php?id=61581037695475"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-white transition"
            style={{ backgroundColor: "#1877F2" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            {t("home.fbFollow")}
          </a>
          <a
            href="https://www.facebook.com/share/g/14brFBk942x/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition"
            style={{ backgroundColor: "#E7F3FF", color: "#1877F2" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            {t("home.fbJoin")}
          </a>
        </div>
      </div>

      {/* SEO content */}
      <div className="w-full max-w-md mt-2 mb-5">
        <h2 className="text-sm font-semibold text-gray-400 mb-2">{t("home.seoTitle")}</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          {t("home.seoDesc")}
        </p>
      </div>

    </div>
  );
}

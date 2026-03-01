import type { Metadata } from "next";
import HomeClient from "./components/HomeClient";
import { SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "महा जॉब — महाराष्ट्रातील नोकऱ्या | Jobs in Maharashtra",
  description:
    "महाराष्ट्रातील नोकऱ्या शोधा — सांगली, पुणे, कोल्हापूर, मुंबई, नाशिक. ड्रायव्हर, सेल्समन, इलेक्ट्रिशियन, प्लंबर. मोफत जाहिरात द्या. थेट फोन करा. Find jobs in Maharashtra.",
  alternates: {
    canonical: SITE_URL,
  },
};

// JSON-LD for Organization + WebSite (helps with Google Knowledge Panel & Sitelinks)
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "महा जॉब",
      alternateName: "MahaJob",
      url: SITE_URL,
      description:
        "महाराष्ट्रातील नोकऱ्या शोधा किंवा मोफत जाहिरात द्या. Jobs in Maharashtra.",
      inLanguage: "mr",
    },
    {
      "@type": "Organization",
      name: "महा जॉब",
      url: SITE_URL,
      logo: `${SITE_URL}/icons/icon-512x512.png`,
      areaServed: {
        "@type": "AdministrativeArea",
        name: "Maharashtra, India",
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  );
}

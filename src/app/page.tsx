import type { Metadata } from "next";
import HomeClient from "./components/HomeClient";

export const metadata: Metadata = {
  title: "सांगली रोजगार — सांगली जिल्ह्यातील नोकऱ्या | Jobs in Sangli Maharashtra",
  description:
    "सांगली जिल्ह्यातील नोकऱ्या शोधा — सांगली, मिरज, तासगाव, कुपवाड, जत, वाळवा. ड्रायव्हर, सेल्समन, इलेक्ट्रिशियन, प्लंबर. मोफत जाहिरात द्या. थेट फोन करा. Find jobs in Sangli district, Maharashtra.",
  alternates: {
    canonical: "https://sanglirojgar.vercel.app",
  },
};

// JSON-LD for Organization + WebSite (helps with Google Knowledge Panel & Sitelinks)
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "सांगली रोजगार",
      alternateName: "Sangli Rojgar",
      url: "https://sanglirojgar.vercel.app",
      description:
        "सांगली जिल्ह्यातील नोकऱ्या शोधा किंवा मोफत जाहिरात द्या. Jobs in Sangli, Maharashtra.",
      inLanguage: "mr",
    },
    {
      "@type": "Organization",
      name: "सांगली रोजगार",
      url: "https://sanglirojgar.vercel.app",
      logo: "https://sanglirojgar.vercel.app/icons/icon-512x512.png",
      areaServed: {
        "@type": "AdministrativeArea",
        name: "Sangli District, Maharashtra, India",
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

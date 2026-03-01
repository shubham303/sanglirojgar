import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import RegisterSW from "./components/RegisterSW";
import InstallBanner from "./components/InstallBanner";
import { SITE_URL } from "@/lib/config";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FF6B00",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "महाजॉब — महाराष्ट्रातील नोकऱ्या | Jobs in Maharashtra",
    template: "%s | महाजॉब",
  },
  description:
    "महाराष्ट्रातील नोकऱ्या शोधा किंवा मोफत जाहिरात द्या. ड्रायव्हर, सेल्समन, इलेक्ट्रिशियन, प्लंबर — थेट फोन करा. Jobs in Maharashtra — Sangli, Pune, Kolhapur, Mumbai.",
  keywords: [
    "महाजॉब", "mahajob", "maharashtra jobs", "maharashtra naukri",
    "नोकरी महाराष्ट्र", "jobs in maharashtra", "महाराष्ट्र नोकऱ्या",
    "sangli jobs", "pune jobs", "kolhapur jobs", "mumbai jobs",
    "सांगली नोकरी", "पुणे नोकरी", "कोल्हापूर नोकरी",
    "driver job maharashtra", "electrician job maharashtra", "plumber job maharashtra",
    "कामगार हवे", "मोफत जाहिरात",
  ],
  manifest: "/manifest.json",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "mr_IN",
    siteName: "महाजॉब",
    title: "महाजॉब — महाराष्ट्रातील नोकऱ्या",
    description: "महाराष्ट्रातील नोकऱ्या शोधा किंवा मोफत जाहिरात द्या. थेट फोन करा. No registration required.",
    url: SITE_URL,
    images: [{ url: "/icons/icon-512x512.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary",
    title: "महाजॉब — Jobs in Maharashtra",
    description: "महाराष्ट्रातील नोकऱ्या शोधा. ड्रायव्हर, सेल्समन, प्लंबर — थेट फोन करा.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "महाजॉब",
  },
  icons: [
    { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
  ],
  other: {
    "mobile-web-app-capable": "yes",
    "google-site-verification": "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mr" data-theme="light" style={{ colorScheme: "light" }}>
      <body className="antialiased" style={{ backgroundColor: "#f5f5f5", color: "#1a1a1a" }}>
        <nav
          className="bg-white border-b border-orange-200 px-4 py-2.5"
          style={{ position: "sticky", top: 0, zIndex: 40, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Link
              href="/"
              className="font-bold text-lg shrink-0"
              style={{ color: "#FF6B00" }}
            >
              महाजॉब
            </Link>
            <div className="flex gap-1.5">
              <Link
                href="/jobs"
                className="text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap border"
                style={{ color: "#374151", borderColor: "#d1d5db", backgroundColor: "#f9fafb" }}
              >
                नोकऱ्या
              </Link>
              <Link
                href="/job/new"
                className="text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap border"
                style={{ color: "#374151", borderColor: "#d1d5db", backgroundColor: "#f9fafb" }}
              >
                जाहिरात द्या
              </Link>
              <Link
                href="/my-ads"
                className="text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap border"
                style={{ color: "#374151", borderColor: "#d1d5db", backgroundColor: "#f9fafb" }}
              >
                माझ्या जाहिराती
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-3xl mx-auto px-4 py-5">{children}</main>
        <footer className="text-center text-gray-400 text-xs py-6 pb-8">
          महाजॉब
        </footer>
        <RegisterSW />
        <InstallBanner />
      </body>
    </html>
  );
}

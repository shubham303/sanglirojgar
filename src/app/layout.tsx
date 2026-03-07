import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import RegisterSW from "./components/RegisterSW";
import InstallBanner from "./components/InstallBanner";
import BottomTabBar from "./components/BottomTabBar";
import { SITE_URL } from "@/lib/config";

const GA_ID = "G-BGYJ0D4EL9";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FF6B00",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "महा जॉब — महाराष्ट्रातील नोकऱ्या | Jobs in Maharashtra",
    template: "%s | महा जॉब",
  },
  description:
    "महाराष्ट्रातील नोकऱ्या शोधा किंवा मोफत जाहिरात द्या. ड्रायव्हर, सेल्समन, इलेक्ट्रिशियन, प्लंबर — थेट फोन करा. Jobs in Maharashtra — Sangli, Pune, Kolhapur, Mumbai.",
  keywords: [
    "महा जॉब", "mahajob", "maharashtra jobs", "maharashtra naukri",
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
    siteName: "महा जॉब",
    title: "महा जॉब — महाराष्ट्रातील नोकऱ्या",
    description: "नोकरी शोधा किंवा मोफत जाहिरात द्या — registration नाही, पूर्णपणे मोफत",
    url: "https://www.mahajob.in",
    images: [{ url: "/icons/icon-512x512.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary",
    title: "महा जॉब — Jobs in Maharashtra",
    description: "महाराष्ट्रातील नोकऱ्या शोधा. ड्रायव्हर, सेल्समन, प्लंबर — थेट फोन करा.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "महा जॉब",
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
      <head>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
      </head>
      <body className="antialiased" style={{ backgroundColor: "#f5f5f5", color: "#1a1a1a" }}>
        {/* Desktop top nav — hidden on mobile */}
        <nav
          className="hidden md:block bg-white border-b border-orange-200 px-4 py-2.5"
          style={{ position: "sticky", top: 0, zIndex: 40, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
        >
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Link href="/" className="font-bold text-lg" style={{ color: "#FF6B00" }}>
              महा जॉब
            </Link>
            <div className="flex items-center gap-5 text-sm font-medium">
              <Link href="/jobs" className="text-gray-600 hover:text-orange-600 transition">नोकऱ्या</Link>
              <Link href="/job/new" className="text-gray-600 hover:text-orange-600 transition">जाहिरात द्या</Link>
              <Link href="/my-ads" className="text-gray-600 hover:text-orange-600 transition">माझ्या जाहिराती</Link>
              <Link href="/blogs" className="text-gray-600 hover:text-orange-600 transition">ब्लॉग</Link>
              <Link href="/contact" className="text-gray-600 hover:text-orange-600 transition">संपर्क</Link>
            </div>
          </div>
        </nav>
        <main className="max-w-3xl mx-auto px-4 py-5 pb-20 md:pb-5">{children}</main>
        <BottomTabBar />
        <RegisterSW />
        <InstallBanner />
      </body>
    </html>
  );
}

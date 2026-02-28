import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import RegisterSW from "./components/RegisterSW";
import InstallBanner from "./components/InstallBanner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FF6B00",
};

export const metadata: Metadata = {
  title: "सांगली रोजगार — सांगली मधील नोकऱ्या",
  description:
    "सांगली जिल्ह्यातील नोकऱ्या शोधा किंवा जाहिरात द्या. थेट फोन करा.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "रोजगार",
  },
  icons: [
    { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
  ],
  other: {
    "mobile-web-app-capable": "yes",
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
              सांगली रोजगार
            </Link>
            <div className="flex gap-0.5">
              <Link
                href="/jobs"
                className="text-xs px-2 py-2 rounded-lg font-medium whitespace-nowrap"
                style={{ color: "#374151" }}
              >
                नोकऱ्या
              </Link>
              <Link
                href="/job/new"
                className="text-xs px-2 py-2 rounded-lg font-medium whitespace-nowrap"
                style={{ color: "#374151" }}
              >
                जाहिरात द्या
              </Link>
              <Link
                href="/my-ads"
                className="text-xs px-2 py-2 rounded-lg font-medium whitespace-nowrap"
                style={{ color: "#374151" }}
              >
                माझ्या जाहिराती
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-3xl mx-auto px-4 py-5">{children}</main>
        <footer className="text-center text-gray-400 text-xs py-6 pb-8">
          सांगली रोजगार
        </footer>
        <RegisterSW />
        <InstallBanner />
      </body>
    </html>
  );
}

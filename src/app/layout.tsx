import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "सांगली रोजगार — सांगली मधील नोकऱ्या",
  description:
    "सांगली जिल्ह्यातील नोकऱ्या शोधा किंवा जाहिरात द्या. थेट फोन करा.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mr" data-theme="light" style={{ colorScheme: "light" }}>
      <body className="antialiased" style={{ backgroundColor: "#FFF9F2", color: "#1a1a1a" }}>
        <nav className="bg-white border-b border-orange-200 px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <Link
              href="/"
              className="text-[#FF6B00] font-bold text-xl"
            >
              सांगली रोजगार
            </Link>
            <div className="flex gap-2">
              <Link
                href="/jobs"
                className="text-gray-700 hover:text-[#FF6B00] text-base px-3 py-2 rounded-lg active:bg-orange-50"
              >
                नोकऱ्या पहा
              </Link>
              <Link
                href="/job/new"
                className="text-gray-700 hover:text-[#FF6B00] text-base px-3 py-2 rounded-lg active:bg-orange-50"
              >
                जाहिरात द्या
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
        <footer className="text-center text-gray-400 text-sm py-6">
          सांगली रोजगार
        </footer>
      </body>
    </html>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { LanguageProvider, useTranslation } from "@/lib/i18n/LanguageContext";
import LanguageToggle from "./LanguageToggle";
import BottomTabBar from "./BottomTabBar";
import InstallBanner from "./InstallBanner";
import RegisterSW from "./RegisterSW";

function DesktopNav() {
  const { t } = useTranslation();
  return (
    <nav
      className="hidden md:block bg-white border-b border-orange-200 px-4 py-2.5"
      style={{ position: "sticky", top: 0, zIndex: 40, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <Link href="/">
          <Image src="/logo.jpg" alt="महा जॉब" width={48} height={48} className="rounded-full" />
        </Link>
        <div className="flex items-center gap-5 text-sm font-medium">
          <Link href="/jobs" className="text-gray-600 hover:text-orange-600 transition">{t("nav.jobs")}</Link>
          <Link href="/job/new" className="text-gray-600 hover:text-orange-600 transition">{t("nav.postAd")}</Link>
          <Link href="/my-ads" className="text-gray-600 hover:text-orange-600 transition">{t("nav.myAds")}</Link>
          <Link href="/blogs" className="text-gray-600 hover:text-orange-600 transition">{t("nav.blog")}</Link>
          <Link href="/contact" className="text-gray-600 hover:text-orange-600 transition">{t("nav.contact")}</Link>
          <LanguageToggle />
        </div>
      </div>
    </nav>
  );
}

function FooterContent() {
  const { t } = useTranslation();
  return (
    <footer className="max-w-3xl mx-auto px-4 pb-24 md:pb-8 text-center">
      <p className="text-xs text-gray-400">{t("footer.disclaimer")}</p>
      <div className="flex items-center justify-center gap-3 mt-1">
        <Link href="/terms" className="text-xs text-gray-400 hover:text-gray-500 underline">
          Terms of Use
        </Link>
        <LanguageToggle />
      </div>
    </footer>
  );
}

function MobileHeader() {
  const { t } = useTranslation();
  return (
    <div
      className="md:hidden flex items-center justify-between px-4 py-2 bg-white"
      style={{ borderBottom: "1px solid #fed7aa", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <Link href="/">
        <Image src="/logo.jpg" alt="महा जॉब" width={32} height={32} className="rounded-full" />
      </Link>
      <LanguageToggle />
    </div>
  );
}

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <DesktopNav />
      <MobileHeader />
      <main className="max-w-3xl mx-auto px-4 py-5 pb-20 md:pb-5">{children}</main>
      <FooterContent />
      <BottomTabBar />
      <RegisterSW />
      <InstallBanner />
    </LanguageProvider>
  );
}

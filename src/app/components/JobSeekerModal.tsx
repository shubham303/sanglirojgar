"use client";

import { useEffect, useState } from "react";

const LS_KEY = "mahajob_seeker";
const WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029Vb7ZWJj1dAvzashsa01K";

interface SeekerData {
  dismissed?: boolean;
  dismissCount?: number;
}

function readStorage(): SeekerData {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

function writeStorage(data: SeekerData) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export default function JobSeekerModal({ forceOpen, onForceOpenHandled }: {
  forceOpen?: boolean;
  onForceOpenHandled?: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const data = readStorage();
    if (data.dismissed || (data.dismissCount && data.dismissCount >= 2)) return;

    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (forceOpen) {
      setVisible(true);
      onForceOpenHandled?.();
    }
  }, [forceOpen, onForceOpenHandled]);

  const handleDismiss = () => {
    const data = readStorage();
    const count = (data.dismissCount || 0) + 1;
    writeStorage({ dismissCount: count });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleDismiss}
      />
      <div
        className="relative w-full max-w-sm rounded-2xl p-5 bg-white text-center"
        style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl leading-none"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="text-4xl mb-3">📢</div>
        <p className="text-base font-bold text-gray-800 mb-1">
          नवीन jobs मिळवा WhatsApp वर!
        </p>
        <p className="text-sm text-gray-500 mb-5">
          आमच्या WhatsApp channel ला join करा आणि रोज नवीन job updates मिळवा.
        </p>

        <a
          href={WHATSAPP_CHANNEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleDismiss}
          className="flex items-center justify-center gap-2 w-full py-3 text-base font-semibold rounded-xl text-white"
          style={{ backgroundColor: "#25D366" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp Channel Join करा
        </a>
      </div>
    </div>
  );
}

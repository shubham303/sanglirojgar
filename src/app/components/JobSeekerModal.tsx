"use client";

import { useEffect, useState } from "react";

const LS_KEY = "mahajob_seeker";

interface SeekerData {
  submitted?: boolean;
  phone?: string;
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

export default function JobSeekerModal() {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const data = readStorage();
    if (data.submitted || (data.dismissCount && data.dismissCount >= 2)) return;

    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    const data = readStorage();
    const count = (data.dismissCount || 0) + 1;
    writeStorage({ dismissCount: count });
    setVisible(false);
  };

  const handleSubmit = async () => {
    setError("");
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError("नाव टाका");
      return;
    }
    if (!/^\d{10}$/.test(trimmedPhone)) {
      setError("10 अंकी फोन नंबर टाका");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/job-seekers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, phone: trimmedPhone }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "काहीतरी चूक झाली");
        return;
      }
      writeStorage({ submitted: true, phone: trimmedPhone });
      setVisible(false);
    } catch {
      setError("सर्व्हरशी संपर्क होऊ शकला नाही");
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleDismiss}
      />
      {/* Card */}
      <div
        className="relative w-full max-w-sm rounded-2xl p-5 bg-white"
        style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl leading-none"
          aria-label="बंद करा"
        >
          ✕
        </button>

        <p className="text-sm font-semibold text-gray-700 mb-4 pr-6">
          WhatsApp वर job alerts साठी कृपया आपला नाव आणि नंबर द्या
        </p>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="तुमचे नाव"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-base bg-white focus:outline-none focus:border-orange-400"
          />
          <input
            type="tel"
            placeholder="फोन नंबर (10 अंकी)"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-base bg-white focus:outline-none focus:border-orange-400"
          />

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-2.5 text-base font-semibold rounded-lg transition disabled:opacity-50"
            style={{ backgroundColor: "#FF6B00", color: "#ffffff" }}
          >
            {submitting ? "पाठवत आहे..." : "माहिती पाठवा"}
          </button>
        </div>
      </div>
    </div>
  );
}

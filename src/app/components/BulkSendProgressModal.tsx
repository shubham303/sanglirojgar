"use client";

import { useState } from "react";
import { Employer } from "@/lib/types";

interface Props {
  employers: Employer[];
  message: string;
  onComplete: (contactedPhones: string[]) => void;
  onCancel: () => void;
}

export default function BulkSendProgressModal({
  employers,
  message,
  onComplete,
  onCancel,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentPhones, setSentPhones] = useState<string[]>([]);

  const total = employers.length;
  const isDone = currentIndex >= total;
  const current = employers[currentIndex] as Employer | undefined;

  const getPersonalizedMessage = (emp: Employer) => {
    const jobLink = `https://mahajob.in/employer/${emp.phone}`;
    return message
      .replace(/\{name\}/g, emp.employer_name)
      .replace(/\{job_links\}/g, jobLink);
  };

  // Single window.open per click — browsers always allow this
  const handleSendToCurrentEmployer = () => {
    if (!current) return;
    const personalized = getPersonalizedMessage(current);
    const url = `https://wa.me/91${current.phone}?text=${encodeURIComponent(personalized)}`;
    window.open(url, "_blank");

    // Mark contacted
    fetch(`/api/admin/employers/${current.phone}/contact`, { method: "POST" });

    setSentPhones((prev) => [...prev, current.phone]);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleSkip = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const handleDone = () => {
    onComplete(sentPhones);
  };

  const progressPercent = Math.round((currentIndex / total) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
    >
      <div
        className="bg-white rounded-xl p-5 w-full max-w-sm"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-bold text-gray-800 mb-3">
          WhatsApp मेसेज पाठवा
        </p>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{currentIndex} / {total} पाठवले</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: "#25D366",
              }}
            />
          </div>
        </div>

        {isDone ? (
          /* Done state */
          <div>
            <div className="text-center py-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ backgroundColor: "#f0fdf4" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-sm font-bold text-gray-800">पूर्ण झाले!</p>
              <p className="text-xs text-gray-500 mt-1">
                {sentPhones.length} नोकरी देणाऱ्यांना मेसेज पाठवला
              </p>
            </div>
            <button
              onClick={handleDone}
              className="w-full py-2.5 text-sm font-semibold rounded-xl text-white transition"
              style={{ backgroundColor: "#25D366" }}
            >
              बंद करा
            </button>
          </div>
        ) : (
          /* Current employer */
          <div>
            {/* Employer info */}
            <div className="bg-gray-50 rounded-xl p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-bold text-gray-800">{current!.employer_name}</p>
                  <p className="text-xs text-gray-500">{current!.phone}</p>
                </div>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                  style={{ backgroundColor: "#fff7ed", color: "#c2410c" }}
                >
                  {currentIndex + 1} / {total}
                </span>
              </div>
              {/* Message preview */}
              <div
                className="text-xs text-gray-600 whitespace-pre-wrap bg-white rounded-lg p-2.5 border border-gray-100 overflow-y-auto"
                style={{ maxHeight: "120px" }}
              >
                {getPersonalizedMessage(current!)}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="px-3 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 transition"
              >
                रद्द करा
              </button>
              <button
                onClick={handleSkip}
                className="px-3 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-500 transition"
              >
                वगळा
              </button>
              <button
                onClick={handleSendToCurrentEmployer}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white transition"
                style={{ backgroundColor: "#25D366" }}
              >
                WhatsApp उघडा
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Employer } from "@/lib/types";

interface BulkTemplate {
  id: string;
  label: string;
  /** Template body — {name} and {job_links} are replaced per employer */
  body: string;
}

const BULK_TEMPLATES: BulkTemplate[] = [
  {
    id: "share_jobs",
    label: "जाहिराती शेअर करा",
    body: `नमस्कार {name},

तुम्ही MahaJob.in वर दिलेल्या जाहिराती तुमच्या WhatsApp ग्रुप आणि Facebook वर शेअर केल्यास जास्त लोकांपर्यंत पोहोचतील.

तुमच्या सक्रिय जाहिरातींच्या लिंक्स:
{job_links}

शेअर केल्याबद्दल धन्यवाद!
- MahaJob टीम`,
  },
  {
    id: "feedback",
    label: "अनुभव / फीडबॅक",
    body: `नमस्कार {name},

MahaJob.in वापरताना तुमचा अनुभव कसा आहे? तुम्ही MahaJob इतरांना सुचवाल का?

कृपया हा छोटा फॉर्म भरा — तुमचा अभिप्राय आम्हाला सुधारणा करण्यास मदत करेल:
https://forms.gle/YOUR_GOOGLE_FORM_LINK

धन्यवाद!
- MahaJob टीम`,
  },
  {
    id: "help_needed",
    label: "मदत / नवीन फीचर",
    body: `नमस्कार {name},

MahaJob.in वापरताना तुम्हाला कोणतीही मदत हवी आहे का? किंवा तुम्हाला कोणते नवीन फीचर उपयोगी वाटेल?

तुमच्या सूचना आम्हाला MahaJob अधिक चांगले बनवण्यास मदत करतील. कृपया तुमचे विचार सांगा!

धन्यवाद!
- MahaJob टीम`,
  },
];

interface Props {
  selectedEmployers: Employer[];
  allEmployers: Employer[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onClose: () => void;
  onSend: (message: string) => void;
}

export default function BulkWhatsAppPanel({
  selectedEmployers,
  allEmployers,
  onSelectAll,
  onDeselectAll,
  onClose,
  onSend,
}: Props) {
  const [message, setMessage] = useState("");
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

  const applyTemplate = (template: BulkTemplate) => {
    setMessage(template.body);
    setActiveTemplateId(template.id);
  };

  const previewName = selectedEmployers[0]?.employer_name || "नाव";
  const previewPhone = selectedEmployers[0]?.phone || "0000000000";
  const previewJobLinks = `https://mahajob.in/employer/${previewPhone}`;
  const previewMessage = message
    .replace(/\{name\}/g, previewName)
    .replace(/\{job_links\}/g, previewJobLinks);

  const allSelected = selectedEmployers.length === allEmployers.length && allEmployers.length > 0;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200"
      style={{ boxShadow: "0 -4px 24px rgba(0,0,0,0.10)", maxHeight: "70vh", overflowY: "auto" }}
    >
      <div className="max-w-4xl mx-auto p-4">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-800">
              {selectedEmployers.length} निवडले
            </span>
            <button
              onClick={allSelected ? onDeselectAll : onSelectAll}
              className="text-xs font-medium px-2 py-1 rounded-lg"
              style={{ backgroundColor: "#fff7ed", color: "#c2410c" }}
            >
              {allSelected ? "सर्व काढा" : "सर्व निवडा"}
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Template buttons */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {BULK_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => applyTemplate(t)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap border transition"
              style={
                activeTemplateId === t.id
                  ? { backgroundColor: "#FF6B00", color: "#fff", borderColor: "#FF6B00" }
                  : { backgroundColor: "#f9fafb", color: "#374151", borderColor: "#e5e7eb" }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Textarea + Preview side by side */}
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <div className="flex-1">
            <p className="text-[10px] font-medium text-gray-400 mb-1 uppercase">मेसेज</p>
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setActiveTemplateId(null);
              }}
              placeholder="मेसेज टाइप करा... ({name} = नोकरी देणाऱ्याचे नाव, {job_links} = जाहिरात लिंक)"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#FF6B00] resize-none"
              style={{ fontSize: "16px", minHeight: "150px" }}
            />
          </div>
          {message && (
            <div className="flex-1">
              <p className="text-[10px] font-medium text-gray-400 mb-1 uppercase">Preview ({previewName})</p>
              <div
                className="p-3 bg-gray-50 rounded-xl text-xs text-gray-700 whitespace-pre-wrap overflow-y-auto"
                style={{ minHeight: "150px", maxHeight: "200px" }}
              >
                {previewMessage}
              </div>
            </div>
          )}
        </div>

        {/* Send button */}
        <button
          onClick={() => onSend(message)}
          disabled={selectedEmployers.length === 0 || !message.trim()}
          className="w-full py-3 text-sm font-semibold rounded-xl text-white transition disabled:opacity-40"
          style={{ backgroundColor: "#25D366" }}
        >
          WhatsApp पाठवा ({selectedEmployers.length})
        </button>
      </div>
    </div>
  );
}

export { BULK_TEMPLATES };
export type { BulkTemplate };

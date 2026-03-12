"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { GroupedJobTypeOption } from "@/lib/job-types-cache";
import { useTranslation } from "@/lib/i18n/LanguageContext";

interface JobTypePickerProps {
  value: string;
  onChange: (value: string) => void;
  groupedJobTypes: GroupedJobTypeOption[];
  placeholder?: string;
  allLabel?: string;
}

export default function JobTypePicker({
  value,
  onChange,
  groupedJobTypes,
  placeholder,
  allLabel,
}: JobTypePickerProps) {
  const { t } = useTranslation();
  const defaultPlaceholder = placeholder || t("picker.select");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Find selected label
  let selectedLabel = allLabel || defaultPlaceholder;
  if (value && value !== (allLabel || "")) {
    for (const group of groupedJobTypes) {
      const match = group.options.find((o) => String(o.id) === String(value));
      if (match) {
        selectedLabel = match.label;
        break;
      }
    }
  }

  // Filter groups by search query
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groupedJobTypes;
    const q = search.trim().toLowerCase();
    return groupedJobTypes
      .map((group) => ({
        ...group,
        options: group.options.filter((opt) =>
          opt.label.toLowerCase().includes(q) ||
          group.industry_en.toLowerCase().includes(q)
        ),
      }))
      .filter((group) => group.options.length > 0);
  }, [groupedJobTypes, search]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setSearch("");
      setTimeout(() => searchRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-base bg-white focus:outline-none text-left flex items-center justify-between"
        style={{ borderColor: value && value !== (allLabel || "") ? "#FF6B00" : undefined }}
      >
        <span className="text-gray-800">
          {selectedLabel}
        </span>
        <span className="text-gray-400 text-xs">▼</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-white flex flex-col sm:bg-transparent sm:items-center sm:justify-center"
        >
          <div
            className="hidden sm:block fixed inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={() => setOpen(false)}
          />

          <div
            ref={modalRef}
            className="flex flex-col h-full sm:h-auto sm:max-h-[70vh] sm:w-full sm:max-w-md sm:rounded-xl sm:relative bg-white z-10"
            style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.15)" }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
              <span className="font-semibold text-sm text-gray-800">{t("picker.title")}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 text-lg leading-none px-1"
              >
                ✕
              </button>
            </div>

            <div className="px-4 py-2 border-b border-gray-100 shrink-0">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search in English..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            <div className="overflow-y-auto flex-1 min-h-0">
              {allLabel && !search.trim() && (
                <button
                  type="button"
                  onClick={() => { onChange(allLabel); setOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm transition hover:bg-gray-100"
                  style={{
                    backgroundColor: value === allLabel ? "#FFF3E6" : undefined,
                    color: value === allLabel ? "#FF6B00" : "#374151",
                    fontWeight: value === allLabel ? 600 : 400,
                  }}
                >
                  {allLabel}
                </button>
              )}

              {filteredGroups.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-6">No results found</p>
              )}

              {filteredGroups.map((group) => (
                <div key={group.industry_id}>
                  <div
                    className="px-4 py-1.5 sticky top-0"
                    style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}
                  >
                    <span className="font-bold text-xs" style={{ color: "#FF6B00" }}>
                      {group.industry_mr}
                    </span>
                    <span className="text-[10px] text-gray-400 ml-1">
                      ({group.industry_en})
                    </span>
                  </div>
                  {group.options.map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => { onChange(String(opt.id)); setOpen(false); }}
                      className="w-full text-left px-4 py-2 text-[13px] transition hover:bg-gray-100"
                      style={{
                        backgroundColor: String(opt.id) === String(value) ? "#FFF3E6" : undefined,
                        color: String(opt.id) === String(value) ? "#FF6B00" : "#374151",
                        fontWeight: String(opt.id) === String(value) ? 600 : 400,
                        paddingLeft: "1.5rem",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

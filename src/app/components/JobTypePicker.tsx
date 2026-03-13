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
  const [selectedIndustry, setSelectedIndustry] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Find selected label
  let selectedLabel = allLabel || defaultPlaceholder;
  if (value && value !== (allLabel || "")) {
    if (value.startsWith("industry:")) {
      // "All in industry" selection — show industry name
      const indId = parseInt(value.replace("industry:", ""));
      const group = groupedJobTypes.find((g) => g.industry_id === indId);
      if (group) {
        selectedLabel = `${t("picker.allInIndustry")} - ${group.industry_mr}`;
      }
    } else {
      for (const group of groupedJobTypes) {
        const match = group.options.find((o) => String(o.id) === String(value));
        if (match) {
          selectedLabel = match.label;
          break;
        }
      }
    }
  }

  // Filter groups by search query (searches both Marathi and English in labels + industry names)
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groupedJobTypes;
    const q = search.trim().toLowerCase();
    return groupedJobTypes
      .map((group) => ({
        ...group,
        options: group.options.filter((opt) =>
          opt.label.toLowerCase().includes(q) ||
          group.industry_en.toLowerCase().includes(q) ||
          group.industry_mr.includes(q)
        ),
      }))
      .filter((group) => group.options.length > 0);
  }, [groupedJobTypes, search]);

  const isSearching = search.trim().length > 0;

  // Get job types for the selected industry (step 2)
  const selectedGroup = selectedIndustry !== null
    ? groupedJobTypes.find((g) => g.industry_id === selectedIndustry)
    : null;

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setSearch("");
      setSelectedIndustry(null);
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
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                {selectedIndustry !== null && !isSearching && (
                  <button
                    type="button"
                    onClick={() => setSelectedIndustry(null)}
                    className="text-sm font-medium px-2 py-0.5 rounded hover:bg-gray-100 transition"
                    style={{ color: "#FF6B00" }}
                  >
                    {t("picker.back")}
                  </button>
                )}
                <span className="font-semibold text-sm text-gray-800">
                  {selectedIndustry !== null && !isSearching && selectedGroup
                    ? selectedGroup.industry_mr
                    : t("picker.title")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 text-lg leading-none px-1"
              >
                ✕
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-2 border-b border-gray-100 shrink-0">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("picker.searchPlaceholder")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 min-h-0">
              {/* "All" option — show on step 1 when not searching */}
              {allLabel && !isSearching && selectedIndustry === null && (
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

              {/* STEP 1: Industry grid (when not searching and no industry selected) */}
              {!isSearching && selectedIndustry === null && (
                <div className="grid grid-cols-2 gap-2 p-3">
                  {groupedJobTypes.map((group) => (
                    <button
                      key={group.industry_id}
                      type="button"
                      onClick={() => setSelectedIndustry(group.industry_id)}
                      className="text-left rounded-lg border border-gray-200 p-3 transition hover:border-[#FF6B00] hover:bg-orange-50 active:bg-orange-100"
                    >
                      <div className="font-semibold text-sm text-gray-800 leading-tight">
                        {group.industry_mr}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {group.industry_en}
                      </div>
                      <div className="text-[11px] mt-1" style={{ color: "#FF6B00" }}>
                        {group.options.length} {t("picker.types")}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* STEP 2: Job types within selected industry */}
              {!isSearching && selectedIndustry !== null && selectedGroup && (
                <>
                  {/* "All in this industry" option — only in filter mode */}
                  {allLabel && (
                    <button
                      type="button"
                      onClick={() => { onChange(`industry:${selectedIndustry}`); setOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm transition hover:bg-gray-100 border-b border-gray-100"
                      style={{
                        backgroundColor: value === `industry:${selectedIndustry}` ? "#FFF3E6" : undefined,
                        color: value === `industry:${selectedIndustry}` ? "#FF6B00" : "#374151",
                        fontWeight: value === `industry:${selectedIndustry}` ? 600 : 400,
                      }}
                    >
                      {t("picker.allInIndustry")} - {selectedGroup.industry_mr}
                    </button>
                  )}
                  {selectedGroup.options.map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => { onChange(String(opt.id)); setOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-[13px] transition hover:bg-gray-100"
                      style={{
                        backgroundColor: String(opt.id) === String(value) ? "#FFF3E6" : undefined,
                        color: String(opt.id) === String(value) ? "#FF6B00" : "#374151",
                        fontWeight: String(opt.id) === String(value) ? 600 : 400,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </>
              )}

              {/* SEARCH RESULTS: Flat filtered list grouped by industry */}
              {isSearching && (
                <>
                  {filteredGroups.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-6">{t("picker.noResults")}</p>
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

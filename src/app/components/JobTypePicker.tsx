"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useJobTypes, usePopularJobTypes, useCategoryGroupedJobTypes } from "@/lib/useJobTypes";
import { useTranslation } from "@/lib/i18n/LanguageContext";

interface JobTypePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allLabel?: string;
}

export default function JobTypePicker({
  value,
  onChange,
  allLabel,
  placeholder,
}: JobTypePickerProps) {
  const { t } = useTranslation();
  const allJobTypes = useJobTypes();
  const popularJobTypes = usePopularJobTypes();
  const categoryGrouped = useCategoryGroupedJobTypes();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Selected label for the trigger button
  const selectedType = allJobTypes.find((jt) => String(jt.id) === String(value));
  const selectedLabel = selectedType
    ? `${selectedType.name_mr} (${selectedType.name_en})`
    : value === allLabel
    ? allLabel
    : placeholder || t("picker.select");

  // Filter all job types by search query
  const filteredTypes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allJobTypes;
    return allJobTypes.filter(
      (jt) =>
        jt.name_mr.toLowerCase().includes(q) ||
        jt.name_en.toLowerCase().includes(q)
    );
  }, [allJobTypes, search]);

  // Popular types that are not already in filtered results (avoid duplicate rows)
  const popularToShow = useMemo(() => {
    if (search.trim()) return [];
    return popularJobTypes;
  }, [popularJobTypes, search]);

  // Popular ids set (to skip them in the category-grouped section)
  const popularIds = new Set(popularJobTypes.map((p) => p.id));

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

  const select = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  const isSelected = (id: number) => String(id) === String(value);

  const JobTypeRow = ({ jt }: { jt: { id: number; name_mr: string; name_en: string } }) => (
    <button
      type="button"
      onClick={() => select(String(jt.id))}
      className="w-full text-left px-4 py-3 flex items-center justify-between transition hover:bg-gray-50 active:bg-orange-50"
      style={{
        backgroundColor: isSelected(jt.id) ? "#FFF3E6" : undefined,
        borderLeft: isSelected(jt.id) ? "3px solid #FF6B00" : "3px solid transparent",
      }}
    >
      <div>
        <div className="text-sm font-medium text-gray-800">{jt.name_mr}</div>
        <div className="text-xs text-gray-400">{jt.name_en}</div>
      </div>
      {isSelected(jt.id) && (
        <span style={{ color: "#FF6B00" }} className="text-sm">✓</span>
      )}
    </button>
  );

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-base bg-white focus:outline-none text-left flex items-center justify-between"
        style={{ borderColor: selectedType ? "#FF6B00" : undefined }}
      >
        <span className={selectedType ? "text-gray-800 font-medium" : "text-gray-400"}>
          {selectedLabel}
        </span>
        <span className="text-gray-400 text-xs ml-2">▼</span>
      </button>

      {/* Modal / bottom sheet */}
      {open && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col sm:bg-transparent sm:items-center sm:justify-center">
          {/* Backdrop (desktop) */}
          <div
            className="hidden sm:block fixed inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={() => setOpen(false)}
          />

          <div
            className="flex flex-col h-full sm:h-auto sm:max-h-[80vh] sm:w-full sm:max-w-md sm:rounded-xl sm:relative bg-white z-10"
            style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.15)" }}
          >
            {/* Header */}
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

            {/* Search */}
            <div className="px-4 py-3 border-b border-gray-100 shrink-0">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("picker.searchPlaceholder")}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:border-[#FF6B00]"
              />
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 min-h-0">

              {/* "All" option for filter mode */}
              {allLabel && !search.trim() && (
                <button
                  type="button"
                  onClick={() => select(allLabel)}
                  className="w-full text-left px-4 py-3 text-sm border-b border-gray-100 transition hover:bg-gray-50"
                  style={{ color: value === allLabel ? "#FF6B00" : "#374151", fontWeight: value === allLabel ? 600 : 400 }}
                >
                  {allLabel}
                </button>
              )}

              {/* Search results */}
              {search.trim() ? (
                <>
                  {filteredTypes.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-8">{t("picker.noResults")}</p>
                  )}
                  {filteredTypes.map((jt) => <JobTypeRow key={jt.id} jt={jt} />)}
                </>
              ) : (
                <>
                  {/* Popular section */}
                  {popularToShow.length > 0 && (
                    <>
                      <div className="px-4 py-2 sticky top-0 bg-gray-50 border-b border-gray-100">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {t("picker.popular")}
                        </span>
                      </div>
                      {popularToShow.map((jt) => <JobTypeRow key={jt.id} jt={jt} />)}
                    </>
                  )}

                  {/* All types grouped by category */}
                  {categoryGrouped.map((group) => {
                    const options = group.options.filter((jt) => !popularIds.has(jt.id));
                    if (options.length === 0) return null;
                    return (
                      <div key={group.category_id}>
                        <div className="px-4 py-2 sticky top-0 bg-gray-50 border-b border-gray-100 border-t">
                          <span className="text-xs font-semibold text-gray-700">{group.category_mr}</span>
                          <span className="text-[11px] text-gray-400 ml-1.5">{group.category_en}</span>
                        </div>
                        {options.map((jt) => <JobTypeRow key={jt.id} jt={jt} />)}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

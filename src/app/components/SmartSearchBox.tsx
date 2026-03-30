"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useJobTypes, usePopularJobTypes, useCategoryGroupedJobTypes } from "@/lib/useJobTypes";

const HISTORY_KEY = "mahajob_search_history";
const MAX_HISTORY = 6;

function loadHistory(): SearchSelection[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch { return []; }
}

function saveToHistory(selection: SearchSelection) {
  try {
    const prev = loadHistory();
    // Deduplicate
    const filtered = prev.filter((s) =>
      s.type !== selection.type ||
      (s.type === "job_type" && selection.type === "job_type" && s.id !== selection.id) ||
      (s.type === "text" && selection.type === "text" && s.query !== selection.query)
    );
    const updated = [selection, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {}
}

const TAGS = [
  "Restaurant", "MIDC", "Canteen", "Cafe", "Shop", "Showroom", "Bank",
  "School", "College", "Hotel", "Mall", "Hospital", "Airport", "Clinic",
  "Petrol Pump", "IT Park", "Farm", "Warehouse", "Construction Site",
  "Government Office", "Home / Residential", "Office Building", "Salon / Parlour", "Gym",
  "Government", "Private Company", "NGO / Trust", "Real Estate", "Automobile",
  "Facility Management", "Agriculture", "Security Agency", "Transport Company",
  "IT Company", "Manufacturing Company",
  "Part Time", "Full Time", "Night Shift", "Day Shift", "Permanent", "Contract",
  "Work From Home", "Live-in (Food & Stay Provided)", "Two Wheeler Required",
];

export type SearchSelection =
  | { type: "job_type"; id: number; label: string }
  | { type: "text"; query: string };

interface SmartSearchBoxProps {
  onSelect: (selection: SearchSelection | null) => void;
  placeholder?: string;
  initialSelection?: SearchSelection | null;
}

export default function SmartSearchBox({ onSelect, placeholder, initialSelection }: SmartSearchBoxProps) {
  const allJobTypes = useJobTypes();
  const popularJobTypes = usePopularJobTypes();
  const categoryGrouped = useCategoryGroupedJobTypes();
  const [input, setInput] = useState(() => {
    if (initialSelection?.type === "job_type") return initialSelection.label;
    if (initialSelection?.type === "text") return initialSelection.query;
    return "";
  });
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SearchSelection | null>(initialSelection ?? null);
  const [history, setHistory] = useState<SearchSelection[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load history on mount (client only)
  useEffect(() => { setHistory(loadHistory()); }, []);

  const q = input.trim().toLowerCase();

  const matchingJobTypes = useMemo(() => {
    if (!q) return [];
    return allJobTypes.filter((jt) => jt.name_mr.toLowerCase().includes(q) || jt.name_en.toLowerCase().includes(q));
  }, [allJobTypes, q]);

  const matchingTags = useMemo(() => {
    if (!q) return [];
    return TAGS.filter((tag) => tag.toLowerCase().includes(q));
  }, [q]);

  // Popular ids set for deduplication
  const popularIdSet = useMemo(() => new Set(popularJobTypes.map((p) => p.id)), [popularJobTypes]);

  // History ids set for deduplication
  const historyJobTypeIds = useMemo(
    () => new Set(history.filter((h) => h.type === "job_type").map((h) => (h as { type: "job_type"; id: number }).id)),
    [history]
  );

  // Category-grouped remaining job types (excluding popular and history)
  const groupedRemaining = useMemo(() => {
    return categoryGrouped
      .map((group) => ({
        ...group,
        options: group.options.filter((jt) => !popularIdSet.has(jt.id) && !historyJobTypeIds.has(jt.id)),
      }))
      .filter((group) => group.options.length > 0);
  }, [categoryGrouped, popularIdSet, historyJobTypeIds]);

  const isEmpty = !q;
  const hasSuggestions = isEmpty
    ? history.length > 0 || popularJobTypes.length > 0 || groupedRemaining.length > 0
    : matchingJobTypes.length > 0 || matchingTags.length > 0;

  const handleInput = (value: string) => {
    setInput(value);
    setSelected(null);
    setOpen(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      onSelect(null);
      return;
    }
    debounceRef.current = setTimeout(() => {
      onSelect({ type: "text", query: value.trim() });
    }, 500);
  };

  const pick = (selection: SearchSelection) => {
    setSelected(selection);
    setInput(selection.type === "job_type" ? selection.label : selection.query);
    setOpen(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    saveToHistory(selection);
    setHistory(loadHistory());
    onSelect(selection);
  };

  const clear = () => {
    setInput("");
    setSelected(null);
    setOpen(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSelect(null);
    inputRef.current?.focus();
  };

  // Close on outside click
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        {/* Search icon */}
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              e.preventDefault();
              pick({ type: "text", query: input.trim() });
            }
            if (e.key === "Escape") { setOpen(false); }
          }}
          placeholder={placeholder || "शोधा... (nurse, airport, MIDC, hotel...)"}
          className="w-full border border-gray-200 rounded-xl pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:border-[#FF6B00]"
          style={{
            borderColor: selected ? "#FF6B00" : input ? "#FF6B00" : undefined,
          }}
        />

        {/* Clear button */}
        {(input || selected) && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        )}
      </div>

      {/* Selected badge */}
      {selected?.type === "job_type" && (
        <div className="mt-1.5 flex items-center gap-1">
          <span className="text-xs text-gray-400">कामाचा प्रकार:</span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "#FFF3E6", color: "#FF6B00" }}
          >
            {selected.label}
          </span>
        </div>
      )}

      {/* Dropdown */}
      {open && hasSuggestions && (
        <div
          className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden"
          style={{ maxHeight: "320px", overflowY: "auto" }}
        >
          {/* Empty state: history + popular */}
          {isEmpty && (
            <>
              {history.length > 0 && (
                <>
                  <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">अलीकडील शोध</span>
                    <button
                      type="button"
                      onMouseDown={() => { try { localStorage.removeItem(HISTORY_KEY); } catch {} setHistory([]); }}
                      className="text-[11px] text-gray-400 hover:text-red-400 transition"
                    >
                      साफ करा
                    </button>
                  </div>
                  {history.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onMouseDown={() => pick(item)}
                      className="w-full text-left px-4 py-2.5 hover:bg-orange-50 transition flex items-center gap-3"
                    >
                      <span className="text-gray-300">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="12 8 12 12 14 14"/><path d="M3.05 11a9 9 0 1 0 .5-4"/><polyline points="3 3 3 7 7 7"/></svg>
                      </span>
                      <div>
                        <div className="text-sm text-gray-700">
                          {item.type === "job_type" ? item.label : item.query}
                        </div>
                        <div className="text-xs text-gray-400">
                          {item.type === "job_type" ? "कामाचा प्रकार" : "शोध"}
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {popularJobTypes.length > 0 && (
                <>
                  <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 border-t">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">लोकप्रिय</span>
                  </div>
                  {popularJobTypes.map((jt) => (
                    <button
                      key={jt.id}
                      type="button"
                      onMouseDown={() => pick({ type: "job_type", id: jt.id, label: `${jt.name_mr} (${jt.name_en})` })}
                      className="w-full text-left px-4 py-2.5 hover:bg-orange-50 transition flex items-center gap-3"
                    >
                      <span className="text-gray-300">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                      </span>
                      <div>
                        <div className="text-sm font-medium text-gray-800">{jt.name_mr}</div>
                        <div className="text-xs text-gray-400">{jt.name_en}</div>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {groupedRemaining.map((group) => (
                <div key={group.category_id}>
                  <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 border-t">
                    <span className="text-[11px] font-semibold text-gray-700">{group.category_mr}</span>
                    <span className="text-[11px] text-gray-400 ml-1.5">{group.category_en}</span>
                  </div>
                  {group.options.map((jt) => (
                    <button
                      key={jt.id}
                      type="button"
                      onMouseDown={() => pick({ type: "job_type", id: jt.id, label: `${jt.name_mr} (${jt.name_en})` })}
                      className="w-full text-left px-4 py-2.5 hover:bg-orange-50 transition flex items-center gap-3"
                    >
                      <span className="text-gray-300">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                      </span>
                      <div>
                        <div className="text-sm font-medium text-gray-800">{jt.name_mr}</div>
                        <div className="text-xs text-gray-400">{jt.name_en}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </>
          )}

          {/* Free text search option — shown first so Enter matches */}
          {input.trim() && (
            <button
              type="button"
              onMouseDown={() => pick({ type: "text", query: input.trim() })}
              className="w-full text-left px-4 py-2.5 border-b border-gray-100 hover:bg-orange-50 transition flex items-center gap-3"
            >
              <span className="text-gray-300">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <span className="text-sm text-gray-500">
                &quot;<span className="font-medium text-gray-700">{input.trim()}</span>&quot; शोधा
              </span>
            </button>
          )}

          {/* Job types */}
          {matchingJobTypes.length > 0 && (
            <>
              <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">कामाचा प्रकार</span>
              </div>
              {matchingJobTypes.map((jt) => (
                <button
                  key={jt.id}
                  type="button"
                  onMouseDown={() => pick({ type: "job_type", id: jt.id, label: `${jt.name_mr} (${jt.name_en})` })}
                  className="w-full text-left px-4 py-2.5 hover:bg-orange-50 transition flex items-center gap-3"
                >
                  <span className="text-sm text-gray-300">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                  </span>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{jt.name_mr}</div>
                    <div className="text-xs text-gray-400">{jt.name_en}</div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Tags */}
          {matchingTags.length > 0 && (
            <>
              <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 border-t">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">टॅग / ठिकाण</span>
              </div>
              {matchingTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onMouseDown={() => pick({ type: "text", query: tag })}
                  className="w-full text-left px-4 py-2.5 hover:bg-orange-50 transition flex items-center gap-3"
                >
                  <span className="text-gray-300">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                  </span>
                  <span className="text-sm text-gray-700">{tag}</span>
                </button>
              ))}
            </>
          )}

        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo, useRef } from "react";

const WORK_LOCATION_TAGS = [
  "Restaurant", "MIDC", "Canteen", "Cafe", "Shop", "Showroom", "Bank",
  "School", "College", "Hotel", "Mall", "Hospital", "Airport", "Clinic",
  "Petrol Pump", "IT Park", "Farm", "Warehouse", "Construction Site",
  "Government Office", "Home / Residential", "Office Building", "Salon / Parlour", "Gym",
];
const SECTOR_TAGS = [
  "Government", "Private Company", "NGO / Trust", "Real Estate", "Automobile",
  "Facility Management", "Agriculture", "Security Agency", "Transport Company",
  "IT Company", "Manufacturing Company",
];
const CONDITION_TAGS = [
  "Part Time", "Full Time", "Night Shift", "Day Shift", "Permanent", "Contract",
  "Work From Home", "Live-in (Food & Stay Provided)", "Two Wheeler Required",
];
const ALL_TAGS = [...WORK_LOCATION_TAGS, ...SECTOR_TAGS, ...CONDITION_TAGS];

// Contextual suggestions by job type id
const CONTEXTUAL_TAGS: Record<number, string[]> = {
  23: ["Hospital", "Clinic"], 24: ["Hospital", "Clinic"], 25: ["Hospital"],
  26: ["Hospital"], 27: ["Hospital"], 28: ["Hospital"], 30: ["Hospital", "Government"],
  31: ["Hospital", "Clinic"], 32: ["Hospital", "Clinic"], 33: ["Hospital"],
  34: ["Hospital", "Clinic"], 35: ["Hospital"], 36: ["Hospital"], 37: ["Hospital"],
  113: ["Hospital"], 114: ["Hospital"], 115: ["Hospital"], 116: ["Hospital"],
  61: ["School", "College"], 62: ["School"], 63: ["School"], 64: ["College"],
  65: ["School", "College"], 67: ["School"], 68: ["School", "College"],
  38: ["Restaurant", "Hotel", "Canteen"], 39: ["Restaurant", "Hotel"],
  40: ["Restaurant", "Canteen", "Hotel"], 41: ["Shop", "Restaurant"],
  43: ["Restaurant", "Hotel"], 44: ["Restaurant", "Hotel"],
  112: ["Restaurant", "Hotel"], 29: ["Hotel", "Hospital", "Restaurant"], 102: ["Hotel"],
  3: ["Government", "Private Company"], 104: ["Government", "Private Company"], 105: ["Private Company"],
  2: ["Two Wheeler Required"], 4: ["Transport Company"],
  74: ["Transport Company"], 75: ["Transport Company"], 77: ["Warehouse"],
  85: ["IT Company", "IT Park", "Work From Home"], 86: ["IT Company", "IT Park"],
  87: ["IT Company", "IT Park"], 88: ["Work From Home", "IT Company"],
  89: ["IT Company", "Work From Home"], 90: ["IT Company", "Work From Home"],
  9: ["Shop", "Showroom"], 72: ["Showroom"], 71: ["Warehouse", "Shop"], 73: ["Shop"],
  80: ["Salon / Parlour"], 81: ["Salon / Parlour"], 82: ["Salon / Parlour"],
  83: ["Salon / Parlour", "Gym"], 84: ["Salon / Parlour"],
  131: ["Salon / Parlour"], 132: ["Salon / Parlour"],
  45: ["MIDC", "Manufacturing Company"], 46: ["MIDC", "Manufacturing Company"],
  47: ["MIDC", "Manufacturing Company"], 48: ["MIDC", "Manufacturing Company"],
  49: ["MIDC", "Manufacturing Company"], 50: ["MIDC", "Manufacturing Company"],
  51: ["MIDC", "Manufacturing Company"], 52: ["MIDC", "Manufacturing Company"],
  124: ["MIDC", "Manufacturing Company"],
  15: ["Bank"], 91: ["Two Wheeler Required"], 92: ["Two Wheeler Required"],
  95: ["Bank"], 129: ["Bank"], 130: ["Two Wheeler Required"],
  96: ["Home / Residential", "Live-in (Food & Stay Provided)"],
  98: ["Home / Residential", "Live-in (Food & Stay Provided)"],
  99: ["Home / Residential", "Live-in (Food & Stay Provided)"],
  100: ["Home / Residential"], 111: ["Petrol Pump"],
  54: ["Construction Site"], 55: ["Construction Site"], 56: ["Construction Site"],
  57: ["Construction Site"], 58: ["Construction Site"], 59: ["Construction Site"],
  60: ["Construction Site"], 126: ["Construction Site"],
  127: ["Construction Site"], 128: ["Construction Site"],
};

interface TagPickerProps {
  value: string[];
  onChange: (tags: string[]) => void;
  jobTypeId?: string;
}

export default function TagPicker({ value, onChange, jobTypeId }: TagPickerProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedSet = new Set(value);

  const toggle = (tag: string) => {
    if (selectedSet.has(tag)) {
      onChange(value.filter((t) => t !== tag));
    } else {
      onChange([...value, tag]);
    }
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !selectedSet.has(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Autocomplete suggestions from ALL_TAGS filtered by input
  const suggestions = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return [];
    return ALL_TAGS.filter(
      (tag) => tag.toLowerCase().includes(q) && !selectedSet.has(tag)
    );
  }, [input, selectedSet]);

  // Custom tag option (if input doesn't match an existing tag exactly)
  const isCustom = input.trim() && !ALL_TAGS.some((t) => t.toLowerCase() === input.trim().toLowerCase());

  // Contextual suggestions based on selected job type
  const contextual = useMemo(() => {
    if (!jobTypeId) return [];
    const id = parseInt(jobTypeId);
    return (CONTEXTUAL_TAGS[id] || []).filter((t) => !selectedSet.has(t));
  }, [jobTypeId, selectedSet]);

  const TAG_SECTIONS = [
    { label: "काम कुठे होते", sublabel: "Work Location", tags: WORK_LOCATION_TAGS },
    { label: "कंपनीचा प्रकार", sublabel: "Sector", tags: SECTOR_TAGS },
    { label: "कामाच्या अटी", sublabel: "Work Conditions", tags: CONDITION_TAGS },
  ];

  return (
    <div className="space-y-3">
      {/* Selected tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
              style={{ backgroundColor: "#FF6B00", color: "#fff" }}
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(value.filter((t) => t !== tag))}
                className="ml-0.5 leading-none hover:opacity-70"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input + autocomplete */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); if (suggestions[0]) addTag(suggestions[0]); else if (isCustom) addTag(input); }
            if (e.key === "Escape") setShowSuggestions(false);
          }}
          placeholder="टॅग जोडा... (Add tag)"
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#FF6B00]"
        />

        {showSuggestions && (suggestions.length > 0 || isCustom) && (
          <div
            className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden"
          >
            {suggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                onMouseDown={() => addTag(tag)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 transition"
                style={{ color: "#374151" }}
              >
                {tag}
              </button>
            ))}
            {isCustom && (
              <button
                type="button"
                onMouseDown={() => addTag(input)}
                className="w-full text-left px-4 py-2.5 text-sm border-t border-gray-100 hover:bg-orange-50 transition"
                style={{ color: "#FF6B00" }}
              >
                + &quot;{input.trim()}&quot; जोडा
              </button>
            )}
          </div>
        )}
      </div>

      {/* Contextual suggestions */}
      {contextual.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-1.5">सुचवलेले टॅग्स</p>
          <div className="flex flex-wrap gap-1.5">
            {contextual.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggle(tag)}
                className="text-xs px-2.5 py-1 rounded-full border border-gray-200 hover:border-[#FF6B00] hover:text-[#FF6B00] transition"
                style={{ color: "#374151" }}
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* All tags grouped */}
      <div className="space-y-3">
        {TAG_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-xs text-gray-400 mb-1.5">
              {section.label} <span className="text-gray-300">· {section.sublabel}</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {section.tags.map((tag) => {
                const active = selectedSet.has(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggle(tag)}
                    className="text-xs px-2.5 py-1 rounded-full border transition"
                    style={{
                      backgroundColor: active ? "#FF6B00" : "#f3f4f6",
                      borderColor: active ? "#FF6B00" : "#e5e7eb",
                      color: active ? "#fff" : "#374151",
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

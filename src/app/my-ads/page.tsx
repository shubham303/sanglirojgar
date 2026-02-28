"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MyAds() {
  const [phone, setPhone] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length === 10) {
      router.push(`/employer/${phone}`);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-8">
      <h1 className="text-xl font-bold text-gray-800 mb-1.5 text-center">
        माझ्या जाहिराती
      </h1>
      <p className="text-sm text-gray-400 mb-5 text-center">
        तुमचा फोन नंबर टाका आणि तुमच्या जाहिराती पहा, बदला किंवा काढा.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            if (val.length <= 10) setPhone(val);
          }}
          placeholder="10 अंकी फोन नंबर"
          className="border border-gray-200 rounded-xl px-4 py-3 text-base text-center focus:outline-none focus:border-[#FF6B00]"
          autoFocus
        />
        <button
          type="submit"
          disabled={phone.length !== 10}
          className="text-base font-semibold py-3 rounded-xl transition disabled:opacity-50"
          style={{ backgroundColor: "#FF6B00", color: "#ffffff" }}
        >
          माझ्या जाहिराती पहा
        </button>
      </form>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeClient() {
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [phone, setPhone] = useState("");
  const router = useRouter();

  const handleMyAds = () => {
    if (phone.length === 10) {
      router.push(`/employer/${phone}`);
    }
  };

  return (
    <div className="flex flex-col items-center text-center px-2">
      {/* Hero */}
      <div className="mt-6 mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "#FF6B00" }}>
          सांगली रोजगार
        </h1>
        <p className="text-base sm:text-lg text-gray-500 mt-2">
          सांगली जिल्ह्यातील नोकऱ्या — थेट फोन करा
        </p>
      </div>

      {/* Value props */}
      <div
        className="bg-white rounded-xl p-4 w-full max-w-md mb-6"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <p className="text-base text-gray-700 leading-relaxed">
          कामगार हवेत? <span className="font-semibold" style={{ color: "#FF6B00" }}>2 मिनिटांत</span> मोफत जाहिरात द्या.
        </p>
        <p className="text-base text-gray-700 leading-relaxed mt-1.5">
          काम हवंय? नोकऱ्या पहा आणि <span className="font-semibold" style={{ color: "#FF6B00" }}>लगेच फोन करा</span>.
        </p>
        <p className="text-sm text-gray-500 mt-2.5 font-medium">
          रजिस्ट्रेशन नाही. लॉगिन नाही. पूर्णपणे मोफत.
        </p>
      </div>

      {/* Main CTAs */}
      <div className="flex flex-col gap-2.5 w-full max-w-xs">
        <Link
          href="/jobs"
          className="text-sm font-semibold py-3 rounded-xl text-center transition"
          style={{ backgroundColor: "#FF6B00", color: "#ffffff" }}
        >
          नोकऱ्या पहा
        </Link>
        <Link
          href="/job/new"
          className="text-sm font-semibold py-3 rounded-xl text-center border transition"
          style={{ backgroundColor: "#ffffff", borderColor: "#FF6B00", color: "#FF6B00" }}
        >
          मोफत जाहिरात द्या
        </Link>
      </div>

      {/* Who is this for */}
      <div className="w-full max-w-md mt-8 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            className="bg-white rounded-xl p-4 text-left"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <p className="font-semibold text-gray-800 text-base mb-1">कामगारांसाठी</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              ड्रायव्हर, सुतार, प्लंबर, इलेक्ट्रिशियन, वेल्डर, शेती काम — सर्व प्रकारच्या नोकऱ्या एकाच ठिकाणी
            </p>
          </div>
          <div
            className="bg-white rounded-xl p-4 text-left"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <p className="font-semibold text-gray-800 text-base mb-1">मालकांसाठी</p>
            <p className="text-sm text-gray-500 leading-relaxed">
              तुमच्या दुकान, कारखाना, शेत किंवा व्यवसायासाठी कामगार शोधा — सांगली जिल्ह्यातील सर्व तालुक्यांमध्ये
            </p>
          </div>
        </div>
      </div>

      {/* SEO content — visible, useful for users too */}
      <div className="w-full max-w-md mt-2 mb-5">
        <h2 className="text-sm font-semibold text-gray-400 mb-2">सांगली जिल्ह्यातील नोकऱ्या</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          सांगली, मिरज, कुपवाड, तासगाव, खानापूर, आटपाडी, जत, कवठेमहांकाळ, वाळवा, पलूस — सर्व तालुक्यांमधील नोकऱ्या एकाच ठिकाणी. सेल्समन, ड्रायव्हर, इलेक्ट्रिशियन, प्लंबर, वेल्डर, मेकॅनिक, सुतार, वेटर, स्वयंपाकी, डिलिव्हरी बॉय — सर्व प्रकारच्या नोकऱ्या.
        </p>
      </div>

      {/* My Ads section */}
      <div className="mt-3 mb-8 w-full max-w-xs">
        {!showPhoneInput ? (
          <button
            onClick={() => setShowPhoneInput(true)}
            className="border rounded-xl px-5 py-3 text-sm w-full transition font-medium"
            style={{ color: "#FF6B00", borderColor: "#FF6B00", backgroundColor: "#ffffff" }}
          >
            माझ्या जाहिराती पहा
          </button>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleMyAds();
            }}
            className="flex flex-col gap-2.5 items-center w-full"
          >
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                if (val.length <= 10) setPhone(val);
              }}
              placeholder="तुमचा 10 अंकी फोन नंबर"
              className="border border-gray-200 rounded-xl px-4 py-3 text-base text-center w-full focus:outline-none focus:border-[#FF6B00]"
              autoFocus
            />
            <button
              type="submit"
              disabled={phone.length !== 10}
              className="py-3 rounded-xl disabled:opacity-50 text-sm w-full font-semibold transition"
              style={{ backgroundColor: "#FF6B00", color: "#ffffff" }}
            >
              माझ्या जाहिराती पहा
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

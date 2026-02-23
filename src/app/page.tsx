"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
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
      <div className="mt-8 mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-[--color-saffron]">
          सांगली रोजगार
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 mt-3">
          सांगली जिल्ह्यातील नोकऱ्या — थेट फोन करा
        </p>
      </div>

      {/* Value props */}
      <div className="bg-white border border-orange-100 rounded-xl p-5 w-full max-w-md mb-8 shadow-sm">
        <p className="text-lg text-gray-800 leading-relaxed">
          कामगार हवेत? <span className="font-semibold text-[--color-saffron]">2 मिनिटांत</span> मोफत जाहिरात द्या.
        </p>
        <p className="text-lg text-gray-800 leading-relaxed mt-2">
          काम हवंय? नोकऱ्या पहा आणि <span className="font-semibold text-[--color-saffron]">लगेच फोन करा</span>.
        </p>
        <p className="text-base text-gray-700 mt-3 font-medium">
          रजिस्ट्रेशन नाही. लॉगिन नाही. पूर्णपणे मोफत.
        </p>
      </div>

      {/* Main CTAs */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          href="/jobs"
          className="bg-[--color-saffron] text-white text-lg font-semibold py-4 rounded-lg text-center hover:bg-[--color-saffron-dark] active:bg-[--color-saffron-dark] transition"
        >
          नोकऱ्या पहा
        </Link>
        <Link
          href="/job/new"
          className="bg-white border-2 border-[--color-saffron] text-[--color-saffron] text-lg font-semibold py-4 rounded-lg text-center hover:bg-orange-50 active:bg-orange-50 transition"
        >
          मोफत जाहिरात द्या
        </Link>
      </div>

      {/* Who is this for */}
      <div className="w-full max-w-md mt-10 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-orange-50 rounded-lg p-4 text-left">
            <p className="font-semibold text-gray-800 text-lg mb-1">कामगारांसाठी</p>
            <p className="text-base text-gray-700">
              ड्रायव्हर, सुतार, प्लंबर, इलेक्ट्रिशियन, वेल्डर, शेती काम — सर्व प्रकारच्या नोकऱ्या एकाच ठिकाणी
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-left">
            <p className="font-semibold text-gray-800 text-lg mb-1">मालकांसाठी</p>
            <p className="text-base text-gray-700">
              तुमच्या दुकान, कारखाना, शेत किंवा व्यवसायासाठी कामगार शोधा — सांगली जिल्ह्यातील सर्व तालुक्यांमध्ये
            </p>
          </div>
        </div>
      </div>

      {/* My Ads section */}
      <div className="mt-4 mb-10 w-full max-w-xs">
        {!showPhoneInput ? (
          <button
            onClick={() => setShowPhoneInput(true)}
            className="text-[--color-saffron] border border-[--color-saffron] rounded-lg px-6 py-3 text-base w-full hover:bg-orange-50 active:bg-orange-50 transition"
          >
            माझ्या जाहिराती पहा
          </button>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleMyAds();
            }}
            className="flex flex-col gap-2 items-center w-full"
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
              className="border border-gray-300 rounded-lg px-4 py-3 text-lg text-center w-full focus:outline-none focus:border-[--color-saffron]"
              autoFocus
            />
            <button
              type="submit"
              disabled={phone.length !== 10}
              className="bg-[--color-saffron] text-white px-6 py-3 rounded-lg disabled:opacity-50 text-base w-full font-medium hover:bg-[--color-saffron-dark] active:bg-[--color-saffron-dark] transition"
            >
              माझ्या जाहिराती पहा
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

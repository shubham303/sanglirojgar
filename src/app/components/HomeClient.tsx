"use client";

import Link from "next/link";

export default function HomeClient() {

  return (
    <div className="flex flex-col items-center text-center px-2">
      {/* Hero */}
      <div className="mt-6 mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "#FF6B00" }}>
          महा जॉब
        </h1>
        <p className="text-base sm:text-lg text-gray-500 mt-2">
          महाराष्ट्रातील नोकऱ्या — थेट फोन करा
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
              तुमच्या दुकान, कारखाना, शेत किंवा व्यवसायासाठी कामगार शोधा — संपूर्ण महाराष्ट्रामध्ये
            </p>
          </div>
        </div>
      </div>

      {/* SEO content — visible, useful for users too */}
      <div className="w-full max-w-md mt-2 mb-5">
        <h2 className="text-sm font-semibold text-gray-400 mb-2">महाराष्ट्रातील नोकऱ्या</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          सांगली, पुणे, कोल्हापूर, मुंबई, नाशिक, औरंगाबाद, सोलापूर, सातारा, नागपूर — संपूर्ण महाराष्ट्रातील नोकऱ्या एकाच ठिकाणी. सेल्समन, ड्रायव्हर, इलेक्ट्रिशियन, प्लंबर, वेल्डर, मेकॅनिक, सुतार, वेटर, स्वयंपाकी, डिलिव्हरी बॉय — सर्व प्रकारच्या नोकऱ्या.
        </p>
      </div>

      {/* Contact / Help */}
      <div
        className="w-full max-w-md mt-2 mb-5 bg-white rounded-xl p-4 text-center"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <p className="text-sm text-gray-700 mb-2">
          जाहिरात देताना काही अडचण येत आहे?
        </p>
        <a
          href="https://wa.me/919284408873?text=%E0%A4%A8%E0%A4%AE%E0%A4%B8%E0%A5%8D%E0%A4%95%E0%A4%BE%E0%A4%B0%2C%20%E0%A4%AE%E0%A4%B2%E0%A4%BE%20%E0%A4%AE%E0%A4%A6%E0%A4%A4%20%E0%A4%B9%E0%A4%B5%E0%A5%80%20%E0%A4%86%E0%A4%B9%E0%A5%87."
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition"
          style={{ backgroundColor: "#25D366", color: "#ffffff" }}
        >
          <span style={{ fontSize: 16 }}>💬</span>
          आम्हाला WhatsApp करा
        </a>
      </div>

    </div>
  );
}

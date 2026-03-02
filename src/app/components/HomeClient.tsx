"use client";

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

      {/* Who is this for */}
      <div className="w-full max-w-md mt-2 mb-5">
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

      {/* Testimonials — horizontal scroll */}
      <div className="w-full max-w-md mt-2 mb-5">
        <h2 className="text-sm font-semibold text-gray-400 mb-3 text-left">लोक काय म्हणतात</h2>
        <div
          className="flex gap-3 overflow-x-auto pb-2"
          style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
        >
          {[
            { name: "राजेश पाटील", location: "सांगली", text: "महा जॉब वरून 2 दिवसात ड्रायव्हर मिळाला. खूप सोपं आहे!" },
            { name: "सुनीता जाधव", location: "कोल्हापूर", text: "मला स्वयंपाकाची नोकरी लगेच मिळाली. रजिस्ट्रेशन नाही, थेट फोन केला." },
            { name: "अमित शिंदे", location: "पुणे", text: "आमच्या दुकानासाठी सेल्समन शोधत होतो. एका दिवसात 5 कॉल आले!" },
            { name: "प्रिया कुलकर्णी", location: "मिरज", text: "कोणतेही चार्जेस नाहीत. अकाउंटंटची जागा भरली गेली." },
            { name: "विकास माळी", location: "सातारा", text: "इलेक्ट्रिशियनचं काम मिळालं. WhatsApp वर लगेच संपर्क झाला." },
          ].map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 shrink-0"
              style={{
                width: "260px",
                scrollSnapAlign: "start",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                &ldquo;{t.text}&rdquo;
              </p>
              <p className="text-xs font-semibold text-gray-700">{t.name}</p>
              <p className="text-xs text-gray-400">{t.location}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="w-full max-w-md mt-2 mb-5">
        <h2 className="text-sm font-semibold text-gray-400 mb-3 text-left">कसं काम करतं?</h2>
        <div className="flex flex-col gap-2.5">
          {[
            { step: "1", title: "जाहिरात द्या किंवा नोकरी शोधा", desc: "2 मिनिटांत मोफत जाहिरात द्या किंवा उपलब्ध नोकऱ्या पहा" },
            { step: "2", title: "थेट संपर्क करा", desc: "फोन किंवा WhatsApp वरून लगेच बोला — कोणताही मध्यस्थ नाही" },
            { step: "3", title: "कामावर रुजू व्हा", desc: "बोलणी करा आणि लगेच कामाला सुरुवात करा" },
          ].map((s) => (
            <div
              key={s.step}
              className="bg-white rounded-xl p-3.5 flex items-start gap-3 text-left"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <span
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: "#FF6B00" }}
              >
                {s.step}
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SEO content — visible, useful for users too */}
      <div className="w-full max-w-md mt-2 mb-5">
        <h2 className="text-sm font-semibold text-gray-400 mb-2">महाराष्ट्रातील नोकऱ्या</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          सांगली, पुणे, कोल्हापूर, मुंबई, नाशिक, औरंगाबाद, सोलापूर, सातारा, नागपूर — संपूर्ण महाराष्ट्रातील नोकऱ्या एकाच ठिकाणी. सेल्समन, ड्रायव्हर, इलेक्ट्रिशियन, प्लंबर, वेल्डर, मेकॅनिक, सुतार, वेटर, स्वयंपाकी, डिलिव्हरी बॉय — सर्व प्रकारच्या नोकऱ्या.
        </p>
      </div>

    </div>
  );
}

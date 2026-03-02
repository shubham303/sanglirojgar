import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "संपर्क | महा जॉब",
  description: "महा जॉब बद्दल माहिती आणि संपर्क",
};

const ADMIN_PHONE = "9284408873";
const WA_MESSAGE = encodeURIComponent("नमस्कार, मला mahajob.in बद्दल माहिती हवी आहे.");

export default function ContactPage() {
  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-4">महा जॉब बद्दल</h1>

      <div
        className="bg-white rounded-xl p-5 mb-5"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          <span className="font-semibold" style={{ color: "#FF6B00" }}>महा जॉब</span> हे महाराष्ट्रातील नोकरी शोधणारे आणि नोकरी देणारे यांना जोडणारे मोफत व्यासपीठ आहे.
        </p>
        <ul className="text-sm text-gray-600 space-y-1.5 mb-3">
          <li>- रजिस्ट्रेशन नाही, लॉगिन नाही</li>
          <li>- जाहिरात देणे पूर्णपणे मोफत</li>
          <li>- नोकरी देणाऱ्यांशी थेट फोन / WhatsApp संपर्क</li>
          <li>- संपूर्ण महाराष्ट्रातील नोकऱ्या</li>
        </ul>
        <p className="text-sm text-gray-500">
          काही अडचण असल्यास किंवा सूचना देण्यासाठी आम्हाला संपर्क करा.
        </p>
      </div>

      <div
        className="bg-white rounded-xl p-5"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <p className="text-sm font-semibold text-gray-700 mb-3">संपर्क</p>
        <div className="flex gap-3">
          <a
            href={`tel:${ADMIN_PHONE}`}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition"
            style={{ backgroundColor: "#16a34a", color: "#ffffff" }}
          >
            <span style={{ fontSize: 18 }}>📞</span>
            कॉल करा
          </a>
          <a
            href={`https://wa.me/91${ADMIN_PHONE}?text=${WA_MESSAGE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition"
            style={{ backgroundColor: "#25D366", color: "#ffffff" }}
          >
            <span style={{ fontSize: 18 }}>💬</span>
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

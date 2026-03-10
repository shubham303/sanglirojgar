import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of use for mahajob.in — a free job listing platform in Maharashtra.",
};

export default function TermsPage() {
  return (
    <div>
      <Link
        href="/"
        className="inline-block mb-3 text-sm font-medium"
        style={{ color: "#FF6B00" }}
      >
        ← मुख्यपृष्ठ
      </Link>

      <div
        className="bg-white rounded-xl p-4 sm:p-6"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
      >
        <h1 className="text-xl font-bold text-gray-800 mb-4">Terms of Use</h1>

        {/* Marathi summary */}
        <div
          className="rounded-lg p-3 mb-5 text-sm text-gray-700 leading-relaxed"
          style={{ backgroundColor: "#FFF7ED", borderLeft: "3px solid #FF6B00" }}
        >
          <p className="font-semibold mb-1" style={{ color: "#FF6B00" }}>सारांश (मराठी)</p>
          <p>
            mahajob.in हे एक मोफत job listing platform आहे. आम्ही recruiter किंवा placement agency नाही.
            नोकरीची जाहिरात देणारे (employers) त्यांच्या माहितीसाठी स्वतः जबाबदार आहेत.
            कोणत्याही नोकरीसाठी संपर्क करण्यापूर्वी employer ची माहिती स्वतः verify करा.
            कोणालाही पैसे देऊ नका. संशयास्पद जाहिरात दिसल्यास आम्हाला WhatsApp वर कळवा: 9284408873.
          </p>
        </div>

        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          <section>
            <h2 className="font-semibold text-gray-800 mb-1">1. What is mahajob.in?</h2>
            <p>
              mahajob.in is a free job listing platform. We connect employers with job seekers by
              letting employers post job listings and job seekers browse and contact them directly.
              We are not a recruiter, staffing agency, or placement consultancy.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-1">2. Employer responsibility</h2>
            <p>
              Employers are solely responsible for the accuracy, completeness, and legitimacy of
              their job listings. mahajob.in does not verify or endorse any employer, job listing,
              salary, or working conditions posted on the platform.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-1">3. No liability</h2>
            <p>
              mahajob.in is not liable for any fraud, misrepresentation, disputes, or damages
              arising between employers and job seekers. All interactions, agreements, and
              transactions happen directly between the two parties.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-1">4. User caution</h2>
            <p>
              Before contacting an employer or sharing personal information, please verify
              their details independently. Never pay money to any employer for a job — legitimate
              employers do not charge job seekers. If something feels suspicious, trust your
              instinct and walk away.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-1">5. Report a fraudulent listing</h2>
            <p>
              If you come across a suspicious or fraudulent job listing, please report it to us
              on WhatsApp at{" "}
              <a
                href="https://wa.me/919284408873?text=Hi%2C%20I%20want%20to%20report%20a%20suspicious%20job%20listing%20on%20mahajob.in."
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline"
                style={{ color: "#FF6B00" }}
              >
                9284408873
              </a>
              . We will review and take it down as soon as possible.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-1">6. Free to use</h2>
            <p>
              mahajob.in is completely free for both employers and job seekers. There are no
              hidden charges, no registration fees, and no commissions.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-800 mb-1">7. Changes to these terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the platform means
              you accept the updated terms.
            </p>
          </section>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Last updated: March 2026
        </p>
      </div>
    </div>
  );
}

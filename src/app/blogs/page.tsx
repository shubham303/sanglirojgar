import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "ब्लॉग — नोकरी टिप्स आणि मार्गदर्शक",
  description:
    "महाराष्ट्रात नोकरी शोधण्यासाठी आणि कामगार मिळवण्यासाठी उपयुक्त लेख. Job search tips, hiring guides for Maharashtra.",
  alternates: { canonical: "/blogs" },
  openGraph: {
    title: "ब्लॉग — महा जॉब",
    description: "नोकरी शोधण्यासाठी आणि कामगार मिळवण्यासाठी उपयुक्त लेख.",
    url: "/blogs",
  },
};

export default function BlogsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-gray-800 mb-1">ब्लॉग</h1>
      <p className="text-sm text-gray-500 mb-5">
        नोकरी आणि व्यवसायासाठी उपयुक्त लेख
      </p>

      <div className="space-y-4">
        {blogPosts.map((post) => (
          <Link key={post.slug} href={`/blogs/${post.slug}`} className="block">
            <div
              className="bg-white rounded-xl p-5 transition hover:shadow-md"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: post.lang === "mr" ? "#FFF3E0" : "#E3F2FD",
                    color: post.lang === "mr" ? "#E65100" : "#1565C0",
                  }}
                >
                  {post.lang === "mr" ? "मराठी" : "English"}
                </span>
                <span className="text-xs text-gray-400">{post.date}</span>
              </div>
              <h2 className="text-base font-semibold text-gray-800 mb-1">
                {post.title}
              </h2>
              <p className="text-sm text-gray-500 line-clamp-2">
                {post.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

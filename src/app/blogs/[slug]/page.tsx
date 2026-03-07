import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, getBlogBySlug } from "@/lib/blog-data";
import type { BlogSection } from "@/lib/blog-data";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `/blogs/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blogs/${post.slug}`,
      type: "article",
      locale: post.lang === "mr" ? "mr_IN" : "en_IN",
    },
  };
}

function renderSection(section: BlogSection, index: number) {
  switch (section.type) {
    case "heading":
      return (
        <h2
          key={index}
          className="text-lg font-bold mt-6 mb-2"
          style={{ color: "#FF6B00" }}
        >
          {section.content}
        </h2>
      );
    case "paragraph":
      return (
        <p key={index} className="text-sm text-gray-700 leading-relaxed mb-3">
          {section.content}
        </p>
      );
    case "list":
      return (
        <ul key={index} className="text-sm text-gray-700 space-y-1.5 mb-3 ml-4">
          {section.items?.map((item, i) => (
            <li key={i} className="list-disc">
              {item}
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogBySlug(slug);
  if (!post) notFound();

  const isMarathi = post.lang === "mr";

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/blogs"
        className="inline-block text-sm text-gray-500 hover:text-orange-600 mb-4 transition"
      >
        &larr; {isMarathi ? "सर्व लेख" : "All Posts"}
      </Link>

      <article
        className="bg-white rounded-xl p-5"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: isMarathi ? "#FFF3E0" : "#E3F2FD",
              color: isMarathi ? "#E65100" : "#1565C0",
            }}
          >
            {isMarathi ? "मराठी" : "English"}
          </span>
          <span className="text-xs text-gray-400">{post.date}</span>
        </div>

        <h1 className="text-xl font-bold text-gray-800 mb-4">{post.title}</h1>

        {post.body.map((section, i) => renderSection(section, i))}
      </article>

      {/* CTA */}
      <div
        className="bg-white rounded-xl p-5 mt-5 text-center"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
      >
        <Link
          href="/jobs"
          className="inline-block w-full py-3 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: "#FF6B00" }}
        >
          {isMarathi
            ? "आजच महा जॉब वर नोकरी शोधा →"
            : "Find Jobs on MahaJob Now →"}
        </Link>
        <Link
          href="/job/new"
          className="inline-block mt-3 text-sm font-medium transition hover:underline"
          style={{ color: "#FF6B00" }}
        >
          {isMarathi ? "मोफत जाहिरात द्या →" : "Post a Free Job Ad →"}
        </Link>
      </div>
    </div>
  );
}

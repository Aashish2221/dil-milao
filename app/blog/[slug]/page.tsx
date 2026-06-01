import { notFound } from "next/navigation";
import Link from "next/link";
import { Heart, Clock, ArrowLeft, Tag } from "lucide-react";
import type { Metadata } from "next";
import { getBlogPost, BLOG_POSTS, ALL_BLOG_SLUGS, type Section } from "@/lib/blog";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ALL_BLOG_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Not Found" };

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `https://dil-milao.vercel.app/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://dil-milao.vercel.app/blog/${slug}`,
      siteName: "Dil Milao",
      locale: "en_IN",
      type: "article",
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

function renderSection(section: Section, i: number) {
  switch (section.type) {
    case "h2":
      return <h2 key={i} className="text-xl md:text-2xl font-bold text-white mt-8 mb-3">{section.text}</h2>;
    case "h3":
      return <h3 key={i} className="text-lg font-semibold text-white/90 mt-5 mb-2">{section.text}</h3>;
    case "p":
      return <p key={i} className="text-white/65 leading-relaxed mb-4">{section.text}</p>;
    case "ul":
      return (
        <ul key={i} className="space-y-2 mb-5 ml-1">
          {section.items?.map((item, j) => (
            <li key={j} className="flex items-start gap-2.5 text-white/65 text-sm leading-relaxed">
              <span className="text-red-400 mt-1 flex-shrink-0">▸</span>
              {item}
            </li>
          ))}
        </ul>
      );
    case "cta":
      return (
        <div key={i} className="my-8 text-center p-6 rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(255,107,107,0.1), rgba(238,90,36,0.1))", border: "1px solid rgba(255,107,107,0.2)" }}>
          <Link href="/signup" className="btn-primary px-7 py-3 rounded-full text-white font-bold inline-flex items-center gap-2">
            <Heart size={16} fill="white" />
            {section.text}
          </Link>
        </div>
      );
    default:
      return null;
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: "Dil Milao" },
    publisher: {
      "@type": "Organization",
      name: "Dil Milao",
      logo: { "@type": "ImageObject", url: "https://dil-milao.vercel.app/icons/icon.svg" },
    },
    url: `https://dil-milao.vercel.app/blog/${slug}`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://dil-milao.vercel.app/blog/${slug}` },
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #1a0a1e 50%, #0a0a0f 100%)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 glass sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <Heart className="heartbeat text-red-400" size={26} fill="#ff6b6b" />
          <span className="text-xl font-bold gradient-text">Dil Milao</span>
        </Link>
        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 rounded-full text-sm text-white/70 hover:text-white transition-colors">Login</Link>
          <Link href="/signup" className="btn-primary px-4 py-2 rounded-full text-sm font-semibold text-white">Join Free</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to Blog
        </Link>

        {/* Article header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold px-3 py-1 rounded-full text-red-400" style={{ background: "rgba(255,107,107,0.1)" }}>
              <Tag size={10} className="inline mr-1" />{post.category}
            </span>
            <span className="text-white/30 text-xs flex items-center gap-1">
              <Clock size={11} />{post.readTime}
            </span>
            <span className="text-white/20 text-xs">
              {new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-white/50 text-base leading-relaxed">{post.description}</p>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 mb-8" />

        {/* Article content */}
        <article className="prose-custom">
          {post.content.map((section, i) => renderSection(section, i))}
        </article>

        {/* Divider */}
        <div className="border-t border-white/5 mt-10 mb-10" />

        {/* Related posts */}
        {related.length > 0 && (
          <div>
            <h2 className="text-white font-bold text-lg mb-5">More Dating Tips</h2>
            <div className="space-y-4">
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="flex items-start gap-4 glass rounded-xl p-4 hover:border-white/15 transition-all group" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm font-semibold group-hover:text-red-300 transition-colors leading-snug">{p.title}</p>
                    <p className="text-white/35 text-xs mt-1 flex items-center gap-1"><Clock size={10} />{p.readTime}</p>
                  </div>
                  <span className="text-white/25 flex-shrink-0 mt-0.5">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Final CTA */}
        <div className="mt-12 text-center glass rounded-3xl p-8">
          <Heart size={32} className="text-red-400 mx-auto mb-4 heartbeat" fill="#ff6b6b" />
          <h2 className="text-xl font-bold text-white mb-2">Ready to find your match?</h2>
          <p className="text-white/40 text-sm mb-5">Join 2 lakh+ Indians on Dil Milao. Free forever.</p>
          <Link href="/signup" className="btn-primary px-7 py-3 rounded-full text-white font-bold inline-block">
            Join Dil Milao — Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8 mt-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-white/25 text-xs">
          <Link href="/" className="flex items-center gap-2">
            <Heart size={14} className="text-red-400" fill="#ff6b6b" />
            <span className="text-white/40">Dil Milao</span>
          </Link>
          <div className="flex gap-5">
            <Link href="/blog" className="hover:text-white/50 transition-colors">Blog</Link>
            <Link href="/terms" className="hover:text-white/50 transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
          </div>
          <p>© 2026 Dil Milao</p>
        </div>
      </footer>
    </div>
  );
}

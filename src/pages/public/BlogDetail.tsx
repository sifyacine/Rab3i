import { useParams, Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import { blogService } from "@/services/blogService";

const BlogDetail = () => {
  const { slug } = useParams();

  // Fetch blog post by slug
  const { data: post, isLoading, error } = useQuery({
    queryKey: ["blog-detail", slug],
    queryFn: () => (slug ? blogService.getBlogPostBySlug(slug) : null),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-6 flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <Navbar />
        <main className="pt-32 pb-20">
          <article className="container mx-auto max-w-3xl px-6">
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">لم يتم العثور على المقال</p>
              <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                <ArrowRight size={14} />
                العودة للمدونة
              </Link>
            </div>
          </article>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20">
        <article className="container mx-auto max-w-3xl px-6">
          <ScrollReveal>
            <Link to="/blog" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowRight size={14} />
              العودة للمدونة
            </Link>
            <h1
              className="mb-6 text-3xl font-bold leading-snug text-foreground sm:text-4xl"
              style={{ textWrap: "balance" } as React.CSSProperties}
            >
              {post.title}
            </h1>
            <div className="mb-12 flex items-center gap-4 text-sm text-muted-foreground">
              <span>{post.author}</span>
              <span>·</span>
              <span>{post.category}</span>
              <span>·</span>
              <span>
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString("ar-SA", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"}
              </span>
            </div>

            {post.featured_image_url && (
              <div className="mb-12 overflow-hidden rounded-2xl border border-border/40">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}
          </ScrollReveal>

          <div className="space-y-6">
            <ScrollReveal>
              <p className="text-lg font-medium leading-relaxed italic text-primary/80">
                {post.excerpt}
              </p>
            </ScrollReveal>

            <div className="space-y-6">
              {post.content.split("\n\n").map((paragraph, i) => (
                <ScrollReveal key={i} delay={i * 0.05}>
                  <p
                    className="text-base leading-[1.9] text-foreground/85"
                    style={{ textWrap: "pretty" } as React.CSSProperties}
                  >
                    {paragraph}
                  </p>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal className="mt-12 pt-8 border-t border-border/20">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>المشاهدات: {post.views}</span>
                <span className="text-xs text-muted-foreground/60">
                  تم التحديث: {post.updated_at ? new Date(post.updated_at).toLocaleDateString("ar-SA") : "—"}
                </span>
              </div>
            </ScrollReveal>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
};

export default BlogDetail;

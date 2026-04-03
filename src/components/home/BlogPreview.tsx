import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import ScrollReveal from "../ScrollReveal";
import { blogService } from "@/services/blogService";

const BlogPreview = () => {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["home-blog-preview"],
    queryFn: () => blogService.getBlogPosts({ published_only: true }),
    select: (data) => data.slice(0, 3), // Show first 3 on homepage
  });

  return (
    <section className="py-32">
    <div className="container mx-auto px-6">
      <ScrollReveal className="mb-12 flex items-end justify-between">
        <div>
          <span className="mb-4 block text-xs font-semibold uppercase tracking-widest text-primary">المدونة</span>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">آخر المقالات</h2>
        </div>
        <Link to="/blog" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
          جميع المقالات ←
        </Link>
      </ScrollReveal>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post, i) => (
            <ScrollReveal key={post.id} delay={i * 0.1}>
              <Link to={`/blog/${post.slug}`}>
                <motion.article
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="group overflow-hidden rounded-2xl border border-border/40 bg-card transition-all duration-500 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
                >
                  {post.featured_image_url && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  )}
                  {!post.featured_image_url && (
                    <div className="h-48 bg-gradient-to-br from-primary/15 via-accent/10 to-secondary" />
                  )}
                  <div className="p-6">
                    <h3 className="mb-3 text-lg font-bold text-foreground leading-snug transition-colors group-hover:text-primary">
                      {post.title}
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{post.author}</span>
                      <span>
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString("ar-SA", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </span>
                    </div>
                  </div>
                </motion.article>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  </section>
  );
};

export default BlogPreview;

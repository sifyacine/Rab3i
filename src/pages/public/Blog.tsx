import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import { blogService } from "@/services/blogService";

const Blog = () => {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["public-blog"],
    queryFn: () => blogService.getBlogPosts({ published_only: true }),
  });

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <ScrollReveal className="mb-16 text-center">
            <h1 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">المدونة</h1>
            <p className="text-muted-foreground">أفكار ورؤى من فريق ربيعي</p>
          </ScrollReveal>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p>لا توجد مقالات منشورة حالياً</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => (
                <ScrollReveal key={post.id} delay={i * 0.08}>
                  <Link to={`/blog/${post.slug}`}>
                    <motion.article
                      whileHover={{ y: -6 }}
                      className="group overflow-hidden rounded-2xl border border-border/40 bg-card transition-all duration-500 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
                    >
                      <div className="h-44 bg-gradient-to-br from-primary/15 via-accent/10 to-secondary" />
                      <div className="p-6">
                        <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                          {post.category}
                        </span>
                        <h3 className="mb-3 text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                          {post.title}
                        </h3>
                        <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{post.author}</span>
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
                      </div>
                    </motion.article>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Blog;

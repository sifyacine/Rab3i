import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ScrollReveal from "../ScrollReveal";

const posts = [
  {
    title: "كيف تبني هوية بصرية تميز علامتك التجارية؟",
    excerpt: "الهوية البصرية هي أول ما يراه جمهورك، وهي اللي تحدد الانطباع الأول عن علامتك التجارية...",
    author: "أحمد المالكي",
    date: "١٥ مارس ٢٠٢٥",
  },
  {
    title: "أسرار الحملات التسويقية الناجحة",
    excerpt: "الحملة التسويقية الناجحة تبدأ من فهم عميق لجمهورك المستهدف واحتياجاته...",
    author: "سارة العتيبي",
    date: "١٠ مارس ٢٠٢٥",
  },
  {
    title: "المحتوى الإبداعي: بين الفن والاستراتيجية",
    excerpt: "صناعة المحتوى الإبداعي تتطلب توازن بين الجانب الفني والجانب الاستراتيجي...",
    author: "خالد النمر",
    date: "٥ مارس ٢٠٢٥",
  },
];

const BlogPreview = () => (
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

      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post, i) => (
          <ScrollReveal key={i} delay={i * 0.1}>
            <Link to="/blog">
              <motion.article
                whileHover={{ y: -6 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="group overflow-hidden rounded-2xl border border-border/40 bg-card transition-all duration-500 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="h-48 bg-gradient-to-br from-primary/15 via-accent/10 to-secondary" />
                <div className="p-6">
                  <h3 className="mb-3 text-lg font-bold text-foreground leading-snug transition-colors group-hover:text-primary">
                    {post.title}
                  </h3>
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.author}</span>
                    <span>{post.date}</span>
                  </div>
                </div>
              </motion.article>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);

export default BlogPreview;

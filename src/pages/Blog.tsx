import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

const posts = [
  {
    id: 1,
    title: "كيف تبني هوية بصرية تميز علامتك التجارية؟",
    excerpt: "الهوية البصرية هي أول ما يراه جمهورك، وهي اللي تحدد الانطباع الأول عن علامتك التجارية. تعرّف على الخطوات الأساسية لبناء هوية بصرية قوية.",
    author: "أحمد المالكي",
    date: "١٥ مارس ٢٠٢٥",
    category: "علامة تجارية",
  },
  {
    id: 2,
    title: "أسرار الحملات التسويقية الناجحة",
    excerpt: "الحملة التسويقية الناجحة تبدأ من فهم عميق لجمهورك المستهدف واحتياجاته. اكتشف أهم الأسرار لنجاح حملاتك.",
    author: "سارة العتيبي",
    date: "١٠ مارس ٢٠٢٥",
    category: "تسويق",
  },
  {
    id: 3,
    title: "المحتوى الإبداعي: بين الفن والاستراتيجية",
    excerpt: "صناعة المحتوى الإبداعي تتطلب توازن بين الجانب الفني والجانب الاستراتيجي. كيف تحقق هذا التوازن؟",
    author: "خالد النمر",
    date: "٥ مارس ٢٠٢٥",
    category: "محتوى",
  },
  {
    id: 4,
    title: "مستقبل التسويق الرقمي في العالم العربي",
    excerpt: "التسويق الرقمي يتطور بسرعة كبيرة. تعرف على أهم التوجهات والفرص المتاحة في السوق العربي.",
    author: "أحمد المالكي",
    date: "١ مارس ٢٠٢٥",
    category: "تسويق",
  },
  {
    id: 5,
    title: "قوة السرد القصصي في بناء العلامات التجارية",
    excerpt: "القصص تخلق اتصال عاطفي مع جمهورك. اكتشف كيف تستخدم السرد القصصي لتعزيز علامتك التجارية.",
    author: "سارة العتيبي",
    date: "٢٥ فبراير ٢٠٢٥",
    category: "علامة تجارية",
  },
];

const Blog = () => (
  <>
    <Navbar />
    <main className="pt-32 pb-20">
      <div className="container mx-auto px-6">
        <ScrollReveal className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">المدونة</h1>
          <p className="text-muted-foreground">أفكار ورؤى من فريق مِلاحة</p>
        </ScrollReveal>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <ScrollReveal key={post.id} delay={i * 0.08}>
              <Link to={`/blog/${post.id}`}>
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
                      <span>{post.date}</span>
                    </div>
                  </div>
                </motion.article>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </>
);

export default Blog;

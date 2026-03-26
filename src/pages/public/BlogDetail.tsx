import { useParams, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

const posts: Record<string, { title: string; author: string; date: string; content: string[] }> = {
  "1": {
    title: "كيف تبني هوية بصرية تميز علامتك التجارية؟",
    author: "أحمد المالكي",
    date: "١٥ مارس ٢٠٢٥",
    content: [
      "الهوية البصرية هي أول ما يراه جمهورك، وهي اللي تحدد الانطباع الأول عن علامتك التجارية. في عالم مليء بالمنافسة، الهوية البصرية القوية تعتبر عامل حاسم في تميزك.",
      "أول خطوة في بناء الهوية البصرية هي فهم شخصية العلامة التجارية. ما هي القيم اللي تمثلها؟ ما هو الشعور اللي تبي توصله لجمهورك؟ الإجابة على هذي الأسئلة تحدد الاتجاه البصري الصحيح.",
      "الألوان تلعب دور كبير في الهوية البصرية. كل لون يوصل رسالة مختلفة — الأزرق يوحي بالثقة والاحترافية، الأخضر يوحي بالنمو والطبيعة، والبرتقالي يوحي بالطاقة والحماس.",
      "الخط المستخدم أيضاً جزء مهم من الهوية. اختيار الخط المناسب يعكس شخصية العلامة التجارية ويسهل قراءة المحتوى. التوازن بين الجمالية والوظيفية أمر ضروري.",
      "أخيراً، الاتساق هو المفتاح. تطبيق الهوية البصرية بشكل موحد عبر جميع نقاط التواصل مع الجمهور يبني الثقة ويعزز التعرف على العلامة التجارية.",
    ],
  },
  "2": {
    title: "أسرار الحملات التسويقية الناجحة",
    author: "سارة العتيبي",
    date: "١٠ مارس ٢٠٢٥",
    content: [
      "الحملة التسويقية الناجحة تبدأ من فهم عميق لجمهورك المستهدف واحتياجاته. بدون هذا الفهم، أي حملة ممكن تكون مجرد ضوضاء إضافية.",
      "التخطيط الاستراتيجي هو الأساس. قبل ما تبدأ أي حملة، لازم تحدد أهداف واضحة وقابلة للقياس. هل تبي زيادة الوعي؟ تحقيق مبيعات؟ بناء قاعدة عملاء؟",
      "اختيار القنوات المناسبة مهم جداً. مو كل منصة مناسبة لكل جمهور. لازم تعرف وين يتواجد جمهورك وكيف يتفاعل مع المحتوى.",
      "المحتوى الإبداعي هو اللي يميز حملتك عن غيرها. الرسائل المؤثرة والتصاميم الجذابة تخلق تفاعل حقيقي مع الجمهور.",
    ],
  },
};

const BlogDetail = () => {
  const { id } = useParams();
  const post = posts[id || "1"] || posts["1"];

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
            <h1 className="mb-6 text-3xl font-bold leading-snug text-foreground sm:text-4xl" style={{ textWrap: "balance" }}>
              {post.title}
            </h1>
            <div className="mb-12 flex items-center gap-4 text-sm text-muted-foreground">
              <span>{post.author}</span>
              <span>·</span>
              <span>{post.date}</span>
            </div>
          </ScrollReveal>

          <div className="space-y-6">
            {post.content.map((p, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <p className="text-base leading-[1.9] text-foreground/85" style={{ textWrap: "pretty" }}>{p}</p>
              </ScrollReveal>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
};

export default BlogDetail;

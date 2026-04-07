import { Link } from "react-router-dom";
import { ArrowLeft, Eye, Target, Heart } from "lucide-react";
import ScrollReveal from "../ScrollReveal";

const values = [
  {
    icon: Heart,
    title: "الشراكة قبل الخدمة",
    description: "نقيس نجاحنا بمدى اندماجنا داخل فريق العميل."
  },
  {
    icon: Eye,
    title: "الوضوح والشفافية",
    description: "نقدم أرقام وحقائق، مو وعود فضفاضة."
  },
  {
    icon: Target,
    title: "النظام قبل الضجة",
    description: "النمو الحقيقي يبدأ ببناء أساس قوي."
  },
  {
    icon: ArrowLeft,
    title: "القرار المشترك",
    description: "نؤمن أن أفضل النتائج تأتي من الحوار، مو من الإملاء."
  },
  {
    icon: Heart,
    title: "الجودة فوق الكمية",
    description: "نختار مشاريع نقدر نصنع فيها فرق حقيقي."
  }
];

const AboutPreview = () => (
  <section className="py-32" dir="rtl">
    <div className="container mx-auto px-6">
      <ScrollReveal className="max-w-3xl mx-auto text-center mb-20">
        <span className="mb-4 block text-xs font-semibold uppercase tracking-widest text-primary">من نحن</span>
        <h2 className="text-3xl sm:text-4xl font-bold leading-snug text-foreground mb-6" style={{ textWrap: "balance" }}>
          وش هي <span className="text-gradient">رُبْعي</span>؟
        </h2>
        <p className="text-lg leading-relaxed text-muted-foreground" style={{ textWrap: "pretty" }}>
          في الثقافة الخليجية، الرُبْعي هو الشريك اللي يجلس معك في المجلس يكون سندك وصحبك،
          ويشاركك الرأي، ويتحمّل القرار.
          <br />
          رُبْع تأسست على نفس الفكرة:
          <span className="text-foreground font-semibold"> نكون القسم الرابع في مشروعك.</span>
          <br />
          الإدارة، العمليات، المبيعات… والتسويق.
          <br />
          مو برّه الفريق.
          <span className="text-foreground font-semibold"> داخل الفريق.</span>
        </p>
      </ScrollReveal>

      <div className="grid gap-8 md:grid-cols-3 mb-20">
        <ScrollReveal delay={0.1} className="text-center p-8 rounded-2xl bg-card/50 border border-border/30">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Eye size={24} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">رؤيتنا</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            أن نعيد تعريف دور التسويق في الشركات السعودية والخليجية،
            من قسم منفصل… إلى شريك استراتيجي في صناعة القرار والنمو.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2} className="text-center p-8 rounded-2xl bg-card/50 border border-border/30">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Target size={24} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">رسالتنا</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            نبني أنظمة تسويقية متكاملة ترتبط بالإدارة والمبيعات والعمليات،
            ونحوّل التسويق من نشاط تشغيلي إلى محرك نمو مستدام.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3} className="text-center p-8 rounded-2xl bg-card/50 border border-border/30">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Heart size={24} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">قيمنا</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            الشراكة قبل الخدمة — الوضوح والشفافية — النظام قبل الضجة —
            القرار المشترك — الجودة فوق الكمية
          </p>
        </ScrollReveal>
      </div>

      <ScrollReveal className="text-center">
        <Link
          to="/about"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
        >
          اعرف المزيد عنا
          <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-1" />
        </Link>
      </ScrollReveal>
    </div>
  </section>
);

export default AboutPreview;

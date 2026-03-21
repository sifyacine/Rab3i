import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ScrollReveal from "../ScrollReveal";

const CTASection = () => (
  <section className="relative py-32 overflow-hidden">
    {/* Animated bg */}
    <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-[hsl(270,60%,15%)] via-[hsl(260,50%,10%)] to-[hsl(280,60%,12%)] bg-[length:300%_300%]" />
    <div className="absolute inset-0 opacity-[0.04]" style={{
      backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
      backgroundSize: "40px 40px",
    }} />

    <div className="relative z-10 container mx-auto px-6 text-center">
      <ScrollReveal>
        <h2 className="mx-auto mb-6 max-w-3xl text-3xl font-bold leading-snug text-foreground sm:text-4xl md:text-5xl" style={{ textWrap: "balance" }}>
          خلنا نبدأ ونبني شيء <span className="text-gradient">مختلف</span>
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-muted-foreground" style={{ textWrap: "pretty" }}>
          جاهز تنقل علامتك التجارية للمستوى القادم؟ تواصل معنا وخلنا نبدأ رحلة إبداعية مع بعض
        </p>
        <Link
          to="/request"
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-10 py-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97]"
        >
          ابدأ مشروعك الآن
          <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
        </Link>
      </ScrollReveal>
    </div>
  </section>
);

export default CTASection;

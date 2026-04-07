import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, MessageSquare } from "lucide-react";
import ScrollReveal from "../ScrollReveal";

const CTASection = () => (
  <section className="relative py-32 overflow-hidden">
    <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-[hsl(0,84%,15%)] via-[hsl(350,70%,10%)] to-[hsl(10,60%,12%)] bg-[length:300%_300%]" />
    <div className="absolute inset-0 opacity-[0.04]" style={{
      backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
      backgroundSize: "40px 40px",
    }} />

    <div className="relative z-10 container mx-auto px-6 text-center">
      <ScrollReveal>
        <span className="mb-6 inline-block rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-xs font-medium text-primary">
          هل أنت جاهز؟
        </span>
        
        <h2 className="mx-auto mb-6 max-w-3xl text-3xl sm:text-4xl md:text-5xl font-bold leading-snug text-foreground" style={{ textWrap: "balance" }}>
          جاهز نكون <span className="text-gradient">رُبْعك</span>؟
        </h2>
        
        <p className="mx-auto mb-10 max-w-xl text-muted-foreground text-lg" style={{ textWrap: "pretty" }}>
          خلنا نجلس، نفهم مشروعك، ونشوف كيف نقدر نبني نمو مستدام.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/request"
            className="group flex items-center gap-2 rounded-xl bg-gradient-brand px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.97]"
          >
            احجز اجتماع
            <Calendar size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
          </Link>
          <Link
            to="/request"
            className="group flex items-center gap-2 rounded-xl border border-border/50 bg-secondary/50 px-8 py-3.5 text-sm font-semibold text-foreground/90 transition-all duration-300 hover:border-primary/30 hover:bg-secondary active:scale-[0.97]"
          >
            <MessageSquare size={16} />
            تواصل معنا
          </Link>
        </div>
      </ScrollReveal>
    </div>
  </section>
);

export default CTASection;

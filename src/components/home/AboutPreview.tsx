import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ScrollReveal from "../ScrollReveal";

const AboutPreview = () => (
  <section className="py-32">
    <div className="container mx-auto px-6">
      <div className="grid items-center gap-16 md:grid-cols-2">
        <ScrollReveal direction="right">
          <span className="mb-4 block text-xs font-semibold uppercase tracking-widest text-primary">من نحن</span>
          <h2 className="mb-6 text-3xl font-bold leading-snug text-foreground sm:text-4xl" style={{ textWrap: "balance" }}>
            نحول أفكارك إلى تجارب إبداعية مؤثرة
          </h2>
          <p className="mb-4 leading-relaxed text-muted-foreground" style={{ textWrap: "pretty" }}>
            ربيعي هي الشريك الإبداعي اللي تساعدك على إيصال رسائلك بشكل إبداعي يبني تصوّر ويحقق هدف. نؤمن أن كل علامة تجارية تستحق قصة تُروى بطريقة مختلفة.
          </p>
          <p className="mb-8 leading-relaxed text-muted-foreground">
            فريقنا يجمع بين الإبداع والاستراتيجية لتقديم حلول تسويقية متكاملة تحقق نتائج ملموسة.
          </p>
          <Link
            to="/about"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            اعرف المزيد
            <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-1" />
          </Link>
        </ScrollReveal>

        <ScrollReveal direction="left" delay={0.15}>
          <div className="relative aspect-square">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-transparent" />
            <div className="absolute inset-4 rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm" />
            <div className="absolute inset-8 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-accent/5">
              <span className="text-4xl sm:text-6xl font-bold text-gradient">ربيعي</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  </section>
);

export default AboutPreview;

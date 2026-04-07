import { motion } from "framer-motion";
import ScrollReveal from "../ScrollReveal";
import { AlertCircle } from "lucide-react";

const ProblemSection = () => {
  return (
    <section className="relative py-32 overflow-hidden bg-secondary/20">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      
      <div className="container mx-auto px-6">
        <ScrollReveal className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-8">
            <AlertCircle size={32} />
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-snug text-foreground mb-8" style={{ textWrap: "balance" }}>
            التسويق غالبًا يكون آخر حلقة…
            <br />
            <span className="text-primary">مع إنه المفروض يكون في قلب المشروع</span>
          </h2>
          
          <div className="space-y-4 text-muted-foreground text-lg leading-relaxed" style={{ textWrap: "pretty" }}>
            <p>
              كثير شركات تتعامل مع التسويق كخدمة خارجية.
              تصميم، إعلانات، سوشال ميديا… وخلاص.
            </p>
            <p>
              لكن بدون فهم عميق للمنتج، العمليات، والمبيعات،
             يصير التسويق مجرد نشاط… مو محرك نمو.
            </p>
            <p className="text-xl font-semibold text-foreground mt-6">
              هنا يجي دور <span className="text-gradient">رُبْعي</span>.
            </p>
          </div>
        </ScrollReveal>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
    </section>
  );
};

export default ProblemSection;

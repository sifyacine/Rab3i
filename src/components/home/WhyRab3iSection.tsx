import { motion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import ScrollReveal from "../ScrollReveal";

const reasons = [
  "نفكر معك مو عنك",
  "نشتغل بعقلية شريك مو مورد",
  "نربط التسويق بالمبيعات والعمليات",
  "نركز على النمو مو الضجة",
  "نؤمن إن النجاح نظام… مو صدفة"
];

const WhyRab3iSection = () => {
  return (
    <section className="relative py-32 overflow-hidden bg-secondary/20">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      
      <div className="container mx-auto px-6">
        <ScrollReveal className="max-w-3xl mx-auto text-center mb-16">
          <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-widest text-primary">ليه رُبْع؟</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" style={{ textWrap: "balance" }}>
            ليش بتجلس معنا؟
          </h2>
        </ScrollReveal>

        <div className="max-w-2xl mx-auto">
          {reasons.map((reason, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-center gap-4 py-4 border-b border-border/20"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white shadow-md">
                  <Check size={20} />
                </div>
                <span className="text-lg font-medium text-foreground">{reason}</span>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
    </section>
  );
};

export default WhyRab3iSection;

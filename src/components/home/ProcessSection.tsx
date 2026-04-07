import { motion } from "framer-motion";
import ScrollReveal from "../ScrollReveal";
import { Search, Map, PenTool, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "تحليل",
    description: "نفهم مشروعك من الداخل قبل ما نفكر بالسوق ونفهم جمهورك لنصنع رسالة تناسبهم."
  },
  {
    icon: Map,
    title: "تخطيط",
    description: "نبني استراتيجية واضحة مبنية على أرقام وواقع ونصمم خطة اتصال واضحة تخاطب الجمهور بفعالية."
  },
  {
    icon: PenTool,
    title: "تنفيذ",
    description: "نصمم هوية، ونقدم محتوى مبدعاً وعالي الجودة يلفت الانتباه ويؤثر في أنظمة التسويق."
  },
  {
    icon: TrendingUp,
    title: "تحسين",
    description: "نراقب النتائج ونحسن أداءنا باستمرار لضمان النجاح."
  }
];

const ProcessSection = () => (
  <section className="py-32 relative overflow-hidden" dir="rtl">
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
    
    <div className="container mx-auto px-6">
      <ScrollReveal className="text-center mb-16">
        <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-widest text-primary">كيف نشتغل</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          نظام واضح. <span className="text-gradient">حركة مستمرة.</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          كل شيء يدور حول هدف واحد: <span className="text-foreground font-semibold">نمو مشروعك</span>.
        </p>
      </ScrollReveal>

      <div className="relative">
        <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-dashed border-border/30" />
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <ScrollReveal key={i} delay={i * 0.1} className="relative">
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="group text-center p-8 rounded-2xl bg-card border border-border/40 transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
              >
                <div className="relative inline-flex">
                  <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-brand flex items-center justify-center text-white shadow-lg shadow-primary/25">
                    <step.icon size={32} />
                  </div>
                </div>
                
                <div className="mt-6 mb-3">
                  <span className="inline-block w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-sm font-bold text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    {i + 1}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
    
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
  </section>
);

export default ProcessSection;

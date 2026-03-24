import ScrollReveal from "../ScrollReveal";
import { Search, LineChart, FileText, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "الاستكشاف والتحليل",
    description: "نبدأ بدراسة فكرتك وتحليل احتياجات سوقك المستهدف بدقة.",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    icon: LineChart,
    title: "بناء الاستراتيجية",
    description: "نضع خطة عمل واضحة وجدول زمني يضمن تحقيق أهدافك.",
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  },
  {
    icon: FileText,
    title: "تقديم العرض",
    description: "نشاركك التصور المبدئي وعرض السعر المناسب لميزانيتك.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    icon: CheckCircle,
    title: "التنفيذ والتسليم",
    description: "نبدأ العمل الإبداعي ونبقى على تواصل دائم حتى التسليم النهائي.",
    color: "text-primary",
    bg: "bg-primary/10"
  }
];

const ProcessSection = () => (
  <section className="py-24 bg-secondary/30 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
    
    <div className="container mx-auto px-6">
      <ScrollReveal className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">كيف نعمل في <span className="text-gradient">ربيعي</span>؟</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          رحلة إبداعية تبدأ من فكرة وتنتهي بنجاح ملموس، نرافقك في كل خطوة.
        </p>
      </ScrollReveal>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 relative group">
        {/* Connection Line (Desktop) */}
        <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-border/30 -translate-y-1/2 z-0" />
        
        {steps.map((step, i) => (
          <ScrollReveal key={i} className="relative z-10">
            <div className="bg-card border border-border/40 p-8 rounded-2xl transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1">
              <div className={`w-14 h-14 rounded-xl ${step.bg} ${step.color} flex items-center justify-center mb-6`}>
                <step.icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
              <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                {i + 1}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);

export default ProcessSection;

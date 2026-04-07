import { motion } from "framer-motion";
import { Zap, ArrowLeft, Loader2, Palette, Megaphone, PenTool, Globe, Building, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import ScrollReveal from "../ScrollReveal";

const services = [
  {
    icon: Palette,
    title: "بناء وتطوير الهوية التجارية",
    title_en: "Brand Identity Development"
  },
  {
    icon: Rocket,
    title: "استراتيجيات التسويق والنمو",
    title_en: "Marketing & Growth Strategies"
  },
  {
    icon: Megaphone,
    title: "إدارة وتنفيذ الحملات الإعلانية",
    title_en: "Ad Campaign Management"
  },
  {
    icon: PenTool,
    title: "صناعة المحتوى الاحترافي والمستدام",
    title_en: "Professional Content Creation"
  },
  {
    icon: Building,
    title: "تطوير الأنظمة التسويقية الداخلية",
    title_en: "Internal Marketing Systems"
  },
  {
    icon: Globe,
    title: "تصميم وتطوير مواقع الويب",
    title_en: "Web Development"
  }
];

function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
  return (
    <ScrollReveal delay={index * 0.1}>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
      >
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/0 blur-3xl transition-all duration-700 group-hover:bg-primary/10" />

        <div className="relative z-10 p-6">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-gradient-brand group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/25">
            <service.icon size={22} />
          </div>
          <h3 className="mb-1 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            {service.title}
          </h3>
          <p className="text-xs text-muted-foreground">{service.title_en}</p>
        </div>
      </motion.div>
    </ScrollReveal>
  );
}

const ServicesSection = () => {
  return (
    <section className="relative py-32" dir="rtl">
      <div className="container mx-auto px-6">
        <ScrollReveal className="mb-16 text-center">
          <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-widest text-primary">خدماتنا</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-wrap-balance">
            وش نقدر نسوي لك؟
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            نشتغل على مشاريع نؤمن فيها، مو على مهام سريعة وخلاص.
          </p>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <ServiceCard key={i} service={service} index={i} />
          ))}
        </div>

        <ScrollReveal className="mt-12 text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            عرض جميع الخدمات <ArrowLeft size={16} />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ServicesSection;

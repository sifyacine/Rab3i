import { motion } from "framer-motion";
import { ArrowLeft, Palette, Megaphone, PenTool, Globe, Building, Rocket, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ScrollReveal from "../ScrollReveal";
import { servicesService } from "@/services/servicesService";
import type { Service } from "@/types/portfolio";

// Icon set cycled by index (DB services store an optional icon string we don't
// map to components yet). Also used for the curated fallback below.
const ICONS = [Palette, Rocket, Megaphone, PenTool, Building, RefreshCw, Globe];

// Curated fallback shown only when the DB has no active services yet, so the
// public homepage never renders an empty section.
const FALLBACK = [
  { title_ar: "بناء وتطوير الهوية التجارية", title_en: "Brand Identity Development" },
  { title_ar: "استراتيجيات التسويق والنمو", title_en: "Marketing & Growth Strategies" },
  { title_ar: "إدارة وتنفيذ الحملات الإعلانية", title_en: "Ad Campaign Management" },
  { title_ar: "صناعة المحتوى الاحترافي والمستدام", title_en: "Professional Content Creation" },
  { title_ar: "تطوير الأنظمة التسويقية الداخلية", title_en: "Internal Marketing Systems" },
  { title_ar: "إعادة تموضع العلامات (Rebranding)", title_en: "Brand Repositioning" },
  { title_ar: "تصميم وتطوير مواقع الويب والتطبيقات", title_en: "Web & App Development" },
];

interface ServiceCardData {
  title_ar: string;
  title_en: string | null;
}

function ServiceCard({ service, index }: { service: ServiceCardData; index: number }) {
  const Icon = ICONS[index % ICONS.length];
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
            <Icon size={22} />
          </div>
          <h3 className="mb-1 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            {service.title_ar}
          </h3>
          {service.title_en && <p className="text-xs text-muted-foreground">{service.title_en}</p>}
        </div>
      </motion.div>
    </ScrollReveal>
  );
}

const ServicesSection = () => {
  const { data } = useQuery({
    queryKey: ["home-services"],
    queryFn: () => servicesService.getServices(true),
  });

  const dbServices = (data ?? []) as Service[];
  const cards: ServiceCardData[] =
    dbServices.length > 0
      ? dbServices.map((s) => ({ title_ar: s.title_ar, title_en: s.title_en }))
      : FALLBACK;

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
          {cards.map((service, i) => (
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

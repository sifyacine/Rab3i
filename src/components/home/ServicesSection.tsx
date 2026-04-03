import { motion } from "framer-motion";
import { Zap, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ScrollReveal from "../ScrollReveal";
import { servicesService } from "@/services/servicesService";
import { Service } from "@/types/portfolio";

function ServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <ScrollReveal delay={index * 0.1}>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
      >
        {/* Glow */}
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/0 blur-3xl transition-all duration-700 group-hover:bg-primary/10" />

        {/* Image if available */}
        {service.image_url && (
          <div className="h-36 w-full overflow-hidden">
            <img
              src={service.image_url}
              alt={service.title_ar}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        )}

        <div className="relative z-10 p-6">
          {!service.image_url && (
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/25">
              <Zap size={22} />
            </div>
          )}
          <h3 className="mb-1 text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            {service.title_ar}
          </h3>
          <p className="text-xs text-muted-foreground mb-3">{service.title_en}</p>
          {service.description_ar && (
            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2" style={{ textWrap: "pretty" } as React.CSSProperties}>
              {service.description_ar}
            </p>
          )}
          {(service.price_from || service.price_note_ar) && (
            <p className="mt-3 text-sm font-semibold text-primary">
              {service.price_note_ar && <span className="font-normal text-muted-foreground me-1">{service.price_note_ar}</span>}
              {service.price_from}
            </p>
          )}
        </div>
      </motion.div>
    </ScrollReveal>
  );
}

const ServicesSection = () => {
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["home-services"],
    queryFn: () => servicesService.getServices(true),
    select: (data) => data.slice(0, 6), // Show first 6 on homepage
  });

  return (
    <section className="relative py-32" dir="rtl">
      <div className="container mx-auto px-6">
        <ScrollReveal className="mb-16 text-center">
          <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-widest text-primary">خدماتنا</span>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl" style={{ textWrap: "balance" } as React.CSSProperties}>
            حلول إبداعية تحقق أهدافك
          </h2>
        </ScrollReveal>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {services.map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>
        )}

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

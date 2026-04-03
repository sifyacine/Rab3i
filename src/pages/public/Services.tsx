import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Zap, ExternalLink, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import { useQuery } from "@tanstack/react-query";
import { servicesService } from "@/services/servicesService";
import { Service } from "@/types/portfolio";

const steps = [
  { num: "٠١", title: "الاكتشاف", desc: "نفهم أهدافك وجمهورك" },
  { num: "٠٢", title: "الاستراتيجية", desc: "نضع خطة إبداعية واضحة" },
  { num: "٠٣", title: "التنفيذ", desc: "نحول الأفكار لواقع مبدع" },
  { num: "٠٤", title: "القياس", desc: "نتابع النتائج ونطور" },
];

function ServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <ScrollReveal delay={index * 0.08}>
      <motion.div
        whileHover={{ y: -4 }}
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-card transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/8"
      >
        {/* Image */}
        {service.image_url ? (
          <div className="h-44 w-full overflow-hidden">
            <img
              src={service.image_url}
              alt={service.title_ar}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="flex h-44 items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/30">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Zap className="h-8 w-8" />
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col p-6 gap-3">
          {/* Titles */}
          <div>
            <h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
              {service.title_ar}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{service.title_en}</p>
          </div>

          {/* Description */}
          {service.description_ar && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {service.description_ar}
            </p>
          )}

          {/* Price */}
          {(service.price_from || service.price_note_ar) && (
            <div className="mt-auto pt-3 border-t border-border/40 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-semibold text-primary">
                {service.price_from && <span>{service.price_from}</span>}
                {service.price_note_ar && (
                  <span className="font-normal text-muted-foreground ms-1">{service.price_note_ar}</span>
                )}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </ScrollReveal>
  );
}

const Services = () => {
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["public-services"],
    queryFn: () => servicesService.getServices(true),
  });

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20" dir="rtl">
        <div className="container mx-auto px-6">
          <ScrollReveal className="mb-16 text-center">
            <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              ما نقدمه
            </span>
            <h1 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">خدماتنا</h1>
            <p className="mx-auto max-w-xl text-muted-foreground text-lg">
              حلول إبداعية متكاملة تساعدك على تحقيق أهدافك التسويقية والرقمية
            </p>
          </ScrollReveal>

          {/* Services Grid */}
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p>لا توجد خدمات متاحة حالياً</p>
            </div>
          ) : (
            <div className="mb-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {services.map((service, i) => (
                <ServiceCard key={service.id} service={service} index={i} />
              ))}
            </div>
          )}

          {/* Process */}
          <ScrollReveal className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground">طريقة عملنا</h2>
            <p className="text-muted-foreground mt-2">خطوات بسيطة توصلك للنتيجة المثالية</p>
          </ScrollReveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-16">
            {steps.map((step, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="rounded-2xl border border-border/40 bg-card p-6 text-center hover:border-primary/30 hover:shadow-lg transition-all">
                  <span className="mb-3 block text-3xl font-bold text-primary">{step.num}</span>
                  <h4 className="mb-2 text-lg font-bold text-foreground">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal className="mt-8 text-center">
            <Link
              to="/request"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-10 py-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl active:scale-[0.97]"
            >
              ابدأ مشروعك
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            </Link>
          </ScrollReveal>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Services;

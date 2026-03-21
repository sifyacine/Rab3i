import { motion } from "framer-motion";
import { Palette, Megaphone, PenTool } from "lucide-react";
import ScrollReveal from "../ScrollReveal";

const services = [
  {
    icon: Palette,
    title: "بناء العلامة التجارية",
    description: "نطور هوية متكاملة تعكس شخصيتك وتترك انطباع قوي لدى جمهورك",
  },
  {
    icon: Megaphone,
    title: "إدارة وتنفيذ الحملات التسويقية",
    description: "نخطط وننفذ حملات متكاملة تضمن وصولك للجمهور المناسب وتحقيق نتائج ملموسة",
  },
  {
    icon: PenTool,
    title: "إنتاج المحتوى الإبداعي",
    description: "نبتكر محتوى بصري وكتابي يلفت الانتباه ويوصل رسالتك بشكل مؤثر",
  },
];

const ServicesSection = () => (
  <section className="relative py-32">
    <div className="container mx-auto px-6">
      <ScrollReveal className="mb-16 text-center">
        <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-widest text-primary">
          خدماتنا
        </span>
        <h2 className="text-3xl font-bold text-foreground sm:text-4xl" style={{ textWrap: "balance" }}>
          حلول إبداعية تحقق أهدافك
        </h2>
      </ScrollReveal>

      <div className="grid gap-6 md:grid-cols-3">
        {services.map((service, i) => (
          <ScrollReveal key={i} delay={i * 0.1}>
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card p-8 transition-all duration-500 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
            >
              {/* Glow on hover */}
              <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/0 blur-3xl transition-all duration-700 group-hover:bg-primary/10" />

              <div className="relative z-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/25">
                  <service.icon size={24} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground">{service.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground" style={{ textWrap: "pretty" }}>
                  {service.description}
                </p>
              </div>
            </motion.div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;

import { motion } from "framer-motion";
import { Palette, Megaphone, PenTool, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

const services = [
  {
    icon: Palette,
    title: "بناء العلامة التجارية",
    description: "نطور هوية متكاملة تعكس شخصيتك وتترك انطباع قوي لدى جمهورك",
    details: ["تصميم الشعار", "الهوية البصرية", "دليل العلامة التجارية", "تصميم المطبوعات"],
  },
  {
    icon: Megaphone,
    title: "إدارة وتنفيذ الحملات التسويقية",
    description: "نخطط وننفذ حملات متكاملة تضمن وصولك للجمهور المناسب وتحقيق نتائج ملموسة",
    details: ["استراتيجية التسويق", "إدارة الإعلانات", "تحليل البيانات", "تقارير الأداء"],
  },
  {
    icon: PenTool,
    title: "إنتاج المحتوى الإبداعي",
    description: "نبتكر محتوى بصري وكتابي يلفت الانتباه ويوصل رسالتك بشكل مؤثر",
    details: ["كتابة المحتوى", "التصوير والإخراج", "موشن جرافيك", "تصميم سوشال ميديا"],
  },
];

const steps = [
  { num: "٠١", title: "الاكتشاف", desc: "نفهم أهدافك وجمهورك" },
  { num: "٠٢", title: "الاستراتيجية", desc: "نضع خطة إبداعية واضحة" },
  { num: "٠٣", title: "التنفيذ", desc: "نحول الأفكار لواقع مبدع" },
  { num: "٠٤", title: "القياس", desc: "نتابع النتائج ونطور" },
];

const Services = () => (
  <>
    <Navbar />
    <main className="pt-32 pb-20">
      <div className="container mx-auto px-6">
        <ScrollReveal className="mb-20 text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">خدماتنا</h1>
          <p className="mx-auto max-w-xl text-muted-foreground">حلول إبداعية متكاملة تساعدك على تحقيق أهدافك التسويقية</p>
        </ScrollReveal>

        <div className="mb-32 space-y-8">
          {services.map((s, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                className="group grid gap-8 rounded-2xl border border-border/40 bg-card p-8 transition-all duration-500 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 md:grid-cols-3"
              >
                <div className="md:col-span-2">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <s.icon size={22} />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-foreground">{s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{s.description}</p>
                </div>
                <div className="flex flex-col gap-3">
                  {s.details.map((d, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {d}
                    </div>
                  ))}
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Process */}
        <ScrollReveal className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-foreground">طريقة عملنا</h2>
        </ScrollReveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="rounded-2xl border border-border/40 bg-card p-6 text-center">
                <span className="mb-3 block text-3xl font-bold text-primary">{step.num}</span>
                <h4 className="mb-2 text-lg font-bold text-foreground">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="mt-16 text-center">
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

export default Services;

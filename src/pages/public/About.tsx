import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

const timeline = [
  { year: "٢٠٢٠", title: "البداية", desc: "انطلقت ربيعي بفكرة بسيطة: إبداع يحقق أهداف" },
  { year: "٢٠٢١", title: "النمو", desc: "وسعنا فريقنا وخدماتنا لنشمل التسويق المتكامل" },
  { year: "٢٠٢٢", title: "التميز", desc: "حققنا أكثر من ٥٠ مشروع ناجح مع عملاء مميزين" },
  { year: "٢٠٢٣", title: "التوسع", desc: "دخلنا أسواق جديدة وطورنا خدمات المحتوى الإبداعي" },
  { year: "٢٠٢٤", title: "المستقبل", desc: "نواصل الابتكار ونطمح لنكون الخيار الأول للإبداع" },
];

const values = [
  { title: "الإبداع", desc: "نفكر خارج الصندوق ونقدم حلول مبتكرة" },
  { title: "الاستراتيجية", desc: "كل خطوة مدروسة ومبنية على بيانات" },
  { title: "الجودة", desc: "نلتزم بأعلى معايير الجودة في كل مشروع" },
  { title: "الشراكة", desc: "نعتبر عملاءنا شركاء نجاح حقيقيين" },
];

const About = () => (
  <>
    <Navbar />
    <main className="pt-32 pb-20">
      <div className="container mx-auto px-6">
        {/* Hero */}
        <ScrollReveal className="mb-24 text-center">
          <h1 className="mb-6 text-4xl font-bold text-foreground sm:text-5xl">من نحن</h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            ربيعي هي الشريك الإبداعي اللي تساعدك على إيصال رسائلك بشكل إبداعي يبني تصوّر ويحقق هدف
          </p>
        </ScrollReveal>

        {/* Mission/Vision */}
        <div className="mb-32 grid gap-6 md:grid-cols-2">
          {[
            { title: "رؤيتنا", text: "أن نكون الخيار الأول للإبداع في العالم العربي" },
            { title: "رسالتنا", text: "نساعد العلامات التجارية على إيصال رسائلها بشكل إبداعي يحقق أهدافها ويبني تصوراً مميزاً لدى جمهورها" },
          ].map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="rounded-2xl border border-border/40 bg-card p-8">
                <h3 className="mb-4 text-xl font-bold text-primary">{item.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Values */}
        <ScrollReveal className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-foreground">قيمنا</h2>
        </ScrollReveal>
        <div className="mb-32 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <ScrollReveal key={i} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -6 }}
                className="rounded-2xl border border-border/40 bg-card p-6 text-center transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
              >
                <h4 className="mb-2 text-lg font-bold text-foreground">{v.title}</h4>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Timeline */}
        <ScrollReveal className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-foreground">رحلتنا</h2>
        </ScrollReveal>
        <div className="relative mx-auto max-w-2xl">
          <div className="absolute top-0 bottom-0 right-[50%] w-px bg-border/50" />
          {timeline.map((t, i) => (
            <ScrollReveal key={i} delay={i * 0.1} direction={i % 2 === 0 ? "right" : "left"}>
              <div className={`mb-12 flex items-center gap-8 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                <div className="flex-1 text-end">
                  {i % 2 === 0 && (
                    <div className="rounded-xl border border-border/40 bg-card p-5">
                      <h4 className="font-bold text-foreground">{t.title}</h4>
                      <p className="text-sm text-muted-foreground">{t.desc}</p>
                    </div>
                  )}
                </div>
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background text-xs font-bold text-primary">
                  {t.year}
                </div>
                <div className="flex-1">
                  {i % 2 !== 0 && (
                    <div className="rounded-xl border border-border/40 bg-card p-5">
                      <h4 className="font-bold text-foreground">{t.title}</h4>
                      <p className="text-sm text-muted-foreground">{t.desc}</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </>
);

export default About;

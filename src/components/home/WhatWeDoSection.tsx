import ScrollReveal from "../ScrollReveal";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const rightServices = [
  { ar: "بناء وتطوير الهوية التجارية", en: "Brand Identity Development" },
  { ar: "صناعة المحتوى الاحترافي والمستدام", en: "Professional Content Creation" },
  { ar: "تصميم وتطوير مواقع الويب والتطبيقات وصفحات الهبوط", en: "Web & App Development" },
  { ar: "تطوير الأنظمة التسويقية الداخلية", en: "Internal Marketing Systems" },
];

const leftServices = [
  { ar: "استراتيجيات التسويق والنمو", en: "Marketing & Growth Strategies" },
  { ar: "إدارة وتنفيذ الحملات الإعلانية", en: "Ad Campaign Management" },
  { ar: "إعادة تموضع العلامات", en: "Brand Repositioning" },
  { ar: "إعادة تموضع العلامات", en: "Rebranding" },
];

const curveOffsets = ["0px", "24px", "40px", "24px"];

const ServiceCard = ({
  ar,
  en,
  align,
}: {
  ar: string;
  en: string;
  align: "right" | "left";
}) => (
  <div
    dir="rtl"
    className="group relative flex items-start gap-3 rounded-[2rem] border border-white/12 bg-black/60 px-5 py-4 backdrop-blur-md transition-all duration-300 hover:border-[hsl(358_86%_52%)/0.5] hover:bg-black/80"
  >
    <div className="mt-1 shrink-0 rounded-[6px] bg-[hsl(358,86%,52%)] p-[5px]">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <rect width="12" height="12" rx="2" fill="white" fillOpacity="0.9" />
      </svg>
    </div>

    <div className={align === "right" ? "text-right flex-1" : "text-right flex-1"}>
      <p
        className="text-sm font-bold leading-snug text-white sm:text-base"
        style={{ fontFamily: "var(--font-zain)" }}
      >
        {ar}
      </p>
      <p
        className="mt-0.5 text-[11px] font-light text-white/50 sm:text-xs"
        style={{ fontFamily: "var(--font-clash), sans-serif", letterSpacing: "0.02em" }}
      >
        {en}
      </p>
    </div>
  </div>
);

const WhatWeDoSection = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden"
      dir="rtl"
      aria-label="وش نقدر نسوي لك؟"
    >
      <div className="absolute inset-0">
        <motion.img
          src="/images/what-we-do-bg.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-[120%] w-full object-cover object-center opacity-0"
          onLoad={(e) => (e.currentTarget.style.opacity = "1")}
          style={{ y, transition: "opacity 0.8s ease" }}
        />
      <div className="absolute inset-x-[15%] top-[5%] h-[55%] rounded-full bg-[#7a3a10]/20 blur-[140px]" />
      <div className="absolute bottom-[-5%] left-1/2 h-[40%] w-[50%] -translate-x-1/2 rounded-full bg-[hsl(358,86%,30%)]/10 blur-[120px]" />
    </div>

    <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/40 to-black/85" />

    <div className="relative z-10 flex min-h-screen flex-col items-center px-6 py-20 sm:px-10 lg:px-16">
      <ScrollReveal direction="down" className="w-full">
        <h2
          className="mb-16 text-right text-5xl font-bold leading-tight text-[var(--brand-ochre)] sm:text-6xl lg:text-7xl"
          style={{ fontFamily: "var(--font-zain)", textWrap: "balance" }}
        >
          وش نقدر نسوي لك؟
        </h2>
      </ScrollReveal>

      <div className="flex w-full max-w-5xl flex-1 items-center gap-4 sm:gap-6 lg:gap-16">
        <div className="flex flex-1 flex-col gap-4">
          {rightServices.map((s, i) => (
            <div key={s.ar + i} style={{ marginLeft: curveOffsets[i] }}>
              <ScrollReveal direction="right" delay={i * 0.1}>
                <ServiceCard ar={s.ar} en={s.en} align="right" />
              </ScrollReveal>
            </div>
          ))}
        </div>

        <div className="flex flex-1 flex-col gap-4">
          {leftServices.map((s, i) => (
            <div key={s.ar + i} style={{ marginRight: curveOffsets[i] }}>
              <ScrollReveal direction="left" delay={i * 0.1 + 0.05}>
                <ServiceCard ar={s.ar} en={s.en} align="left" />
              </ScrollReveal>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
  );
};

export default WhatWeDoSection;
